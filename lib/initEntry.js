var sqlite3 = require('sqlite3');
var async = require('async');

// Connect to the database:
var db = new sqlite3.Database('./data/userinfo.db');

// ## Functions

// ### *function*:getDBlen
/**
 *  Gets the length of the db.
 */

 exports.getDBlen = function(tableName, cb){
 	db.get("'SELECT count(*) FROM "+tableName+"'", function(err, u){
		//
		console.log(u);
		cb(u);
	});
 };

function createUser(username, name, password, email, location, website, cb){
    var profilepic = "/images/defaultProfilePic.jpg";
    var profvis = "Public";
    var mentionperm = "Public";
    var pmperm = "Public";
    var background = "";
    db.run('insert into users values (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [username, name, password, email, location, website,profilepic, profvis, mentionperm, pmperm, background],
      cb);
}

function createVerUser(username, name, password, email, location, website, randVarCode, cb){
	console.log("in createVerUser");
    db.run('insert into verifyUsers values (NULL, ?, ?, ?, ?, ?, ?, ?)',
      [username, name, password, email, location, website, randVarCode],
      cb);
}

// ### *function*:lookup
/**
 * A function to confirm the username and password for the
 * user account. A callback function is used in the third 
 * parameter where an error message is sent if any feild is 
 * empty, the password entered is not correct, or the username
 * is not found.
 *
 * @param {string} username
 * @param {string} password
 * @param {function} cb
 */
exports.lookup = function(username, password, cb){
	if ((username == '' || password == '')){
       cb('Enter both the username and password.');
    }else{
	   db.all('select * from users where username=?', [username], function(err, u){
	   	if(err){
	   		cb(err);
	   	}else{
            console.log("error"+err); 
	        userobj = u[0];
	        if(userobj == undefined){
              cb('User not found');
		    }else{
		      if(userobj.password == password){
		   	     cb(undefined, userobj);
		      }else{
                 cb("Password is not correct.");
              }
		    }
	   	}
	   });
    }
};

function getUser(username, table, cb){
	db.all('select * from ' +table+' where username=?', [username], function(err, u){ 
		userobj = u[0]; cb(userobj);
	});
};
exports.getUser = getUser

// ### *function*:lookupForgotLoginInfo
/**
 * A function used to check whether or not anything was entered
 * and if the email exists in the database. If a matching email 
 * is found, an email is sent out to the username with the login 
 * information. A callback function is used in the second 
 * parameter where the success or failure message is sent. 
 *
 * Note: Potentially changing this funtion so that the sent email contains 
 *      a reset password page specific for the user. The user
 *      will be able to change the password at the link provided.
 *      (The link will only be usable one time.)
 * @param {string} email
 * @param {function} cb
 */
exports.lookupForgotLoginInfo = function(email, cb){
   if(email.length > 0){	
     db.all('select * from users where email=?', [email], function(err, u){
     	if(err){
     		cb(err);
     	}else{
  
            if(u.length == 0){
               cb("The email is not associated with any Tweetee account.");
   	        }else{
		       userobj = u[0];
		       emailLoginInfo(userobj.name, userobj.username, userobj.email, userobj.password);
               cb("An email has been sent out with the information.");
            }
     	}
     });
   }else{
   	  cb("Please enter an email.");
   }
};
// ### *function*:lookupRegistrationParams
/**
 * A function used to check if the parameters entered from the registration form 
 * meets certain requirements to create a new user. If requirements are met, then the
 * user object is created, and pushed in the codeUserList, which stores all of the users
 * pending for verification. A verification code is generated and sent to the email provided. 
 * An error message is sent if different checks are not met, and undefined is sent if 
 * there are no problems with the information. 
 *  
 * ####Current Register Requirements - 
 *   1. The fields of: Name, Username, E-mail, Password, Retype P are filled (astarisk indicated)
 *   2. The username is not already taken and no spaces
 *   3. The email is valid (with @ symbol)
 *   4. The password is a minimum of 6 characters and the retype matches
 *      People can reference any location and website.
 *
 * If requirements are not fulfiled then the respective error message is displayed 
 *
 * Note: Increase the number of checks, such as the confirming if an email exists, 
 *       require different characters for the password, etc. 
 *       Have a timelimit from when the registration code is sent to account verification. 
 *
 * @param {string} name
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @param {string} retypeP 
 * @param {string} location
 * @param {string} website
 * @param {function} cb
 */
 exports.lookupRegistrationParams = function(name, username, email, password, retypeP, location, website, cb){
 	console.log("here");
 	db.all('select * from users where username=?', [username], function(err, u){ 
		callback = u[0];
    	var b = false;
      	if(callback != undefined){
      		console.log("callback"+callback);
    		b=true;
    		console.log("other userin db");
    	}
    	if (containsChar(username, ' ')){
    		b=true;
    		console.log("space found");
    	}
    	db.all('select * from verifyUsers where username=?', [username], function(err, callb){ 
		     callb = callb[0];
            if(callb!==undefined){
            	console.log("otherusername found");
                b=true;
            }
            console.log("b=!!!"+b);
            if(b){
                cb("The username entered is already taken or invalid");
            }else{
            	 console.log("here!!!");
      	         if(name.length == 0 || username.length == 0 || email.length == 0 || password.length == 0){
                    cb("Please make sure that all of the required fields are filled");
                 }else if(checkEmail(email)){
                    cb("The email is invalid. Please try again.");
                 }else if(checkPassword(password, retypeP)){
                    cb("The passwords must match and be at least 6 characters long.");
                 }else{
                    var randVarCode = makeCode();
                    console.log("ranCOde"+randVarCode)
                    var profilepic = "/images/defaultProfilePic.jpg";
                    var profvis = "Public";
                    var mentionperm = "Public";
                    var pmperm = "Public";
                    var background = "";
                    createVerUser(username, name, password, email, location, website, randVarCode, function(done){
   console.log(done);});
                       cb(undefined);
                 }
            }        
    	});
    });
};

