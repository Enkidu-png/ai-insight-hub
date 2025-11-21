# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/bba3a875-69c9-4a3e-8aa8-b092af813914

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/bba3a875-69c9-4a3e-8aa8-b092af813914) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Local CSV backend

- Start the lightweight backend that writes survey submissions to `data/survey-responses.csv` (no Supabase or external database required):
  ```bash
  node server/index.js
  ```
- In development, point the frontend at it with a `.env` file:
  ```bash
  VITE_API_BASE_URL=http://localhost:4000/api
  ```
- In production on Apache, proxy `/api` to the backend so the default `/api` base URL works without extra configuration. The provided `.htaccess` handles client-side routing, caching, and security headers.

## Deployment readiness

- Frontend builds to static assets in `dist/` and ships with an Apache-friendly `.htaccess` under `public/.htaccess`.
- Backend is a zero-dependency Node.js service writing survey data to CSV (see `server/index.js`).
- Wersja gotowa do wdrożenia na Apache on-premises – pełna instrukcja po polsku znajduje się w sekcji poniżej.

## Instrukcja wdrożenia na serwer Apache (po polsku)

Ten fragment README zawiera skróconą instrukcję z pliku `README_PL.md`, aby wszystko było w jednym miejscu.

### Wymagania
- Linux z Apache 2.4+ i modułami: `mod_rewrite`, `mod_headers`, `mod_deflate`, `mod_expires`, `mod_proxy`, `mod_proxy_http`
- Node.js (LTS) do budowania frontendu i uruchomienia backendu
- Uprawnienia do zapisu w katalogu z danymi ankiet (domyślnie `data/` obok aplikacji)

### Budowanie frontendu (Vite)
1. Zainstaluj zależności:
   ```bash
   npm install
   ```
2. Zbuduj wersję produkcyjną:
   ```bash
   npm run build
   ```
   Wynik znajdziesz w katalogu `dist/`.

### Uruchomienie backendu CSV
1. Na serwerze skopiuj katalog `server/` (lub cały projekt) obok katalogu z plikami statycznymi.
2. Ustaw (opcjonalnie) zmienne środowiskowe:
   - `PORT` – domyślnie `4000`
   - `DATA_DIR` – katalog na pliki CSV (domyślnie `data/` obok `server/index.js`)
   - `CSV_PATH` – pełna ścieżka do pliku CSV, jeżeli chcesz nadpisać nazwę/położenie
   - `CORS_ORIGIN` – gdy backend stoi na innym hoście niż frontend
3. Uruchom backend:
   ```bash
   node server/index.js
   ```
4. Sprawdź zdrowie usługi:
   ```bash
   curl http://localhost:4000/health
   ```

#### Jednostka systemd (zalecane)
Utwórz plik `/etc/systemd/system/survey-backend.service`:
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
Aktywuj usługę:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now survey-backend
```

### Publikacja frontendu w Apache
1. Skopiuj zawartość `dist/` do katalogu DocumentRoot (np. `/var/www/html`).
2. Upewnij się, że plik `.htaccess` z `public/.htaccess` znajduje się w głównym katalogu witryny.
3. W konfiguracji VirtualHost włącz `AllowOverride All` dla katalogu DocumentRoot:
   ```apache
   <Directory /var/www/html>
       AllowOverride All
       Require all granted
   </Directory>
   ```
4. Włącz moduły wymagane przez frontend (kompresja, cache, nagłówki):
   ```bash
   sudo a2enmod rewrite deflate expires headers
   sudo systemctl restart apache2
   ```

### Proxy `/api` do backendu
1. Włącz moduły proxy:
   ```bash
   sudo a2enmod proxy proxy_http
   sudo systemctl restart apache2
   ```
2. Dodaj do VirtualHost (backend na tym samym hoście, porcie 4000):
   ```apache
   ProxyPass /api http://127.0.0.1:4000/api
   ProxyPassReverse /api http://127.0.0.1:4000/api
   ```
3. Zrestartuj Apache:
   ```bash
   sudo systemctl restart apache2
   ```

### Weryfikacja po wdrożeniu
- Wejdź na adres strony (np. `https://twojadomena/`) i wypełnij ankietę.
- Sprawdź, czy plik CSV rośnie po każdym zgłoszeniu (domyślnie `data/survey-responses.csv`).
- Endpoint eksportu jest dostępny pod `/api/survey/export` i zwraca plik CSV.

### Aktualizacje aplikacji
1. Zatrzymaj backend: `sudo systemctl stop survey-backend`
2. Wgraj nową wersję plików `dist/` i ewentualnie zaktualizuj katalog `server/`.
3. Uruchom backend: `sudo systemctl start survey-backend`
4. Wyczyść cache przeglądarki lub odśwież stronę wymuszając przeładowanie zasobów.

### Najczęstsze problemy
- **404 przy routingu** – upewnij się, że `.htaccess` jest obecny i `mod_rewrite` działa.
- **Brak zapisu CSV** – sprawdź uprawnienia do `DATA_DIR` / `CSV_PATH` oraz logi `/var/log/survey-backend.log`.
- **CORS przy testach z innego hosta** – ustaw `CORS_ORIGIN` na adres frontendu albo skonfiguruj proxy jak wyżej.
- **Backend nie startuje po restarcie** – sprawdź status usługi: `systemctl status survey-backend`.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/bba3a875-69c9-4a3e-8aa8-b092af813914) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
