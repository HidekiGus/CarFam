const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'backend/db/database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run("UPDATE users SET name = 'Mãe' WHERE name = 'Mom'");
  db.run("UPDATE users SET name = 'Pai' WHERE name = 'Dad'");
  db.run("UPDATE users SET name = 'Gu' WHERE name = 'Son'");
  db.run("UPDATE users SET name = 'Re' WHERE name = 'Daughter'");
});

db.close((err) => {
  if (err) console.error(err);
  else console.log('Names updated successfully in DB!');
});
