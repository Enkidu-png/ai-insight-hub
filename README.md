# Instrukcja wdrożenia aplikacji ankiety na serwer www.learn.asseco.pl

Ten dokument zawiera krok po kroku instrukcję wdrożenia aplikacji ankiety AI na serwer Apache dostępny pod adresem www.learn.asseco.pl.

## Co będziesz instalować?

- **Frontend**: Aplikacja webowa z ankietą (pliki HTML, CSS, JavaScript)
- **Backend**: Serwer Node.js zapisujący odpowiedzi do bazy danych MariaDB
- **Baza danych**: MariaDB na serwerze mariadb-cloud (10.10.9.191)

---

## KROK 1: Połącz się z serwerem

### 1.1 Otwórz terminal (wiersz polecenia)
- **Windows**: Naciśnij `Win + R`, wpisz `cmd`, naciśnij Enter
- **Mac/Linux**: Otwórz aplikację Terminal

### 1.2 Połącz się z serwerem przez SSH
Skopiuj i wklej poniższą komendę (zastąp `uzytkownik` swoją nazwą użytkownika):

```bash
ssh uzytkownik@www.learn.asseco.pl
```

Wpisz hasło gdy zostaniesz poproszony.

✅ **Sprawdź**: Powinien pojawić się wiersz z nazwą serwera (np. `uzytkownik@learn:~$`)

---

## KROK 2: Przygotuj katalog dla aplikacji

### 2.1 Przejdź do katalogu głównego WWW
Skopiuj i wklej:

```bash
cd /var/www
```

### 2.2 Utwórz katalog dla projektu
Skopiuj i wklej:

```bash
sudo mkdir -p ai-insight-hub
```

Wpisz hasło sudo jeśli zostaniesz poproszony.

### 2.3 Ustaw uprawnienia
Skopiuj i wklej (zastąp `uzytkownik` swoją nazwą):

```bash
sudo chown -R uzytkownik:www-data ai-insight-hub
```

✅ **Sprawdź**: Komenda powinna wykonać się bez błędów.

---

## KROK 3: Wgraj pliki aplikacji na serwer

### 3.1 Otwórz NOWE okno terminala (nie zamykaj poprzedniego)
- **Windows**: `Win + R` → `cmd` → Enter
- **Mac/Linux**: Nowe okno Terminal

### 3.2 Przejdź do folderu z aplikacją na swoim komputerze
Skopiuj i wklej (zmień ścieżkę do swojej lokalizacji):

```bash
cd "C:\Users\jan.sachse\OneDrive - ASSECO DATA SYSTEMS S.A\Documents\Ankieta podstawy  github\ai-insight-hub"
```

### 3.3 Wgraj frontend (folder dist) na serwer
Skopiuj i wklej (zastąp `uzytkownik`):

```bash
scp -r dist/* uzytkownik@www.learn.asseco.pl:/var/www/html/
```

⏳ **Poczekaj**: Transfer plików może potrwać 10-30 sekund.

### 3.4 Wgraj backend (folder server) na serwer
Skopiuj i wklej (zastąp `uzytkownik`):

```bash
scp -r server uzytkownik@www.learn.asseco.pl:/var/www/ai-insight-hub/
```

⏳ **Poczekaj**: Transfer plików powinien zająć kilka sekund.

✅ **Sprawdź**: Na końcu powinno pojawić się potwierdzenie "100%" dla każdego pliku.

### 3.5 Zamknij to okno terminala
Możesz zamknąć to okno. Wróć do poprzedniego okna z połączeniem SSH.

---

## KROK 4: Sprawdź czy Node.js jest zainstalowany

### 4.1 Wróć do okna terminala z połączeniem SSH
(To pierwsze okno, gdzie jesteś połączony z serwerem)

### 4.2 Sprawdź wersję Node.js
Skopiuj i wklej:

```bash
node --version
```

