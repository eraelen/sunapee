// # Route Handler: index.js
// ##Handles routes related to post user login.

// ## Global variables
//The user and tweet files in the lib directory is accessed. 
//Variable 'online' is a logged in database.
var users = require('../lib/users');
var tweets = require('../lib/tweets');
var entry = require('../routes/entry');
var online = entry.online;
var chat = require('../chat/index');

var userdb = users.userdb;
var mytweets = tweets.tweetdb;
var conversation = tweets.conversation;
var profileMsg = '';


var fs = require('fs');

// ## User Server-Side Route-Handlers

// ### home
/*
*GET home page.
*/
exports.home = function(req, res){
  var loggedInUser = req.session.user;
  if (loggedInUser === undefined || online[loggedInUser.uid] === undefined) {
    req.flash('userAuth', 'Not logged in!');
    res.redirect('/');
  } else {
    var user = users.getUserById(loggedInUser.username);
    var username = user.username;
    if (username !== req.params.id){
      res.redirect('/'+username+'/home');
    }else {
      console.log("bg - "+user.background);
      var tl = tweets.getRecentT(username, user.following, 20);
      res.render('home', 
            { title: 'Home',
              name: user.name,
              username: username,
			  profilepic: user.profilePic,
              tweetN: users.getTNumberById(username),
              followerN: user.follower.length,
              followingN: user.following.length,
              tweets: tl,
			  loggedInUser: user.username,
			  background: user.background,
               } );
    }
  }
}

// ### newtweet
/*
* POST newtweet.
* Handles submiting request from new tweet button on Home page.
* And redirect to Home page.
*/
exports.newtweet = function(req, res) {
	var user = req.session.user;
	var username = user.username;
	var ntweet = tweets.addTweet(user.name, username, req.body.msg, null, null);
	res.json([ntweet,users.getTNumberById(username)]);
}

// ### profile
/*
* GET profile page.
*/
exports.profile = function(req, res) {
  	var loggedInUser = req.session.user;
	if (loggedInUser === undefined || online[loggedInUser.uid] === undefined) {
		res.redirect('/');
	} else {
	  loggedInUser = users.getUserById(loggedInUser.username);
	  var user = users.getUserById(req.params.id);
	  if (user !== undefined ) {
	    //check if logged in user is allowed to view this profile
		var permission = users.checkProfilePermission(loggedInUser, user);
		console.log("permission is " + permission);
		if (permission) {	
			var username = user.username;
			var tl = tweets.getTByUser(username, 20);
			var isFollowing = users.isFollowing(loggedInUser, user);
			res.render('profile',
					  {title: 'Profile',
					   loggedInUser: loggedInUser.username,
					   background: user.background,
					   name: user.name,
					   username: username,
					   profilepic: user.profilePic,
					   tweetN: users.getTNumberById(username),
					   followerN: user.follower.length,
					   followingN: user.following.length,
					   isFollowing: isFollowing,
					   tweets: tl,
					   background: user.background});
		} else {
			console.log("should go here");
			res.render('error', {title: 'Error - Profile Permission',
			            background: user.background, 
						errorHeader: "Profile Permission",
						msg: "You are not allowed to view " + user.username+ "'s profile.",
						username: loggedInUser.username,
						loggedInUser: loggedInUser.username});
		}
	  } else {
	    res.render('error', {title: 'Error - User Nonexistent',
						background: loggedInUser.background,
						errorHeader: "User does NOT exist",
						msg: "No one with the username '" + req.params.id + "' exists in Tweetee. Invite your friend to register: tweetee.com/register",
						username: loggedInUser.username,
						loggedInUser: loggedInUser.username});
	  }
	}
}

