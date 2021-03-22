
const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser')
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": { 
    longURL: "http://www.lighthouselabs.ca", 
    userID: "aJ48lW" },
  "9sm5xK": { 
    longURL: "http://www.google.com", 
    userID: "aJ48lW" }
};

const usersDatabase = { 
  "aJ48lW": {
    id: "aJ48lW", 
    email: "user@example.com", 
    password: "purple"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

//This function taken from: https://dev.to/oyetoket/fastest-way-to-generate-random-strings-in-javascript-2k5a
const generateRandomString = function(){
  return Math.random().toString(20).substr(2, 6)
  };

const findUserByEmail = (email) => {
  for (let userID in usersDatabase) {
    if (usersDatabase[userID].email === email) {
      return usersDatabase[userID];
  } 
} 
return false;
};


const urlsForUser = (userID) => {
  const urlDatabaseByUser = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID == userID) {
      urlDatabaseByUser[shortURL] = urlDatabase[shortURL]
    }
  }
  return urlDatabaseByUser;
};

//load login page
app.get('/login', (req, res) => {
  const templateVars = { 
    userID: usersDatabase[req.cookies.userID],
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
    userID: usersDatabase[req.cookies.userID],
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
    userID: usersDatabase[req.cookies.userID],
    urls: urlsForUser(req.cookies.userID)
}
  if (!req.cookies.userID) {
    res.status(401).send('Please login first.')
  }
  res.render('urls_index', templateVars);
})


//creates short URL and adds url submission to database
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  longURL = 'http://www.' + req.body.longURL;
  urlDatabase[shortURL] = {longURL: longURL, userID: req.cookies.userID }
  console.log('urlDatabase', urlDatabase)
  console.log('usersdatabase', usersDatabase)
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
  if (req.cookies.userID !== urlDatabase[shortURL].userID) {
    res.status(403).send('URL can only be deleted by the account owner')
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls')
})

//updates long address of previous entry/shortURL
app.post('/urls/:shortURL', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  if (req.cookies.userID !== urlDatabase[shortURL].userID) {
    res.status(403).send('URL can only be editted by the account owner')
  }
  urlDatabase[shortURL].longURL = 'http://www.' + longURL
   res.redirect('/urls/');
})

// //submit handler for create new URL form, info added to database and will redirect to /urls/shortURL
// app.post('/urls', (req, res) => {
//   const shortURL = generateRandomString();
//   urlDatabase[shortURL] = 'http://www.' + req.body.longURL;
//   res.redirect('/urls/' + shortURL);
// });

//load new page template/ create indiv url page. needs to be before GET /urls/:id route
app.get("/urls/new", (req, res) => {
  if (!req.cookies.userID) {
    res.redirect('/login');
  }
  const templateVars = {
    userID: usersDatabase[req.cookies.userID],
    urls: urlDatabase }
  res.render("urls_new", templateVars);
});


//loads indiv url page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = {
    'userID': usersDatabase[req.cookies.userID],
    'shortURL': req.params.shortURL,
    'longURL': urlDatabase[req.params.shortURL].longURL
  }
  if (req.cookies.userID !== urlDatabase[shortURL].userID) {
    res.status(403).send('URL can only be viewed by the account owner')
  }
  res.render("urls_show", templateVars);
});


//when you click on short url, will redirect to long url address
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
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