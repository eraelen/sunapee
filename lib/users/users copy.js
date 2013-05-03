// # Users Module
// This is a module for accessing user data and functions.

// ## In Memory User Database
// Note: Create a real user database later-on. The number of users in test data is stored for userid continuation.
var userdb = [
{name: 'Tim Berners-Lee' ,username: 'tim', password: 'mit', uid: 1, email: "aqua_manga@yahoo.com", location: "Massachusetts", website: "amazon.com", profilePic: "/images/defaultProfilePic.jpg", follower: ["caleb","hazel"], following: ["caleb"], tweets: [0,4], profVis: "Public", mentionPerm: "Public", pmPerm: "Public", background:""},
{name: 'Hazel Rozetta', username: 'hazel', password: 'lezah', uid: 2, email: "ysasaki@smith.edu", location: "United States", website: "petco.com", profilePic: "/images/defaultProfilePic.jpg", follower: ["caleb"], following: ["tim", "caleb"], tweets: [1,5], profVis: "Public", mentionPerm: "Public", pmPerm: "Public", background: ""},
{name: 'Caleb Marks', username: 'caleb', password: 'belac', uid: 3, email: "ysasaki2014@gmail.com", location: "Asia", website: "ebay.com", profilePic: "/images/defaultProfilePic.jpg", follower: ["hazel","tim"], following: ["hazel","tim"], tweets: [2,3], profVis: "Public", mentionPerm: "Public", pmPerm: "Public", background: ""},
{name: 'Eeyore', username: 'cheerfuldonkey', password: 'eeyore', uid: 4, email: "mynameiseeyore@hundredacrewood.com", location: "Hundred Acre Wood", website: "", profilePic: "/images/users/cheerfuldonkey/eeyore_profilepic.jpg", follower: [], following: [1], tweets: [6,7,9,11], profVis: "Public", mentionPerm: "Public", pmPerm: "Public", background: ""},
{name: 'Winnie', username: 'thepooh', password: 'winnie', uid: 5, email: "mynameiswinnie@hundredacrewood.com", location: "Hundred Acre Wood", website: "", profilePic: "/images/users/thepooh/pooh_profilepic.jpg", follower: [], following: [], tweets: [8,10], profVis: "Public", mentionPerm: "Public", pmPerm: "Public", background: ""}
];

var usersInTestData = userdb.length; 
exports.userdb = userdb;

//List of usernames that are pending verification codes for registration
var codeUserList = [];

var tweets = require('../tweets');

// ## Functions

// ### *function*:delFromCodeList
/**
 *  Deletes a user from the CodeUserList
 *  after verification of the account.
 * @param {string} username
 */