// ### follower
/* 
* GET follower page.
*/
exports.follower = function(req, res) {
	var loggedInUser = req.session.user;
	if (loggedInUser === undefined || online[loggedInUser.uid] === undefined) {
		res.redirect('/');
	} else {
		loggedInUser = users.getUserById(loggedInUser.username);
		var user = users.getUserById(req.params.id);
		if (loggedInUser.username === user.username) {
			var followerList = users.getFollowerList(loggedInUser.username);
			res.render('myfollower',
						{title: 'Follower',
						 loggedInUser: loggedInUser.username,
						 background: user.background,
						 name: loggedInUser.name,
						 username: loggedInUser.username,
						 followers: followerList});
		} else {
			var followerList = users.getFollowerList(user.username);
			res.render('follower', 
	    			{ title: 'Follower',
	            	  loggedInUser: loggedInUser.username,
	            	  background: user.background,
	    			  name: user.name,
	    			  username: user.username,
	    			  followers: followerList} );
		}
  }
}

//  ### Delete Follower
/*
*	In our implementation, users can delete followers.
*	Deleting followers use AJAX. 
*   The user to be deleted is passed to this route and that same user is passed back to the script to delete the user from the list displayed.
*/
exports.deleteFollower = function(req, res) {
	var loggedInUser = req.session.user;
	var user = req.body.usertbd;
	users.deleteFollower(loggedInUser, user);
	res.send(user);
}

// ### following
/* 
* GET following page
*/
exports.following = function(req, res) {
	var loggedInUser = req.session.user;
	if (loggedInUser === undefined || online[loggedInUser.uid] === undefined) {
		res.redirect('/');
	} else {
		loggedInUser = users.getUserById(loggedInUser.username);
		var user = users.getUserById(req.params.id);
		var followingList = users.getFollowingList(user.username);
		res.render('following', 
    			{ title: 'Following',
            	  loggedInUser: loggedInUser.username,
            	  background: user.background,
    			  name: user.name,
    			  username: user.username,
    			  following: followingList} );
  }
}

// ### Unfollow
/* 
* Unfollowing users implemented using AJAX
*/
exports.unfollow = function(req, res){
	console.log("unfollow");
	var loggedInUser = req.session.user;
	if (loggedInUser === undefined || online[loggedInUser.uid] === undefined) {
		res.redirect('/');
	} else {
		var rmusername = req.body.rmusername;
		users.unfollow(loggedInUser.username, rmusername);
		var followerN = users.getFollowerNum(rmusername);
		res.json([rmusername, followerN]);
	}
}

// ### follow
/* 
* POST follow tweets of a user implemented using AJAX
*/
exports.follow = function(req, res){
	console.log("follow");
  var loggedInUser = req.session.user;
  if (loggedInUser === undefined || online[loggedInUser.uid] === undefined) {
     res.redirect('/');
  } else {
  	  var adduname = req.body.adduname;
      users.follow(loggedInUser.username, adduname);
      var followerN = users.getFollowerNum(adduname);
      res.json([adduname, followerN]);
  }

}

// ### interaction
/* 
* GET interaction page
*/
exports.interaction = function(req, res) {
   var user = req.session.user;
   if (user === undefined || online[user.uid] === undefined) {
     res.redirect('/');
   } else {
      var username = user.username;
      if(username !== req.params.id){
        res.redirect('/'+username+'/interaction');
      } else {
       var tl = tweets.getTByMention(username, 20);
       res.render('interaction',
              { title: 'Interaction',
                name: user.name,
                username: username,
                background: user.background,
                tweets: tl,
                loggedInUser: user.username
                });
     }
   }
}

// ### Help
/**
 * Renders help page.
 */
exports.help = function (req,res) {
	var user = req.session.user;
	console.log("Userback help"+user.background);
	if (user === undefined || online[user.uid] === undefined) {
        //res.send("Login to view this page.");
        res.redirect('/');
    }else{
    	res.render('help', {title: 'Help', 
    		                username: user.username, 
    		                background: user.background,
							loggedInUser: user.username});
    }
}

// ### Search Tweets Result Page
/**
 * Searches through tweets (message only).
 */ 
