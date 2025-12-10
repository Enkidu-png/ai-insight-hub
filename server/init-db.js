import { initDatabase, testConnection } from './db.js';

const run = async () => {
  console.log('Testowanie połączenia z bazą danych...');
  const isConnected = await testConnection();

  if (!isConnected) {
    console.error('Nie udało się połączyć z bazą danych. Sprawdź konfigurację.');
    process.exit(1);
  }

  console.log('Połączenie z bazą danych udane!');
  console.log('Inicjalizacja schematu bazy danych...');

  try {
    await initDatabase();
    console.log('Baza danych zainicjalizowana pomyślnie!');
    process.exit(0);
  } catch (error) {
    console.error('Nie udało się zainicjalizować bazy danych:', error);
    process.exit(1);
  }
};

run();
