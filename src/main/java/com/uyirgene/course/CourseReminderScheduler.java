package com.uyirgene.course;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


@Component
@RequiredArgsConstructor
@Slf4j
public class CourseReminderScheduler {

    private final EnrollmentRepository enrollmentRepository;
    private final MailService mailService;

    /**
     * Runs daily at 09:00 AM.
     * Sends completion reminder emails for both course and flagship program enrollments
     * where the SLA (reminderDays) has elapsed and no reminder has been sent yet.
     */
    @Scheduled(cron = "0 0 9 * * *")
    public void sendCourseReminders() {
        LocalDate today = LocalDate.now();
        int sent = 0;

        // ── Course reminders ──────────────────────────────────────────────────
        List<Enrollment> courseCandidates = enrollmentRepository.findPendingReminders(Enrollment.Status.ENROLLED);
        log.info("Course reminder scheduler: {} course enrollment(s) eligible for reminder check.", courseCandidates.size());
        for (Enrollment enrollment : courseCandidates) {
            try {
                Course course = enrollment.getCourse();
                if (course.getReminderDays() == null) continue;
                if (enrollment.getEnrolledAt() == null) {
                    log.warn("Course reminder scheduler: enrollment id={} has null enrolledAt, skipping.", enrollment.getId());
                    continue;
                }

                LocalDate dueDate = enrollment.getEnrolledAt().toLocalDate().plusDays(course.getReminderDays());
                log.info("Course reminder scheduler: enrollment id={}, dueDate={}, today={}", enrollment.getId(), dueDate, today);
                if (!dueDate.isAfter(today)) {
                    mailService.sendCourseReminder(enrollment.getUser(), course, enrollment);
                    enrollment.setReminderSentAt(LocalDateTime.now());
                    enrollmentRepository.save(enrollment);
                    sent++;
                }
            } catch (Exception ex) {
                log.error("Course reminder scheduler: error processing course enrollment id={}: {}",
                        enrollment.getId(), ex.getMessage(), ex);
            }
        }

        // ── Flagship program reminders ────────────────────────────────────────
        List<Enrollment> flagshipCandidates = enrollmentRepository.findPendingFlagshipReminders(Enrollment.Status.ENROLLED);
        log.info("Course reminder scheduler: {} flagship enrollment(s) eligible for reminder check.", flagshipCandidates.size());
        for (Enrollment enrollment : flagshipCandidates) {
            try {
                FlagshipProgram program = enrollment.getFlagshipProgram();
                if (program.getReminderDays() == null) continue;
                if (enrollment.getEnrolledAt() == null) {
                    log.warn("Course reminder scheduler: flagship enrollment id={} has null enrolledAt, skipping.", enrollment.getId());
                    continue;
                }

                LocalDate dueDate = enrollment.getEnrolledAt().toLocalDate().plusDays(program.getReminderDays());
                log.info("Course reminder scheduler: flagship enrollment id={}, dueDate={}, today={}", enrollment.getId(), dueDate, today);
                if (!dueDate.isAfter(today)) {
                    mailService.sendFlagshipReminder(enrollment.getUser(), program, enrollment);
                    enrollment.setReminderSentAt(LocalDateTime.now());
                    enrollmentRepository.save(enrollment);
                    sent++;
                }
            } catch (Exception ex) {
                log.error("Course reminder scheduler: error processing flagship enrollment id={}: {}",
                        enrollment.getId(), ex.getMessage(), ex);
            }
        }

        log.info("Course reminder scheduler: completed. {} reminder email(s) queued.", sent);
    }
}