exports.searchT = function (req,res) {
	var user = req.session.user;
	if (user === undefined || online[user.uid] === undefined) {
        res.redirect('/');
    } else {
		var query = req.params.query;
		var results = tweets.searchTweets(query);
		res.render('searchT', {title: 'Search Result',
								loggedInUser: user.username,
								background: user.background,
								searchPhrase: query,
								tweets: results, username: user.username});	
   }
};

// ### Search People Result Page
/**
 * Searches through users (name and username only).
 */
exports.searchP = function (req, res) {
	var user = req.session.user;
	if (user === undefined || online[user.uid] === undefined) {
		res.redirect('/');
	} else {
		var query = req.params.query;
		var results = users.searchPeople(query);
		res.render('searchP', {title: 'Search Result',
								loggedInUser: user.username,
								background: user.background,
								searchPhrase: query,
								users: results, username: user.username});
	}
};

// ### Search Box from Navigation Bar
/**
 * Supports searching using the search box. Simply passes query string from search box to search.
 * Default for result in search box is searching tweets.
 */
exports.searchBox = function (req,res) {
	var query = req.body.query;
	//performs additional check - found that # as first character for url causes issues
	if (query.charAt(0) === "#") {query = query.substring(1,query.length);}
	res.redirect('/searchT/'+query);
};

// ### Detailed Tweet Page
/** 
 * Renders detailed conversation. A conversation is a thread of tweets through replies.
 * The page displays the first "original" tweet in the conversation and the user information of who posted that tweet.
 * There is a default text box that allows users to reply to the "original" tweet.
 * The rest of the conversation appears below the box.
 */
exports.detailedTweet = function (req, res) {
	var loggedInUser = req.session.user;
	if (loggedInUser === undefined || online[loggedInUser.uid] === undefined) {
		req.flash('userAuth', 'Not logged in!');
		res.redirect('/');
	} else {
		loggedInUser = users.getUserById(loggedInUser.username);
		var tweetId = req.params.tweetId;
		var tweetconvo = tweets.getTweetConvoByTweetID(tweetId);
		if (tweetconvo === null) {
			var user = users.getUserById(tweets.tweetdb[tweetId].username);
			var isFollowing = users.isFollowing(loggedInUser, user);
			res.render('detailedTweet',{title: 'Detailed Tweet', 
						loggedInUser: loggedInUser.username, 
						background: loggedInUser.background,
						convo: "", 
						profilePic: userdb[0].profilePic, //change later
						origTweet: tweets.tweetdb[tweetId],
						isFollowing: isFollowing,
						//had to include this because text area did not like <%= origTweet.username %>
						username: user.username});
		} else {
			var user = users.getUserById(tweetconvo[0].username);
			var isFollowing = users.isFollowing(loggedInUser, user);
			res.render('detailedTweet',{title: 'Detailed Tweet', 
						loggedInUser: user.username, 
						background: user.background,
						convo: tweetconvo, 
						profilePic: userdb[0].profilePic, //change later
						origTweet: tweetconvo[0],
						isFollowing: isFollowing,
						//had to include this because text area did not like <%= origTweet.username %>
						username: user.username});
		}
	}
}

// ### Detailed Tweet REPLY Page
/**
*  In our system, we have two kinds of replies that we track. One is replying from the detailed page and the other is replying from the "Reply" link from the tweet itself.
*  This route handles replies from the detailed page. The reply is composed from the compose tweet box. It is a direct reply to the original tweet of the current conversation displayed and not to the last tweet of the conversation. 
*/
exports.detailedTweetReply = function (req, res) {
	var user = req.session.user;
	if (user === undefined || online[user.uid] === undefined) {
		req.flash('userAuth', 'Not logged in!');
		res.redirect('/');
	} else {
		var tweetId = req.params.tweetId;	
		tweets.addTweet(user.name, user.username, req.body.message, parseInt(tweetId), null);
		res.redirect('/'+tweetId+'/detailedTweet');
	}
}

