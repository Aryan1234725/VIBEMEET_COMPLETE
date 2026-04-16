# 🎥 Video Call Backend - Complete with Payment Integration

Complete Spring Boot backend for video calling application with Razorpay payment integration.

## ✨ Features

- ✅ User Registration & Login (JWT Authentication)
- ✅ Meeting History Tracking
- ✅ Razorpay Payment Integration
- ✅ Subscription Management (Free/Pro)
- ✅ H2 In-Memory Database
- ✅ RESTful API
- ✅ CORS Configured

## 🚀 Quick Start

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- IntelliJ IDEA or VS Code

### Installation

#### Using IntelliJ IDEA (Recommended)

1. **Open IntelliJ IDEA**
2. **File → Open** → Select this folder
3. **Wait** for Maven dependencies to download
4. **Right-click** `VideoCallBackendApplication.java`
5. **Select** "Run 'VideoCallBackendApplication'"

#### Using VS Code

1. **Install Extensions:**
   - Extension Pack for Java
   - Spring Boot Extension Pack

2. **Open** this folder in VS Code

3. **Run:**
   - Use Spring Boot Dashboard (left sidebar)
   - Or terminal: `mvn spring-boot:run`

#### Using Maven Command Line

```bash
mvn spring-boot:run
```

## 📋 API Endpoints

### User Management

**Register User**
```http
POST /api/v1/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "username": "john",
  "password": "password123"
}
```

**Login**
```http
POST /api/v1/users/login
Content-Type: application/json

{
  "username": "john",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGc...",
  "message": "Login successful"
}
```

**Add Meeting to History**
```http
POST /api/v1/users/add_to_activity
Content-Type: application/json

{
  "token": "your-jwt-token",
  "meeting_code": "abc123"
}
```

**Get Meeting History**
```http
GET /api/v1/users/get_all_activity?token=your-jwt-token
```

### Payment Endpoints

**Create Payment Order**
```http
POST /api/v1/payments/create_order
Content-Type: application/json

{
  "token": "your-jwt-token",
  "plan": "PRO"
}

Response:
{
  "orderId": "order_...",
  "key": "rzp_test_...",
  "amount": 49900,
  "currency": "INR"
}
```

**Verify Payment**
```http
POST /api/v1/payments/verify_payment
Content-Type: application/json

{
  "token": "your-jwt-token",
  "plan": "PRO",
  "razorpay_order_id": "order_...",
  "razorpay_payment_id": "pay_...",
  "razorpay_signature": "signature..."
}
```

## ⚙️ Configuration

### application.properties

```properties
# Server
server.port=8080

# Database - H2 (In-Memory)
spring.datasource.url=jdbc:h2:mem:videocall_db
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# JWT
jwt.secret=your-secret-key
jwt.expiration=86400000

# Razorpay
razorpay.key.id=rzp_test_SOJOanpM6ANM4k
razorpay.key.secret=W0znkvNMRF12J6jlXf3iB9ak

# CORS
cors.allowed.origins=http://localhost:3000
```

### Update Razorpay Keys

Your Razorpay keys are already configured in `application.properties`:
- **Key ID:** `rzp_test_SOJOanpM6ANM4k`
- **Key Secret:** `W0znkvNMRF12J6jlXf3iB9ak`

For production, update these with your live keys.

## 🗄️ Database

### H2 Console

Access H2 Database Console:
- **URL:** http://localhost:8080/h2-console
- **JDBC URL:** `jdbc:h2:mem:videocall_db`
- **Username:** `sa`
- **Password:** (leave empty)

### Tables Created Automatically

- `users` - User accounts
- `meeting_activities` - Meeting history
- `payments` - Payment records

## 🧪 Testing

### Test Registration

```bash
curl -X POST http://localhost:8080/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "username": "test",
    "password": "test123"
  }'
```

### Test Login

```bash
curl -X POST http://localhost:8080/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "password": "test123"
  }'
```

