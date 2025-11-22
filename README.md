# AI-Powered JSON Converter

[中文文档](./README_CN.md) | English

A lightweight application that uses AI to convert JSON data between different formats. Features a secure web interface with dual-layer authentication.

## Features

- **AI-Powered Conversion**: Utilizes OpenAI-compatible APIs for intelligent format transformation
- **Secure Authentication**:
  - **Admin (`KEY`)**: Full access including AI conversion capabilities
- **Secure**: JWT-based stateless authentication with 3-day token expiration
- **User-Friendly UI**:
  - Split-view for Source and Result
  - URL fetching and file upload support
  - One-click download of converted files

## Quick Start with Docker

### Option 1: Using Docker Hub (Recommended)

Pull and run the pre-built image:

```bash
docker pull axuitomo/fucktvconfig:latest

docker run -d \
  -p 8787:8787 \
  -e KEY=your-admin-password \
  -e APIURL=https://api.openai.com/v1/chat/completions \
  -e APIKEY=your-api-key \
  -e MODEL=gpt-4o-mini \
  --name fucktvconfig \
  axuitomo/fucktvconfig:latest
```

Access the application at `http://localhost:8787`

### Option 2: Using Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  fucktvconfig:
    image: axuitomo/fucktvconfig:latest
    container_name: fucktvconfig
    ports:
      - "8787:8787"
    environment:
      - KEY=your-admin-password
      - APIURL=https://api.openai.com/v1/chat/completions
      - APIKEY=your-api-key
      - MODEL=gpt-4o-mini
    restart: unless-stopped
```

Then run:

```bash
docker-compose up -d
```

### Option 3: Build from Source

```bash
git clone https://github.com/axuitomo/FUCKTVconfig.git
cd FUCKTVconfig

# Configure environment variables
cp .env.example .env
nano .env  # Edit with your values

# Build and run
docker-compose up -d --build
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `KEY` | Yes | Admin password for full access |
| `APIURL` | Yes | AI API endpoint (e.g., `https://api.openai.com/v1/chat/completions`) |
| `APIKEY` | Yes | API key for AI provider |
| `MODEL` | No | AI model name (default: `gpt-4o-mini`) |

## Usage

1. Access the application at `http://localhost:8787`
2. Login with your Admin `KEY`
3. Paste your source JSON, fetch from a URL, or upload a file
4. Select the target format (e.g., `LunaTV/MoonTV`)
5. Click **Start Conversion**
6. Download the result

## Security

- JWT tokens expire after **3 days** - users must re-login for security
- Passwords are stored as environment variables, never in code
- Admin-only access to AI conversion features

## Troubleshooting

### Container Keeps Restarting (Kubernetes/Docker)

If your container is in a restart loop:

1. **Check logs**:
   ```bash
   # Docker
   docker logs fucktvconfig
   
   # Kubernetes
   kubectl logs <pod-name>
   ```

2. **Verify environment variables**:
   - Ensure `KEY` is set (required)
   - Ensure `APIURL` and `APIKEY` are set (required for AI conversion)
   
3. **Common causes**:
   - Missing required environment variables
   - Invalid API credentials
   - Port 8787 already in use

### Container Starts But Can't Access

1. **Check if container is running**:
   ```bash
   docker ps | grep fucktvconfig
   ```

2. **Verify port mapping**:
   - Ensure port 8787 is exposed: `-p 8787:8787`
   - Check if port is already in use: `netstat -an | grep 8787`

3. **Test connectivity**:
   ```bash
   curl http://localhost:8787
   ```

### AI Conversion Fails

1. **Verify API configuration**:
   - Check `APIURL` is correct (e.g., `https://api.openai.com/v1/chat/completions`)
   - Verify `APIKEY` is valid
   - Ensure `MODEL` name is correct (default: `gpt-4o-mini`)

2. **Check logs for API errors**:
   ```bash
   docker logs fucktvconfig | grep -i error
   ```

### Authentication Issues

1. **Can't login**:
   - Verify `KEY` environment variable matches your password
   - JWT tokens expire after 3 days - try logging in again

2. **"Unauthorized" errors**:
   - Clear browser cache and cookies
   - Check browser console for errors (F12)

### Port Already in Use

If port 8787 is already occupied:

```bash
# Option 1: Use a different port
docker run -p 8788:8787 ...

# Option 2: Stop the conflicting service
# Find what's using the port
netstat -ano | findstr :8787  # Windows
lsof -i :8787                  # Linux/Mac
```

### Getting Help

If issues persist:

1. Check the [Docker Debug Guide](./DOCKER_DEBUG.md)
2. Review container logs for specific error messages
3. Ensure all required environment variables are set
4. Try pulling the latest image: `docker pull axuitomo/fucktvconfig:latest`

## Resources

- **Docker Hub**: [axuitomo/fucktvconfig](https://hub.docker.com/r/axuitomo/fucktvconfig)
- **GitHub**: [axuitomo/FUCKTVconfig](https://github.com/axuitomo/FUCKTVconfig)
- **Debugging Guide**: [DOCKER_DEBUG.md](./DOCKER_DEBUG.md)

## Tech Stack

- **Runtime**: Node.js + Wrangler Dev Server
- **Language**: JavaScript (ES6+)
- **Bundler**: esbuild
- **Auth**: jose (JWT)
- **Frontend**: Vanilla JS + CSS (Embedded)
- **Container**: Docker

## License

ISC
