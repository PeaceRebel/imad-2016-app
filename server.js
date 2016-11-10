var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');

var config = {
    user: 'peacerebel',
    host: 'db.imad.hasura-app.io',
    database: 'peacerebel',
    port: '5432',
    password: process.env.DB_PASSWORD
};

var pool = new Pool(config);
var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'RandomValue',
    cookie: { maxAge : 1000*60*60*24*30}
}));

function createTemplate (data){
    var title = data.title;
    var date = data.date;
    var heading = data.heading;
    var content = data.content;
    var htmlTemplate = `<html>
        <head>
            <link href="/ui/style.css" rel="stylesheet" />
            <title>
                ${title}
            </title>
            <meta name="viwport" content="width-device-width" initial-scale=1/>
        </head>
        <body>
            <div class="container">
                <div>
                    <a href="/">Home</a>
                </div>
                <hr/>
                <h3>
                    ${heading}
                </h3>
                <div>
                    ${date.toDateString()}
                </div>
                <div>
                   ${content}
                </div>
                <br>
                <hr/>
                <h4>comments</h4>
                <div id='article_comments'>    
                    <form method='post'>
                          <input type='text' name='name' id='name' placeholder='Your name'/><br />
                          <input type='text' name='email' id='email' placeholder='email'/>*<br />
                          <textarea name='comment' style="width: 799px; height: 77px;" id='comment' placeholder='Your comments go here'></textarea><br />
                          <input type='hidden' name='articleid' id='articleid' value='<? echo $_GET["id"]; ?>' />
                          <input type='submit' id='submit_comment' value='Submit' />  
                    </form>
                </div>
            </div>
      </body>
    </html>`;
    return htmlTemplate;
}

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

function hash(input, salt){
    const hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
    return ["pbkdf2", "10000", salt, hashed.toString('hex')].join('$');
}

app.get('/hash/:input', function (req, res){
    var hashedString = hash(req.params.input, 'random-string');
    res.send(hashedString);
});

app.post('/create-user', function (req, res) {
   var username = 'bipin';//req.body.username
   var password = 'password';//req.body.password
   var salt = crypto.randomBytes(128).toString('hex');
   var dbString = hash(password, salt);
   pool.query('INSERT INTO "user" (username, password) VALUES ($1, $2)', [username, dbString], function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          res.send('User successfully created: ' + username);
      }
   });
});


app.post('/login', function(req, res){
   var username = req.body.username;
   var password = req.body.password;
   
   pool.query('SELECT * FROM "user" WHERE username=$1',[username], function(err,result){
      if (err){
          res.status(500).send(err.toString());
      }
      else {
          if (result.rows.length === 0){
              res.status(403).send('username/password is invalid!');
          }
        else{
              var dbString = result.rows[0].password;
              var salt= dbString.split('$')[2];
              var hashedPassword = hash(password, salt);
              if (hashedPassword == dbString){
                  req.session.auth = {userId : result.rows.[0].id} ;
                  res.send('Credentials accepted!');
                }
              else {
                  res.status(403).send('username/password is invalid!');
              }
          }
      }
   });
});

app.get('/check-login',fucntion(req,res){
    if (req.session && req.session.auth && req.session.auth.userId){
        res.send('You are logged in: ' + req.session.auth.userId.toString());
    }
    else{
        res.send('You are not logged in!');
    }
});

app.get('/log-out', function(req, res){
    delete req.session.auth;
    res.send('Logged Out!');
});

var names = [];
app.get('/submit-name', function (req, res){
    var name = req.query.name;
    names.push(name);
    res.send(JSON.stringify(names));
});

app.get("/article/:articleName", function (req, res){
    
   pool.query('SELECT * FROM article WHERE title = $1', [req.params.articleName], function(err, result){
      if(err){
          res.status(500).send(err.toString());
      } 
      else{
          if(result.rows.length == 0){
              res.status(404).send('Article not found!');
          }
          else{
              var articleData = result.rows[0];
              res.send(createTemplate(articleData));
          }
      }
   });
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
