# Instrukcja wdrożenia aplikacji na serwer Apache (on‑premises)

Ten dokument opisuje, jak uruchomić frontend (Vite/React) oraz lekki backend CSV na własnym serwerze Apache bez zewnętrznych usług.

## Architektura w skrócie
- Frontend: statyczne pliki zbudowane Vite (React, TypeScript, Tailwind, shadcn-ui).
- Backend: prosty serwis Node.js zapisujący odpowiedzi ankiet do pliku CSV (`server/index.js`).
- Komunikacja: frontend wysyła żądania POST do `/api/survey`, Apache proxy kieruje je do backendu; eksport CSV pod `/api/survey/export`.

## Wymagania
- Linux z Apache 2.4+ i modułami: `mod_rewrite`, `mod_headers`, `mod_deflate`, `mod_expires`, `mod_proxy`, `mod_proxy_http`.
- Node.js (LTS) do budowania frontendu i uruchomienia backendu.
- Uprawnienia do zapisu w katalogu z danymi ankiet (domyślnie `data/` obok aplikacji).

## Budowanie frontendu (Vite)
1. Zainstaluj zależności:
   ```bash
   npm install
   ```
2. Zbuduj wersję produkcyjną:
   ```bash
   npm run build
   ```
   Wynik znajdziesz w katalogu `dist/`.

## Uruchomienie backendu CSV
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

### Jednostka systemd (zalecane)
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

## Publikacja frontendu w Apache
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

## Proxy `/api` do backendu
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

## Weryfikacja po wdrożeniu
- Wejdź na adres strony (np. `https://twojadomena/`) i wypełnij ankietę.
- Sprawdź, czy plik CSV rośnie po każdym zgłoszeniu (domyślnie `data/survey-responses.csv`).
- Endpoint eksportu jest dostępny pod `/api/survey/export` i zwraca plik CSV.

## Aktualizacje aplikacji
1. Zatrzymaj backend: `sudo systemctl stop survey-backend`
2. Wgraj nową wersję plików `dist/` i ewentualnie zaktualizuj katalog `server/`.
3. Uruchom backend: `sudo systemctl start survey-backend`
4. Wyczyść cache przeglądarki lub odśwież stronę wymuszając przeładowanie zasobów.

## Najczęstsze problemy
- **404 przy routingu** – upewnij się, że `.htaccess` jest obecny i `mod_rewrite` działa.
- **Brak zapisu CSV** – sprawdź uprawnienia do `DATA_DIR` / `CSV_PATH` oraz logi `/var/log/survey-backend.log`.
- **CORS przy testach z innego hosta** – ustaw `CORS_ORIGIN` na adres frontendu albo skonfiguruj proxy jak wyżej.
- **Backend nie startuje po restarcie** – sprawdź status usługi: `systemctl status survey-backend`.