### Test Payment (after login)

```bash
curl -X POST http://localhost:8080/api/v1/payments/create_order \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-jwt-token-here",
    "plan": "PRO"
  }'
```

## 💳 Razorpay Test Cards

Use these test cards in Razorpay checkout:

- **Card Number:** 4111 1111 1111 1111
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **Name:** Any name

**UPI Test ID:** `success@razorpay`

## 🎯 Subscription Plans

### Free Plan
- 5 participants max
- 40 min time limit
- Basic chat only
- No recording

### Pro Plan (₹499/month)
- 100 participants
- Unlimited time
- Cloud recording
- Priority support

## 🔧 Technology Stack

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security** (JWT)
- **Spring Data JPA**
- **H2 Database**
- **Razorpay SDK 1.4.6**
- **Lombok**
- **Maven**

## 📁 Project Structure

```
src/main/java/com/videocall/
├── VideoCallBackendApplication.java  # Main application
├── config/
│   └── SecurityConfig.java            # Security & CORS config
├── controller/
│   ├── UserController.java            # User endpoints
│   └── PaymentController.java         # Payment endpoints
├── dto/                                # Data Transfer Objects
│   ├── RegisterRequest.java
│   ├── LoginRequest.java
│   ├── AuthResponse.java
│   ├── CreateOrderRequest.java
│   ├── VerifyPaymentRequest.java
│   └── ...
├── entity/                             # JPA Entities
│   ├── User.java
│   ├── MeetingActivity.java
│   └── Payment.java
├── repository/                         # Data Access Layer
│   ├── UserRepository.java
│   ├── MeetingActivityRepository.java
│   └── PaymentRepository.java
├── service/                            # Business Logic
│   ├── UserService.java
│   └── PaymentService.java
├── util/
│   └── JwtUtil.java                   # JWT utilities
└── exception/
    └── GlobalExceptionHandler.java    # Error handling
```

## 🔍 Troubleshooting

### Port 8080 Already in Use

Change port in `application.properties`:
```properties
server.port=8081
```

### JWT Errors

Make sure JWT version is **0.11.5** in `pom.xml`:
```xml
<version>0.11.5</version>
```

### Maven Dependencies Not Downloading

```bash
mvn clean install
```

### Razorpay Payment Failing

1. Check Razorpay keys in `application.properties`
2. Use test cards listed above
3. Check logs for detailed error messages

## 📝 Environment Variables (Optional)

Instead of hardcoding in `application.properties`, you can use environment variables:

```bash
export RAZORPAY_KEY_ID=rzp_test_SOJOanpM6ANM4k
export RAZORPAY_KEY_SECRET=W0znkvNMRF12J6jlXf3iB9ak
export JWT_SECRET=your-secret-key
```

Then update `application.properties`:
```properties
razorpay.key.id=${RAZORPAY_KEY_ID}
razorpay.key.secret=${RAZORPAY_KEY_SECRET}
jwt.secret=${JWT_SECRET}
```

## 🚀 Deployment

### Build JAR

```bash
mvn clean package
```

JAR file will be in `target/video-call-backend-1.0.0.jar`

### Run JAR

```bash
java -jar target/video-call-backend-1.0.0.jar
```

## 📚 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Razorpay Documentation](https://razorpay.com/docs/)
- [JWT Documentation](https://jwt.io/)

## 🆘 Support

If you encounter any issues:

1. Check H2 console for database state
2. Check application logs
3. Verify Razorpay keys are correct
4. Ensure frontend is pointing to `http://localhost:8080`

## ✅ Success Checklist

- [ ] Backend starts without errors
- [ ] Can access H2 console
- [ ] User registration works
- [ ] User login returns JWT token
- [ ] Payment order creation works
- [ ] Payment verification works
- [ ] Frontend can connect to backend

---

**Your backend is ready! Start it and connect your frontend!** 🎉
