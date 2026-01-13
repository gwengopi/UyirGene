# Uyirgene Learning Platform

A modern, production-ready online learning platform with video courses, enrollment management, mock payment processing, and certificate generation.

## 🚀 Features

- **Course Management**: Browse, search, and enroll in video-based courses
- **Mock Payment System**: Simulated payment processing (2-second delay, always succeeds)
- **User Authentication**: Secure HTTP Basic Auth with role-based access (Student, Instructor, Admin)
- **Video Progress Tracking**: Resume courses from where you left off
- **Certificate Generation**: Downloadable PDF certificates upon course completion
- **Email Notifications**: Enrollment confirmations via email
- **Dark Theme**: Professional dark UI matching uyirgene.com design
- **Responsive Design**: Mobile-first approach with Material-UI

## 🛠️ Tech Stack

### Backend
- Java 17
- Spring Boot 3.3.4
- PostgreSQL 15
- Flyway (database migrations)
- Spring Security
- Swagger/OpenAPI
- Apache PDFBox (certificates)
- Logback (logging)

### Frontend
- React 18.2
- Material-UI 5.14 (Dark Theme)
- React Router 6
- Axios
- Vite 5.3

### DevOps
- Docker & Docker Compose
- Nginx (frontend serving)
- Multi-stage builds

## 📦 Quick Start

### Prerequisites
- Docker (v20.10+)
- Docker Compose (v2.0+)
- 2GB RAM minimum

### Development Setup

1. **Clone the repository**:
   ```bash
   cd "D:\Java Practise\uyirgene-backend"
   ```

2. **Start all services**:
   ```bash
   docker-compose up
   ```

3. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080
   - API Docs: http://localhost:8080/swagger-ui.html

4. **Test the mock payment**:
   - Register a new user
   - Browse courses
   - Enroll in a paid course
   - Payment will automatically complete after 2 seconds

### Manual Setup (Without Docker)

**Backend:**
```bash
# Install PostgreSQL and create database
createdb UyirGene

# Set environment variables
export SPRING_PROFILES_ACTIVE=dev
export DB_USERNAME=postgres
export DB_PASSWORD=postgres

# Run backend
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🎨 Features Showcase

### Mock Payment Flow
- Simulates real payment processing
- 2-second delay to mimic gateway response
- Always succeeds for testing
- Toast notifications for user feedback
- Automatic enrollment confirmation

### Dark Theme
- Professional dark background (`rgb(22, 22, 22)`)
- Card surfaces (`rgb(30, 30, 30)`)
- Slate blue-gray accents (`rgb(79, 102, 114)`)
- Smooth hover effects and transitions

### User Roles
- **Student**: Browse, enroll, track progress
- **Instructor**: Create courses, add videos
- **Admin**: Full access including course deletion

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/{id}` - Get course details
- `POST /api/courses` - Create course (Instructor/Admin)
- `DELETE /api/courses/{id}` - Delete course (Admin)

### Enrollment
- `POST /api/courses/{id}/enroll` - Start enrollment (free or paid)
- `POST /api/courses/{id}/enroll/confirm` - Confirm mock payment
- `GET /api/courses/enrolled` - List enrolled courses

### Videos
- `GET /api/courses/{id}/videos` - List course videos
- `POST /api/videos/{id}/progress` - Update progress

### Certificates
- `GET /api/courses/{id}/certificate` - Download certificate (PDF)

## 🔧 Configuration

### Environment Variables

**Development** (application-dev.yml):
```yaml
SPRING_PROFILES_ACTIVE=dev
DB_USERNAME=postgres
DB_PASSWORD=postgres
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
```

**Production** (application-prod.yml):
```yaml
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=jdbc:postgresql://your-db-host:5432/UyirGene
DB_USERNAME=your_db_user
DB_PASSWORD=your_secure_password
CORS_ALLOWED_ORIGINS=https://yourdomain.com
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
PAYMENT_PROVIDER=mock
```

See `.env.example` for complete list.

## 🧪 Testing

### Run Backend Tests
```bash
./mvnw test
```

### Test Mock Payment
1. Start the application
2. Register a user
3. Browse courses
4. Click "Enroll" on a paid course
5. Toast notification: "Processing mock payment..."
6. After 2 seconds: "Payment successful! Enrollment complete."
7. Course appears in "My Courses"

### Check Logs
```bash
# View mock payment logs
docker-compose logs backend | grep -i "mock"

# Should see:
# Creating mock payment order for amount: X paise
# Mock order created successfully: order_mock_...
# Verifying mock payment signature
# Mock signature verification successful
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose up
```

### Production
```bash
# Copy and configure environment
cp .env.example .env
nano .env

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### Health Checks
```bash
# Backend
curl http://localhost:8080/actuator/health

# Frontend
curl http://localhost:5173
```

## 📖 Documentation

- [Deployment Guide](docs/DEPLOYMENT.md) - Detailed deployment instructions
- [Environment Variables](docs/ENVIRONMENT_VARIABLES.md) - Configuration reference
- [API Documentation](http://localhost:8080/swagger-ui.html) - Interactive API docs

## 🔐 Security

- HTTP Basic Authentication
- Password encryption (BCrypt)
- CORS configuration
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Input validation
- SQL injection protection (JPA)
- Global exception handling

## 🎯 Project Structure

```
uyirgene-backend/
├── src/main/java/com/uyirgene/
│   ├── auth/              # Authentication
│   ├── course/            # Course management
│   │   └── payment/       # Payment providers (Mock & Razorpay)
│   ├── user/              # User management
│   ├── exception/         # Global error handling
│   └── config/            # Spring configuration
├── src/main/resources/
│   ├── db/migration/      # Flyway migrations
│   └── templates/         # Email templates
├── frontend/
│   └── src/
│       ├── components/    # React components
│       ├── pages/         # Page components
│       ├── hooks/         # Custom hooks (usePayment, useToast)
│       └── theme.js       # Dark theme config
├── Dockerfile             # Backend Docker image
├── docker-compose.yml     # Dev orchestration
└── docker-compose.prod.yml # Prod orchestration
```

## 🚀 Production Readiness Checklist

- [x] Mock payment system
- [x] Global exception handling
- [x] Input validation
- [x] Environment-based configuration
- [x] Database migrations (Flyway)
- [x] Logging framework (Logback)
- [x] Docker containerization
- [x] Security headers
- [x] CORS configuration
- [x] Dark theme UI
- [x] Toast notifications
- [x] Loading states
- [x] Health checks
- [x] API documentation
- [x] Deployment guide

## 📝 Recent Changes

### Mock Payment System
- Replaced Razorpay with mock payment for testing
- 2-second simulated delay
- Always succeeds for smooth testing
- Profile-based switching (dev=mock, prod=razorpay ready)

### Dark Theme
- Professional dark design matching uyirgene.com
- Material-UI custom theme
- Consistent styling across all pages
- Responsive design

### Production Hardening
- Flyway migrations replacing ddl-auto
- Global exception handler
- Environment-based configs
- Security headers
- Comprehensive logging

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📧 Support

For issues or questions:
1. Check logs: `docker-compose logs backend`
2. Review [DEPLOYMENT.md](docs/DEPLOYMENT.md)
3. Check health endpoints
4. Verify environment variables

## 🎓 About Uyirgene

Uyirgene provides specialized training courses in:
- Microbiology
- Food Safety
- ISO Auditing
- Pharmaceutical Compliance

Visit: https://uyirgene.com

---

**Built with ❤️ for online education**
