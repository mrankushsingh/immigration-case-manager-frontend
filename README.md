# Immigration Case Manager - Frontend

Frontend React application for the Immigration Case Manager.

## Features

- Modern React UI with TypeScript
- Firebase Authentication
- Multi-language support (English/Spanish)
- Responsive design with Tailwind CSS
- Client and case template management
- Document tracking and uploads
- Dashboard with statistics
- Reminder notifications

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v7
- **Icons:** Lucide React
- **Authentication:** Firebase (client-side)
- **i18n:** Custom i18n implementation

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend API server running (see backend README)
- Firebase project (optional, for authentication)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the frontend directory:
   ```env
   # Backend API URL
   # For development: leave empty to use proxy (http://localhost:4000)
   # For production: set to your backend URL (e.g., https://api.yourdomain.com)
   VITE_API_URL=http://localhost:4000

   # Firebase Configuration (optional - authentication disabled if not set)
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

3. **Run in development mode:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

4. **Build for production:**
   ```bash
   npm run build
   ```
   The built files will be in the `dist` directory.

5. **Preview production build:**
   ```bash
   npm run preview
   ```

## Configuration

### API URL

The frontend needs to know where your backend API is located:

- **Development:** If `VITE_API_URL` is not set, Vite proxy will forward `/api` requests to `http://localhost:4000`
- **Production:** Set `VITE_API_URL` to your backend URL (e.g., `https://api.yourdomain.com`)

### Firebase Authentication

To enable authentication:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Email/Password authentication
3. Get your Firebase config from Project Settings
4. Set the `VITE_FIREBASE_*` environment variables

See `FIREBASE_SETUP.md` in the root directory for detailed instructions.

## Project Structure

```
frontend/
├── public/          # Static assets
├── src/
│   ├── components/  # React components
│   ├── locales/    # Translation files (en.json, es.json)
│   ├── utils/      # Utilities (API, Firebase, i18n)
│   ├── types.ts    # TypeScript type definitions
│   ├── App.tsx     # Main app component
│   └── main.tsx    # Entry point
├── index.html
├── vite.config.ts  # Vite configuration
└── package.json
```

## Development

```bash
# Start development server
npm run dev

# Type check
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### Vercel (Recommended for Frontend)

1. Connect your repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables in Vercel dashboard
5. Deploy!

### Netlify

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables
5. Deploy!

### Other Static Hosting

The frontend builds to static files in the `dist` directory. You can deploy to:
- GitHub Pages
- AWS S3 + CloudFront
- Any static file hosting service

**Important:** Make sure to set `VITE_API_URL` to your backend URL in production!

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | No | Uses proxy in dev |
| `VITE_FIREBASE_*` | Firebase configuration | No | Auth disabled |

## Notes

- The frontend is a Single Page Application (SPA)
- All API requests go to the backend server
- Authentication is handled via Firebase
- The app supports English and Spanish languages
- File uploads are handled through the backend API

## Troubleshooting

### API Connection Issues

If you see API errors:
1. Check that your backend server is running
2. Verify `VITE_API_URL` is set correctly
3. Check CORS settings on the backend
4. Check browser console for detailed error messages

### Authentication Issues

If authentication doesn't work:
1. Verify Firebase environment variables are set
2. Check Firebase project settings
3. Ensure Email/Password auth is enabled in Firebase Console
4. Check browser console for Firebase errors

