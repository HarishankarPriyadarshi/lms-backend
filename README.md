# LMS Backend (Express + Prisma)

A Learning Management System (LMS) backend built with Node.js, Express, Prisma, and JWT-based authentication. Supports student, teacher, and admin flows, including login, password reset, event and assignment handling, and attendance retrieval.

## Tech stack

- Node.js (ES Modules)
- Express
- Prisma ORM
- SQLite/PostgreSQL/MySQL (via Prisma provider)
- JWT authentication
- bcrypt password hashing
- nodemailer for OTP email notifications

##  Features

- Student registration + login
- Teacher and admin login
- Forgot password / OTP verification / reset password
- Protected routes (`requireSignIn`)
- Role-based teacher middleware (`isTeacher`)
- Student profile and attendance retrieval
- Teacher event creation
- Teacher assignment creation
- Event & assignment query endpoints

##  API Routes

Base URL: `/api/v1/erp`

### Student routes (`/student`)
- POST `/register` - register a student (email + password)
- POST `/login` - student login
- POST `/forgotPassword` - send OTP to reset password
- POST `/otpverify` - verify OTP
- PUT `/resetPassword` - reset password
- GET `/profile` - student profile (JWT required)
- GET `/event` - list events (JWT required)
- GET `/assignment` - list assignments (JWT required)
- GET `/attendance/:year/:month` - attendance summary (JWT required)

### Teacher routes (`/teacher`)
- POST `/login` - teacher login
- POST `/forgotPassword` - send OTP for password reset
- POST `/otpverify` - verify OTP
- PUT `/resetPassword` - reset password
- GET `/profile` - teacher profile (JWT required)
- POST `/createEvent` - create event (JWT + role=teacher required)
- POST `/createAssignment` - create assignment (JWT + role=teacher required)

### Admin routes (`/admin`)
- POST `/login` - admin login
- POST `/forgotPassword` - send OTP for password reset
- POST `/otpverify/:id` - verify OTP using admin id
- PUT `/:id` - reset password using admin id
