/* Wraps sqlite commands get,use, and all, so that they use Promises, and can be used with async-await */

/* Also creates the database; you will need to configure it here */

'use strict'

const sql = require('sqlite3');
const util = require('util');


// old-fashioned database creation code 

// creates a new database object, not a 
// new database. 
const db = new sql.Database("videos.db");

// check if database exists
let cmd = " SELECT name FROM sqlite_master WHERE type='table' AND name='VideoTable' ";

db.get(cmd, function (err, val) {
    if (val == undefined) {
        console.log("No database file - creating one");
        createVideoTable();
    } else {
        console.log("Database file found");
    }
});

// called to create table if needed
function createVideoTable() {
    // explicitly declaring the rowIdNum protects rowids from changing if the 
    // table is compacted; not an issue here, but good practice
    const cmd = 'CREATE TABLE VideoTable (rowIdNum INTEGER PRIMARY KEY, url TEXT, nickname TEXT, userid TEXT, flag INTEGER)';
    db.run(cmd, function (err, val) {
        if (err) {
            console.log("Database creation failure", err.message);
        } else {
            console.log("Created database");
        }
    });
}

// wrap all database commands in promises
db.run = util.promisify(db.run);
db.get = util.promisify(db.get);
db.all = util.promisify(db.all);

// allow code in other server .js files to use the db object
module.exports = db;
