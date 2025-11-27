# 🚀 InvestMatch – Startup & Investor Matching Platform (MERN)

A full-stack web platform that connects **startups** with **investors** using a rule-based **Matching Engine**.  
Startups can create profiles, view matching investors, and send connection requests.  
Investors can manage profile details and accept/reject startup requests.

This project is built using **MERN Stack** with JWT authentication and clean, modular architecture.

---

## ⭐ Features

### 🔐 Authentication
- User registration (Startup / Investor)
- Secure login with JWT
- Protected routes (Dashboard, Profile pages)

### 🧑‍💼 Startup Features
- Create/Edit startup profile  
- View dashboard  
- See matched investors (based on matching engine)  
- Send requests to investors  
- Track request statuses (pending/accepted/rejected)

### 💼 Investor Features
- Create/Edit investor profile  
- View dashboard  
- See received requests  
- Accept/Reject requests  

### 🎯 Matching Engine (Rule-Based)
Matches startups with investors using scoring logic:

| Criteria | Score |
|---------|--------|
| Industry match | +40 |
| Funding range fit | +30 |
| Location match | +20 |
| Stage/interest match | +10 |

Investors are returned in **sorted order** (highest score first).

---

## 🛠️ Tech Stack

### **Frontend**
- React (Vite)
- Axios
- React Router
- Tailwind CSS
- React Hot Toast

### **Backend**
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- CORS
- dotenv

### **Tools**
- Postman (API Testing)
- Render (Backend Deployment)
- Vercel (Frontend Deployment)

---

## 📁 Folder Structure

/backend
├── controllers
├── models
├── routes
├── middleware
├── config
└── server.js

/frontend
├── src
│ ├── pages
│ ├── components
│ ├── context
│ ├── utils
│ └── App.jsx
└── index.html


PORT=5000
MONGO_URI=mongodb://localhost:27017/investorDB
JWT_SECRET=xxxxxxxx
JWT_EXPIRES_IN=7d

✔ Startup Flow

Login → Dashboard → Create/Edit Profile → Matched Investors → Send Request → View Sent Requests → Logout

✔ Investor Flow

Login → Dashboard → Create/Edit Profile → View Received Requests → Accept/Reject → Logout



