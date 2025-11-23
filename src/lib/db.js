import Dexie from 'dexie';

// Initialize IndexedDB database
const db = new Dexie('BibBox');

db.version(1).stores({
  raceEntries: '++id, raceName, date, raceType, createdAt, updatedAt',
});

export default db;