function delFromCodeList(username){
    for(var i = 0; i < codeUserList.length; i++){
        if(codeUserList[i] === username){
            delete codeUserList[i];
            codeUserList.splice(i,1);
            break;
        }
    }
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
exports.lookup = function(username, password, cb) {
  var len = userdb.length;
  if ((username == '' || password == '')){
       cb('Enter both the username and password.');
  }else{
     for (var i = 0; i < len; i++) {
       var u = userdb[i];
       if (u.username === username) {
         if (u.password === password) {
            cb(undefined, u);
         }
         else {
            cb('Password is not correct.');
         }
         return;
       }
     }
     cb('User not found');
  }
};
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
     for(var i = 0; i < userdb.length; i++){
        if(userdb[i].email === email){
           var name = userdb[i].username;
           var username = userdb[i].username;
           var password = userdb[i].password;
           emailLoginInfo(name, username, email, password);
           cb("An email has been sent out with the information.");
          break;
        }else if(i == userdb.length-1 && userdb[i].email != email){
           cb("The email is not associated with any Tweetee account.");
        }
    }
   }else{
     cb("Please make sure that all of the required  are filled");
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
    if(name.length == 0 || username.length == 0 || email.length == 0 || password.length == 0){
        cb("Please make sure that all of the required fields are filled");
    }else if(checkUsername(username)){
        cb("The username is currently taken. Please chose another and try again.");
    }else if(checkEmail(email)){
        cb("The email is invalid. Please try again.");
    }else if(checkPassword(password, retypeP)){
        cb("The passwords must match and be at least 6 characters long.");
    }else{
        cb(undefined);
        var randVarCode = makeCode();
        var newUid = userdb.length+1;
        console.log("newUID"+newUid);
        usersInTestData = newUid;
        var userVerObj = {
               name: name, 
               username: username,
               password: password, 
               uid: newUid,
               email:email, 
               code:randVarCode, 
               location:location, 
               website:website,
               profilePic: "/images/defaultProfilePic.jpg", 
               follower: [], 
               following: [], 
               tweets: [],
               profVis: "Public",
               folPerm: "Public",
               mentionPerm: "Public",
               pmPerm: "Public",
               background:""
        }; 
        codeUserList.push(userVerObj);
        emailCode(name, username, password, email, randVarCode);
        codeUserList.push(username);
    }
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
exports.lookupCodeCheck = function(code, cb){
    var b = false;
    var userToVerify;
    for(var i=0;i<codeUserList.length;i++){
        if(codeUserList[i].code == code){
          b = true;
          userToVerify = codeUserList[i];
          break;
        }
    }
    if(!b){
      cb("The code is incorrect! Try Again.");
    }else{
      //Create the new user
      delFromCodeList(userToVerify);
      userdb.push(userToVerify);
	  var mkdirp = require('mkdirp');
	  mkdirp('public/images/users/'+userToVerify.username, function (err) {
		if (err) console.error(err)
		else console.log('folder created')
	  });
      cb(undefined);
    }
};

// ### *function*:checkUsername
/**
 * A function used to check if the username is valid for registration.
 * If there is a username that is already in the database, contains a space
 * or if the username is in the pending verification list. 
 *
 * Note: Set limit to username length so 'a' or '3' won't be available
 *       Organize the code for logical boolean values
 * 
 * @param {string} username
 * @returns {boolean} b  
 */
function checkUsername(username){
    var b = false;
    for (var i=0;i<userdb.length;i++){
        if(userdb[i].username==username || containsChar(username,' ')){
            b = true;
            break;
        }
    }
    for (var j=0;j<userdb.length;j++){
        if(codeUserList[j]==username){
            b = true;
            break;
        }
    }
    return b
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
       .setSender(new alphamail.EmailContact("noreply-tweetee@gmail.com", "no-reply-tweetee@gmail.com"))
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

// ### *function*:get_user
/**A function that gets the user by username.
 * 
 * @param {string} username
 * @returns {object} user object
 */
function get_user(user) {
    var u = undefined;
    for (var i = 0; i < userdb.length; i++) {
        if (userdb[i].username === user) {
            u = userdb[i];
            break;
        }
    }
    return u;
}
exports.get_user = get_user;

// ### *function*: getUserById
/*
* Gets the user object by username.
* @param {string} username
* @return {object} user object
*/
function getUserById(username) {
    var len = userdb.length;
    for (var i=0; i < len; i++) {
        if (userdb[i].username === username) {
            break;
        }
    }
    return userdb[i];
}
exports.getUserById = getUserById;

// ### *function*: getTNumberById
/*
* Gets the user's tweets number.
* @param {string} username
* @return {string} user's tweet number
*/
function getTNumberById(username) {
    return getUserById(username).tweets.length;
}
exports.getTNumberById = getTNumberById;

// ### *function*: addUserT
/*
* Adds a new tweetID to user's tweetID field.
* @param {string} username
*/
function addUserT(username, id) {
  getUserById(username).tweets.push(id);
}
exports.addUserT = addUserT;

function delUserT(username, id) {
	var t = getUserById(username).tweets;
	var idx = t.indexOf(id);
	t.splice(idx,1);
}
exports.delUserT = delUserT;

// ### *function*: unfollow
/*
* Deletes a user in the following list of the logged-in user.
* @param {string} username of logged in user
* @param {string} username of the user that is to be removed from the following list
*/
function unfollow(loggedinuser, username) {
	//removes user from following list of logged-in user
	var fl = getUserById(loggedinuser).following;
	fl.splice(fl.indexOf(username), 1);
	
	//remove logged in user from follower list of user
	var followerList = getUserById(username).follower;
	followerList.splice(followerList.indexOf(loggedinuser), 1);
}
exports.unfollow = unfollow;

// ### *function*: follow
/*
* Addes a user to the following list of the logged-in user.
* @param {string} username
* @param {string} username of the user that is to be added from the following list
*/
exports.follow = function (username, adduname) {
  getUserById(username).following.push(adduname);
  getUserById(adduname).follower.push(username);
}

// ### *function*: ifFollowing
/*
* Check if you're following another user
* @param {object} logged in user
* @param {object} user that we're checking
*/
exports.isFollowing = function (self, u) {
  if (self.following.indexOf(u.username) === -1) {
    return false;
  } else {
    return true;
  }
}

// ### *function*: getFollowingNum
/*
* Get number of users following
* @param {string} username
*/
function getFollowingNum (username) {
	return getUserById(username).following.length;
}
exports.getFollowingNum = getFollowingNum;

// ### *function*: getFollowerNum
/*
* Get number of followers
* @param {string} username
*/
function getFollowerNum (username) {
  return getUserById(username).follower.length;
}
exports.getFollowerNum = getFollowerNum;

// ### *function*: changeUserSettings
/*
*  Changes user settings or permission for viewing user's profile, mentioning user in tweets and sending user private messages.
*  @param {string} username of logged in user
*  @param {string} profile visibility permission
*  @param {string} mentioning of user permission
*  @param {string} sending user private messages permission
*/
function changeUserSettings (username, nprofvis, nmentionperm, npmperm) {
	var user = getUserById(username);
	if (nprofvis !== undefined) {
		userdb[user.uid-1].profVis = nprofvis;
	}
	if (nmentionperm !== undefined) {
		userdb[user.uid-1].mentionPerm = nmentionperm;
	}
	if (npmperm !== undefined) {
		userdb[user.uid-1].pmPerm = npmperm;
	}
}
exports.changeUserSettings = changeUserSettings;

// ### *function*: checkProfilePermission
/*
*  Checks and sets profile permission.
*  If "Public", any user can view profile.
*  If "Followers Only", only followers of this user can view this profile.
*  If "Only Me", only profile owner can view profile.
*  @param {object} logged in user
*  @param {object} profile owner
*  @return {boolean} whether logged in user has permission to view profile
*/
function checkProfilePermission(loggedin, profileowner) {
	var profperm = userdb[profileowner.uid-1].profVis;
	if (profperm === "Followers Only") {
		var followerList = userdb[profileowner.uid-1].follower;
		if (followerList.indexOf(loggedin.username) !== -1) {
			return true;
		} else {
			return false;
		}
	} else if (profperm === "Only Me") {
		if (loggedin.username === profileowner.username) {
			return true;
		} else {
			return false;
		}
	} else {
		return true;
	}	
}
exports.checkProfilePermission = checkProfilePermission;

// ### *function*: searchPeople
/*
*  Searches database for users having names and/or usernames matching query string.
*  @param {string} query 
*  @return {object} list of users matching (partial or complete) query or null if none found
*/
function searchPeople (query) {
	var userList = [];
	var reQuery = new RegExp(query, "gi");
	
	for (var i=0; i<userdb.length; i++) {
		if ((userdb[i].name.match(reQuery) !== null) || (userdb[i].username.match(reQuery) !== null)) {
			userList.push(userdb[i]);
		}
	}
	
	if (userList.length != 0) {
		return userList;
	} else {
		return null;
	}
}
exports.searchPeople = searchPeople;

function changeUserProfile(username, nname, nusername, nemail, nlocation, nwebsite, nnewpass, nconfirmnewpass, ncurrentpass, req, user) {
	var user = getUserById(username);
	console.log("user in changeUserProfile is: " + user.username);
	//check if current password is correct
	console.log("ncurrentpass: " + ncurrentpass + " userdbpassword: " + userdb[user.uid-1].password);
	if (ncurrentpass === userdb[user.uid-1].password) {
		//check if user changed new password
		if (nnewpass !== '') {
			if ((nnewpass === nconfirmnewpass) && (nnewpass.length > 6)) {
				userdb[user.uid-1].password = nnewpass;
			} else {
				return {b: false, user: user, error: 'Changes not saved. New password must be at least 6 characters long. New password must match.'};
			}
		}
		//check if user changed name, username and email - cannot be empty
		if (nname !== '') { 
			userdb[user.uid-1].name = nname; 
			var tl = tweets.getAllTweetsByUser(username);
			for (var i=0; i<tl.length; i++) {
				var idx = tl[i].id;
				tweets.tweetdb[idx].name = nname;
			}
		}
		if (nusername !== '') { 
			userdb[user.uid-1].username = nusername; 
			req.session.user = user;
			var tl = tweets.getAllTweetsByUser(username);
			for (var i=0; i<tl.length; i++) {
				var idx = tl[i].id;
				tweets.tweetdb[idx].username = nusername;
			}
			var mtl = tweets.getAllTByMention(username);
			for (var j=0; j<mtl.length; j++) {
				var idx = mtl[j].id;
				var mentions = tweets.tweetdb[idx].mention;
				var repidx = mentions.indexOf("@"+username);
				mentions[repidx] = "@"+nusername;
				
				tweets.tweetdb[idx].msg = tweets.tweetdb[idx].msg.replace("@"+username,"@"+nusername);
			}
		}
		if (nemail !== '') { userdb[user.uid-1].email = nemail; }
		//check if user changed location and website - can be empty
		userdb[user.uid-1].location = nlocation;
		userdb[user.uid-1].website = nwebsite;
		return {b: true, user: user, error: ''};
	} else {
		return {b: false, user: user, error: 'Changes not saved. Current password must be entered.'};
	}
}
exports.changeUserProfile = changeUserProfile;

// ### *function*: deleteFollower
/*
*  Deletes follower from follower list. Two steps:
*  1. Delete user from logged in user's followers list
*  2. Delete logged in user from user's following list
*  @param {object} loggedinuser 
*  @param {string} username of user to be deleted from logged in user's follower's list
*/
function deleteFollower(loggedinuser, username) {
	console.log("in users.js deleteFollower");
	//remove user from logged in user's follower list
	var followerList = userdb[loggedinuser.uid-1].follower;
	followerList.splice(followerList.indexOf(username),1);
	
	//remove logged in user from user's following list
	var followingList = getUserById(username).following;
	followingList.splice(followingList.indexOf(loggedinuser.username),1);
}
exports.deleteFollower = deleteFollower;

// ### *function*: getFollowerList
/*
*  Returns follower list 
*  @param {string} username 
*  @return {object} follower list
*/
function getFollowerList (username) {
	var followerList = [];
	var fl = getUserById(username).follower;
	for (var i=0; i<fl.length; i++) {
		followerList.push(getUserById(fl[i]));
	}
	return followerList;
}
exports.getFollowerList = getFollowerList;

// ### *function*: getFollowingList
/*
*  Returns following list 
*  @param {string} username 
*  @return {object} following list
*/
function getFollowingList (username) {
	var followingList = [];
	var fl = getUserById(username).following;
	for (var i=0; i<fl.length; i++) {
		followingList.push(getUserById(fl[i]));
	}
	return followingList;
}
exports.getFollowingList = getFollowingList;

// ### *function*: saveUserBackground
/*
* @param {obj} user
* @param {string} background
*/
function saveUserBackground (user, background, req) {
  userdb[user.uid-1].background = background;
  req.session.user.background = background;
}
exports.saveUserBackground = saveUserBackground;
