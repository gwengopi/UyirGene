# UyirGene — Technical Reference Documentation

> This file documents how the code is structured and how features work.
> Update this file whenever a feature is added or significantly changed.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Platform Growth & Scale Context](#2-platform-growth--scale-context)
3. [Email System — Architecture](#3-email-system--architecture)
4. [Email System — Sending Types & Volume](#4-email-system--sending-types--volume)
5. [Email Provider — Decision & Roadmap](#5-email-provider--decision--roadmap)
6. [Email Trigger Map](#6-email-trigger-map)
7. [Marketing Campaign System](#7-marketing-campaign-system)
8. [Payment Flow](#8-payment-flow)
9. [Enrollment Flow](#9-enrollment-flow)
10. [Auth & Guest User System](#10-auth--guest-user-system)
11. [Scheduled Jobs](#11-scheduled-jobs)
12. [Database Migrations](#12-database-migrations)
13. [Incident Log](#13-incident-log)

---

## 1. Project Overview



| Property | Value |
|---|---|
| Platform | UyirGene — Online courses for Food Safety & Quality training (HACCP, FSMS, etc.) |
| Backend | Spring Boot (Java 17), PostgreSQL, Flyway |
| Frontend | React + Vite |
| Payments | Razorpay (INR + multi-currency KWD etc.) |
| Email | Spring JavaMail → SMTP (configurable via env vars) |
| Auth | JWT + Google OAuth + guest magic-link (30-day tokens) |
| Deployment | Docker Compose — `docker-compose.prod.yml` |

**Key environment variables**

| Variable | Purpose |
|---|---|
| `MAIL_HOST` | SMTP relay host |
| `MAIL_PORT` | SMTP port (typically 587) |
| `MAIL_USERNAME` | SMTP login / From address |
| `MAIL_PASSWORD` | SMTP credential / API key |
| `MAIL_FROM` | Display From address (e.g. noreply@uyirgene.com) |
| `MARKETING_MAIL_HOST/PORT/USERNAME/PASSWORD` | Optional separate SMTP for marketing campaigns |
| `JWT_SECRET` | HS256 signing key (min 32 chars) |
| `RAZORPAY_KEY_ID / KEY_SECRET / WEBHOOK_SECRET` | Razorpay credentials |
| `GOOGLE_CLIENT_ID` | OAuth client |

---

## 2. Platform Growth & Scale Context

> Recorded: 2026-06-13 (Month 1 since launch)

| Metric | Value |
|---|---|
| Live since | ~2026-05-13 (1 month) |
| Total visitors (month 1) | 15,000 |
| Unique visitors (month 1) | 6,000 |
| Registered users | 1,000 |
| Unique-to-user conversion | ~16.7% |

### Projected growth (conservative — half current rate)

| Month | Est. Users | Est. Monthly Emails | Brevo Plan |
|---|---|---|---|
| 1 (now) | 1,000 | ~8,000 | Starter ($9/mo, 20k) |
| 2 | 1,800 | ~15,000 | Starter ($9/mo, 20k) |
| 3 | 2,500 | ~22,000 | Business ($18/mo, 60k) |
| 5 | 4,000 | ~38,000 | Business ($18/mo, 60k) |
| 8 | 6,000 | ~58,000 | Business ($18/mo, 60k) |
| 12 | 10,000+ | ~100,000+ | Split: SES + Brevo |

Monthly email estimate breakdown (per 1,000 users):
- Marketing campaigns (2–3/month): ~2,000–3,000
- Blog notifications (4–8 posts × ~300 subscribers): ~1,200–2,400
- Daily reminders (50/day × 30): ~1,500
- Transactional (enrollments, completions, resets): ~900–1,500
- **Total: ~6,000–9,000/month per 1,000 users**

---

## 3. Email System — Architecture

### SMTP Configuration

Base config (`application.yml:35-47`):
```yaml
spring.mail:
  host: ${MAIL_HOST:smtp.gmail.com}
  port: ${MAIL_PORT:587}
  username: ${MAIL_USERNAME:}
  password: ${MAIL_PASSWORD:}
  properties.mail.smtp:
    auth: true
    starttls.enable: true
    starttls.required: true
    ssl.protocols: TLSv1.2

app.mail.from: ${MAIL_FROM:${MAIL_USERNAME:UyirGene}}
```

The `app.mail.from` value becomes the `From:` address on every transactional email.
If `MAIL_FROM` is not set, it falls back to `MAIL_USERNAME`.

### Core Classes

| Class | File | Responsibility |
|---|---|---|
| `MailService` | `course/MailService.java` | All transactional email sending (15+ methods) |
| `MailTemplate` | `course/MailTemplate.java` | JPA entity — DB-stored templates (`mail_template` table) |
| `MailTemplateService` | `course/MailTemplateService.java` | Template CRUD, key-based lookup |
| `MailTemplateInitializer` | `course/MailTemplateInitializer.java` | `ApplicationRunner` — seeds `html_body` from classpath on startup |
| `MarketingCampaignService` | `course/MarketingCampaignService.java` | Bulk marketing email campaigns, batched sending |
| `CourseReminderScheduler` | `course/CourseReminderScheduler.java` | Daily cron — sends overdue course reminder emails |

### How `MailService` sends emails

All methods follow the same pattern:
1. Look up template from DB via `mailTemplateService.findByKey(key)`
2. If template exists, use its `subject`, `content`, and `htmlBody`; otherwise use hardcoded fallback strings
3. Build the final HTML by calling a private `build*Html()` method that replaces `{{variableName}}` tokens
4. Create a `MimeMessage` via `JavaMailSender`, set To/From/Subject/HTML body
5. Call `mailSender.send(msg)` inside a try/catch — failures are logged but not retried
6. The method is annotated `@Async` — runs on Spring's async thread pool, never blocks the HTTP thread

### Template System

Templates are stored in two places:
- **Classpath:** `src/main/resources/templates/*.html` — source of truth for HTML layouts
- **Database:** `mail_template.html_body` — copy loaded at startup, editable by admin via API

`MailTemplateInitializer` reads each classpath file and writes it to `html_body` on first run only
(idempotent — skips if `html_body` is already set).

Variable substitution uses `String.replace("{{key}}", value)` — no templating engine.

Admin can customise template subject and content via `PUT /api/mail-templates/admin/{id}` (requires ADMIN role).

**Available templates**

| Template Key | HTML File | Variables |
|---|---|---|
| `enrollment-success` | `enrollment-success.html` | `{{name}}`, `{{courseTitle}}`, `{{courseDescription}}`, `{{courseCode}}`, `{{trainerName}}`, `{{courseUrl}}`, `{{appName}}`, `{{content}}` |
| `course-completion` | `course-completion.html` | `{{name}}`, `{{courseTitle}}`, `{{courseCode}}`, `{{marks}}`, `{{certificateType}}`, `{{dashboardUrl}}`, `{{appName}}`, `{{content}}` |
| `result-published` | `result-published.html` | `{{name}}`, `{{courseTitle}}`, `{{courseCode}}`, `{{marks}}`, `{{certificateType}}`, `{{certificateId}}`, `{{issuedDate}}`, `{{verifyUrl}}`, `{{dashboardUrl}}`, `{{appName}}`, `{{content}}` |
| `bundle-enrollment-success` | `bundle-enrollment-success.html` | `{{name}}`, `{{bundleTitle}}`, `{{courseList}}`, `{{dashboardUrl}}`, `{{appName}}`, `{{content}}` |
| `payment-failed` | `payment-failed.html` | `{{name}}`, `{{courseTitle}}`, `{{reasonLine}}`, `{{retryUrl}}`, `{{content}}`, `{{appName}}` |
| `course-reminder` | `course-reminder.html` | `{{name}}`, `{{courseTitle}}`, `{{courseCode}}`, `{{courseUrl}}`, `{{dashboardUrl}}`, `{{appName}}`, `{{content}}` |
| *(no DB entry)* | `new-blog-notification.html` | `{{name}}`, `{{blogTitle}}`, `{{blogDescription}}`, `{{category}}`, `{{authorName}}`, `{{readingTime}}`, `{{blogUrl}}`, `{{unsubscribeUrl}}`, `{{appName}}` |

---

## 4. Email System — Sending Types & Volume

### Transactional emails (1 email per event)

These are triggered by individual user actions — one email per event, per user.

| Email Type | Trigger | Approx. Volume |
|---|---|---|
| Enrollment confirmation | Each paid or free enrolment | 1 per enrolment |
| Guest enrollment + magic link | Guest user pays | 1 per guest payment |
| Bundle enrollment | Value pack purchase | 1 per bundle purchase |
| Course completion | Admin marks complete | 1 per completion |
| Results + certificate | Admin publishes results | 1 per result publish |
| Payment failed | Payment failure webhook | 1 per failure |
| Password reset | User requests reset | 1 per request |
| Magic link resend | Admin resends access | 1 per request |
| Admin payment alert | Webhook enrollment fails | 1 per incident |

### Bulk emails (N emails per event)

These send to multiple recipients at once.

| Email Type | Trigger | Volume |
|---|---|---|
| Blog notification | Blog published/updated to PUBLISHED | 1 per active subscriber |
| Course completion reminder | Daily cron 09:00 AM | 1 per overdue enrollment (all in one run) |
| Marketing campaign | Admin triggers campaign | Up to 500 per batch, daily batches |

### Marketing campaign batching logic (`MarketingCampaignService.java`)

- Batch size: **500 recipients per batch** (hardcoded at line 114)
- First batch fires immediately when campaign is triggered
- Subsequent batches: `processDailyBatches()` runs at **09:00 AM** daily via `@Scheduled(cron = "0 0 9 * * *")`
- All opted-in users fetched via `userRepository.findByMarketingOptOutFalseOrMarketingOptOutIsNull()`
- Log rows created upfront in `marketing_mail_log` table (PENDING → SENT/FAILED per recipient)
- Only one PENDING or IN_PROGRESS campaign allowed at a time
- Cancellable mid-campaign via `cancelCampaign(Long id)`

### Separate SMTP for marketing

`MarketingCampaignService.resolveMailSender()` checks for `MARKETING_MAIL_USERNAME` + `MARKETING_MAIL_PASSWORD`. If set, it creates a separate `JavaMailSenderImpl` using those credentials. Otherwise falls back to the default transactional `JavaMailSender` bean.

---

## 5. Email Provider — Decision & Roadmap

### Infrastructure context

Server: **AWS EC2**. Amazon SES pricing rule: emails sent from EC2 = **first 62,000/month free**.
This makes SES the most cost-efficient provider at every stage of growth.

### Why Amazon SES (not Brevo)

UyirGene sends two distinct email types — transactional (per-user events) and bulk (marketing
campaigns + blog notifications). Brevo is the only provider at this scale that handles both
under one platform with a single domain authentication setup.

| Provider | Verdict |
|---|---|
| **Amazon SES** | **Selected** — first 62,000 emails/month FREE from EC2. Handles all channels via SMTP. |
| Brevo | Good fallback if SES setup is blocked; $9–25/mo but not free |
| SendGrid | Marketing separate product; expensive |
| Mailgun | No marketing, expensive |
| Postmark | Transactional only, prohibits bulk |
| Resend | Transactional only, newer platform |

### Cost at every growth stage (EC2 → SES)

| Month | Est. Users | Monthly Emails | SES Cost |
|---|---|---|---|
| 1 | 1,000 | ~8,000 | **$0** |
| 6 | 5,000 | ~38,000 | **$0** |
| 10 | 8,000 | ~60,000 | **$0** |
| 12 | 10,000 | ~100,000 | **~$3.80** |
| 18 | 20,000 | ~200,000 | **~$13.80** |

### Configuration (env vars — no code changes in MailService or MarketingCampaignService)

```env
MAIL_HOST=email-smtp.ap-south-1.amazonaws.com
MAIL_PORT=587
MAIL_USERNAME=<ses-smtp-access-key-id>
MAIL_PASSWORD=<ses-smtp-secret-access-key>
MAIL_FROM=noreply@uyirgene.com

MARKETING_MAIL_HOST=email-smtp.ap-south-1.amazonaws.com
MARKETING_MAIL_PORT=587
MARKETING_MAIL_USERNAME=<ses-smtp-access-key-id>
MARKETING_MAIL_PASSWORD=<ses-smtp-secret-access-key>
```

> SES SMTP credentials are generated in the SES console under **SMTP Settings → Create SMTP Credentials**.
> Do NOT use your main AWS IAM access key here.

### DNS records required (from SES console → Verified Identities → uyirgene.com)

- **DKIM** — 3 CNAME records on SES-provided subdomains
- **SPF** — TXT on root domain (SES provides the value)
- **DMARC** — TXT on `_dmarc.uyirgene.com` — start with `p=none` for monitoring

### Bounce handling (new code added — required for SES)

SES suspends accounts when bounce rate > 5% or complaint rate > 0.1%.
Bounce/complaint events are published to SNS → your app's `/api/ses/notification` endpoint.

**New files added:**
- `email/SesNotificationController.java` — receives SNS notifications, marks users as bounced
- `db/migration/V76__add_email_bounced_to_users.sql` — adds `email_bounced`, `email_bounced_at`, `email_bounce_type` to users table

**Changed files:**
- `user/User.java` — three new fields: `emailBounced`, `emailBouncedAt`, `emailBounceType`
- `user/UserRepository.java` — added `findByEmailIgnoreCase()`
- `course/MailService.java` — `isBounced()` guard added to every send method

### AWS console setup (one-time)

1. SES → **Verified Identities** → Add domain `uyirgene.com` → copy 3 DNS records to registrar
2. SES → **Account dashboard** → **Request production access** (submit form, 24–48 hr review)
3. SES → **Configuration Sets** → Create set → Add event destination (Bounces + Complaints → SNS)
4. SNS → **Create topic** (Standard) → **Create subscription** (HTTPS, endpoint: `https://api.uyirgene.com/api/ses/notification`)
5. First call from SNS will be `SubscriptionConfirmation` — `SesNotificationController` auto-confirms it

### Admin-configurable email settings (site_config table, category = EMAIL)

Both transactional and marketing email sender identity are configurable from admin without a deploy.

| Config Key | Channel | Description | Fallback |
|---|---|---|---|
| `transactionalFromEmail` | Transactional | From address for enrollment, completion, reminder, reset emails | `MAIL_FROM` env var → `MAIL_USERNAME` env var → `noreply@uyirgene.com` |
| `transactionalFromName` | Transactional | Display name shown in From field | `app.name` env var (`UyirGene`) |
| `marketingFromEmail` | Marketing | From address for campaigns | `MAIL_FROM` env var |
| `marketingFromName` | Marketing | Display name for campaigns | `UyirGene` |
| `marketingFooterAddress` | Marketing | Physical address in campaign footer | `CONTACT_ADDRESS` config |

Resolution order for transactional From email:
`site_config.transactionalFromEmail` → `MAIL_FROM` env var → `MAIL_USERNAME` env var → `noreply@uyirgene.com`

SMTP credentials (host, port, username, password) are env-var only — not exposed to admin for security.

### Known limitation in marketing batch code

`MarketingCampaignService.java:114` — `batchSize = 500`, one batch per day via cron.
At 10,000 users a campaign takes 20 days to finish. Address this around month 10–12.

---

## 6. Email Trigger Map

| Trigger Class | Method | MailService Method Called |
|---|---|---|
| `EnrollmentService` | `enroll()` | `sendEnrollmentSuccess(User, Course)` |
| `GuestEnrollmentService` | `startGuestCourseEnrollment()` | `sendEnrollmentSuccess(User, Course)` (free) |
| `GuestEnrollmentService` | `confirmGuestCoursePayment()` | `sendGuestEnrollmentSuccess(User, Course, magicLink, isNew)` |
| `GuestEnrollmentService` | `confirmGuestFlagshipPayment()` | `sendGuestEnrollmentSuccess(User, FlagshipProgram, magicLink, isNew)` |
| `GuestEnrollmentService` | `confirmGuestBundlePayment()` | `sendGuestBundleEnrollmentSuccess(User, bundleTitle, courses, magicLink, isNew)` |
| `RazorpayWebhookController` | `handlePaymentCaptured()` | `sendEnrollmentSuccess` / `sendBundleEnrollmentSuccess` (logged-in users) |
| `CourseBundleService` | `enroll()` | `sendBundleEnrollmentSuccess(email, name, bundleTitle, courseTitles)` |
| `AdminController` | `markCourseComplete()` | `sendCourseCompletion(User, Course, marks, certType)` |
| `AdminController` | `publishResults()` | `sendResultPublished(User, Course, enrollment, certificate)` |
| `PaymentController` | `notifyPaymentFailed()` | `sendPaymentFailed(email, name, title, reason, retryUrl)` |
| `PaymentController` | `notifyGuestPaymentFailed()` | `sendPaymentFailed(email, name, title, reason, retryUrl)` |
| `PasswordResetService` | `generateAndSendToken()` | `sendPasswordReset(User, resetLink)` |
| `AdminController` | `resendMagicLink()` | `sendMagicLinkResend(User, magicLink)` |
| `BlogService` | `createBlog()` / `updateBlog()` | `sendNewBlogNotification(List<BlogSubscription>, Blog)` |
| `CourseReminderScheduler` | `sendCourseReminders()` (daily 09:00) | `sendCourseReminder(User, Course, Enrollment)` |
| `CourseReminderScheduler` | `sendCourseReminders()` (daily 09:00) | `sendFlagshipReminder(User, FlagshipProgram, Enrollment)` |
| `RazorpayWebhookController` | `handlePaymentCaptured()` (enrollment fail) | `sendPaymentAlertToAdmin(adminEmail, ...)` |

---

## 7. Marketing Campaign System

### Entity: `MarketingCampaign`

| Field | Type | Notes |
|---|---|---|
| `name` | String | Campaign display name |
| `subject` | String (500) | Email subject line |
| `htmlBody` | TEXT | Final HTML with CTA buttons already resolved |
| `totalRecipients` | int | Count at trigger time |
| `totalBatches` | int | `ceil(totalRecipients / 500)` |
| `batchesSent` | int | Incremented after each batch completes |
| `batchSize` | int | Always 500 |
| `status` | Enum | `PENDING / IN_PROGRESS / COMPLETED / CANCELLED` |
| `triggeredBy` | String | Admin email |
| `triggeredAt` | LocalDateTime | When admin triggered |
| `completedAt` | LocalDateTime | When last batch done |

### CTA Placeholder Syntax

Admin writes campaign HTML using placeholders:
```
[[CTA:COURSE-CODE|Enrol Now]]
[[CTA:FP-FLAGSHIP-CODE|Learn More]]
```

`resolveCtaPlaceholders()` converts these to styled `<a>` button HTML before the campaign is saved.
Throws `IllegalArgumentException` if a code is not found in the DB.

### Unsubscribe

Each marketing email has a personalised unsubscribe URL:
`{baseUrl}/unsubscribe?token={marketingOptOutToken}`

`unsubscribe(String token)` sets `user.marketingOptOut = true`.
Users with `marketingOptOut = true` are excluded from future campaigns.

---

## 8. Payment Flow

### Razorpay order lifecycle

```
Frontend: create order  →  Backend: PaymentProvider.createOrder()  →  Razorpay: order_id returned
Frontend: open Razorpay checkout  →  User pays
                                  ↓
              Two parallel confirmation paths:
              A) Frontend /confirm endpoint  →  EnrollmentService.confirmEnrollmentPayment()
              B) Razorpay webhook  →  RazorpayWebhookController.handlePaymentCaptured()
```

Both paths verify the Razorpay signature. The first to arrive confirms the enrollment **and sends the confirmation email**; the second is a no-op (idempotency check) and sends nothing.

In practice the webhook usually arrives first (in the Sep 29 2026 incident it arrived about 10 seconds before the frontend `/confirm`). So the webhook's email step must not fail. If it does, the customer gets no email at all, because the frontend path skips the email for enrollments that are already done.

Implementation notes for the webhook path (`RazorpayWebhookController`):
- `confirmEnrollments()` is annotated `@Transactional` but is called from within the same class, so Spring does not apply the transaction. Combined with `spring.jpa.open-in-view: false`, **no Hibernate session is open** while the webhook reads the enrollment rows.
- Therefore every association the webhook reads (user, course, bundle, flagshipProgram) must be fetched by the query itself. `EnrollmentRepository.findAllByPaymentOrderId` uses `@EntityGraph(attributePaths = {"user","course","bundle","flagshipProgram"})` for this (added 2026-10-02). `Enrollment.bundle` is `LAZY`; without the entity graph, `getBundle().getTitle()` throws `LazyInitializationException`.
- Email failures are caught and logged with `orderId` and `email` (`Failed to send ... email after webhook confirmation: orderId=..., email=...`).
- Known gap (not fixed): if both paths arrive within milliseconds of each other, both can see PENDING rows and both send the email, which produces a rare duplicate email.

### PENDING enrollment rows

When `createOrder()` is called, PENDING enrollment rows are written to the `enrollment` table immediately. These are upgraded to `ENROLLED` on payment confirmation. Bundle orders create one PENDING row per course in the bundle.

### Webhook signature verification

`RazorpayWebhookController` verifies `X-Razorpay-Signature` using HMAC-SHA256 of the raw request body signed with `RAZORPAY_WEBHOOK_SECRET`. Requests with missing or invalid signatures return 401.

### Currency handling

`EnrollmentService` resolves the price and currency based on:
1. `countryCode` from request (e.g. `"KWD"`)
2. Checks `CoursePrice` table for a country-specific price
3. Falls back to base course price in INR
4. Converts to smallest currency unit (paise for INR, fils for KWD)

---

## 9. Enrollment Flow

### Enrolled (logged-in) user, free course
`EnrollmentService.enroll()` → creates `ENROLLED` row → sends confirmation email

### Enrolled (logged-in) user, paid course
`PaymentController.createOrder()` → PENDING row → Razorpay checkout →
`EnrollmentService.confirmEnrollmentPayment()` or webhook → `ENROLLED` → email

### Guest user, paid course
`GuestEnrollmentService.startGuestCourseEnrollment()` → `findOrCreateGuestUser()` → PENDING row →
Razorpay checkout → `confirmGuestCoursePayment()` → ENROLLED → generate magic link → email

### Bundle (value pack)
`CourseBundleService` → one PENDING row per course in bundle → confirmation →
`sendBundleEnrollmentSuccess()` sends one consolidated email listing all courses.
The email is sent only by whichever confirmation path (frontend `/confirm` or webhook) enrolls the courses first. See §8 and incident 13.2.

### Magic link access (guest users)
Guest enrolled users receive a magic link in their enrollment email.
Token generated by `UserService.generateMagicLinkToken()` — 64 chars, valid 30 days.
`GET /api/auth/magic?token={token}` validates and returns a JWT.

---

## 10. Auth & Guest User System

### JWT
- Signed with HS256 using `JWT_SECRET` (min 32 chars — validated at startup)
- Expiry: 24 hours (`jwt.expiration=86400000`)
- Stored client-side, sent as `Authorization: Bearer {token}`

### Google OAuth
- ID token from frontend verified against `GOOGLE_CLIENT_ID`
- `findOrCreateGoogleUser()` — creates user with `authProvider=GOOGLE`, no password set

### Guest users
- Created by `UserService.findOrCreateGuestUser(name, email, phone)`
- Random 32-char password set (unusable — access only via magic link)
- Magic link token: 64-char random string, stored in `user.magic_link_token`
- Token cleared when user sets a real password

### Password reset
- Token: 64-char random, stored in `password_reset_token` table
- Expiry: 1 hour
- `PasswordResetService.generateAndSendToken()` → sends reset email

---

## 11. Scheduled Jobs

| Cron | Class | Method | What it does |
|---|---|---|---|
| `0 0 9 * * *` (09:00 AM daily) | `CourseReminderScheduler` | `sendCourseReminders()` | Sends reminder emails to all enrolled users whose SLA (reminderDays) has elapsed and no reminder has been sent yet. Sets `reminderSentAt` to prevent duplicate sends. |
| `0 0 9 * * *` (09:00 AM daily) | `MarketingCampaignService` | `processDailyBatches()` | Sends next pending batch (500 recipients) for any IN_PROGRESS marketing campaign. |

`CourseReminderScheduler` processes both course enrollments and flagship program enrollments in sequence in the same run. Delay between sends: 200ms (added 2026-06-13).

---

## 12. Database Migrations

Managed by Flyway. Migration files in `src/main/resources/db/migration/`.
Production profile: `ddl-auto=none` — schema changes only via Flyway.

Key tables created by migrations:

| Table | Migration | Purpose |
|---|---|---|
| `mail_template` | V23 | Admin-editable email templates |
| `mail_template.html_body` | V24 | HTML body column added |
| `marketing_campaign` | Later migration | Marketing campaign records |
| `marketing_mail_log` | Later migration | Per-recipient send status |
| `enrollment` | Early | Course enrollment records |
| `certificate` | Early | Issued certificates |
| `password_reset_token` | Early | Password reset tokens |

---

## 13. Incident Log

### 13.1 SSL certificate expired — site outage (Aug 4-5, 2026)
**Symptom:** login broken and courses not loading; browser shows `NET::ERR_CERT_DATE_INVALID`. All containers were healthy.
**Root cause:** the certbot container renewed the certificate on Jul 5 as designed, but nginx (`frontend` container) loads the certificate only at startup and was never reloaded. It kept serving the old certificate until that expired.
**Immediate fix:** manual `certbot renew --force-renewal` + `docker compose restart frontend`.
**Permanent fix (2026-10-02, commit `4e8ff7ef`):** `frontend/docker-entrypoint.d/90-cert-reload.sh`. It checks the certificate every 6h and runs a graceful `nginx -s reload` when it changes. Details are in `docs/SERVER_MAINTENANCE.md` (Incident 3).
**Verify:** `docker logs uyirgene-frontend 2>&1 | grep cert-reload` shows `certificate changed - nginx reloaded` after each renewal (~every 60 days).

### 13.2 Bundle purchase — no confirmation email (Sep 29, 2026)
**Symptom:** a logged-in customer (user ID 1271) bought bundle #23 (4 courses, EUR 43.05, `order_ThwFSt6WUeT3XM`). The payment succeeded and all 4 courses were enrolled, but no email was sent.
**Timeline (UTC):** 17:42:30 webhook `payment.captured` → 17:42:31 4 enrollments confirmed → 17:42:31 `ERROR Failed to send bundle enrollment email after webhook confirmation` → 17:42:41 frontend `/confirm` arrives, finds all courses already ENROLLED, sends nothing.
**Root cause:** the webhook read `enrollment.getBundle().getTitle()` with no open Hibernate session (self-invoked `@Transactional` + `open-in-view: false`). `bundle` is LAZY, so this threw `LazyInitializationException`. The error was caught and logged, and the email was dropped. The frontend path then skipped the email because nothing was newly enrolled.
**Scope:** every bundle purchase where the webhook arrived before the frontend confirm, since the webhook bundle-email code was added (commit `85f85f04`, May 11 2026). Single-course and flagship purchases are not affected (those associations are EAGER).
**Fix (2026-10-02):** `@EntityGraph` on `EnrollmentRepository.findAllByPaymentOrderId` (associations fetched in the query), plus orderId/email added to the webhook email error logs. Fix 2 (making the webhook transaction effective) was not applied.
**Follow-up:** identify other bundle buyers since May 11 who missed the email and contact them.

### 13.3 Razorpay SSL certificate rotation notice (Oct 5, 2026) — no action needed
Razorpay renewed its API certificate on Oct 5 2026. The backend calls `api.razorpay.com` through a default `RestTemplate` with the JVM's standard trust store (`eclipse-temurin:17-jre-alpine`). There is no certificate pinning or custom trust store, so the new certificate is trusted automatically. If it ever fails, the backend log will show `SSLHandshakeException` / `PKIX path building failed`.

---

*Last updated: 2026-10-02*
