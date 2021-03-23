
const getUserByEmail = (email, database) => {
  for (let userID in database) {
    if (database[userID].email === email) {
      return database[userID];
  } 
} 
return false;
};

//This function taken from: https://dev.to/oyetoket/fastest-way-to-generate-random-strings-in-javascript-2k5a
const generateRandomString = function(){
  return Math.random().toString(20).substr(2, 6)
  };

const urlsForUser = (userID, database) => {
  const urlDatabaseByUser = {};
  for (let shortURL in database) {
    if (database[shortURL].userID == userID) {
      urlDatabaseByUser[shortURL] = database[shortURL]
    }
  }
  return urlDatabaseByUser;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser }