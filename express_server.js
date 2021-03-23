
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const request = require('request');
const bcrypt = require('bcrypt');
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'userID',
  keys: ['mini', 'giant'],
}));
app.set("view engine", "ejs");

const urlDatabase = {};

const usersDatabase = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("purple", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

//load login page
app.get('/login', (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
  }
  const templateVars = {
    userID: usersDatabase[req.session.userID],
  };
  res.render('urls_login', templateVars);
});

//creates cookie when logging in
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userInfoID = getUserByEmail(email, usersDatabase);
  if (!userInfoID) {
    res.status(403).send('Email is not registered. Please register first.');
  }
  const pwValidation = bcrypt.compareSync(password, usersDatabase[userInfoID].password);
  if (!pwValidation) {
    res.status(403).send('Password is incorrect. Please try again');
  } else {
    req.session.userID = userInfoID;
    res.redirect('/urls');
  }
});

//logs user out and clears cookie
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//load register page
app.get('/register', (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
  }
  const templateVars = {
    userID: usersDatabase[req.session.userID],
    urls: urlDatabase };
  res.render('urls_register', templateVars);
});

//registration submit handler
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let userID = generateRandomString();
  if (!email || !password) {
    res.status(400).send('Please enter both an email address and password');
  }
  if (getUserByEmail(email, usersDatabase) !== undefined) {
    res.status(400).send('Email is already registered. Please login instead.');
  }
  bcrypt.genSalt(10)
    .then((salt) => {
      return bcrypt.hash(password, salt);
    })
    .then((hash) => {
      usersDatabase[userID] = {
        'id': userID,
        'email': req.body.email,
        'password': hash
      };
    });
  req.session.userID = userID;
  res.redirect('/urls');
});

////load index table of our URL database
app.get('/urls', (req, res) => {
  const templateVars = {
    userID: usersDatabase[req.session.userID],
    urls: urlsForUser(req.session.userID, urlDatabase)
  };
  if (!req.session.userID) {
    res.status(401).send('Please login first.');
  }
  res.render('urls_index', templateVars);
});

//creates short URL and adds url entry to database
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = 'http://www.' + req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.session.userID
  };
  res.redirect('/urls/' + shortURL);
});

//delete entry in our database
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.userID !== urlDatabase[shortURL].userID) {
    res.status(403).send('URL can only be deleted by the account owner');
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

//updates long address of existing shortURL entry
app.post('/urls/:shortURL', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  if (req.session.userID !== urlDatabase[shortURL].userID) {
    res.status(403).send('URL can only be editted by the account owner');
  }
  urlDatabase[shortURL].longURL = 'http://www.' + longURL;
  res.redirect('/urls/');
});

//load new page template/ create indiv url page. Needs to be put before GET /urls/:id route
app.get("/urls/new", (req, res) => {
  if (!req.session.userID) {
    res.redirect('/login');
  }
  const templateVars = {
    userID: usersDatabase[req.session.userID],
    urls: urlDatabase };
  res.render("urls_new", templateVars);
});

//loads indiv url page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    'userID': usersDatabase[req.session.userID],
    'shortURL': req.params.shortURL,
    'longURL': urlDatabase[req.params.shortURL].longURL
  };
  if (req.session.userID !== urlDatabase[shortURL].userID) {
    res.status(403).send('URL can only be viewed by the account owner');
  }
  res.render("urls_show", templateVars);
});

//when you click on short url, will redirect to long url address
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  request(longURL, (error) => {
    if (error) {
      res.status(400).send('Requested URL does not exist. Please try a different one.');
    } else {
      res.redirect(longURL);
    }
  });
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});