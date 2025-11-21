# Apache Server Deployment Guide

## Prerequisites
- Apache server with `mod_rewrite`, `mod_deflate`, `mod_expires`, and `mod_headers` enabled
- Node.js installed on your build machine

## Build Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the production version:**
   ```bash
   npm run build
   ```
   This creates a `dist` folder with optimized production files.

## Deployment Steps

1. **Upload the `dist` folder contents** to your Apache web server's document root (e.g., `/var/www/html` or `public_html`)

2. **Ensure the `.htaccess` file is present** in the root directory (it's automatically copied from `public/.htaccess` during build)

3. **Start the CSV backend service on the server:**

   ```bash
   # Run in a long-lived session (tmux/systemd recommended)
   node server/index.js
   ```

   - Default port: `4000` (override with `PORT`)
   - Default storage path: `./data/survey-responses.csv` (override with `DATA_DIR` or `CSV_PATH`)

   To keep it running after reboots, create a systemd unit (e.g., `/etc/systemd/system/survey-backend.service`):
   ```ini
   [Unit]
   Description=Survey CSV backend
   After=network.target

   [Service]
   WorkingDirectory=/var/www/ai-insight-hub
   ExecStart=/usr/bin/node server/index.js
   Restart=always
   Environment=PORT=4000
   Environment=DATA_DIR=/var/www/survey-data
   StandardOutput=append:/var/log/survey-backend.log
   StandardError=inherit

   [Install]
   WantedBy=multi-user.target
   ```

   Then enable it:
   ```bash
   sudo systemctl enable --now survey-backend
   ```

4. **Proxy `/api` calls from Apache to the backend (same host, no CORS hassles):**

   Enable the proxy modules:
   ```bash
   sudo a2enmod proxy
   sudo a2enmod proxy_http
   sudo systemctl restart apache2
   ```

   Add this to your VirtualHost (replace `/var/www/html` if needed):
   ```apache
   <Directory /var/www/html>
       AllowOverride All
       Require all granted
   </Directory>

   ProxyPass /api http://127.0.0.1:4000/api
   ProxyPassReverse /api http://127.0.0.1:4000/api
   ```

5. **Verify Apache modules are enabled for the frontend:**
   ```bash
   sudo a2enmod rewrite
   sudo a2enmod deflate
   sudo a2enmod expires
   sudo a2enmod headers
   sudo systemctl restart apache2
   ```

6. **Restart Apache:**
   ```bash
   sudo systemctl restart apache2
   ```

## File Structure After Deploy

```
/var/www/html/
├── .htaccess          # URL rewriting and caching rules
├── index.html         # Main HTML file
├── assets/            # JS, CSS, and other static files
├── robots.txt
└── [other static files]
```

## Troubleshooting

### Routes return 404 errors
- Verify `.htaccess` file is present
- Check that `mod_rewrite` is enabled: `apache2ctl -M | grep rewrite`
- Ensure `AllowOverride All` is set in Apache config

### Assets not loading
- Check file permissions: `chmod -R 755 /var/www/html`
- Verify correct base path in `vite.config.ts`

### Performance issues
- Enable gzip compression (mod_deflate)
- Enable browser caching (mod_expires)
- Use a CDN for static assets

## Environment Variables

If you need to use different API endpoints or configurations for production:

1. Create a `.env.production` file before building
2. Add your production variables (e.g., `VITE_API_URL=https://api.yourdomain.com`)
3. Build the app - Vite will use production env variables

## Testing Locally

To test the production build locally before deploying:

```bash
npm run build
npm run preview
```

This serves the production build at `http://localhost:4173`
