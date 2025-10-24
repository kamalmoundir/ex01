# Unsplash Gallery App

A full-stack application that lets users log in with Unsplash, browse and search photos, and save their favorites. Built with Node.js, vanilla JS, and Docker.

## Features

- **Login with Unsplash OAuth**
- **Responsive gallery** for desktop and mobile
- **Search Unsplash photos**
- **Like/Unlike photos** (saved locally with a beautiful label)
- **Dockerized backend and frontend**

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/)
- [Unsplash Developer Account](https://unsplash.com/oauth/applications)

### Setup

1. **Clone the repository**
   ```sh
   git clone <your-repo-url>
   cd ex01
   ```

2. **Configure Unsplash API**
   - Create an app on Unsplash and get your `CLIENT_ID`, `CLIENT_SECRET`, and set the redirect URI (e.g. `http://localhost:8080/`).
   - Edit `/authservice/.env`:
     ```
     UNSPLASH_CLIENT_ID=your_client_id
     UNSPLASH_CLIENT_SECRET=your_client_secret
     UNSPLASH_REDIRECT_URI=http://localhost:8080/
     JWT_SECRET=your_jwt_secret
     PORT=4000
     ```

3. **Build and run with Docker Compose**
   ```sh
   docker-compose up --build
   ```

4. **Access the app**
   - Frontend: [http://localhost:8080](http://localhost:8080)
   - Backend: [http://localhost:4000](http://localhost:4000)

## Usage

- Click **Login with Unsplash** to authenticate.
- Search for photos using the search bar.
- Click a photo to "save" it (shows a "Saved" label).
- Click again to "unsave" it.

## Project Structure

```
ex01/
  ├── authservice/      # Node.js backend (OAuth, API)
  ├── frontend/         # Static frontend (HTML, JS, CSS)
  ├── docker-compose.yml
  └── readme.md
```

## Mobile & Desktop

- The app is fully responsive and touch-friendly.

## License

MIT
