

---

# Planix – Venue Discovery & Booking Platform

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge\&logo=vercel)](https://event-management-chi-beige.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/Code-GitHub-black?style=for-the-badge\&logo=github)](https://github.com/Vardhan2006/event-management)


Planix is a full-stack web application designed to simplify venue discovery and booking. It enables users to explore event spaces, view detailed information, and make bookings, while providing administrators with efficient tools to manage venues and interactions.

---

## Live Demo

[https://event-management-chi-beige.vercel.app/](https://event-management-chi-beige.vercel.app/)

---

## Features

### User

* Browse and search venues
* View venue details with images
* Book venues and Track efficiently
* Fully responsive interface

### Admin

* Add, update, and delete venues
* Manage bookings and user activity
* Handle image uploads via Cloudinary

---

## Tech Stack

| Layer      | Technology                     |
| ---------- | ------------------------------ |
| Frontend   | React.js |
| Backend    | Node.js, Express.js            |
| Database   | MongoDB                        |
| Cloud      | Cloudinary                     |
| Deployment | Vercel (Frontend), Render (Backend) |

---


---

## Installation & Setup

### Clone Repository

```bash
git clone https://github.com/Vardhan2006/event-management.git
cd event-management
```

### Backend Setup

```bash
cd server
npm install
```

Create `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Run backend:

```bash
npm run dev
```

---

### Frontend Setup

```bash
cd client
npm install
npm start
```

---

## Workflow

1. User accesses the platform and explores venues
2. React frontend sends API requests using Axios
3. Express backend processes requests via REST APIs
4. MongoDB handles data storage and retrieval
5. Cloudinary manages image uploads and delivery
6. Data is rendered dynamically on the frontend

---

## Key Concepts

* RESTful API architecture
* CRUD operations
* MVC design pattern
* React component-based architecture
* Cloud-based media handling
* Full-stack MERN integration

---

## Future Enhancements

* Location-based search and filtering
* Google Maps integration
* Reviews and ratings system
* Payment gateway integration
* Enhanced UI/UX

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Open a Pull Request
