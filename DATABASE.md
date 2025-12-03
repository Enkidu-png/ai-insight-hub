# Dokumentacja bazy danych - Ankieta AI

## Informacje o bazie danych

- **Typ**: MariaDB 10.x
- **Host**: mariadb-cloud (10.10.9.191)
- **Port**: 3306
- **Baza danych**: `ankieta_db`
- **User**: `ankieta_user`
- **Hasło**: `zaq1@WSXDupa`

## Schemat tabeli `survey_responses`

```sql
CREATE TABLE survey_responses (
  id CHAR(36) PRIMARY KEY,                    -- UUID odpowiedzi
  email VARCHAR(255) NOT NULL,                -- Email uczestnika
  profession VARCHAR(255) NOT NULL,           -- Rola zawodowa
  experience VARCHAR(255) NOT NULL,           -- Poziom doświadczenia z AI
  ai_areas TEXT NOT NULL,                     -- JSON: obszary użycia AI
  challenge VARCHAR(500) NOT NULL,            -- Największe wyzwanie
  expectations VARCHAR(500) NOT NULL,         -- Oczekiwania od filmu
  time_spent VARCHAR(100) NOT NULL,           -- Czas spędzony z AI tygodniowo
  frustration TEXT NOT NULL,                  -- Frustracje w pracy z AI
  data_consent BOOLEAN NOT NULL DEFAULT TRUE, -- Zgoda na przetwarzanie danych
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Data utworzenia
  INDEX idx_email (email),
  INDEX idx_created_at (created_at),
  INDEX idx_profession (profession),
  INDEX idx_experience (experience)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Połączenie z bazą danych

### Z poziomu Node.js

Backend automatycznie łączy się z bazą używając zmiennych środowiskowych:

```javascript
import { query } from './database/connection.js';

// Przykład zapytania
const results = await query('SELECT * FROM survey_responses WHERE email = ?', ['test@example.com']);
```

### Z poziomu MySQL CLI

```bash
mysql -h mariadb-cloud -u ankieta_user -p ankieta_db
# Hasło: zaq1@WSXDupa
```

## Przykładowe zapytania SQL

### Pokaż wszystkie odpowiedzi
```sql
SELECT * FROM survey_responses ORDER BY created_at DESC;
```

### Zlicz odpowiedzi
```sql
SELECT COUNT(*) as total FROM survey_responses;
```

### Statystyki według zawodu
```sql
SELECT profession, COUNT(*) as count
FROM survey_responses
GROUP BY profession
ORDER BY count DESC;
```

### Statystyki według doświadczenia
```sql
SELECT experience, COUNT(*) as count
FROM survey_responses
GROUP BY experience
ORDER BY count DESC;
```

### Odpowiedzi z ostatnich 24 godzin
```sql
SELECT * FROM survey_responses
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY created_at DESC;
```

### Eksport do CSV (z MySQL)
```sql
SELECT * FROM survey_responses
INTO OUTFILE '/tmp/survey_export.csv'
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';
```

## Backup i restore

### Backup bazy danych
```bash
mysqldump -h mariadb-cloud -u ankieta_user -p ankieta_db > backup_$(date +%Y%m%d).sql
```

### Restore z backup
```bash
mysql -h mariadb-cloud -u ankieta_user -p ankieta_db < backup_20241124.sql
```

## Inicjalizacja bazy danych

### Automatyczna (przez backend)
Backend automatycznie tworzy tabelę przy pierwszym uruchomieniu.

### Ręczna (przez SQL script)
```bash
mysql -h mariadb-cloud -u ankieta_user -p ankieta_db < server/database/init.sql
```

## API Endpoints

### POST /api/survey
Zapisuje nową odpowiedź ankiety.

**Request:**
```json
{
  "profession": "Programista/Developer",
  "experience": "Podstawowy - używam od czasu do czasu",
  "aiAreas": ["Programowanie i debugging kodu", "Nauka i edukacja"],
  "email": "test@example.com",
  "challenge": "Nie wiem jak konstruować skuteczne prompty",
  "expectations": "Konkretnych szablonów promptów",
  "timeSpent": "1-5 godzin",
  "frustration": "Często muszę wielokrotnie przeformułowywać pytania...",
  "dataConsent": true
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "storedAt": "2024-11-24T15:30:00.000Z"
}
```

### GET /api/survey/export
Eksportuje wszystkie odpowiedzi jako plik CSV.

**Response:**
```csv
"id","email","profession","experience","ai_areas","challenge","expectations","time_spent","frustration","data_consent","created_at"
"123e4567...","test@example.com","Programista/Developer",...
```

### GET /health
Sprawdza status backendu i połączenia z bazą danych.

**Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-11-24T15:30:00.000Z"
}
```

## Monitoring i utrzymanie

### Sprawdzenie rozmiaru bazy
```sql
SELECT
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'ankieta_db'
ORDER BY (data_length + index_length) DESC;
```

### Optymalizacja tabel
```sql
OPTIMIZE TABLE survey_responses;
```

### Analiza indeksów
```sql
SHOW INDEX FROM survey_responses;
```

## Bezpieczeństwo

### Uprawnienia użytkownika
```sql
-- Sprawdź uprawnienia
SHOW GRANTS FOR 'ankieta_user'@'%';

-- Uprawnienia powinny obejmować:
-- SELECT, INSERT na tabeli survey_responses
-- Brak uprawnień DROP, DELETE dla bezpieczeństwa
```

### Rekomendacje bezpieczeństwa
1. Hasło przechowywane w zmiennych środowiskowych (nie w kodzie)
2. Połączenie przez sieć wewnętrzną (10.10.9.x)
3. SSL/TLS dla połączeń MySQL (rekomendowane w produkcji)
4. Regularne backupy bazy danych
5. Monitoring logów dostępu

## Migracja z CSV do bazy danych

Jeśli masz stare dane w formacie CSV:

```bash
# 1. Przygotuj plik CSV (bez nagłówków)
tail -n +2 survey-responses.csv > data.csv

# 2. Importuj do bazy
mysql -h mariadb-cloud -u ankieta_user -p ankieta_db

LOAD DATA LOCAL INFILE 'data.csv'
INTO TABLE survey_responses
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
(id, email, profession, experience, ai_areas, challenge, expectations, time_spent, frustration, data_consent, created_at);
```

## Troubleshooting

### Błąd: "Access denied"
- Sprawdź hasło
- Sprawdź czy user ma uprawnienia z danego hosta
- Sprawdź czy baza danych istnieje

### Błąd: "Can't connect to MySQL server"
- Sprawdź czy MariaDB działa: `systemctl status mariadb`
- Sprawdź firewall: `telnet mariadb-cloud 3306`
- Sprawdź network connectivity: `ping mariadb-cloud`

### Błąd: "Table doesn't exist"
- Uruchom skrypt init.sql
- Sprawdź logi backendu - powinien automatycznie utworzyć tabelę

## Kontakt

W przypadku problemów z bazą danych:
1. Sprawdź logi backendu: `/var/log/survey-backend.log`
2. Sprawdź logi MariaDB na serwerze mariadb-cloud
3. Skontaktuj się z administratorem bazy danych

---

**Wersja dokumentu**: 1.0
**Data**: 24 listopada 2024
**Autor**: AI Insight Hub Team
