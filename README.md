# InvestMatch 🚀

**InvestMatch** is a full-stack web application designed to bridge the gap between Startups and Investors. It simplifies the fundraising process by using a matching algorithm to connect founders with the right investors based on industry, funding needs, and risk appetite.

## 🌟 Key Features

*   **👥 User Roles**: Separate dashboards and profiles for **Startups** and **Investors**.
*   **🤝 Smart Matching**: Intelligent matching algorithm to find compatible connections.
*   **💬 Real-Time Chat**: Integrated messaging system using **Socket.io** for instant communication between matched users.
*   **🔐 Secure Authentication**: JWT-based authentication with Google OAuth integration.
*   **🔔 Request System**: Connection request workflow (Send, Accept, Reject).
*   **📂 Profile Management**: Detailed profiles with pitch decks (Startups) and investment preferences (Investors).
*   **📱 Responsive Design**: Built with specific focus on user experience.

## 🛠️ Tech Stack

### Frontend
*   **React.js** (Vite)
*   **Tailwind CSS** (Styling)
*   **Framer Motion** (Animations)
*   **Socket.io Client** (Real-time communication)
*   **React Router DOM** (Navigation)
*   **Axios** (API Requests)

### Backend
*   **Node.js & Express.js** (Server)
*   **MongoDB & Mongoose** (Database)
*   **Socket.io** (WebSockets)
*   **JWT & Bcrypt** (Auth & Security)
*   **Multer** (File Uploads)

---

## 🚀 Getting Started

Follow these step-by-step instructions to set up the project locally.

### Prerequisites
*   Node.js (v14 or higher)
*   MongoDB (Local or Atlas URL)
*   Git

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/investmatch.git
cd investmatch
```

### 2. Backend Setup (`/backend`)

The backend runs on Node.js and Express.

1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a file named `.env` in the `backend` directory and add the following keys:
    ```env
    PORT=5000
    MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/yourdbname
    JWT_SECRET=your_super_secret_jwt_key
    ```

4.  Start the Server:
    ```bash
    npm run dev
    ```
    ✅ The server should be running on `http://localhost:5000`.

### 3. Frontend Setup (`/frontend`)

The frontend is a React + Vite application.

1.  Open a new terminal and navigate to the frontend folder:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a file named `.env` in the `frontend` directory and add the following keys:
    ```env
    # Google OAuth Client ID (Required for Login)
    VITE_GOOGLE_CLIENT_ID=your_google_client_id_from_console

    # Webhooks (Optional/Custom)
    VITE_N8N_NEWS_URL=[url]
    VITE_N8N_email_URL=[url]

    for webhook contact me- [imraghu0805@gmail.com]

4.  Start the Application:
    ```bash
    npm run dev
    
    ✅ The application should be running on `http://localhost:5173`.

---

## 📂 Project Structure

```
investmatch/
├── backend/            # Express, MongoDB, Socket.io Server
│   ├── .env            # Backend Environment Variables
│   ├── config/         # Database configuration
│   ├── controllers/    # Route logic
│   ├── models/         # Mongoose Schemas
│   ├── routes/         # API endpoints
│   ├── socket/         # Real-time logic
│   └── server.js       # Entry point
│
└── frontend/           # React application
    ├── .env            # Frontend Environment Variables
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── pages/      # Application pages
    │   ├── context/    # Context API (Auth, etc.)
    │   └── utils/      # API helpers
```

## 🤝 Contribution
Contributions are welcome! Please fork the repository and create a pull request.
