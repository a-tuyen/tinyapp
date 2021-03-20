
const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser')
app.use(cookieParser());
app.set("view engine", "ejs");

//This function taken from: https://dev.to/oyetoket/fastest-way-to-generate-random-strings-in-javascript-2k5a
const generateRandomString = function(length=6){
  return Math.random().toString(20).substr(2, length)
  };
  
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

////load index and table of our database
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
  
})
//creates cookie when logging in
app.post('/login', (req, res) => {
  const username = req.body.username;
  console.log('user', username)
  res.cookie('user', username)
  res.redirect('/urls');
})
//delete entry in our database
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls')
})
//form post sent here, info added to database and will redirect to /urls/shortURL
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = 'http://www.' + req.body.longURL;
  res.redirect('/urls/' + shortURL);
});
//load new page template/ create indiv url page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
//updates long address of previous entry/shortURL
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL]
   req.params.shortURL = req.body.shortURL;
   urlDatabase[shortURL] = 'http://www.' + req.body.longURL;
   res.redirect('/urls/' + shortURL);
})

//loads indiv url page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]};
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