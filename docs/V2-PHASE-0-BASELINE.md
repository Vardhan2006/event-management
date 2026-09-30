# Event Management Platform — V2 Phase 0 Baseline

## 1. Current Git State
* **Current Branch**: `v2-development`
* **Target / Stable Branch**: `main`
* **Working Tree Status**: Clean (`nothing to commit, working tree clean`)
* **Latest Commit**: `f6143fe` ("fix: restore local development environment")

## 2. Current Architecture
* **Stack**: Full-stack MERN (MongoDB, Express, React, Node.js)
* **Frontend**: React (Create React App 19), React Router v7, Axios, CSS design system (`index.css`)
* **Backend**: Node.js, Express v5, Mongoose v9, Multer Cloudinary storage
* **Media Storage**: Cloudinary Cloud Media Hosting
* **Database**: MongoDB Atlas Cluster0 (`test` database)

## 3. Frontend Structure
* **Entry Points**: `src/index.js`, `src/App.js`
* **Routes (`src/routes/AppRoutes.jsx`)**:
  - `/` -> `Home.jsx`
  - `/venues` -> `Venues.jsx`
  - `/venues/:id` -> `VenueDetails.jsx`
  - `/events` -> `Events.jsx`
  - `/events/:id` -> `EventDetails.jsx`
  - `/create-event` -> `CreateEvent.jsx` (Protected)
  - `/login` -> `Login.jsx`
  - `/dashboard` -> `Dashboard.jsx` (Protected)
  - `/owner-dashboard` -> `OwnerDashboard.jsx` (Protected, Role: owner)
  - `/my-bookings` -> `MyBookings.jsx` (Protected)
* **Services**:
  - `src/services/venueService.js` (Axios API client for `/api/venues`)
  - `src/services/eventService.js` (Axios API client for `/api/events`)
* **State Management**:
  - `src/context/AuthContext.jsx` using `localStorage` (`eventflow_user`)
* **Components**:
  - Common: `Navbar`, `Footer`, `Loader`
  - Venues: `VenueCard`, `VenueForm`
  - Events: `EventCard`, `EventForm`
  - Bookings: `BookingCard`

## 4. Backend Structure
* **Entry Point**: `backend/server.js`
* **Config**:
  - `backend/config/db.js` (MongoDB Mongoose connection)
  - `backend/config/cloudinary.js` (Cloudinary SDK initialization)
* **Middleware**:
  - `backend/middleware/upload.js` (Multer + CloudinaryStorage)
* **Routes**:
  - `backend/routes/venueRoutes.js`
  - `backend/routes/eventRoutes.js`
* **Controllers**:
  - `backend/controllers/venueController.js`
  - `backend/controllers/eventController.js`

## 5. Database Structure
* **Collections**:
  - `venues`: Venue documents (`name`, `location`, `capacity`, `pricePerDay`, `description`, `services`, `ownerId`, `images`, `createdAt`)
  - `events`: Event / Booking request documents (`venueId`, `title`, `description`, `eventDate`, `userId`, `status`, `createdAt`)
* **Relationships**:
  - `Event.venueId` references `Venue._id` via Mongoose ObjectId ref.
  - `Venue.ownerId` and `Event.userId` store user string identifiers.

## 6. Existing API Endpoints

| Method | Endpoint | Purpose | Auth Required | Current Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | API Health check | No | Working |
| `GET` | `/api/venues` | Retrieve all venues | No | Working |
| `GET` | `/api/venues/:id` | Retrieve single venue details | No | Working |
| `POST` | `/api/venues` | Create venue + image upload | Client string | Working |
| `PATCH` | `/api/venues/:id` | Update venue + image upload | Client string | Working |
| `DELETE` | `/api/venues/:id` | Delete venue listing | Client string | Working |
| `GET` | `/api/events` | Retrieve all events | No | Working |
| `POST` | `/api/events` | Create event / booking request | Client string | Working |
| `GET` | `/api/events/user` | Fetch user booking requests | Client string | Working |
| `GET` | `/api/events/owner` | Fetch owner booking requests | Client string | Working |
| `PATCH` | `/api/events/:id` | Review booking status | Client string | Working |

## 7. External Services
* **MongoDB Atlas**: Database cluster hosting production venue data.
* **Cloudinary**: Cloud image storage for uploaded venue photos (`venues` folder).

## 8. Environment Variables
*(Variable names only — secret values protected)*
* `MONGO_URI`
* `CLOUD_NAME`
* `CLOUD_API_KEY`
* `CLOUD_API_SECRET`
* `PORT`
* `REACT_APP_API_URL`

## 9. Working V1 Features
* Public browsing of venue listings fetched from MongoDB Atlas.
* Single venue detailed view.
* Multi-image uploads streamed to Cloudinary on venue creation/update.
* Client-side dummy authentication saving user role (`user`/`owner`) to `localStorage`.
* Request booking modal creating pending booking documents in DB.
* Owner dashboard displaying listed venues and incoming booking requests.
* Approve/reject review workflow for booking requests.

## 10. Known Technical Debt
* Absence of server-side token authentication (JWT/OAuth/Session).
* Overloading of the `Event` schema to represent venue booking requests.
* Absence of a backend `User` collection/model.
* Insecure client-side authorization parameters (`ownerId`, `userId` passed in queries/bodies).
* Lack of automated test suite and request input validation library.

## 11. V2 Areas Planned for Change

| Area | Current V1 | Planned V2 Change | Risk |
| :--- | :--- | :--- | :--- |
| Authentication | Client-side dummy login (`localStorage`) | Server-side JWT/Bcrypt authentication | High |
| User Model | Missing | Dedicated `User` schema (`name`, `email`, `password`, `role`) | High |
| Booking Schema | Overloaded onto `Event` schema | Dedicated `Booking` schema | High |
| Authorization | Unverified string comparison | Middleware-enforced token authorization | High |
| Venues | Working CRUD | Preserve data & secure endpoints | Medium |

## 12. Data That Must Be Preserved
* **Existing Mongo Atlas Database**: `test`
* **Collection**: `venues` (3 production documents: *SV Hall*, *BPJ Hall*, *Grand Hall*)
* **Cloudinary Media**: Uploaded image assets referenced in venue documents.

## 13. Phase 0 Verification Checklist
* [x] Current branch is `v2-development`
* [x] Branch `main` has not been modified
* [x] No database data was modified, added, or deleted
* [x] No `.env` secret values were committed or logged
* [x] React frontend starts cleanly (`http://localhost:3000`)
* [x] Express backend starts cleanly (`http://localhost:5000`)
* [x] MongoDB connects successfully
* [x] `GET /api/venues` API endpoint returns existing 3 venues
* [x] Existing venues display properly in React UI
* [x] Zero application source code files were modified during Phase 0