✅ **Sprawdź**: Powinna pojawić się wersja (np. `v18.17.0` lub nowsza).

❌ **Jeśli pojawił się błąd "command not found"** - musisz zainstalować Node.js:

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

⏳ **Poczekaj**: Instalacja może potrwać 2-5 minut.

---

## KROK 5: Skonfiguruj połączenie z bazą danych

### 5.1 Utwórz plik konfiguracyjny środowiska
Skopiuj i wklej:

```bash
nano /var/www/ai-insight-hub/server/.env
```

⏳ Otworzy się edytor tekstu.

### 5.2 Wklej konfigurację bazy danych
Naciśnij **Ctrl+Shift+V** (lub prawy przycisk myszy → Paste) i wklej:

```
PORT=4000
DB_HOST=mariadb-cloud
DB_PORT=3306
DB_USER=ankieta_user
DB_PASSWORD=zaq1@WSXDupa
DB_NAME=ankieta_db
```

### 5.3 Zapisz i zamknij plik
- Naciśnij **Ctrl+O** (zapisz)
- Naciśnij **Enter** (potwierdź nazwę)
- Naciśnij **Ctrl+X** (wyjdź)

✅ **Sprawdź**: Powinieneś wrócić do wiersza poleceń.

---

## KROK 6: Skonfiguruj backend jako usługę systemową

### 6.1 Utwórz plik konfiguracyjny usługi
Skopiuj i wklej:

```bash
sudo nano /etc/systemd/system/survey-backend.service
```

⏳ Otworzy się edytor tekstu.

### 6.2 Wklej konfigurację
Naciśnij **Ctrl+Shift+V** (lub prawy przycisk myszy → Paste) i wklej:

```ini
[Unit]
Description=Survey backend with MariaDB
After=network.target

[Service]
WorkingDirectory=/var/www/ai-insight-hub/server
ExecStart=/usr/bin/node index.js
Restart=always
Environment=PORT=4000
Environment=DB_HOST=mariadb-cloud
Environment=DB_PORT=3306
Environment=DB_USER=ankieta_user
Environment=DB_PASSWORD=zaq1@WSXDupa
Environment=DB_NAME=ankieta_db
StandardOutput=append:/var/log/survey-backend.log
StandardError=inherit

[Install]
WantedBy=multi-user.target
```

### 6.3 Zapisz i zamknij plik
- Naciśnij **Ctrl+O** (zapisz)
- Naciśnij **Enter** (potwierdź nazwę)
- Naciśnij **Ctrl+X** (wyjdź)

✅ **Sprawdź**: Powinieneś wrócić do wiersza poleceń.

---

## KROK 7: Uruchom backend

### 7.1 Przeładuj konfigurację systemd
Skopiuj i wklej:

```bash
sudo systemctl daemon-reload
```

### 7.2 Włącz automatyczne uruchamianie backendu
Skopiuj i wklej:

```bash
sudo systemctl enable survey-backend
```

### 7.3 Uruchom backend
Skopiuj i wklej:

```bash
sudo systemctl start survey-backend
```

### 7.4 Sprawdź czy backend działa
Skopiuj i wklej:

```bash
sudo systemctl status survey-backend
```

✅ **Sprawdź**: Powinno pojawić się `active (running)` w kolorze zielonym.

Naciśnij **Q** aby wyjść z widoku statusu.

### 7.5 Przetestuj endpoint backendu
Skopiuj i wklej:

```bash
curl http://localhost:4000/health
```

✅ **Sprawdź**: Powinna pojawić się odpowiedź JSON: `{"status":"ok","dataPath":"..."}`

---

## KROK 8: Skonfiguruj Apache

### 8.1 Włącz wymagane moduły Apache
Skopiuj i wklej:

```bash
sudo a2enmod rewrite deflate expires headers proxy proxy_http
```

✅ **Sprawdź**: Powinny pojawić się komunikaty o włączeniu modułów.

