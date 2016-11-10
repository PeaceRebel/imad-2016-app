var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');

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

/*var articles = { 
    'article-one' : {
      title: 'Article One',
      heading: 'Article One',
      date: '03-10-2016',
      content: `<p>
                        Some bullshit just for the sake of having some text.
                        Let's talk about <b>NOTHING</b>.
                    </p>
                    <p>
                        Nothing is a pronoun denoting the absence of anything. Nothing is a pronoun associated with nothingness. In nontechnical uses, nothing denotes things lacking importance, interest, value, relevance, or significance.
                    </p>
                    <p>
                         Nothingness is the state of being nothing, the state of nonexistence of anything, or the property of having nothing.
                    </p>
                    <p>
                        <h4>
                            Philosophy
                        </h4>
                        <h5>
                            Western philosophy
                        </h5>
                        <p>
                            Some would consider the study of "nothing" to be foolish. A typical response of this type is voiced by Giacomo Casanova (1725–1798) in conversation with his landlord, one Dr. Gozzi, who also happens to be a priest:
                            <br/>"As everything, for him, was an article of faith, nothing, to his mind, was difficult to understand: the Great Flood had covered the entire world; before, men had the misfortune of living a thousand years; God conversed with them; Noah had taken one hundred years to build the ark; while the earth, suspended in air, stood firmly at the center of the universe that God had created out of nothingness. When I said to him, and proved to him, that the existence of nothingness was absurd, he cut me short, calling me silly."
                        </p>
                        <br>
                        <hr/>
                        <h4>comments</h4>
                        <textarea style="width: 799px; height: 77px;"  id='newcomment' placeholder='Type your comments here' maxlength = '150'></textarea>
                        <hr/>
                        <ul id='comments'>
                        </ul>`
    },
    'article-two' : {
        title: 'Article Two',
        heading: 'Article Two',
        date: '03-10-2016',
        content: `<p>
                    Some bullshit just for the sake of having some text.
                    Let's talk about <b>NOTHING</b> again.
                </p>
                <p>
                    Nothing is a pronoun denoting the absence of anything. Nothing is a pronoun associated with nothingness. In nontechnical uses, nothing denotes things lacking importance, interest, value, relevance, or significance.
                </p>
                <p>
                     Nothingness is the state of being nothing, the state of nonexistence of anything, or the property of having nothing.
                </p>
                <p>
                    <h4>
                        Philosophy
                    </h4>
                    <h5>
                        Western philosophy
                    </h5>
                    <p>
                        Some would consider the study of "nothing" to be foolish. A typical response of this type is voiced by Giacomo Casanova (1725–1798) in conversation with his landlord, one Dr. Gozzi, who also happens to be a priest:
                        <br/>"As everything, for him, was an article of faith, nothing, to his mind, was difficult to understand: the Great Flood had covered the entire world; before, men had the misfortune of living a thousand years; God conversed with them; Noah had taken one hundred years to build the ark; while the earth, suspended in air, stood firmly at the center of the universe that God had created out of nothingness. When I said to him, and proved to him, that the existence of nothingness was absurd, he cut me short, calling me silly."
                    </p>`
    },
    'article-three' : {
        title: 'Article Three',
        heading: 'Article Three',
        date: '03-10-2016',
        content: ` <p>
                    Some bullshit just for the sake of having some text.
                    Let's talk about <b>NOTHING</b> once more.
                </p>
                <p>
                    Nothing is a pronoun denoting the absence of anything. Nothing is a pronoun associated with nothingness. In nontechnical uses, nothing denotes things lacking importance, interest, value, relevance, or significance.
                </p>
                <p>
                     Nothingness is the state of being nothing, the state of nonexistence of anything, or the property of having nothing.
                </p>
                <p>
                    <h4>
                        Philosophy
                    </h4>
                    <h5>
                        Western philosophy
                    </h5>
                    <p>
                        Some would consider the study of "nothing" to be foolish. A typical response of this type is voiced by Giacomo Casanova (1725–1798) in conversation with his landlord, one Dr. Gozzi, who also happens to be a priest:
                        <br/>"As everything, for him, was an article of faith, nothing, to his mind, was difficult to understand: the Great Flood had covered the entire world; before, men had the misfortune of living a thousand years; God conversed with them; Noah had taken one hundred years to build the ark; while the earth, suspended in air, stood firmly at the center of the universe that God had created out of nothingness. When I said to him, and proved to him, that the existence of nothingness was absurd, he cut me short, calling me silly."
                    </p>`
    }
};*/

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
    return ['pbkdf2', '10000', salt, hashed.toString('hex')].join('$');
}

app.get('/hash/:input', function (req, res){
    var hashedString = hash(req.params.input, 'random-string');
    res.send(hashedString);
});

var counter = 0;
app.get('/counter', function (req, res) {
   counter = counter + 1;
   res.send(counter.toString());
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
