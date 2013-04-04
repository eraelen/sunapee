// # Route Handler: Entry.js
// ## Contains routes to views that are associated with entering Tweetee.

// ## Global variables
//The user and tweet files in the lib directory is accessed. 
//Variable 'online' is a logged in database.
var users = require('../lib/users');
var tweets = require('../lib/tweets');
var online = {};
exports.online = online; 


// # User Server-Side Route-Handler

// ## Forgot Login
//GET forgotlogin.ejs
exports.forgotlogin = function(req, res){
  res.render('forgotlogin',{message: ""});
};
//Post forgotlogin.ejs with respective message, either error or success.
exports.forgotloginProcess = function(req, res){
  var email = req.body.email;
  users.lookupForgotLoginInfo(email, function(message) {
      req.flash('message', message);
      res.render('forgotlogin',{message: req.flash("message")});
  });
};

// ## Registration
//GET rsegister.ejs
exports.register = function(req, res){
  res.render('register',{message: req.flash("error")});
};
//POST to registration.ejs a message indicating if the registration information provided is valid
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
//Post to login.ejs or verifyCode.ejs based on the code submitted
exports.codeCheck = function(req,res){
    users.lookupCodeCheck(req.body.code, function(message){
        if(message){
            req.flash('message', message);
            res.render('verifyCode',{message:req.flash("message")});
        }else{
            req.flash("msg", "The code is correct! Login to begin.");
            res.render('login', {message: "",msg:req.flash("msg")});
        }
  });
}

// ## login, userAuth, Logout
//GET login.ejs. Based on sessions example from lecture 18 examples by 
//Timothy Richards. 
// There is a check to see if the user is already logged in. If they are, the user's
// home page is loaded. If there is no currently logged-in user, then the login page 
// is rendered with an message field to display error messages from userAuth.
exports.login = function(req, res){
  var authmessage = req.flash('userAuth') || '';
  var user  = req.session.user;
  if (user !== undefined && online[user.uid] !== undefined) {
    res.redirect('/'+user.username+'/home');
  }
  else {
    res.render('login', { message : authmessage, msg: " " });
  }
};


// POST, Performs **basic** user authentication. Based on sessions example 
//from lecture 18 examples by Timothy Richards. 
//Redirects if logged-in. If not then the username and password is 
//checked. 
exports.userAuth = function(req, res) {
  var user = req.session.user;
  if (user !== undefined && online[user.uid] !== undefined) {
    res.redirect('/'+online[user.uid].username+'/home');
  }
  else {
    var username = req.body.username;
    var password = req.body.password;
    users.lookup(username, password, function(error, user) {
      if (error) {
        req.flash('userAuth', error);
        res.redirect('/');
      }
      else {
        req.session.user = user;
        online[user.uid] = user;
        res.redirect('/'+user.username+'/home');
      }
    });
  }
};

// Get login.ejs again. Deletes user info & session - then redirects to login.
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