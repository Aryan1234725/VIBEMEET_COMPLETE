# 🚀 QUICKSTART GUIDE

Get your backend running in **2 minutes**!

## ✅ Method 1: IntelliJ IDEA (Easiest!)

1. **Download IntelliJ IDEA Community** (free): https://www.jetbrains.com/idea/download/
2. **Install** it
3. **Open IntelliJ** → File → Open
4. **Select** this `video-call-backend-complete` folder
5. **Wait** 2-5 minutes for Maven to download dependencies
6. **Navigate:** `src/main/java/com/videocall/VideoCallBackendApplication.java`
7. **Right-click** on the file → **Run 'VideoCallBackendApplication'**
8. **Wait** for "Started VideoCallBackendApplication" in console

✅ **Backend running on:** `http://localhost:8080`

---

## ✅ Method 2: VS Code

### Prerequisites
1. **Install Extensions:**
   - Extension Pack for Java
   - Spring Boot Extension Pack

### Steps
1. **Open VS Code**
2. **File → Open Folder** → Select this folder
3. **Wait** for Java to configure (2-3 minutes)
4. **Look for Spring Boot Dashboard** in left sidebar
5. **Click ▶️ Run** next to your app

**OR use terminal:**
```bash
mvn spring-boot:run
```

---

## ✅ Method 3: Command Line (Maven)

```bash
# Navigate to project folder
cd path/to/video-call-backend-complete

# Run Spring Boot
mvn spring-boot:run
```

---

## 🧪 Test It's Working

### Test 1: H2 Console
Open browser: `http://localhost:8080/h2-console`

Login:
- JDBC URL: `jdbc:h2:mem:videocall_db`
- Username: `sa`
- Password: (leave empty)

### Test 2: Register a User

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/users/register" -Method Post -ContentType "application/json" -Body '{"name":"Test User","username":"test","password":"test123"}'
```

**cURL:**
```bash
curl -X POST http://localhost:8080/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","username":"test","password":"test123"}'
```

### Test 3: Login

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/users/login" -Method Post -ContentType "application/json" -Body '{"username":"test","password":"test123"}'
```

Should return:
```json
{
  "token": "eyJhbGciOi...",
  "message": "Login successful"
}
```

---

## 🎯 Connect Your Frontend

1. **Update** `frontend/src/environment.js`:
   ```javascript
   const server = "http://localhost:8080";
   export default server;
   ```

2. **Start frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Open:** `http://localhost:3000`

---

## 💳 Test Payment

1. **Login** to your app
2. **Go to** `/payment` page
3. **Click** "UPGRADE ₹499/MO"
4. **Use test card:**
   - Card: `4111 1111 1111 1111`
   - CVV: `123`
   - Expiry: `12/25`

---

## 🆘 Troubleshooting

### "Port 8080 already in use"
**Solution:** Stop other apps using port 8080, or change port in `application.properties`:
```properties
server.port=8081
```

### "mvn command not found"
**Solution:** Use IntelliJ IDEA (has Maven built-in) OR install Maven:
```bash
choco install maven
```

### Backend starts but returns errors
**Solution:** Check Razorpay keys in `application.properties` are correct

---

## ✅ Success Checklist

- [ ] Backend starts without errors
- [ ] Console shows "Started VideoCallBackendApplication"
- [ ] Can access `http://localhost:8080/h2-console`
- [ ] User registration works
- [ ] User login returns JWT token
- [ ] Frontend connects to backend
- [ ] Payment page shows Razorpay popup

---

**That's it! You're ready to go!** 🎉

See `README.md` for detailed documentation.
