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
- **Deployment:** Docker, Cloud Hosting ( Render)
  <!-- - **API Documentation:** Swagger -->
  <!-- - **Testing:** Jest / Mocha -->

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

## 📌 API Endpoints

### 1️⃣ **User Authentication**

| Endpoint           | Method | Description                          |
| ------------------ | ------ | ------------------------------------ |
| `/api/auth/google` | `GET`  | Authenticate user via Google Sign-In |
| `/api/auth/logout` | `POST` | Logout user                          |

### 2️⃣ **Shorten URL**

| Endpoint       | Method | Description            |
| -------------- | ------ | ---------------------- |
| `/api/shorten` | `POST` | Create a new short URL |

**Request Body:**

```json
{
  "longUrl": "https://example.com/some-long-url",
  "customAlias": "mycustomalias",
  "topic": "marketing"
}
```

### 3️⃣ **Redirect Short URL**

| Endpoint               | Method | Description                  |
| ---------------------- | ------ | ---------------------------- |
| `/api/shorten/{alias}` | `GET`  | Redirect to the original URL |

### 4️⃣ **Analytics**

| Endpoint                       | Method | Description                            |
| ------------------------------ | ------ | -------------------------------------- |
| `/api/analytics/alias/{alias}` | `GET`  | Get analytics for a specific short URL |
| `/api/analytics/topic/{topic}` | `GET`  | Get analytics for a topic              |
| `/api/analytics/overall`       | `GET`  | Get overall analytics for the user     |

---

## 🚀 Deployment

### **Deploy to Render**

1. Push code to GitHub repository.
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
- **Email:** arafat.aman.alimgmail.com
- **GitHub:** [Arafat Aman Alim](https://github.com/arafat-alim)
<!-- - **Live Demo:** [Live URL](https://your-live-app.com) -->

---
