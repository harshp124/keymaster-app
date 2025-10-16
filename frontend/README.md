# Keymaster UI

A modern React + Vite web interface for the Keymaster employee skills finder application.

## Features

✨ **Modern UI**
- Clean, responsive design
- Dark/Light mode support
- Smooth animations and transitions

🔍 **Multi-Select Skills Filter**
- Search and filter skills
- Select/Deselect all functionality
- Real-time employee search
- Visual skill tags

👥 **Employee Cards**
- Beautiful card layout
- Employee information display
- Skill badges with color coding
- Responsive grid

📊 **Health Status**
- Real-time API health monitoring
- Redis connection status
- Response time tracking

## Prerequisites

- Node.js 16+ 
- npm or yarn
- Keymaster API running on `http://localhost:8082`

## Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

## Configuration

Create a `.env` file in the frontend directory:

```bash
cp .env.example .env
```

Edit `.env` to match your API URL:

```
VITE_API_URL=http://localhost:8082
```

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

**Features:**
- Hot module replacement (HMR)
- Fast refresh on code changes
- Automatic API proxy

## Build

Build for production:

```bash
npm run build
```

Output will be in the `dist/` directory.

## Preview

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── SkillsFilter.jsx      # Multi-select skills component
│   │   ├── SkillsFilter.css
│   │   ├── EmployeeList.jsx      # Employee cards grid
│   │   ├── EmployeeList.css
│   │   ├── HealthStatus.jsx      # API health indicator
│   │   └── HealthStatus.css
│   ├── App.jsx                   # Main app component
│   ├── App.css                   # App styles
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── index.html                    # HTML template
├── vite.config.js               # Vite configuration
├── package.json                 # Dependencies
└── README.md                    # This file
```

## API Integration

The UI communicates with the Keymaster API:

### Endpoints Used

1. **GET /health/detailed** - Health check
   - Returns API and Redis status
   - Used for health indicator

2. **GET /v1/employees** - Get all employees
   - Fetches all employees to extract available skills
   - Used to populate skills filter

3. **GET /v1/employees/search/by-skills** - Search by skills
   - Query: `?skills=aws,docker,gcp`
   - Returns employees with ALL selected skills
   - Triggered on skill selection

## Features Explained

### Multi-Select Skills Filter

- **Search**: Type to filter skills
- **Select All**: Quickly select all available skills
- **Clear**: Remove all selections
- **Tags**: Visual representation of selected skills
- **Real-time**: Automatically searches as you select

### Employee Cards

- **Avatar**: First letter of employee name
- **Information**: Name, ID, email, department, position, experience
- **Skills**: Color-coded skill badges
- **Hover Effects**: Interactive card animations

### Health Status

- **Status Indicator**: Green (healthy) or Red (unhealthy)
- **Redis Connection**: Shows connection status
- **Response Time**: API response time in milliseconds
- **Auto-refresh**: Updates on page load

## Styling

### Color Scheme

- **Primary**: Indigo (#6366f1)
- **Secondary**: Pink (#ec4899)
- **Success**: Green (#10b981)
- **Danger**: Red (#ef4444)
- **Background**: Light gray (#f9fafb)

### Responsive Design

- **Desktop**: 2-column layout (filter + results)
- **Tablet**: Adjusted grid and spacing
- **Mobile**: Single column, full-width

## Performance

- **Lazy Loading**: Components load on demand
- **Memoization**: Optimized re-renders
- **Debouncing**: Search input debounced
- **Caching**: API responses cached where appropriate

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### API Connection Issues

**Problem**: "Cannot connect to API"

**Solution**:
1. Verify API is running: `curl http://localhost:8082/health`
2. Check `.env` file has correct `VITE_API_URL`
3. Check browser console for CORS errors
4. Ensure API allows CORS requests

### Skills Not Loading

**Problem**: Skills dropdown is empty

**Solution**:
1. Verify employees exist in Redis
2. Run `python populate_skills.py` in backend
3. Check API response: `curl http://localhost:8082/v1/employees`

### Slow Performance

**Problem**: UI is slow or laggy

**Solution**:
1. Check network tab in DevTools
2. Verify API response times
3. Clear browser cache
4. Restart dev server

## Development Tips

### Adding New Features

1. Create component in `src/components/`
2. Add component CSS file
3. Import in `App.jsx`
4. Update `App.css` if needed

### Debugging

- Use React DevTools browser extension
- Check browser console for errors
- Use Network tab to inspect API calls
- Use Redux DevTools for state management (if added)

### Code Style

- Use functional components with hooks
- Keep components small and focused
- Use descriptive variable names
- Add comments for complex logic

## Deployment

### Docker

Build Docker image:

```bash
docker build -f Dockerfile.frontend -t keymaster-ui:latest .
```

Run container:

```bash
docker run -p 3000:80 keymaster-ui:latest
```

### Vercel/Netlify

1. Push code to GitHub
2. Connect repository to Vercel/Netlify
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables

### Static Hosting

1. Build: `npm run build`
2. Upload `dist/` folder to hosting service
3. Configure API URL in environment

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

MIT

## Support

For issues or questions:
1. Check existing issues on GitHub
2. Create new issue with details
3. Include browser/OS information
4. Attach screenshots if applicable