### 8.2 Znajdź plik konfiguracyjny VirtualHost
Skopiuj i wklej:

```bash
ls /etc/apache2/sites-available/
```

✅ **Sprawdź**: Powinny pojawić się pliki .conf (np. `000-default.conf`, `learn.asseco.pl.conf`)

### 8.3 Edytuj plik konfiguracyjny dla www.learn.asseco.pl
Zastąp `learn.asseco.pl.conf` odpowiednią nazwą z poprzedniego kroku:

```bash
sudo nano /etc/apache2/sites-available/learn.asseco.pl.conf
```

⏳ Otworzy się edytor z konfiguracją.

### 8.4 Znajdź sekcję `<VirtualHost>` i dodaj proxy
Użyj strzałek, aby przewinąć do środka sekcji `<VirtualHost *:80>` lub `<VirtualHost *:443>`.

Znajdź linię z `DocumentRoot` i **PONIŻEJ niej** dodaj:

```apache
    # Proxy dla API backendu
    ProxyPass /api http://127.0.0.1:4000/api
    ProxyPassReverse /api http://127.0.0.1:4000/api

    # Konfiguracja katalogu głównego
    <Directory /var/www/html>
        AllowOverride All
        Require all granted
    </Directory>
```

### 8.5 Zapisz i zamknij plik
- Naciśnij **Ctrl+O** (zapisz)
- Naciśnij **Enter** (potwierdź)
- Naciśnij **Ctrl+X** (wyjdź)

### 8.6 Sprawdź konfigurację Apache
Skopiuj i wklej:

```bash
sudo apache2ctl configtest
```

✅ **Sprawdź**: Powinno pojawić się `Syntax OK`.

❌ **Jeśli pojawił się błąd**: Wróć do kroku 8.3 i sprawdź czy poprawnie skopiowałeś konfigurację.

### 8.7 Zrestartuj Apache
Skopiuj i wklej:

```bash
sudo systemctl restart apache2
```

✅ **Sprawdź**: Komenda powinna wykonać się bez błędów.

---

## KROK 9: Sprawdź czy wszystko działa

### 9.1 Sprawdź status Apache
Skopiuj i wklej:

```bash
sudo systemctl status apache2
```

✅ **Sprawdź**: Powinno być `active (running)` w kolorze zielonym.

Naciśnij **Q** aby wyjść.

### 9.2 Sprawdź logi backendu
Skopiuj i wklej:

```bash
tail -n 20 /var/log/survey-backend.log
```

✅ **Sprawdź**: Powinien pojawić się komunikat `Survey backend listening on port 4000`.

### 9.3 Otwórz przeglądarkę na swoim komputerze
Wpisz w pasku adresu:

```
https://www.learn.asseco.pl
```

✅ **Sprawdź**: Powinna załadować się aplikacja z ankietą.

### 9.4 Wypełnij testową ankietę
Wypełnij formularz i kliknij "Przejdź do filmu".

### 9.5 Sprawdź czy dane zostały zapisane w bazie danych
Sprawdź połączenie z bazą danych przez endpoint health:

```bash
curl http://localhost:4000/health
```

✅ **Sprawdź**: Powinna pojawić się odpowiedź JSON z `"database": "connected"`.

### 9.6 Pobierz dane jako CSV (opcjonalnie)
Możesz wyeksportować dane z bazy:

```bash
curl http://localhost:4000/api/survey/export -o ankieta-export.csv
cat ankieta-export.csv
```

✅ **Sprawdź**: Plik CSV powinien zawierać Twoją testową odpowiedź.

---

## KROK 10: Zakończ

### 10.1 Rozłącz się z serwerem
Skopiuj i wklej:

```bash
exit
```

### 10.2 Zamknij terminal

🎉 **Gratulacje!** Aplikacja ankiety jest teraz uruchomiona na www.learn.asseco.pl

---

## Co dalej? - Zarządzanie aplikacją

