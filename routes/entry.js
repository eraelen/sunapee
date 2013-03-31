//#Entry.js
//##Contains routes to views that are associated with entering Tweetee.

//##Global variables
//The user and tweet files in the lib directory is accessed. 'userids' records the
//logged in user and 'online' is a logged in database.
var users = require('../lib/users');
var tweets = require('../lib/tweets');
var userids = 0;
// A logged in "database":
var online = {};
exports.online = online; 


// # User Server-Side Routes

//##Forgot Login
//GET forgotlogin.ejs
exports.forgotlogin = function(req, res){
  res.render('forgotlogin',{message: ""});
};
//Post forgotlogin with respective message, either error or success.
exports.forgotloginProcess = function(req, res){
  var email = req.body.email;
  users.lookupForgotLoginInfo(email, function(message) {
      req.flash('message', message);
      res.render('forgotlogin',{message: req.flash("message")});
  });
};

//##Registration
//GET rsegister.ejs
exports.register = function(req, res){
  res.render('register',{message: req.flash("error")});
};
//POST : Use registration form results to check if information provided is valid
exports.verify = function(req, res){
    var name = req.body.name;
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var retypeP = req.body.retypeP;
    var location = req.body.location;
    var website = req.body.website;
    users.lookupRegistrationParams(name, username, email, password, retypeP, location, website, function(message) {
        if(message){
            req.flash('message', message);
            res.render('register',{message: req.flash("message")});
        }else{
             req.flash(req, res, 'message', 'A code has been sent out to the email provided.'
              +'submit it to confirm the account and complete the registration.');
             res.redirect('/verifyCode');
        }
    });
}
//GET verifyCode.js
exports.verifyCode = function(req, res){
  res.render('verifyCode',{message: req.flash("message")});
};
exports.codeCheck = function(req,res){
    users.lookupCodeCheck(req.body.code, function(message){
        if(message){
            req.flash('message', message);
            res.render('verifyCode',{message:req.flash("message")});
        }else{
            req.flash("msg", "The code is correct! Login to begin.");
            res.render('/', {msg: req.flash("msg")});
        }
  });
}

// ## login
// Provides a user login view.
exports.login = function(req, res){
  // Grab any messages being sent to use from redirect.
  var authmessage = req.flash('userAuth') || '';

  // TDR: redirect if logged in:
  var user  = req.session.user;

  // TDR: If the user is already logged in - we redirect to the
  // main application view. We must check both that the `userid`
  // and the `online[userid]` are undefined. The reason is that
  // the cookie may still be stored on the client even if the
  // server has been restarted.
  if (user !== undefined && online[user.uid] !== undefined) {
    res.redirect('/'+user.username+'/home');
  }
  else {
        // Render the login view if this is a new login.
    res.render('login', { message : authmessage, msg: " " });//For login username and password
  }
};


// ## userAuth
// Performs **basic** user authentication.
exports.userAuth = function(req, res) {
  // TDR: redirect if logged in:
  var user = req.session.user;

  // TDR: do the check as described in the `exports.login` function.
  if (user !== undefined && online[user.uid] !== undefined) {
    res.redirect('/'+online[user.uid].username+'/home');
  }
  else {
    // Pull the values from the form.
    var username = req.body.username;
    var password = req.body.password;
    console.log("username:"+username);
    console.log("password:"+password);
    // Perform the user lookup.
    users.lookup(username, password, function(error, user) {
      if (error) {
        // If there is an error we "flash" a message to the
        // redirected route `/user/login`.
        req.flash('userAuth', error);
        console.log("Flash Error!");
        res.redirect('/');
      }
      else {
        console.log("No error!");
        req.session.user = user;
        // Store the user in our in memory database.
        online[user.uid] = user;
        // Redirect to main.
        console.log("userlogged in:"+user.username);
        res.redirect('/'+user.username+'/home');
      }
    });
  }
};

// ## logout
// Deletes user info & session - then redirects to login.
exports.logout = function(req, res) {
  var user = req.session.user;
  if (user === undefined || online[user.uid] === undefined) {
    req.flash('userAuth', 'Not logged in!');
    res.redirect('/');
    return;
  }

  if (online[user.uid] !== undefined) {
    delete online[user.uid];
  }

  delete req.session.user;
  res.redirect('/');
};