# Quick Start Guide - Manual Service Startup

## Prerequisites Check
✓ Java 23 - Installed
✓ Node.js 20.15.1 - Installed
✓ PostgreSQL 16 - Running
✓ Database "UyirGene" - Created
✓ Configuration (.env) - Created with password: admin

---

## Step 1: Start Backend (Terminal 1)

### Option A: Using Command Prompt (CMD) - EASIEST
1. Open **Command Prompt** (not PowerShell)
2. Run these commands:
```cmd
cd "D:\Java Practise\uyirgene-backend"
set SPRING_PROFILES_ACTIVE=dev
set DB_USERNAME=postgres
set DB_PASSWORD=admin
mvn spring-boot:run
```

### Option B: Using PowerShell
1. Open **PowerShell**
2. Run these commands:
```powershell
cd "D:\Java Practise\uyirgene-backend"
$env:SPRING_PROFILES_ACTIVE="dev"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="admin"
mvn spring-boot:run
```

**Wait for this message:**
```
Started UyirgeneApplication in X.XX seconds
```

**Then test:** Open browser to http://localhost:8080/actuator/health
- Should show: `{"status":"UP"}`

---

## Step 2: Start Frontend (Terminal 2)

1. Open a **NEW Command Prompt or PowerShell window**
2. Run these commands:

```cmd
cd "D:\Java Practise\uyirgene-backend\frontend"
npm install
npm run dev
```

**Wait for this message:**
```
VITE ready in XXXms
Local: http://localhost:5173/
```

---

## Step 3: Test Application

1. Open browser to: **http://localhost:5173**

2. You should see:
   - ✓ Dark theme (black/gray background)
   - ✓ Professional UI with Material-UI
   - ✓ "Courses" page

3. **Test Registration:**
   - Click "Register"
   - Fill form:
     - Name: Test User
     - Email: test@test.com
     - Password: password123
     - Role: STUDENT
   - Click "Register"
   - Should see toast notification: "Registration successful!"

4. **Test Login:**
   - Email: test@test.com
   - Password: password123
   - Click "Login"
   - Should redirect to Courses page

5. **Test Mock Payment (Paid Course):**
   - Find a course with a price (₹XXX)
   - Click "Enroll"
   - Toast: "Processing mock payment..."
   - **Wait 2 seconds** (simulated payment)
   - Toast: "Payment successful! Enrollment complete."
   - Button changes to "Enrolled" (disabled)

6. **Test Free Course:**
   - Find a course without a price
   - Click "Enroll"
   - Toast: "Successfully enrolled in free course!"
   - Instant enrollment (no delay)

7. **Check My Courses:**
   - Click "My Courses" in navigation
   - Should see ONLY enrolled courses (bug is fixed!)

---

## Troubleshooting

### Backend won't start - "mvn not found"
Maven is not in your PATH. Try one of these:

**Option 1:** Add Maven to PATH
1. Find Maven installation (usually C:\Program Files\Apache\maven)
2. Add `C:\Program Files\Apache\maven\bin` to System PATH
3. Restart terminal and try again

**Option 2:** Use full Maven path
```cmd
"C:\Program Files\Apache\maven\bin\mvn" spring-boot:run
```

### Backend error: "Access denied for user 'postgres'"
The password might not be "admin".

1. Edit `.env` file in project root
2. Change `DB_PASSWORD=admin` to your actual PostgreSQL password
3. Restart backend

### Port 8080 already in use
```cmd
netstat -ano | findstr :8080
taskkill /PID <PID_NUMBER> /F
```

### Port 5173 already in use
```cmd
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

### Frontend error: "npm not found"
Node.js is installed but npm is not in PATH.
1. Close and reopen terminal
2. Run: `node --version` (should show v20.15.1)
3. Run: `npm --version` (should show a version)

---

## Expected Backend Console Output

When enrolling in a course, you should see:
```
Creating mock payment order for amount: 50000 paise, receipt: enroll-1
Mock order created successfully: order_mock_1736424567890_12345
Verifying mock payment signature for orderId: order_mock_...
Mock signature verification successful (always returns true in mock mode)
Sending enrollment success email to test@test.com for course: Spring Boot Course
```

---

## Success Indicators

✓ Backend console shows "Started UyirgeneApplication"
✓ Frontend shows dark theme immediately
✓ Toast notifications appear (not browser alerts)
✓ Mock payment shows "Processing..." then "Success!" after 2 seconds
✓ My Courses shows only enrolled courses
✓ No errors in browser console (F12)

---

## Need Help?

1. Keep both terminal windows open while testing
2. Watch backend logs for errors
3. Use browser DevTools (F12) to see network requests
4. Check backend health: http://localhost:8080/actuator/health

---

**Ready for production deployment next week!**