// ### *function*:lookupCodeCheck
/**
 * A function used to check if the verification code entered matches
 * one stored in the pending verification users list. If there is 
 * a match, undefined is sent back in the callback funtion. If the code 
 * does match, then the user is deleted from the codeUserList and put in 
 * the user database. 
 * Note: There may be a way to make the verification process more secure.
 * 
 * @param {string} code
 * @param {function} cb
 */
 exports.lookupCodeCheck= function(code,cb){
 	db.all('select * from verifyUsers where randVarCode=?', [code], function(err, u){
        var user = u[0];
        if(user ==undefined){
            cb("The code is incorrect! Try Again.");
        }else{
        	createUser(user.username, user.name, user.password, user.email, user.location, user.website, function(err,done){});
        	db.run('delete from verifyUsers where username=?',[user.username],cb);
        	var mkdirp = require('mkdirp');
	        mkdirp('public/images/users/'+user.username, function (err) {
		      if (err) console.error(err)
		      else console.log('folder created')
	        });
            cb(undefined);
        }
    });
 }


// ### *function*:checkEmail
/**
 * A function used to check if the email is valid for registration.
 * It checks if there is a @ character. A boolean value is returned.
 * Note: Check to see if the email is already contained in the database to 
 *       allow users to have only one account per username for the login information
 *       retreival. Or the format of the data retrieval will need to be 
 *       changed. 
 *       Organize the code for logical boolean values
 * 
 * @param {string} email
 * @returns {boolean} b
 */
function checkEmail(email){
    var b = containsChar(email, '@')
    return !b;
}

// ### *function*:checkPassword
/**
 * A function used to check if the password is valid for registration.
 * It checks if the password and reentered password match and check if 
 * the length is 6 characters. A boolean value is returned.
 * 
 * @param {string} email
 * @returns {boolean} b
 */
function checkPassword(password,retypeP){
    var b = false
    if(password != retypeP || password.length < 6){ b=true };
    return b;
}
// ### *function*:containsChar
/**
 *  A function that checks if a string contains a character
 *  returns a boolean value.
 * @param {string} char
 * @returns {boolean} b
 */
function containsChar(string, char){
   var b = false;
   for(var i=0; i<string.length; i++){
      var l = string.charAt(i);
      if(l == char){
         b = true;
      }
    }
    return b
}
// ### *function*:makeCode
/**
 *  Creates a random 10 char code for verification.
 *  Returns the code as a string.
 * @param {string} char
 * @returns {string} makeCode 
 */
function makeCode(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
};
exports.makeCode = makeCode;

// ### *function*:emailCode
/**
 *  Sends tweetee verification email for registration with Alpha Mail (node_modules -> alphamail)
 * @param {string} name
 * @param {string} username
 * @param {string} password
 * @param {string} email 
 * @param {string} code
 */
function emailCode(name, username, password, email, code){
    var alphamail = require('alphamail');
    var emailService = new alphamail.EmailService("513cedbd564467-24442067");
    var message = {
       "name": name,
       "username": username,
       "code": code,
       "url": "http:\/\/localhost:3000/verifyCode\/"
    };
    var payload = new alphamail.EmailMessagePayload()
       .setProjectId(1452) // ID of "Tweetee Registration Code" project
       .setSender(new alphamail.EmailContact("noreply@tweetee.com", "no-reply@tweetee.com"))
       .setReceiver(new alphamail.EmailContact(email, email))
       .setBodyObject(message);

    emailService.queue(payload, function(error, result){
       if(error){
           console.log("Error! " + result + " (" + error + ")");
       }else{
           console.log("Mail successfully sent! ID = " + result);
       }
    });
};
// ### *function*: emailLoginInfo
/**
 *  Sends tweetee login information with Alpha Mail (node_modules -> alphamail)
 *
 * @param {string} name
 * @param {string} username
 * @param {string} password
 * @param {string} email 
 * @param {string} code
 */function emailLoginInfo(name, username, email, password){
    var alphamail = require('alphamail');
    var emailService = new alphamail.EmailService("513cedbd564467-24442067");
    var message = {
        "name": name,
        "username": username,
        "password": password,
        "url": "http:\/\/localhost:3000\/"
    };
    var payload = new alphamail.EmailMessagePayload()
        .setProjectId(1456) // ID of "Tweetee Login Assistance" project
        .setSender(new alphamail.EmailContact("noreply-tweetee@gmail.com", "noreply-tweetee@gmail.com"))
        .setReceiver(new alphamail.EmailContact(email, email))
        .setBodyObject(message);
    emailService.queue(payload, function(error, result){
        if(error){
            console.log("Error! " + result + " (" + error + ")");
        }else{
            console.log("Mail successfully sent! ID = " + result);
        }
    });
};
