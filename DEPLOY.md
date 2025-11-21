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

3. **Verify Apache modules are enabled:**
   ```bash
   sudo a2enmod rewrite
   sudo a2enmod deflate
   sudo a2enmod expires
   sudo a2enmod headers
   sudo systemctl restart apache2
   ```

4. **Configure Apache to allow .htaccess overrides:**
   
   Edit your Apache configuration (usually `/etc/apache2/sites-available/000-default.conf` or similar):
   
   ```apache
   <Directory /var/www/html>
       AllowOverride All
       Require all granted
   </Directory>
   ```

5. **Restart Apache:**
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
