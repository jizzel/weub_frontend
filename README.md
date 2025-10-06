# Weub - Video Platform Frontend

A production-ready React frontend for video upload, processing, and streaming built with Vite, TypeScript, and Tailwind CSS.

## Features

- 📤 **Video Upload**: Upload videos with client-side validation and progress tracking
- 🎥 **HLS Streaming**: Adaptive bitrate streaming with hls.js and resolution selection
- 🔍 **Search & Filter**: Advanced filtering by title, date, resolution, and tags
- 📊 **Stats Dashboard**: System metrics and analytics
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- ♿ **Accessible**: Keyboard navigation and ARIA attributes
- 📱 **Responsive**: Mobile-first design

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **hls.js** - HLS video playback
- **Recharts** - Data visualization
- **shadcn/ui** - Accessible UI components

## Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running (see API documentation)

## Getting Started

### 1. Clone and Install

```bash
# Install dependencies
npm install
```

### 2. Environment Configuration

Create a \`.env\` file from the example:

```bash
cp .env.example .env
```

Configure the backend API URL:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Development

Start the development server:

```bash
npm run dev
```

The app will be available at \`http://localhost:5173\`

### 4. Build for Production

Build the application:

```bash
npm run build
```

The optimized build will be in the \`/dist\` directory, ready to be served by the NestJS backend's ServeStaticModule.

### 5. Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Layout.tsx      # Main layout with navigation
│   ├── VideoCard.tsx   # Video card component
│   ├── VideoList.tsx   # Video grid
│   ├── Player.tsx      # HLS video player
│   ├── UploadForm.tsx  # Upload form with validation
│   ├── StatusBadge.tsx # Processing status indicator
│   └── ...
├── pages/              # Route components
│   ├── Home.tsx        # Video listing with search/filters
│   ├── Upload.tsx      # Upload page
│   ├── VideoDetail.tsx # Video player and metadata
│   └── Stats.tsx       # Analytics dashboard
├── hooks/              # React Query hooks
│   ├── useVideos.ts    # List videos hook
│   ├── useVideo.ts     # Single video hook
│   ├── useUpload.ts    # Upload mutation hook
│   ├── useVideoStatus.ts # Status polling hook
│   └── useStats.ts     # Stats hooks
├── lib/                # Core utilities
│   └── apiClient.ts    # API client with retry logic
├── types/              # TypeScript definitions
│   └── api.ts          # API response types
├── utils/              # Helper functions
│   ├── formatters.ts   # Date/size formatters
│   └── validators.ts   # Client-side validation
├── styles/             # Global styles
│   └── globals.css     # Tailwind configuration
└── App.tsx             # Main app with routing
```

## API Integration

This frontend integrates with the backend API defined in \`/docs/docs.yaml\`. All endpoints follow the standard response format:

```typescript
{
  data: T,
  statusCode: number,
  error: string | null
}
```

### API Endpoints Used

| Feature | Method | Endpoint | Description |
|---------|--------|----------|-------------|
| Upload video | POST | \`/api/v1/videos/upload\` | Upload video with metadata |
| Check status | GET | \`/api/v1/videos/:id/status\` | Poll processing status |
| List videos | GET | \`/api/v1/videos\` | Paginated video list with filters |
| Get video | GET | \`/api/v1/videos/:id\` | Video details and playback URL |
| Get stats | GET | \`/api/v1/stats\` | System statistics |
| Health check | GET | \`/api/v1/health\` | System health |

## Key Features

### Video Upload Flow

1. **File validation**: Client-side format and size validation
2. **Upload**: Multipart form data upload with progress
3. **Polling**: Automatic status polling with exponential backoff
4. **Feedback**: Real-time processing status and estimated time

### Video Playback

- HLS adaptive streaming with hls.js
- Native HLS support for Safari
- Manual quality selection
- Fallback error handling
- Keyboard accessible controls

### Search and Filters

- Title search with debouncing
- Date range filtering
- Resolution filtering
- Tag filtering
- Server-side pagination

### Stats Dashboard

- Total uploads and success rate
- Storage usage metrics
- Resolution distribution chart
- System health status

## Development

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

## Deployment

### Deploy with Backend

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Copy the \`/dist\` directory to your backend's static file serving location

3. Configure NestJS ServeStaticModule to serve from this directory

### Environment Variables for Production

Set the production API URL:

```env
VITE_API_BASE_URL=https://api.your-domain.com
```

### Static File Serving

The backend should serve the built files with proper MIME types and handle client-side routing by serving \`index.html\` for all non-API routes.

Example NestJS configuration:

```typescript
ServeStaticModule.forRoot({
  rootPath: join(__dirname, '..', 'client/dist'),
  exclude: ['/api/*'],
})
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

## Accessibility

- Keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader compatible
- Color contrast compliant (WCAG AA)

## Performance

- Code splitting by route
- Lazy loading for heavy components
- Image optimization
- React Query caching
- Debounced search
- Optimistic updates

## Troubleshooting

### Video won't play

- Check that the backend API is running and accessible
- Verify the video status is "ready"
- Check browser console for HLS errors
- Ensure video is in a supported format

### Upload fails

- Check file size (max 2GB)
- Verify file format (.mp4, .mov, .webm, .avi)
- Check network connection
- Verify backend API is accessible

### API connection errors

The app automatically detects backend availability:
- **Connected**: Green WiFi icon in header, no demo mode banner
- **Demo Mode**: Gray WiFi icon in header, blue demo mode banner with retry button

If you see demo mode but your backend is running:
1. Verify \`VITE_API_BASE_URL\` in \`.env\` (default: http://localhost:3000)
2. Check that backend is running at the configured URL
3. Verify CORS configuration on backend allows your frontend origin
4. Check browser network tab for errors
5. Click the "Retry" button in the demo mode banner
6. Check browser console for connection messages

## Contributing

1. Follow the existing code style
2. Write TypeScript with proper types
3. Add tests for new features
4. Update documentation
5. Ensure accessibility standards

## License

MIT

## Support

For issues and questions, please create an issue in the issue tab.