// ### Simple Reply Page View
/**
*  In our system, we have two kinds of replies that we track. One is replying from the detailed page and the other is replying from the "Reply" link from the tweet itself.
*  This renders the detailed tweet page view with the tweet that the user wants to reply to appears. 
*  Can be improved: Create a div for compose box once the "Reply" link is clicked.
*/
exports.simpleReply = function (req, res) {
	var loggedInUser = req.session.user;
	if (loggedInUser === undefined || online[loggedInUser.uid] === undefined) {
		req.flash('userAuth', 'Not logged in!');
		res.redirect('/');
	} else {
		var tweetId = req.params.tweetId;
		var user = users.getUserById(tweets.tweetdb[tweetId].username);
		var isFollowing = users.isFollowing(loggedInUser, user);
		res.render('detailedTweet',{title: 'Simple Reply', 
					loggedInUser: loggedInUser.username, 
					background: loggedInUser.background,
					convo: "", 
					profilePic: userdb[0].profilePic, 
					origTweet: tweets.tweetdb[tweetId],
					isFollowing: isFollowing,
					//had to include this because text area did not like <%= origTweet.username %>
					username: tweets.tweetdb[tweetId].username});
	}
}

// ### Simple Reply Page Handler
/**
*  In our system, we have two kinds of replies that we track. One is replying from the detailed page and the other is replying from the "Reply" link from the tweet itself.
*  This route handles replies from clicking on the "Reply" link attached to each tweet. 
*/
exports.displaySimpleReply = function (req, res) {
	var user = req.session.user;
	var tweetId = req.params.tweetId;	
	tweets.addTweet(user.name, user.username, req.body.message, parseInt(tweetId), null);
	res.redirect('/'+tweetId+'/simpleReply');
}

// ### Edit Settings Page View
/**
 *
 * This page also has the link for Edit Profile.
 * To get to this page, user can click on Tools icon.
 */
exports.editSettings = function (req, res){
	var user = req.session.user;
	var settingsMsg = req.flash('changeSettings') || '';
	if (user === undefined || online[user.uid] === undefined) {
		res.redirect('/');
	} else {
		var username = user.username;
		if(username !== req.params.id){
			res.redirect('/'+username+'/editSettings');
		} else {
			res.render('editSettings', {title: 'Edit Settings', 
			loggedInUser: username,
			msg: settingsMsg, 
			background: user.background,
			pv: users.userdb[user.uid-1].profVis, 
			mp: users.userdb[user.uid-1].mentionPerm, 
			pm: users.userdb[user.uid-1].pmPerm,
			username: username});
		}
	} 
};

// ### Change Settings
/**
 * Makes changes to user settings.
 */
exports.changeSettings = function (req, res){
	var user = req.session.user;
	if (user === undefined || online[user.uid] === undefined) {
		res.redirect('/');
	} else {
		var username = user.username;
		users.changeUserSettings(username, req.body.profVis, req.body.mentionPerm, req.body.pmPerm);		
		req.flash('changeSettings', 'Changes saved.');
		res.redirect('/'+username+'/editSettings');
	}
};

// ### Edit Profile Page View
/**
 * Allows users to edit name, username, email, location, website, profile picture and password.
 * User's name, username and email cannot be empty.
 * User must always enter current password to allow changes.
 */
