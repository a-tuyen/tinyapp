
const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const request = require('request');
const bcrypt = require('bcrypt');
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'userID',
  keys: ['mini', 'giant'],
}));

const urlDatabase = {};

const usersDatabase = {};

//load login page
app.get('/login', (req, res) => {
  const userID = req.session.userID;
  if (userID) {
    return res.redirect('/urls');
  }
  const templateVars = {
    userID: usersDatabase[userID],
  };
  return res.render('urls_login', templateVars);
});

//creates cookie when logging in
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const userInfoID = getUserByEmail(email, usersDatabase);
  if (!userInfoID) {
    return res.status(403).send('Email is not registered. Please register first');
  }
  const pwValidation = bcrypt.compareSync(password, usersDatabase[userInfoID].password);
  if (!pwValidation) {
    return res.status(403).send('Password is incorrect. Please try again');
  } else {
    req.session.userID = userInfoID;
    return res.redirect('/urls');
  }
});

//logs user out and clears cookie
app.post('/logout', (req, res) => {
  req.session = null;
  return res.redirect('/urls');
});


//registration submit handler
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let userID = generateRandomString();
  if (!email || !password) {
    return res.status(400).send('Please enter both an email address and password');
  }
  if (getUserByEmail(email, usersDatabase) !== undefined) {
    return res.status(400).send('Email is already registered. Please login instead');
  }
  bcrypt.genSalt(10)
    .then((salt) => {
      return bcrypt.hash(password, salt);
    })
    .then((hash) => {
      usersDatabase[userID] = {
        'id': userID,
        'email': email,
        'password': hash
      };
      req.session.userID = userID;
      return res.redirect('/urls');
    });

});

//load register page
app.get('/register', (req, res) => {
  const userID = req.session.userID;
  const templateVars = {
    userID: usersDatabase[userID],
    urls: urlDatabase };
  if (userID) {
    return res.redirect('/urls');
  }
  return res.render('urls_register', templateVars);
});

//load index table of our URL database
app.get('/urls', (req, res) => {
  const userID = req.session.userID;
  const templateVars = {
    userID: usersDatabase[userID],
    urls: urlsForUser(userID, urlDatabase)
  };
  if (!userID) {
    return res.status(401).send('Please login first.');
  }
  return res.render('urls_index', templateVars);
});

//creates short URL and adds url entry to database
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = 'http://' + req.body.longURL;
  const userID = req.session.userID;
  urlDatabase[shortURL] = {
    longURL,
    userID,
  };
  return res.redirect('/urls/' + shortURL);
});

//delete entry in our database
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.userID;
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(403).send('URL can only be deleted by the account owner');
  }
  delete urlDatabase[shortURL];
  return res.redirect('/urls');
});

//updates long address of existing shortURL entry
app.post('/urls/:shortURL', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  const userID = req.session.userID;
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(403).send('URL can only be editted by the account owner');
  }
  urlDatabase[shortURL].longURL = 'http://' + longURL;
  return res.redirect('/urls/');
});

//load new page template/ create indiv url page. Needs to be put before GET /urls/:id route
app.get('/urls/new', (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    return res.redirect('/login');
  }
  const templateVars = {
    userID: usersDatabase[userID],
    urls: urlDatabase };
  return res.render('urls_new', templateVars);
});

//loads indiv url page
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const userID = req.session.userID;
  const templateVars = {
    userID: usersDatabase[userID],
    shortURL,
    longURL,
  };
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(403).send('URL can only be viewed by the account owner');
  }
  return res.render('urls_show', templateVars);
});

//when you click on short url, will redirect to long url address
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  request(longURL, (error) => {
    if (error) {
      return res.status(400).send('Requested URL does not exist. Please try a different one.');
    } else {
      return res.redirect(longURL);
    }
  });
});

app.get('/', (req, res) => {
  const userID = req.session.userID;
  if (userID) {
    return res.redirect('/urls');
  } else {
    return res.redirect('login');
  }
});

app.get('/urls.json', (req, res) => {
  return res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  return res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});