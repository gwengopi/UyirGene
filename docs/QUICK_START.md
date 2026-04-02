# 🚀 Uyirgene - Quick Start Guide

## Prerequisites Installation

### Required Software:
1. **Java 17+**: https://adoptium.net/
2. **Node.js 16+**: https://nodejs.org/
3. **PostgreSQL 15**: https://www.postgresql.org/download/windows/
4. **Maven** (optional, wrapper included)

### Quick Check:
```powershell
java -version      # Should show 17+
node --version     # Should show 16+
npm --version      # Should show 8+
psql --version     # Should show PostgreSQL
```

---

## 🎯 Automated Setup (Recommended)

### Step 1: Check Prerequisites
Open PowerShell in project directory:
```powershell
cd "D:\Java Practise\uyirgene-backend"
.\scripts\check-prerequisites.ps1
```

### Step 2: Setup Database
```powershell
.\scripts\setup-database.ps1
```
- Enter PostgreSQL username (default: `postgres`)
- Enter PostgreSQL password
- Database `UyirGene` will be created

### Step 3: Start All Services
```powershell
.\scripts\run-all.ps1
```
This will:
- Start backend in one window (port 8080)
- Start frontend in another window (port 5173)
- Wait 1-2 minutes for services to start

### Step 4: Test Application
```powershell
.\scripts\test-application.ps1
```

### Step 5: Open Browser
Go to: **http://localhost:5173**

You should see:
- ✅ Dark theme (black/gray background)
- ✅ Professional UI with Material-UI
- ✅ "Courses" page

---

## 🧪 Manual Testing Steps

### 1. Register User
- Click "Register" button
- Fill form:
  - Name: `Test User`
  - Email: `test@test.com`
  - Password: `password123`
  - Role: `STUDENT`
- Click "Register"
- Toast notification: "Registration successful!" (top-right)

### 2. Login
- Enter email: `test@test.com`
- Enter password: `password123`
- Click "Login"
- Redirects to Courses page

### 3. Test Mock Payment (Paid Course)
- Find a course with a price (₹XXX displayed)
- Click "Enroll" button
- Toast appears: "Processing mock payment..."
- **Wait 2 seconds** (simulated payment)
- Toast appears: "Payment successful! Enrollment complete."
- Button changes to "Enrolled" (disabled)

### 4. Test Free Course
- Find a course without a price
- Click "Enroll"
- Toast: "Successfully enrolled in free course!"
- Instant enrollment (no delay)

### 5. Check My Courses
- Click "My Courses" in navigation bar
- See only courses you enrolled in
- Should NOT show all courses (bug is fixed!)

### 6. Verify Backend Logs
In backend PowerShell window, look for:
```
Creating mock payment order for amount: 50000 paise, receipt: enroll-1
Mock order created successfully: order_mock_1736424567890_45678
Verifying mock payment signature for orderId: order_mock_...
Mock signature verification successful (always returns true in mock mode)
```

---

## 📂 Individual Service Commands

### Start Backend Only:
```powershell
.\scripts\start-backend.ps1

# Or with fresh build:
.\scripts\start-backend.ps1 -Build
```

### Start Frontend Only:
```powershell
.\scripts\start-frontend.ps1

# Or with fresh install:
.\scripts\start-frontend.ps1 -Install
```

---

## 🔧 Manual Setup (Without Scripts)

### Backend:
```powershell
# Set environment variables
$env:SPRING_PROFILES_ACTIVE="dev"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_password"

# Run
.\mvnw.cmd spring-boot:run
```

### Frontend:
```powershell
cd frontend
npm install
npm run dev
```

---

## 🌐 Access Points

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:8080 |
| **Health Check** | http://localhost:8080/actuator/health |
| **API Docs** | http://localhost:8080/swagger-ui.html |
| **Metrics** | http://localhost:8080/actuator/metrics |

---

## ✅ Verification Checklist

### Visual Checks:
- [ ] Dark theme applied (black background)
- [ ] Cards have gray background
- [ ] White/light gray text
- [ ] Blue-gray accent buttons
- [ ] No browser alert() popups
- [ ] Toast notifications appear top-right

### Functional Checks:
- [ ] Registration works
- [ ] Login works
- [ ] Courses load
- [ ] Mock payment works (2-second delay)
- [ ] Free enrollment works (instant)
- [ ] My Courses shows only enrolled courses
- [ ] Logout works

### Backend Checks:
- [ ] Health endpoint returns `{"status":"UP"}`
- [ ] No errors in backend console
- [ ] Database migrations successful
- [ ] Mock payment logs visible

---

## 🐛 Troubleshooting

### Backend won't start:
```powershell
# Check if port 8080 is in use
netstat -ano | findstr :8080

# Kill process (replace <PID>)
taskkill /PID <PID> /F
```

### Frontend won't start:
```powershell
# Check if port 5173 is in use
netstat -ano | findstr :5173

# Kill process
taskkill /PID <PID> /F

# Clean install
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
```

### Database connection error:
```powershell
# Check PostgreSQL is running
Get-Service postgresql*

# Start if needed
Start-Service postgresql-x64-15
```

### Clear and restart:
```powershell
# Stop all PowerShell windows
# Delete .env file
Remove-Item .env

# Start fresh
.\scripts\setup-database.ps1
.\scripts\run-all.ps1
```

---

## 📊 Expected Output

### Backend Console (when enrolling):
```
Creating mock payment order for amount: 50000 paise, receipt: enroll-1
Mock order created successfully: order_mock_1736424567890_12345
Verifying mock payment signature for orderId: order_mock_1736424567890_12345, paymentId: pay_mock_1736424569890_67890
Mock signature verification successful (always returns true in mock mode)
Sending enrollment success email to test@test.com for course: Spring Boot Course
```

### Frontend Browser Console:
- No errors (clean console)
- Network tab shows:
  - `POST /api/courses/1/enroll` → 201 Created
  - `POST /api/courses/1/enroll/confirm` → 200 OK

---

## 🎉 Success Indicators

You'll know it's working when:
1. **Dark theme** is visible immediately
2. **Toast notifications** appear (not browser alerts)
3. **Mock payment** shows "Processing..." then "Success!" after 2 seconds
4. **Backend logs** show mock payment messages
5. **My Courses** shows only enrolled courses
6. **No errors** in browser console

---

## 📚 Next Steps

After successful testing:
1. Install Docker Desktop for production deployment
2. Test with Docker: `docker-compose up`
3. Review deployment guide: `docs/DEPLOYMENT.md`
4. Prepare for cloud deployment next week

---

## 💡 Tips

- Keep both PowerShell windows open while testing
- Watch backend logs for mock payment messages
- Use browser DevTools (F12) to see network activity
- Toast notifications auto-dismiss after 6 seconds
- Mock payment always succeeds (for testing)

---

## 🆘 Need Help?

1. Run: `.\scripts\test-application.ps1`
2. Check: `docs/DEPLOYMENT.md`
3. Review logs in PowerShell windows
4. Ensure all services are running

---

**Built with ❤️ for online education**
