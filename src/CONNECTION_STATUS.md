# Backend Connection Status

This document explains how the frontend connects to the backend API.

## Configuration

The frontend is configured to connect to: **http://localhost:3000**

You can customize this by setting the `VITE_API_BASE_URL` environment variable in `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Connection Detection

The app automatically detects whether the backend is available:

### Visual Indicators

1. **Header WiFi Icon**:
   - 🟢 Green WiFi icon = Connected to backend
   - ⚫ Gray WifiOff icon = Demo mode (backend unavailable)

2. **Demo Mode Banner**:
   - Appears at the top when backend is unavailable
   - Includes a "Retry" button to test connection again
   - Can be dismissed (will reappear on page reload if still in demo mode)

### Console Messages

Open your browser console (F12) to see connection status:
- `✅ Connected to backend API` = Successfully connected
- `⚠️ Backend API unavailable, using demo mode: [error]` = Connection failed

## Testing Connection

### Method 1: Automatic Detection
Just load the app - it automatically tries to connect on every page load.

### Method 2: Manual Retry
Click the "Retry" button in the demo mode banner.

### Method 3: Console Test
Open browser console (F12) and run:
```javascript
testConnection()
```

This will test the connection and log detailed results.

## Demo Mode

When the backend is unavailable, the app enters **Demo Mode**:
- Shows sample data (3 demo videos)
- All features remain functional
- Upload button will show an error when clicked
- Stats page shows demo statistics
- No data is persisted

## Troubleshooting

If you have the backend running but still see demo mode:

1. **Verify backend URL**
   - Default is http://localhost:3000
   - Check `.env` file if you changed it
   - Ensure backend is listening on this address

2. **Check CORS**
   - Backend must allow requests from your frontend origin
   - Typically http://localhost:5173 for Vite dev server

3. **Test endpoints manually**
   ```bash
   curl http://localhost:3000/api/v1/health
   curl http://localhost:3000/api/v1/videos?page=1&limit=20
   ```

4. **Check browser console**
   - Look for network errors
   - Check for CORS errors
   - Run `testConnection()` for detailed diagnostics

5. **Restart both servers**
   - Stop and restart the backend
   - Stop and restart the frontend (Vite)
   - Clear browser cache if needed

## API Endpoints Used

The frontend connects to these backend endpoints:

- `GET /api/v1/health` - Health check
- `GET /api/v1/videos` - List videos with pagination/filters
- `GET /api/v1/videos/:id` - Get video details
- `GET /api/v1/videos/:id/status` - Get processing status
- `POST /api/v1/videos/upload` - Upload new video
- `GET /api/v1/stats` - Get platform statistics

All responses follow the format:
```json
{
  "data": {},
  "statusCode": 200,
  "error": null
}
```

## Production Deployment

For production, update the API URL:

```env
VITE_API_BASE_URL=https://api.your-domain.com
```

Rebuild the app:
```bash
npm run build
```

The connection detection works the same way in production.