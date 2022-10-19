``// index.js
// This is our main server file

// A static server using Node and Express
const express = require("express");
// gets data out of HTTP request body 
// and attaches it to the request object
const bodyParser = require('body-parser');

const fetch = require("cross-fetch");
// create object to interface with express
const app = express();

const db = require('./Video_database');
// Code in this section sets up an express pipeline

// print info about incoming HTTP request 
// for debugging





app.use(function(req, res, next) {
  console.log(req.method,req.url);
  next();
})

app.use(bodyParser.json());
// make all the files in 'public' available 
app.use(express.static("public"));

// if no file specified, return the main page
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/tiktokpets.html");
});
app.get("/MyVideos.html", (request, response) => {
  response.sendFile(__dirname + "/public/MyVideos.html");
});

app.post("/videoData", (req, res) =>{
  let data=req.body;
  console.log(data);
  if(data.name==''||data.nickname==''||data.url==''){
    return res.status(406).send();
  }

  let isFull = false;
  
  dumpTable()
        .then(function(result) {
            let n = result.length;
            console.log(n + " items in the database");
            if (n < 8) {
              ChangeFlag();
                insertVideo(data);
                console.log("inserted successfully!");
                console.log(n + " items in the database");
            } else {
                console.log("database full!");
                isFull = true;
            }
          return res.json({isFull}).send();
        })
        .catch(function(err) {
            console.log("SQL error", err)
        });
});

app.get("/getfirstVideo", (req, res) =>{
  getfirstVideo().then((data)=>{
    //console.log(JSON.stringify(data)); 
  return res.send( JSON.stringify(data)); 
  });;
});

app.get("/videoList", (req, res) =>{
  get8Videos().then((data)=>{
    //console.log(JSON.stringify(data));
    
  return res.send( JSON.stringify(data)); 
  });
 
});
app.get("/delete", (req, res) => {
    que=req.query;
    console.log(que.num);
    res.send(deleteVideo(que.num));
  
});
// Need to add response if page not found!
app.use(function(req, res){
  res.status(404); res.type('txt'); 
  res.send('404 - File '+req.url+' not found'); 
});


// end of pipeline specification

app.get("/", (request, response) => {
    response.sendFile(__dirname + "/public/redirect.html");
  });
// end of pipeline specification

async function deleteVideo(num) {
  const sql = "delete from VideoTable where rowIdNum=?";

  return await db.run(sql,num);
}

async function insertVideo(v) {

  const sql = "insert into VideoTable (url,nickname,userid,flag) values (?,?,?,TRUE)";

await db.run(sql,[v.url, v.nickname, v.username]);
}

async function getfirstVideo() {

  const sql = 'select * from VideoTable where flag=TRUE';
  
let result = await db.get(sql);
  
return result;
}

async function get8Videos() {

  // warning! You can only use ? to replace table data, not table name or column name.
  const sql = 'select * from VideoTable order by rowIdNum LIMIT 8';

let result = await db.all(sql);
  
return result;
}

async function dumpTable() {
  const sql = "select * from VideoTable"
  
  let result = await db.all(sql)
  return result;
}

async function ChangeFlag() {
    const update = "UPDATE VideoTable SET flag=0 WHERE flag=1"
    let result = await db.run(update);
    return result;
}









// Now listen for HTTP requests
// it's an event listener on the server!
const listener = app.listen(3000, function () {
  console.log("The static server is listening on port " + listener.address().port);
});
