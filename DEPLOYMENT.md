# ITM-Site Deployment Guide

This guide covers deploying ITM-Site to production, particularly on a Raspberry Pi or Linux server.

---

## Pre-Deployment Checklist

- [ ] Backend `.env` file configured for production
- [ ] `FLASK_ENV=production` and `FLASK_DEBUG=False`
- [ ] `BLOCKS_DIR` and `BLOCKS_JSON` paths verified
- [ ] Frontend built (`npm run build`)
- [ ] All dependencies installed and tested locally

---

## Option 1: Systemd Service (Linux/Raspberry Pi)

### 1. Create systemd service file

```bash
sudo nano /etc/systemd/system/itm-site.service
```

**Content:**
```ini
[Unit]
Description=ITM-Site Image to Minecraft Converter
After=network.target

[Service]
Type=notify
User=pi
WorkingDirectory=/home/pi/Desktop/itm-site/backend
Environment="PATH=/home/pi/Desktop/itm-site/backend/venv/bin"
EnvironmentFile=/home/pi/Desktop/itm-site/backend/.env
ExecStart=/home/pi/Desktop/itm-site/backend/venv/bin/gunicorn -w 2 -b 127.0.0.1:5000 app:app
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 2. Enable and start the service

```bash
sudo systemctl daemon-reload
sudo systemctl enable itm-site
sudo systemctl start itm-site
```

### 3. Check status

```bash
sudo systemctl status itm-site
sudo journalctl -u itm-site -f  # View logs
```

---

## Option 2: Docker Deployment

### 1. Create backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:5000", "app:app"]
```

### 2. Create frontend Dockerfile

```dockerfile
# itm-site/Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Create docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      FLASK_ENV: production
      FLASK_DEBUG: "False"
    volumes:
      - ./backend/.env:/app/.env:ro
    restart: unless-stopped

  frontend:
    build: ./itm-site
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

### 4. Run with Docker Compose

```bash
docker-compose up -d
```

---

## Option 3: Nginx Reverse Proxy Setup

### 1. Install Nginx

```bash
sudo apt-get install nginx
```

### 2. Create Nginx config

```bash
sudo nano /etc/nginx/sites-available/itm-site
```

**Content:**
```nginx
upstream flask_app {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name your-domain.com;

    # Frontend (React build)
    location / {
        root /home/pi/Desktop/itm-site/itm-site/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://flask_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 3. Enable the site

```bash
sudo ln -s /etc/nginx/sites-available/itm-site /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Update frontend API URL

In `itm-site/.env`:
```
REACT_APP_API_URL=http://your-domain.com/api
```

---

## SSL/HTTPS Setup (Let's Encrypt)

### 1. Install Certbot

```bash
sudo apt-get install certbot python3-certbot-nginx
```

### 2. Get certificate

```bash
sudo certbot certonly --nginx -d your-domain.com
```

### 3. Update Nginx config to use HTTPS

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # ... rest of config
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Monitoring & Maintenance

### View backend logs

```bash
sudo journalctl -u itm-site -f
```

### Restart the service

```bash
sudo systemctl restart itm-site
```

### Update configuration

Edit `.env` and restart:
```bash
sudo systemctl restart itm-site
```

### Monitor resource usage

```bash
ps aux | grep gunicorn
top  # Check CPU/memory usage
```

---

## Performance Tuning

### Gunicorn workers (for Raspberry Pi)

In `.env` or systemd service, adjust based on CPU cores:

```bash
# For Pi 4 (4 cores): use 2-4 workers
gunicorn -w 2 -b 0.0.0.0:5000 app:app

# For Pi 3 (4 cores): use 2 workers
gunicorn -w 2 -b 0.0.0.0:5000 app:app

# For Pi Zero: use 1 worker
gunicorn -w 1 -b 0.0.0.0:5000 app:app
```

### File size limits

Adjust in `.env` based on available RAM:
```
MAX_FILE_SIZE_MB=5  # For Pi Zero/3
MAX_FILE_SIZE_MB=10 # For Pi 4
```

### Image width limits

Balance quality vs. processing time:
```
MAX_IMAGE_WIDTH=512  # Standard
MAX_IMAGE_WIDTH=256  # Faster on slower hardware
```

---

## Backup & Recovery

### Backup configuration

```bash
cp /home/pi/Desktop/itm-site/backend/.env ~/backup/.env.backup
cp -r /home/pi/Desktop/itm-site/backend ~/backup/backend-backup
```

### Restore from backup

```bash
cp ~/backup/.env.backup /home/pi/Desktop/itm-site/backend/.env
sudo systemctl restart itm-site
```

---

## Troubleshooting

### Flask won't start

```bash
# Check for port conflicts
sudo lsof -i :5000

# Kill conflicting process
kill -9 <PID>

# Restart
sudo systemctl restart itm-site
```

### Nginx reverse proxy timeout

In Nginx config, increase proxy timeout:
```nginx
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
```

### High CPU usage

1. Check conversion timeout in `.env`
2. Reduce `MAX_IMAGE_WIDTH`
3. Check Gunicorn worker count

### Memory exhaustion on Pi

1. Reduce `MAX_FILE_SIZE_MB`
2. Reduce Gunicorn workers to 1
3. Add swap space (if available)

---

## Upgrade & Rollback

### Upgrade backend

```bash
cd /home/pi/Desktop/itm-site/backend
git pull origin main
pip install -r requirements.txt --upgrade
sudo systemctl restart itm-site
```

### Rollback to previous version

```bash
git revert HEAD
sudo systemctl restart itm-site
```

---

## Security Hardening

- [ ] Enable HTTPS (Let's Encrypt)
- [ ] Configure firewall (`ufw`)
- [ ] Regular dependency updates
- [ ] Monitor logs for errors
- [ ] Use strong `.env` secrets (if auth added)
- [ ] Keep OS patched

---

**Last Updated:** 2026-02-16
