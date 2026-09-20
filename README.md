# ViewStream — Full-Stack Video Sharing Platform

A full-stack YouTube-like video sharing platform built with React, Node.js, Express.js, and MongoDB.

## Overview

This project is a full-stack video-sharing application that provides core YouTube-style functionality such as user authentication, video uploading, video playback, likes, comments, subscriptions, watch history, playlists, search, and a creator dashboard.

The application is divided into two parts:

- **Frontend** — React + Vite
- **Backend** — Node.js + Express.js + MongoDB

## Features

### Authentication & Account Management

- User registration and login
- JWT-based authentication
- Access and refresh tokens
- HttpOnly cookies
- Automatic access-token refresh
- Logout
- Change password
- Update account details
- Avatar and cover image management

### Videos

- Upload videos and thumbnails
- Cloudinary media storage
- Video playback
- Update video details
- Update thumbnails
- Publish/unpublish videos
- Delete videos
- View tracking
- Published/unpublished access control

### Engagement

- Like/unlike videos
- Create comments
- Edit and delete comments
- Like/unlike comments
- Watch history
- Subscribe/unsubscribe to channels

### Playlists

- Create playlists
- Update playlists
- Delete playlists
- Add videos to playlists
- Remove videos from playlists
- Public playlist viewing

### Search & Discovery

- Search videos by title and description
- Pagination
- Sorting by newest, oldest, and views
- Channel-based video filtering

### Creator Dashboard

- Total videos
- Total views
- Total likes
- Total comments
- Total subscribers

## Tech Stack

### Frontend

- React 19
- React Router
- Vite
- JavaScript
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Multer
- Cloudinary
- Cookie Parser
- CORS

### Development Tools

- Git
- GitHub
- VS Code
- Nodemon
- Oxlint

## Architecture

The application follows a client-server architecture.

```text
React Frontend
      |
      | HTTP / REST API
      |
      v
Express.js Backend
      |
      +------------------+
      |                  |
      v                  v
   MongoDB           Cloudinary
   Database          Media Storage
```

The backend is organized into:

```text
backend/src/
├── controllers/
├── db/
├── middlewares/
├── models/
├── routes/
├── utils/
├── app.js
├── constants.js
└── index.js
```

The frontend is organized into:

```text
frontend/src/
├── components/
├── lib/
├── pages/
├── App.jsx
├── index.css
└── main.jsx
```

## Authentication Flow

Authentication uses access tokens and refresh tokens stored in HttpOnly cookies.

```text
Login
  |
  v
Backend validates credentials
  |
  v
Access + Refresh tokens
  |
  v
HttpOnly cookies
  |
  v
Authenticated API requests
  |
  v
Access token expires
  |
  v
Frontend requests refresh token
  |
  v
New access token
  |
  v
Original request retries once
```

The frontend API client coordinates concurrent token refresh requests so multiple simultaneous `401` responses share a single refresh operation.

## Video Upload Flow

The video upload pipeline uses JWT authentication, Multer, and Cloudinary.

```text
Request
   |
   v
verifyJWT
   |
   v
req.user
   |
   v
Multer
   |
   v
req.files
   |
   v
publishVideo controller
   |
   +--> Video metadata validation
   |
   +--> Cloudinary video upload
   |
   +--> Cloudinary thumbnail upload
   |
   +--> MongoDB Video document
```

Temporary uploaded files are cleaned up after the request, including failure paths. If Cloudinary uploads succeed but a later operation fails, the uploaded Cloudinary resources are also cleaned up.

## API Structure

The backend exposes REST APIs under:

```text
/api/v1
```

Main API groups include:

```text
/users
/videos
/comments
/comment-likes
/likes
/subscriptions
/playlists
/history
/dashboard
/health
```

Examples:

```text
POST   /api/v1/users/register
POST   /api/v1/users/login
POST   /api/v1/users/logout

GET    /api/v1/videos
GET    /api/v1/videos/:videoId
POST   /api/v1/videos

GET    /api/v1/history
GET    /api/v1/subscriptions/my-subscriptions

GET    /api/v1/playlists/:playlistId

GET    /api/v1/dashboard/stats
GET    /api/v1/health
```

## Project Setup

### Prerequisites

Install:

- Node.js
- MongoDB
- A Cloudinary account

### 1. Clone the repository

```bash
git clone https://github.com/Amaan-Mulla/youtube-clone.git
cd youtube-clone
```

### 2. Install dependencies

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

### 3. Configure environment variables

Create:

```text
backend/.env
```

Do not commit this file to GitHub.

Add:

```env
PORT=8000

MONGODB_URL=your_mongodb_connection_url

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRES_IN=your_access_token_expiry

REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=your_refresh_token_expiry

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

NODE_ENV=development
```

The application uses the `Youtube` database name.

## Running the Project

### Start the Backend

From the `backend` directory:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:8000
```

### Start the Frontend

Open another terminal and go to the `frontend` directory:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

Open the frontend in your browser:

```text
http://localhost:5173
```

## Production Build

To create a production build of the frontend:

```bash
cd frontend
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Security

The project includes several security and reliability measures:

- JWT authentication
- HttpOnly authentication cookies
- Ownership checks for protected resources
- Published/unpublished video access control
- Sensitive user fields excluded from public responses
- Password hashing with bcrypt
- MongoDB unique constraint for email addresses
- Duplicate-email conflicts returned as HTTP 409
- Controlled JWT refresh and retry behavior
- Temporary upload cleanup
- Cloudinary cleanup on failed video publishing
- Centralized API error handling

## Validation & Testing

The project was tested through:

- Backend syntax validation
- Frontend production build
- API-level authentication tests
- Registration and validation tests
- Login/logout/refresh tests
- Public channel profile tests
- Subscription state tests
- Manual frontend testing of the major application flows

## Screenshots

Screenshots of the application can be added here.

Example:

```text
docs/screenshots/
├── home.png
├── watch.png
├── channel.png
├── playlist.png
└── dashboard.png
```

## Project Status

## Project Status

The core implementation is complete and the project has been verified across the major user flows, including authentication, video management, channels, subscriptions, watch history, playlists, engagement, search, and the creator dashboard.

## Author

**Amanulla**

GitHub:

https://github.com/Amaan-Mulla
