var express = require('express');
const bodyParser = require('body-parser');
var app = express();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./web_project.db');
const { v4: uuidv4 } = require('uuid');

const session = require('express-session');
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 },
  })
);

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/api/numbers', (req, res) => {
  db.get('SELECT COUNT(*) AS count FROM users', (err, row) => {
    const number = row.count;

    res.json(number);
  });
});

app.get('/', function (req, res) {
  let sql = 'SELECT * FROM posts';

  db.all(sql, (err, rows) => {
    if (err) {
      throw err;
    }
    res.render('mainPage', {
      posts: rows,
    });
  });
});

app.get('/logout', function (req, res) {});

app.post('/add', function (req, res) {
  const id = uuidv4();
  var subject = req.body.subject;
  var body = req.body.body;

  var today = new Date();
  var date =
    today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  var time =
    today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();

  var author = req.session.username;
  req.session.addResult = 'Post succusfully added.';

  db.run(
    'INSERT INTO posts(id,subject, body, date, time, author) VALUES(?, ?, ?, ?, ?, ?)',
    [id, subject, body, date, time, author],
    err => {}
  );

  res.redirect('/panel');
});

app.get('/add', function (req, res) {
  if (req.session.loggedIn) {
    const username = req.session.username;
    res.render('addPage', { username: username });
  } else {
    res.redirect('/login');
  }
});

app.post('/delete', function (req, res) {
  const sql = `DELETE FROM posts WHERE id = '${req.body.deletedId}'`;
  req.session.addResult = 'Post succusfully deleted.';

  db.run(sql, function (err) {
    if (err) {
      console.error(err.message);
    }
  });

  res.redirect('/panel');
});

app.post('/editing', function (req, res) {
  const id = req.body.id;
  var subject = req.body.subject;
  var body = req.body.body;

  var today = new Date();
  var date =
    today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  var time =
    today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();

  req.session.addResult = 'Post succusfully edited.';

  let sql = `UPDATE posts SET subject = '${subject}', body = '${body}', date = '${date}', time = '${time}' WHERE id = '${id}'`;

  db.all(sql, function (err) {
    if (err) {
      return console.error(err.message);
    }
  });

  res.redirect('/panel');
});

app.post('/edit', function (req, res) {
  if (req.session.loggedIn) {
    const id = req.body.Edit;
    const username = req.session.username;

    let sql = 'SELECT * FROM posts WHERE id = ?';

    db.all(sql, [id], (err, rows) => {
      if (err) {
        throw err;
      }

      res.render('editPage', {
        username: username,
        subject: rows[0].subject,
        body: rows[0].body,
        id: id,
      });
    });
  } else {
    res.redirect('/login');
  }
});

app.get('/panel', function (req, res) {
  if (req.session.loggedIn) {
    const username = req.session.username;
    const message = req.session.addResult;
    req.session.addResult = '';

    let sql = 'SELECT * FROM posts WHERE author = ?';

    db.all(sql, [username], (err, rows) => {
      if (err) {
        throw err;
      }

      res.render('panelPage', {
        username: username,
        result: message,
        posts: rows,
      });
    });
  } else {
    res.redirect('/login');
  }
});

app.post('/logout', function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/login');
    }
  });
});

app.post('/login', function (req, res) {
  var username = req.body.username;
  var password = req.body.pass;

  let sql = 'SELECT * FROM users WHERE username = ?';

  db.all(sql, [username], (err, rows) => {
    if (err) {
      throw err;
    }

    if (rows.length == 1) {
      if (rows[0].password == password) {
        req.session.loggedIn = true;
        req.session.username = username;
        return res.redirect(`/panel`);
      }
    }

    res.render('loginPage', { error: 'username or password is wrong' });
  });
});

app.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/login');
  } else {
    res.render('loginPage');
  }
});

app.post('/signup', (req, res) => {
  var username = req.body.username;
  var email = req.body.mail;
  var password = req.body.pass;
  var len = 0;

  let sql = 'SELECT * FROM users WHERE username = ?';

  db.all(sql, [username], (err, rows) => {
    if (err) {
      throw err;
    }

    rows.forEach(row => {
      len++;
    });
  });

  setTimeout(function () {
    if (len) {
      res.render('signupPage', { error: 'This username already exists.' });
    } else {
      db.run(
        'INSERT INTO users(username, email, password) VALUES(?, ?, ?)',
        [username, email, password],
        err => {}
      );

      req.session.loggedIn = true;
      req.session.username = username;
      res.redirect(`/panel`);
    }
  }, 100);
});

app.get('/signup', function (req, res) {
  res.render('signupPage');
});

app.listen(3000, function () {
  console.log('Listening on port 3000!');
});
