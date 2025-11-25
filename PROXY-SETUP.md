# API Proxy Setup Guide

## Problem
The Anthropic API cannot be called directly from the browser due to CORS (Cross-Origin Resource Sharing) restrictions. This causes "Connection error" messages.

## Solution
Use a backend proxy server to handle API calls. The proxy runs on your local machine and forwards requests to Anthropic's API.

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

This will install:
- `express` - Web server for the proxy
- `cors` - Enable CORS for the proxy
- `dotenv` - Load environment variables
- `concurrently` - Run proxy and dev server together

### 2. Start the Proxy Server

**Option A: Run everything together (Recommended)**
```bash
npm run dev:all
```

This starts both the proxy server (port 3001) and the Vite dev server (port 3000).

**Option B: Run separately**

Terminal 1 - Start proxy:
```bash
npm run proxy
```

Terminal 2 - Start dev server:
```bash
npm run dev
```

### 3. Verify It's Working

1. Check that the proxy server is running:
   - You should see: `API Proxy server running on http://localhost:3001`

2. Try scanning an image in the app
   - The app will automatically use the proxy
   - If the proxy is not available, it will try the direct API (which may fail due to CORS)

## How It Works

1. Your browser app calls `http://localhost:3001/api/analyze-image`
2. The proxy server receives the request
3. The proxy calls Anthropic's API (server-to-server, no CORS issues)
4. The proxy returns the result to your browser

## Troubleshooting

### Proxy server won't start
- Make sure port 3001 is not in use
- Check that Node.js is installed: `node --version`
- Verify dependencies are installed: `npm install`

### Still getting connection errors
- Make sure the proxy server is running
- Check browser console for errors
- Verify your API key is in `.env` file
- Try restarting both servers

### Port conflicts
If port 3001 is in use, edit `api-proxy-server.js` and change:
```javascript
const PORT = 3001; // Change to another port like 3002
```

Then update `.env`:
```env
VITE_API_PROXY_URL=http://localhost:3002
```

## Production Deployment

For production, you'll need to:
1. Deploy the proxy server (e.g., to Vercel, Railway, or your own server)
2. Update `VITE_API_PROXY_URL` in your production environment
3. Keep your API key secure on the server (never expose it in the browser)

## Alternative: Serverless Function

Instead of a local proxy, you can deploy a serverless function:
- Vercel Serverless Functions
- Netlify Functions
- AWS Lambda
- Google Cloud Functions

The proxy code in `api-proxy-server.js` can be adapted for any of these platforms.

