# Advanced URL Shortener with Analytics, Custom Aliases, and Rate Limiting

![Project Logo](https://res.cloudinary.com/cocoder/image/upload/v1738152945/Projects/url_shortner/url-shortner_obfbk3.png)

## 🚀 Overview

This project is a **scalable URL Shortener API** with advanced features such as **analytics tracking, custom aliases, user authentication via Google Sign-In, and rate limiting**. The solution is **Dockerized** and can be deployed on a cloud hosting service for scalability.

## 🔥 Features

- ✅ **Google Sign-In Authentication**
- ✅ **Short URL Generation with Custom Aliases**
- ✅ **Real-Time Analytics Tracking** (Clicks, Unique Users, OS, Device Type, Geolocation)
- ✅ **Rate Limiting to Prevent Abuse**
- ✅ **Topic-Based URL Grouping**
- ✅ **Caching with Redis for Performance Optimization**
- ✅ **Dockerized for Easy Deployment**
- ✅ **Comprehensive API Documentation with Swagger**
- ✅ **Unit Tests for API Validation**

## 🏗️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** Google OAuth 2.0
- **Caching:** Redis
- **Deployment:** Docker, Cloud Hosting (Render)

---

## 📌 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Arafat-alim/url-shortner-pro.git
cd url-shortner-pro
```

### 2️⃣ Set Up Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
PORT=
MONGO_DB_USERNAME=
MONGO_DB_PASSWORD=
MONGODB_URI=
GOOGLE_CLIENT_ID=
GOOGLE_SECRET=
SESSION_SECRET=
JWT_SECRET=
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
```

### 3️⃣ Install Dependencies

```bash
npm install
```

### 4️⃣ Run the Application

#### Development Mode

```bash
npm run dev
```

#### Production Mode

```bash
npm start
```

### 5️⃣ Run with Docker

```bash
docker build -t url-shortner-pro .
docker run -p 5000:5000 url-shortner-pro
```

---

## 📮 Postman Collection

- ⬇️ **Download Postman Application** - [🔗 Link](https://www.postman.com/downloads/)
- 🌍 **Access the Web Version of Postman** - [🔗 Postman Web](https://web.postman.co/home)
- ⬇️ **Download the Collection Here** 👉 [🔗 Link](https://bit.ly/4hr3N4M)

### ⏺️ How to `Import` a Downloaded Postman Collection

1. Click on the **`Import`** button in the top left corner of Postman.
2. Drag and drop the file into the import modal or manually select the file.
3. You're all set!

---

## 📌 API Endpoints

### 1️⃣ **User Authentication**

| Endpoint       | Method | Description                          |
| -------------- | ------ | ------------------------------------ |
| `/auth/google` | `GET`  | Authenticate user via Google Sign-In |
| `/auth/logout` | `POST` | Logout user                          |

### **Steps to Get the Authentication Token**

1. Open this URL in a browser: `https://url-shortner-pro.onrender.com/auth/google` or [Login with Google](https://url-shortner-pro.onrender.com/auth/google)
2. Sign up or log in with your Google account.
3. After successful authentication, you will receive a token. Copy it.
4. Open Postman and go to **Environment** settings. Add a new variable:
   - **Variable Name:** `accessToken`
   - **Initial Value:** Paste the copied token
   - **Current Value:** Paste the copied token
5. Select the API **Live Google Auth / Find Me**.
   1. Navigate to `Authorization` -> `Select Auth` -> `Bearer Token`
   2. Click **Send** to execute the request.
   3. You should receive the expected response.
6. You can now explore other APIs. If you encounter an `Unauthorized User` error, please notify us.
7. All set!

---

### 2️⃣ **Shorten URL**

| Endpoint          | Method | Description            |
| ----------------- | ------ | ---------------------- |
| `/api/v1/shorten` | `POST` | Create a new short URL |

**Request Body:**

```json
{
  "longUrl": "https://example.com/some-long-url",
  "customAlias": "mycustomalias", // optional
  "topic": "marketing"
}
```

### 3️⃣ **Redirect Short URL**

| Endpoint                  | Method | Description                  |
| ------------------------- | ------ | ---------------------------- |
| `/api/v1/shorten/{alias}` | `GET`  | Redirect to the original URL |

### 4️⃣ **Analytics**

| Endpoint                          | Method | Description                            |
| --------------------------------- | ------ | -------------------------------------- |
| `/api/v1/analytics/alias/{alias}` | `GET`  | Get analytics for a specific short URL |
| `/api/v1/analytics/topic/{topic}` | `GET`  | Get analytics for a topic              |
| `/api/v1/analytics/overall`       | `GET`  | Get overall analytics for the user     |

---

## 🚀 Deployment

### **Deploy to Render**

1. Push code to the GitHub repository.
2. Create a new project on your cloud hosting platform.
3. Connect the GitHub repository.
4. Add environment variables.
5. Deploy the application.

---

## 🧪 Testing

Run tests to ensure API functionality:

```bash
npm test
```

---

## 💪 Upcoming Features

- Test integration
- Swagger implementation
- User API
- Logger enhancements
- Additional analytics APIs
- Frontend applications
- Real-time monitoring
- Cloud provider migration from Render to AWS
- Notifier (Discord webhook)

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 🤝 Contributing

1. Fork the repository.
2. Create a new branch (`feature-xyz`).
3. Commit your changes.
4. Open a Pull Request.

---

## 📞 Contact

- **Author:** Arafat Aman Alim
- **Email:** arafat.aman.alim@gmail.com
- **GitHub:** [Arafat Aman Alim](https://github.com/arafat-alim)
- **Server is Live:** [Live URL](https://url-shortner-pro.onrender.com)
