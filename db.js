const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('logs.db');

function initializeDb() {
  return new Promise(function(resolve, reject) {
    const checkTable = 
      `SELECT "name" 
       FROM "sqlite_master" 
       WHERE type="table" AND name=$name;`;
    db.get(checkTable, { $name: "temperature" }, function(err, row) {
      if (err) reject(err); 
      else if (row) resolve(true); // table exists
      else resolve(false); // table doesn't exist
    });
  });
}

function createTemperatureTable()
{
  return new Promise(function(resolve, reject) {
    console.log('> Creating table: temperature.');
    db.run(
      `CREATE TABLE "temperature" (
	      "id"    INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	      "value"	REAL,
	      "date"	TEXT);`,
      function(err) {
        if (err) reject(err);
        else resolve();
      });
  });
}

function createRelHumidityTable() {
  return new Promise(function(resolve, reject) {
    console.log('> Creating table: relhumidity.');
    db.run(
      `CREATE TABLE "relhumidity" (
	      "id"	  INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	      "value"	REAL,
	      "date"	TEXT);`,
      function(err) {
        if (err) reject(err);
        else resolve();
      });
  });
}

function createTables(exists) {
  if (!exists) {
    console.log('> New DB; creating schema.');
    createTemperatureTable()
      .then(createRelHumidityTable)
      .then(() => console.log("All tables created"))
      .catch(err => console.log("> Create tables error: ", err));
    } 
    else console.log('> Existing DB with updated schema.');
}

function initialize() {
  initializeDb()
  .then(exists => createTables(exists))
  .catch(err => console.log('> DB initialize error: ', err));
}

function close() {
  console.log('> Closing DB.');
  db.close();
  console.log('> DB is closed.')
}

function storeTemperature(temperature, date) {
  return new Promise(function(resolve, reject) {
    console.log("> Storing temperature.")
    db.run(
      `INSERT INTO "temperature" ("value", "date") VALUES ($temperature,  $date)`, 
      { 
        $temperature: temperature, 
        $date: date 
      },
      function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
}

function getlastInsertId() {
  return new Promise(function(resolve, reject) {
    db.get(`SELECT last_insert_rowid()`, 
    function(err, row) {
      if (err) reject(err);
      else 
      {
        let lastRowId = row["last_insert_rowid()"];
        resolve(lastRowId)
      };
    });
  });
}

function storeRelHumidity(insertId, relhumidity, date) {
  return new Promise(function(resolve, reject) {
    console.log("> Storing relhumidity at id", insertId)
    db.run(
      `INSERT INTO "relhumidity" ("id", "value", "date") VALUES ($id, $relhumidity,  $date)`, 
      { 
        $id: insertId,
        $relhumidity: relhumidity, 
        $date: date 
      },
      function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
}

function store(data) {
  console.log('> Storing data', data);
  storeTemperature(data.temp, data.date)
    .then(getlastInsertId)
    .then(id => storeRelHumidity(id, data.relhumidity, data.date))
    .then(() => console.log('> All data stored.'))
    .catch(err => console.log('> DB store error: ', err));
}

module.exports = { initialize, close, store }