# ITM-Site: Image to Minecraft Converter

A web application that converts images into Minecraft-style block art. Upload an image, choose the block width, and download your Minecraft-ready pixel art!

**Features:**
- 🎨 Convert any image (PNG, JPG) to Minecraft blocks
- 🌍 Multilingual UI (English, French, Russian)
- ⚡ Fast real-time processing
- 📱 Responsive web interface
- 🔒 Production-ready security

---

## Project Structure

```
itm-site/
├── backend/           # Python Flask API
│   ├── app.py         # Main application (fixed & hardened)
│   ├── config.py      # Configuration management
│   ├── blocks.json    # Minecraft block definitions
│   ├── requirements.txt
│   ├── .env           # Local development config (git-ignored)
│   └── .env.example   # Template for configuration
│
└── itm-site/          # React frontend (Create React App)
    ├── src/
    │   ├── App.js     # Main React component
    │   └── index.js
    ├── public/
    ├── package.json
    └── README.md
```

---

## Quick Start (Development)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd itm-site/backend
   ```

2. **Create a Python virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment** (already set up in `.env`):
   ```bash
   # .env is pre-configured for development
   # Adjust BLOCKS_DIR and BLOCKS_JSON if needed
   ```

5. **Run the Flask server:**
   ```bash
   python app.py
   ```
   Server will start at `http://localhost:5000`

### Frontend Setup

1. **In another terminal, navigate to frontend directory:**
   ```bash
   cd itm-site/itm-site
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the React development server:**
   ```bash
   npm start
   ```
   App will open at `http://localhost:3000`

---

## Usage

1. **Upload an image** (PNG or JPG, max 10 MB)
2. **Choose block width** (1-512 blocks, default: 64)
3. **Click Convert**
4. **Download the result** as a PNG file

---

## Configuration

### Environment Variables

Edit `.env` to customize behavior:

```bash
FLASK_ENV=development              # Set to 'production' for deployment
FLASK_DEBUG=True                   # Set to False in production
BLOCKS_DIR=./                      # Path to blocks.json directory
BLOCKS_JSON=blocks.json            # Blocks definition file
API_HOST=localhost                 # Server host
API_PORT=5000                      # Server port
API_ALLOWED_ORIGINS=...            # CORS allowed origins
MAX_FILE_SIZE_MB=10                # Max upload size
MAX_IMAGE_WIDTH=512                # Max block width
MIN_IMAGE_WIDTH=1                  # Min block width
CONVERSION_TIMEOUT_SECONDS=30      # Timeout for processing
```

---

## Production Deployment

### Using Gunicorn (Recommended)

1. **Install production dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Create production `.env`:**
   ```bash
   cp backend/.env.example backend/.env.production
   # Edit with production settings:
   FLASK_ENV=production
   FLASK_DEBUG=False
   API_HOST=0.0.0.0
   ```

3. **Run with Gunicorn:**
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

4. **Build frontend:**
   ```bash
   cd itm-site
   npm run build
   ```
   Serve the `build/` folder with nginx or similar

### Using Docker (Recommended)

Create a `Dockerfile` for the backend:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

---

## Security Features

✅ **Input Validation**
- File type checking (PNG, JPG only)
- File size limits (10 MB default)
- Block width bounds (1-512)

✅ **Error Handling**
- Conversion timeouts (30s default)
- Graceful error messages
- Detailed server logging

✅ **CORS Security**
- Restricted to allowed origins
- Only POST method allowed on conversion endpoint

✅ **Configuration Management**
- No hardcoded paths
- Environment-based configuration
- Development vs. production modes

✅ **Logging**
- Request logging
- Error tracking
- Performance monitoring

---

## API Reference

### POST /minecraftify

Converts an image to Minecraft blocks.

**Request:**
```
Content-Type: multipart/form-data
- image: File (PNG, JPG) - required
- width: Integer (1-512) - optional, default: 128
```

**Response (Success):**
```
Content-Type: image/png
Body: PNG image
```

**Response (Error):**
```json
{
  "error": "Description of error"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

---

## Troubleshooting

### Flask server won't start

**Error:** `Blocks file not found at ./blocks.json`

**Solution:** Make sure `BLOCKS_DIR` in `.env` points to the directory containing `blocks.json`

### CORS errors in browser

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:** Update `API_ALLOWED_ORIGINS` in `.env` to match your frontend URL

### Conversion timeout

**Error:** `Conversion took too long`

**Solution:** Try a smaller image or fewer blocks. Increase `CONVERSION_TIMEOUT_SECONDS` in `.env` if needed

### Connection refused

**Error:** `Error fetching data: Failed to fetch`

**Solution:** Make sure Flask is running on the configured port (default 5000)

---

## Performance Notes

- **Image size:** Recommended < 5 MB for fast processing
- **Block width:** Higher = more detail, slower processing
- **Typical conversion time:** 1-5 seconds for 256px images

---

## Development

### Running Tests

Frontend:
```bash
cd itm-site
npm test
```

Backend:
```bash
cd backend
pytest  # (add pytest to requirements.txt first)
```

### Code Changes

**Backend (Python):**
- Edit `backend/app.py`
- Restart Flask server

**Frontend (React):**
- Edit files in `itm-site/src/`
- Changes auto-reload in development

---

## Dependencies

**Backend:**
- Flask: Web framework
- flask-cors: CORS handling
- image-to-minecraft: Core conversion library
- gunicorn: Production server

**Frontend:**
- React 19.2: UI framework
- Create React App: Build tooling

---

## License

[Add your license here]

## Contributing

[Add contribution guidelines]

## Support

[Add support links]

---

**Last Updated:** 2026-02-16  
**Status:** ✅ Production-Ready (with minor UI tweaks pending)
