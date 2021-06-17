# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

Super simple to use and convenient, TinyApp creates a personalized database of shortened URLs of your choice. Quickly edit, add or delete URL entries on the fly! Register today and keep your URLs within clicking distance. 

## Final Product

!["screenshot of main page"](https://github.com/a-tuyen/tinyapp/blob/master/docs/Main-URLs-Page.png?raw=true)
!["screenshot of Individual URL page"](https://github.com/a-tuyen/tinyapp/blob/master/docs/Individual-URLs-Page.png?raw=true)
!["screenshot of create URL page"](https://github.com/a-tuyen/tinyapp/blob/master/docs/Create-URL-Page.png?raw=true)
!["screenshot of Registration page"](https://github.com/a-tuyen/tinyapp/blob/master/docs/Create-Account-Page.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- nodemon
- mocha
- chai

## Getting Started

- Install all dependencies (using the `npm install` command).
- Open the package.json file and edit the scripts section to look like this:
"scripts": {
  "start": "./node_modules/.bin/nodemon -L express_server.js",
  "test": "echo \"Error: no test specified\" && exit 1"
}
- You can now start the server by running `npm start` and nodemon will restart the server anytime it detects a change in the source code.
- Navigate to http://localhost:8080 to view TinyApp!

