
const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser')
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const usersDatabase = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

//This function taken from: https://dev.to/oyetoket/fastest-way-to-generate-random-strings-in-javascript-2k5a
const generateRandomString = function(length=6){
  return Math.random().toString(20).substr(2, length)
  };

const findUserByEmail = (email) => {
  for (let user in usersDatabase) {
    if (usersDatabase[user].email === email) {
      return usersDatabase[user];
  } 
} return false;
};
//load login page
app.get('/login', (req, res) => {
  const templateVars = { 
    user: usersDatabase[req.cookies.userID],
  }
  res.render('urls_login', templateVars);
})

//creates cookie when logging in
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userInfo = findUserByEmail(email)
  // console.log('req.body.email', req.body.email)
  // console.log('func', findUserByEmail(email))
  // console.log('info', userInfo)
  if (!userInfo) {
    res.status(403).send('Email is not registered. Please register first.')
  }
  if (userInfo.password !== password) {
    res.status(403).send('Password is incorrect. Please try again')
  }  
  res.cookie('userID', userInfo.id);
  res.redirect('/urls');
})

//load register page
app.get('/register', (req, res) => {
  const templateVars = { 
    user: usersDatabase[req.cookies.userID],
    urls: urlDatabase };
  res.render('urls_register', templateVars);
})

//registration submit handler
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send('Please enter both an email address and password')
  }
  if(findUserByEmail(email) !== false) {
    res.status(400).send('Email is already registered. Please login instead.')
  }
  let userID = generateRandomString();
  usersDatabase[userID] = {
    'id': userID, 
    'email': req.body.email, 
    'password': req.body.password
  };
  // console.log('body', req.body);
  console.log('users', usersDatabase);
  res.cookie('userID', userID);
  // console.log('reqcookies', req.cookies)
  res.redirect('/urls');
})

////load index and table of our database
app.get('/urls', (req, res) => {
  const templateVars = { 
    user: usersDatabase[req.cookies.userID],
    urls: urlDatabase };
  res.render('urls_index', templateVars);
})

//creates short URL and adds url submission to database
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = 'http://www.' + req.body.longURL;
  res.redirect('/urls/' + shortURL);
});


//logs user out and clears cookie
app.post('/logout', (req, res) => {
  res.clearCookie('userID');
  res.redirect('/urls');
})

//delete entry in our database
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls')
})

//URL form post sent here, info added to database and will redirect to /urls/shortURL
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = 'http://www.' + req.body.longURL;
  res.redirect('/urls/' + shortURL);
});
//load new page template/ create indiv url page. needs to be before GET /urls/:id route
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: usersDatabase[req.cookies.userID],
    urls: urlDatabase }
  res.render("urls_new", templateVars);
});
//updates long address of previous entry/shortURL
app.post('/urls/:shortURL', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = 'http://www.' + longURL
   res.redirect('/urls/');
})

//loads indiv url page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    'user': usersDatabase[req.cookies.userID],
    'shortURL': req.params.shortURL,
    'longURL': urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

//when you click on short url, will redirect to long url address
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
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