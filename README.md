# AI-Powered JSON Converter Worker

A lightweight, single-file Cloudflare Worker application that uses AI to convert JSON data between different formats. Features a secure web interface with dual-layer authentication.

## Features

- **AI-Powered Conversion**: Utilizes Cloudflare WorkerAI or custom OpenAI-compatible APIs for intelligent format transformation.
- **Serverless & Single File**: Entire application (Frontend + Backend) is bundled into a single `worker.js` for easy deployment on Cloudflare Workers.
- **Dual Authentication**:
  - **Admin (`KEY`)**: Full access including AI conversion capabilities.
  - **Guest (`TOKEN`)**: Read-only access to the interface.
- **Secure**: JWT-based stateless authentication.
- **User-Friendly UI**:
  - Split-view for Source and Result.
  - URL fetching and file upload support.
  - One-click download of converted files.

## Deployment

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed.
- [Cloudflare Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and authenticated.

### 2. Setup
Install dependencies:
```bash
npm install
```

### 3. Configuration (Secrets)
Set the necessary secrets using Wrangler:

**Required:**
```bash
# Admin Password (Full Access)
npx wrangler secret put KEY
```

**Optional:**
```bash
# Guest Password (Read Only)
npx wrangler secret put TOKEN

# Custom AI Provider (If not using Cloudflare WorkerAI)
npx wrangler secret put APIURL  # e.g., https://api.openai.com/v1/chat/completions
npx wrangler secret put APIKEY  # Your API Key
npx wrangler secret put MODEL   # e.g., gpt-4o-mini
```

### 4. Build & Deploy
```bash
npm run deploy
```

## Usage

1.  Access your Worker URL.
2.  Login with your Admin `KEY` or Guest `TOKEN`.
3.  Paste your source JSON, fetch from a URL, or upload a file.
4.  Select the target format (e.g., `LunaTV/MoonTV`).
5.  Click **Start Conversion**.
6.  Download the result.

## Tech Stack
-   **Runtime**: Cloudflare Workers
-   **Language**: JavaScript (ES6+)
-   **Bundler**: esbuild
-   **Auth**: jose (JWT)
-   **Frontend**: Vanilla JS + CSS (Embedded)
