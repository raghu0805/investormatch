# Dockerization Guide for InvestMatch

This guide explains how to containerize your **InvestMatch** application (Frontend + Backend) using Docker and Docker Compose.

## Prerequisites

- [Install Docker Desktop](https://www.docker.com/products/docker-desktop/) on your machine.

---

## 1. Backend Dockerfile

We need to create a `Dockerfile` inside the `backend/` folder to tell Docker how to build the backend image.

**Step 1:** Create a file named `Dockerfile` (no extension) in `c:\Users\imrag\OneDrive\Desktop\investmatch\backend\`

**Step 2:** Paste the following content into `backend/Dockerfile`:

```dockerfile
# Use a lightweight Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for efficient caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your backend runs on (matches PORT in .env or server.js)
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]
```

---

## 2. Frontend Dockerfile

For the frontend, we will use a **multi-stage build**.
1.  **Build Stage**: Uses Node.js to build the React/Vite app into static files (`dist` folder).
2.  **Production Stage**: Uses **Nginx** to serve those static files.

**Step 1:** Create a file named `Dockerfile` inside `c:\Users\imrag\OneDrive\Desktop\investmatch\frontend\`

**Step 2:** Paste the following content into `frontend/Dockerfile`:

```dockerfile
# --- Stage 1: Build the React App ---
FROM node:20-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine

# Copy the build output from the previous stage to Nginx's html directory
COPY --from=build /app/dist /usr/share/nginx/html

# (Optional) Copy a custom nginx config if you need to handle React Router refresh
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Handling React Router (SPA)
By default, Nginx might not handle React Router paths (like `/login`) correctly on page refresh. To fix this, create an `nginx.conf` file in your `frontend/` folder:

**File:** `frontend/nginx.conf`
```nginx
server {
    listen 80;
    
    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```
*Note: If you use this, uncomment the `COPY nginx.conf ...` line in the Frontend Dockerfile.*

---

## 3. Docker Compose (Orchestration)

To run both Frontend and Backend together easily, we use `docker-compose`.

**Step 1:** Create a file named `docker-compose.yml` in the **root** folder (`c:\Users\imrag\OneDrive\Desktop\investmatch\`).

**Step 2:** Paste the following content:

```yaml
services:
  # Backend Service
  backend:
    build: ./backend
    container_name: investmatch-backend
    ports:
      - "5000:5000"
    env_file:
      - ./backend/.env
    environment:
      - PORT=5000
    depends_on:
      - mongo # Optional if you run mongo locally in docker

  # Frontend Service
  frontend:
    build: ./frontend
    container_name: investmatch-frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  # (Optional) MongoDB Service - if you want a local DB instead of Atlas
  mongo:
    image: mongo:latest
    container_name: investmatch-mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

---

## 4. How to Run

1.  Open your terminal in the root folder (`investmatch`).
2.  Run the following command to build and start everything:
    ```bash
    docker-compose up --build
    ```
3.  **Access your app**:
    - Frontend: `http://localhost`
    - Backend: `http://localhost:5000`

## 5. Important Notes on Environment Variables

- **Backend**: Ensure your `backend/.env` file exists. If you are pointing to `localhost` inside your `.env` (e.g., `MONGO_URI=mongodb://localhost:27017/...`), you must change `localhost` to `host.docker.internal` (to reach your machine) or the service name `mongo` (if running mongo in docker).
- **Frontend**: Vite environment variables (`VITE_...`) are baked in at **build time**. If you need to change the API URL, you must update your `.env` in the frontend folder **before** running `docker-compose build`, or use build args. 
    - Ensure your frontend is calling the backend at the correct URL. If running in Docker locally, `http://localhost:5000` usually works because the browser runs on your host machine.