### Sprawdzanie logów backendu
```bash
ssh uzytkownik@www.learn.asseco.pl
tail -f /var/log/survey-backend.log
```
(Naciśnij **Ctrl+C** aby wyjść z podglądu logów)

### Eksport danych z bazy jako CSV
```bash
# Pobierz eksport CSV z API
curl https://www.learn.asseco.pl/api/survey/export -o ankiety.csv
```

### Dostęp do bazy danych MariaDB
```bash
# Połącz się z bazą danych (z serwera www.learn.asseco.pl)
ssh uzytkownik@www.learn.asseco.pl
mysql -h mariadb-cloud -u ankieta_user -p ankieta_db
# Hasło: zaq1@WSXDupa

# Przykładowe zapytania SQL:
# Pokaż wszystkie odpowiedzi:
SELECT * FROM survey_responses ORDER BY created_at DESC;

# Zlicz odpowiedzi:
SELECT COUNT(*) as total FROM survey_responses;

# Wyjdź z MySQL:
exit
```

### Restart backendu (jeśli potrzebny)
```bash
ssh uzytkownik@www.learn.asseco.pl
sudo systemctl restart survey-backend
```

### Aktualizacja aplikacji
1. Zbuduj nową wersję lokalnie: `npm run build`
2. Zatrzymaj backend: `sudo systemctl stop survey-backend`
3. Wgraj nowe pliki: `scp -r dist/* uzytkownik@www.learn.asseco.pl:/var/www/html/`
4. Wgraj nowy backend (jeśli zmieniony): `scp -r server uzytkownik@www.learn.asseco.pl:/var/www/ai-insight-hub/`
5. Uruchom backend: `sudo systemctl start survey-backend`

---

## Najczęstsze problemy

### ❌ Strona nie ładuje się (404)
```bash
# Sprawdź czy pliki są w katalogu
ssh uzytkownik@www.learn.asseco.pl
ls -la /var/www/html/
# Powinien być plik index.html i .htaccess
```

### ❌ Ankieta nie zapisuje się
```bash
# Sprawdź status backendu
ssh uzytkownik@www.learn.asseco.pl
sudo systemctl status survey-backend
# Sprawdź logi
tail -n 50 /var/log/survey-backend.log
```

### ❌ Backend nie startuje
```bash
# Sprawdź szczegółowe logi błędów
ssh uzytkownik@www.learn.asseco.pl
sudo journalctl -u survey-backend -n 50
```

### ❌ Błąd połączenia z bazą danych
```bash
# Sprawdź czy serwer ma dostęp do bazy
ssh uzytkownik@www.learn.asseco.pl
ping -c 3 mariadb-cloud

# Sprawdź połączenie MySQL
mysql -h mariadb-cloud -u ankieta_user -p ankieta_db
# Hasło: zaq1@WSXDupa

# Jeśli nie możesz się połączyć:
# 1. Sprawdź czy MariaDB działa na serwerze mariadb-cloud
# 2. Sprawdź firewall (port 3306 musi być otwarty)
# 3. Sprawdź czy user ma uprawnienia z '%' hosta
```

### ❌ Tabela w bazie danych nie istnieje
```bash
# Backend automatycznie tworzy tabelę przy starcie
# Jeśli potrzebujesz ręcznie:
ssh uzytkownik@www.learn.asseco.pl
mysql -h mariadb-cloud -u ankieta_user -p ankieta_db < /var/www/ai-insight-hub/server/database/init.sql
```

---

## Kontakt i pomoc

Jeśli napotkasz problemy:
1. Skopiuj komunikaty błędów z terminala
2. Zrób zrzut ekranu przeglądarki (jeśli problem jest widoczny)
3. Skontaktuj się z działem IT Asseco

---

**Wersja dokumentu**: 1.0
**Data ostatniej aktualizacji**: 24 listopada 2024
**Aplikacja**: AI Insight Hub Survey
