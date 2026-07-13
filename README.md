# UniSphere

UniSphere is a university event management platform built with a TypeScript MERN stack. It supports student and organizer workflows for clubs, events, registrations, attendance tracking, notifications, and personalized recommendations.

## Features

- Authentication and role-based access control
- Club discovery and management
- Event listing, creation, approval, and editing
- Registration handling with QR-based check-in
- Attendance recording and reporting
- In-app and email notifications
- Personalized event recommendations
- Organizer dashboard and event management tools

## Tech Stack

- Backend: Node.js, Express, TypeScript, MongoDB, Mongoose
- Frontend: React, TypeScript, Vite, React Router, Axios
- Authentication: JWT access and refresh tokens
- Email: Nodemailer

## Folder Structure

- `/client` - React frontend application
- `/server` - Express API server
- `/server/src` - TypeScript server source files
- `/server/src/models` - Mongoose data models
- `/server/src/controllers` - Route controllers
- `/server/src/services` - Business logic and data orchestration
- `/server/src/routes` - Express route definitions
- `/server/src/middlewares` - Validation, authentication, and error handling
- `/server/.env.example` - Backend environment variable guide

## Installation

From the repository root:

```bash
npm install
```

## Environment Variables

### Backend (`server/.env`)

- `PORT` - Backend port, e.g. `5000`
- `MONGODB_URI` - MongoDB connection string
- `JWT_ACCESS_SECRET` - JWT access token secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret
- `NODE_ENV` - `development` or `production`
- `CLIENT_URL` - Frontend origin allowed by CORS

### Frontend

Create a Vite environment file if needed or set the variable in your hosting provider:

- `VITE_API_URL` - URL of the backend API, e.g. `http://localhost:5000/api/v1`

## Run Commands

### Backend

```bash
npm run server:dev
```

### Frontend

```bash
npm run client:dev
```

### Build for production

```bash
npm run client:build
npm run build --prefix server
```

## API Overview

### Authentication

- `POST /api/v1/auth/register` — create user account
- `POST /api/v1/auth/login` — sign in and receive access token
- `POST /api/v1/auth/refresh` — refresh access token
- `POST /api/v1/auth/logout` — sign out

### Users

- `GET /api/v1/users/me` — fetch current user profile
- `PATCH /api/v1/users/me` — update profile

### Clubs

- `GET /api/v1/clubs` — list clubs
- `GET /api/v1/clubs/:id` — view club details

### Events

- `GET /api/v1/events` — list events
- `GET /api/v1/events/:id` — get event details
- `POST /api/v1/events` — create event (organizer/admin)
- `PATCH /api/v1/events/:id` — update event
- `DELETE /api/v1/events/:id` — delete event
- `GET /api/v1/events/analytics` — event analytics

### Registrations

- `POST /api/v1/registrations` — register for event
- `GET /api/v1/registrations` — list user registrations
- `DELETE /api/v1/registrations/:id` — cancel registration

### Attendance

- `POST /api/v1/attendance/check-in` — check in with QR token
- `GET /api/v1/attendance/events/:eventId/report` — attendance report

### Notifications

- `GET /api/v1/notifications` — list notifications
- `PATCH /api/v1/notifications/:id/read` — mark read
- `PATCH /api/v1/notifications/:id/unread` — mark unread
- `DELETE /api/v1/notifications/:id` — delete notification

### Recommendations

- `GET /api/v1/recommendations` — get personalized event recommendations
- `POST /api/v1/recommendations/refresh` — refresh personalized recommendations
- `GET /api/v1/recommendations/trending` — get trending event recommendations

## Deployment

### MongoDB Atlas

1. Create an Atlas account at https://www.mongodb.com/atlas.
2. Create a new project and a free shared cluster.
3. Add a database user with a strong password.
4. Add your deployment IP address or set to `0.0.0.0/0` temporarily for testing.
5. Copy the connection string and set `MONGODB_URI` in your backend environment.

### Backend Deployment (Render)

1. Create a new web service on Render.
2. Connect your GitHub repository.
3. Set the build command to `npm install --prefix server && npm run build --prefix server`.
4. Set the start command to `npm run start --prefix server`.
5. Add environment variables:
   - `PORT`
   - `MONGODB_URI`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `CLIENT_URL`
   - `NODE_ENV=production`
6. Deploy and verify the service is healthy.

### Frontend Deployment (Vercel)

1. Connect your repository to Vercel.
2. Set the framework preset to Vite.
3. Set the build command to `npm run build --prefix client`.
4. Set the output directory to `client/dist`.
5. Add environment variable:
   - `VITE_API_URL` — the backend API base URL, e.g. `https://your-backend-host/api/v1`
6. Deploy and verify the frontend loads successfully.

### Production Checklist

- Confirm `MONGODB_URI` points to a production MongoDB cluster.
- Ensure `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are strong and unique.
- Set `NODE_ENV=production` for backend deployment.
- Configure CORS `CLIENT_URL` to your production frontend origin.
- Confirm frontend `VITE_API_URL` points to the deployed backend.
- Enable HTTPS on both frontend and backend domains.

## Testing Documentation

### Authentication testing

- Register a new user and verify successful login.
- Confirm access token generation and refresh endpoint behavior.
- Test logout and protected routes for unauthorized access.

### Event testing

- Create, update, and delete events as an organizer.
- Verify event approvals, status transitions, and list filtering.
- Inspect event details from the frontend and API responses.

### Club testing

- List clubs and view club detail pages.
- Confirm club membership is reflected for joined clubs.
- Verify club visibility and member listing.

### Registration testing

- Register for events and verify registration response.
- Confirm duplicate registrations are rejected.
- Test cancellation flow and registration list updates.

### Attendance testing

- Generate QR check-in tokens through registration flows.
- Confirm attendance endpoints accept valid QR tokens.
- Verify duplicate attendance attempts are rejected.
- Confirm event attendance reports return totals and percentages.

### Notification testing

- Trigger registration and event reminder notifications.
- Confirm in-app notifications appear for the user.
- Mark notifications read/unread and verify deletion behavior.

### Recommendation testing

- Authenticate as a user and request `/api/v1/recommendations`.
- Verify recommendations are based on user interests, club memberships, and popular events.
- Call `/api/v1/recommendations/refresh` to regenerate recommendations.
- Confirm `/api/v1/recommendations/trending` returns high-activity future events.