exports.editProfile = function (req, res){
	var user = req.session.user;
	var profileMsg = req.flash('changeProfile') || '';
	if (user === undefined || online[user.uid] === undefined) {
		res.redirect('/');
	} else {
		var username = user.username;
		res.render('editProfile', { title: 'Edit Profile',
					loggedInUser: username,
					msg: profileMsg,
					background: user.background,
					name: users.userdb[user.uid-1].name,
					username: users.userdb[user.uid-1].username,
					email: users.userdb[user.uid-1].email,
					location: users.userdb[user.uid-1].location,
					website: users.userdb[user.uid-1].website,
					profilePic: users.userdb[user.uid-1].profilePic});
   }
};
//  ### Change Profile Page
/**
*  Route for actually changing the profile page.
*  For changes to be valid and take effect, users must input the correct current password. If users want to change the password, the new password entered must be entered twice and those passwords must match.
*  Users will be informed whether the changes are saved or not.
*/
exports.changeProfile = function (req, res) {
	var user = req.session.user;
	if (user === undefined || online[user.uid] === undefined) {
		res.redirect('/');
	} else {
		var username = user.username;
		var validChange = users.changeUserProfile(username, req.body.name, req.body.username, req.body.email, req.body.location, req.body.website, req.body.newpass, req.body.confirmnewpass, req.body.currentpass, req, user);		
		if (validChange.b) {
			username = validChange.user.username;
			req.flash('changeProfile', 'Changes saved.');
			res.redirect('/'+username+'/editProfile');
		} else {
			req.flash('changeProfile', validChange.error);
			res.redirect('/'+username+'/editProfile');
		}
	}
}

// ### changeProfilePic
/**
 * Makes changes to profile picture
 * 
 * This version does not support uploading the file though that form is active.
 * It returns fake image upload at the moment.
 * 
 * This is separated from the rest of the form for changing profile information because it was
 * getting frustrating to figure out the uploading image part which was not really part of this project.
 * Once the image upload is figured out, it will be merged with the rest of the data for changing profile
 * or user information.
 * 
 */
exports.changeProfilePic = function (req, res) {
	var flag = false;
	var user = req.session.user;
    if (user === undefined || online[user.uid] === undefined) {
      res.send("Login to view this page.");
    } else {
    	var username = user.username;
    	if(username !== req.params.id){
	   		res.redirect('/'+username+'/editProfile'); 
    	}else {
			console.log(req.files);
			fs.readFile(req.files.profilepic.path, function (err, data) {
			  var newPath = __dirname + "/../public/images/users/" + username + "/" + req.files.profilepic.name;
			  fs.writeFile(newPath, data, function (err) {
				var u = users.getUserById(user.username);
				console.log("written... " + newPath);
				u.profilePic = "/images/users/" + username + "/" + req.files.profilepic.name;
				res.redirect('/'+u.username+'/editProfile');
			  });
			});
    	}
    }
};

// ### chat
/* 
* GET global chat page
*/
exports.chat = function (req, res){
	var user = req.session.user
	if (user === undefined || online[user.uid] === undefined) {
      res.redirect('/');
    }else{
	  res.render('chat', { title: 'Chat', loggedInUser: user.username, username:user.username, online: online, messageList: chat.messageList, background: user.background});
    }
}

// ### pm
/* 
* GET pm page
*/
exports.pm = function (req, res){
	var user = req.session.user
	if (user === undefined || online[user.uid] === undefined) {
      res.redirect('/');
    }else{
      var messageList= ["Here is a test list", "Of different things", "This is the third element"]
	  res.render('pm', { title: 'PM', loggedInUser: user.username, username:user.username, pmfollowers: user.follower, messageList: "" });
    }
}

// ### changeBackground
/* 
* GET changeBackground page
*/
exports.changeBackground = function (req, res){
	var user = req.session.user
	if (user === undefined || online[user.uid] === undefined) {
      res.redirect('/');
    }else{
	  res.render('changeBackground', { title: 'Change Background', loggedInUser: user.username, username:user.username, background:user.background});
    }
}

// ### saveBackground
/* 
* Post saveBackground page
*/
exports.saveBackground = function (req, res){
	var user = req.session.user
	if (user === undefined || online[user.uid] === undefined) {
      res.redirect('/');
    }else{
      var bName = req.body.bName;
      users.saveUserBackground(user,bName,req);
	  res.redirect('/'+user.username+'/home');
    }
}

exports.deleteTweet = function (req, res) {
	var user = req.session.user
	if (user === undefined || online[user.uid] === undefined) {
		res.redirect('/');
    } else {
		tweets.deleteTweet(user.username, req.body.tweetID);
		res.json([req.body.tweetID,users.getTNumberById(user.username)]);
	}	
}

