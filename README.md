# Instrukcja wdrożenia aplikacji ankiety na serwer www.learn.asseco.pl

Ten dokument zawiera krok po kroku instrukcję wdrożenia aplikacji ankiety AI na serwer Apache dostępny pod adresem www.learn.asseco.pl.

## Co będziesz instalować?

- **Frontend**: Aplikacja webowa z ankietą (pliki HTML, CSS, JavaScript)
- **Backend**: Prosty serwer zapisujący odpowiedzi do pliku CSV

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

## KROK 5: Utwórz katalog na dane z ankiet

### 5.1 Utwórz folder na odpowiedzi CSV
Skopiuj i wklej:

```bash
sudo mkdir -p /var/www/survey-data
```

### 5.2 Ustaw uprawnienia zapisu
Skopiuj i wklej:

```bash
sudo chmod 755 /var/www/survey-data
```

✅ **Sprawdź**: Komendy powinny wykonać się bez błędów.

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

### 9.5 Sprawdź czy dane zostały zapisane
Wróć do terminala SSH i wpisz:

```bash
cat /var/www/survey-data/survey-responses.csv
```

✅ **Sprawdź**: Powinieneś zobaczyć nagłówki CSV i Twoją testową odpowiedź.

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

### Pobieranie pliku CSV z odpowiedziami
```bash
scp uzytkownik@www.learn.asseco.pl:/var/www/survey-data/survey-responses.csv ./ankiety.csv
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

### ❌ Brak uprawnień do zapisu CSV
```bash
ssh uzytkownik@www.learn.asseco.pl
sudo chmod 777 /var/www/survey-data
```

---

## Kontakt i pomoc

Jeśli napotkasz problemy:
1. Skopiuj komunikaty błędów z terminala
2. Zrób zrzut ekranu przeglądarki (jeśli problem jest widoczny)
3. Skontaktuj się z działem IT Asseco

---

## Historia zmian (Changelog)

### 2024-12-15: Aktualizacja zgodności GDPR i UX formularza ankiety

**Zmodyfikowane pliki:**
1. **src/pages/Survey.tsx** (główne zmiany)
2. **package.json** - dodano @anthropic-ai/claude-agent-sdk
3. **package-lock.json** - zaktualizowane zależności
4. **claude-dependencies.txt** (nowy plik)

**Szczegółowe zmiany w src/pages/Survey.tsx:**

#### 1. Treść i kolejność (linie 119, 207, 211-216):
- Zaktualizowano opis ankiety: "Ankieta przed filmem - pomoże nam lepiej dostosować treści **materiałów edukacyjnych**"
- Przeniesiono pole email na koniec formularza (przed zgodami GDPR)
- Nowa kolejność: Pytania 1-7 → Email → Informacja GDPR → Zgoda

#### 2. Nowa sekcja: Informacja o nieodpłatnym dostępie (linie 204-209):
```jsx
<div className="glass-card rounded-2xl p-6 bg-primary/5 border border-primary/10">
  <p className="text-sm text-black/80 leading-relaxed">
    Chcemy nieodpłatnie dzielić się z Państwem cennym dobrem, jakim jest dostęp do wiedzy...
    Jeśli nie wyrażasz zgody, prosimy o opuszczenie strony.
  </p>
</div>
```

#### 3. Zaktualizowana zgoda marketingowa (linia 232):
- **Nowa treść**: "Wyrażam zgodę na przetwarzanie moich danych osobowych w celu przesyłania informacji handlowych (w tym marketingowych) za pomocą środków komunikacji elektronicznej zgodnie z art. 398 Prawa komunikacji elektronicznej."
- **Poprzednia**: Ogólna zgoda marketingowa bez podstawy prawnej

#### 4. Ulepszona klauzula RODO (linie 220-224):
- Osadzona w stylizowanym kontenerze (glass-card)
- Pełna informacja o administratorze: Asseco Data Systems S.A., Gdańsk
- Link do polityki prywatności: https://www.assecods.pl/polityka-prywatnosci-klauzule/newsletter
- Zwiększony odstęp między klauzulą a checkboxem (space-y-8)

#### 5. Usprawnienia wizualne:
- Spójna stylizacja obu boxów informacyjnych
- Wyrównane odstępy między elementami (32px - jak między pytaniami)
- Lepsza czytelność i hierarchia wizualna

**Nowy plik: claude-dependencies.txt**
- Szablon do instalacji zależności Claude AI SDK w nowych projektach
- Zawiera komendy dla npm i pip
- Instrukcje użycia

**Zgodność prawna:**
- ✅ Art. 398 Prawa komunikacji elektronicznej
- ✅ RODO - pełna klauzula informacyjna
- ✅ Jasna informacja o wymaganiu zgody marketingowej

---

**Wersja dokumentu**: 1.1
**Data ostatniej aktualizacji**: 15 grudnia 2024
**Aplikacja**: AI Insight Hub Survey
