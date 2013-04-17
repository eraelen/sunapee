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
      var tl = tweets.getRecentT(username, user.following, 20);
      res.render('home', 
            { title: 'Home',
              name: user.name,
              username: username,
              tweetN: users.getTNumberById(username),
              followerN: user.follower.length,
              followingN: user.following.length,
              tweets: tl,
			  loggedInUser: user.username
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
		if (permission) {	
			var username = user.username;
			var tl = tweets.getTByUser(username, 20);
			var isFollowing = users.isFollowing(loggedInUser, user);
			res.render('profile',
					  {title: 'Profile',
					   loggedInUser: loggedInUser.username,
					   name: user.name,
					   username: username,
					   tweetN: users.getTNumberById(username),
					   followerN: user.follower.length,
					   followingN: user.following.length,
					   isFollowing: isFollowing,
					   tweets: tl });
		} else {
			res.render('error', {title: 'Error', msg: "You are not allowed to view this profile."});
		}
	  } else {
	    res.render('error',
	               {title: 'Error',
	                msg: "Oops, this user does not exist."});
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
						 name: loggedInUser.name,
						 username: loggedInUser.username,
						 followers: followerList});
		} else {
			var followerList = users.getFollowerList(user.username);
			res.render('follower', 
	    			{ title: 'Follower',
	            	  loggedInUser: loggedInUser.username,
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
                tweets: tweetsToHtml(tl),
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
	if (user === undefined || online[user.uid] === undefined) {
        //res.send("Login to view this page.");
        res.redirect('/');
    }else{
    	res.render('help', {title: 'Help', username: 
							user.username, 
							loggedInUser: user.username});
    }
}

// ### search
/**
 * Renders Search Result Page
 * 
 * At the moment, only searches through hashtags. What is displayed is not what is returned, however.
 * We still need to figure out how to manipulate arrays in ejs.
 * Need also to add search through users, actual message content of tweets and possibly the help page.
 *
 * This current version displays the first tweet from the result of searching tweets for hashtag "#ftw".
 * It is also able to recognize active hashtags clicked/searched in a tweet.
 */
 
exports.search = function (req,res) {
	var user = req.session.user;
	if (user === undefined || online[user.uid] === undefined) {
        res.redirect('/');
    } else {
		var query = "#"+req.params.query;
		var results = tweets.searchTweetsByHT(query);
		res.render('search', {title: 'Search Result',
								loggedInUser: user.username,
								searchPhrase: query,
								tweets: results, username: user.username});	
   }
};

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
			var user = tweets.tweetdb[tweetId];
			var isFollowing = users.isFollowing(loggedInUser, user);
			res.render('detailedTweet',{title: 'Detailed Tweet', 
						loggedInUser: loggedInUser.username, 
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
	var user = req.session.user;
	if (user === undefined || online[user.uid] === undefined) {
		req.flash('userAuth', 'Not logged in!');
		res.redirect('/');
	} else {
		var tweetId = req.params.tweetId;
		res.render('detailedTweet',{title: 'Simple Reply', 
					loggedInUser: user.username, 
					convo: "", 
					profilePic: userdb[0].profilePic, 
					origTweet: tweets.tweetdb[tweetId],
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
			req.flash('changeProfile', 'Changes not saved. Please try again.');
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
	        var u = users.getUserById(user.username);
			u.profilePic = 'fakeChangedPic.jpg';
			profileMsg = 'Fake image generated here.';
			res.redirect('/'+u.username+'/editProfile');
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
      res.send("Login to view this page.");
    }else{
	  res.render('chat', { title: 'Chat', loggedInUser: user.username, username:user.username, online: online, messageList: chat.messageList });
    }
}

//## Functions

// ### *function*: userToHtml
/*
* Generate HTML to display user list on follower and following page.
* HTML includes name, username (hyperlink to user profile), button
* 
* @param userlist, array of user objects
* @param btntext, text on the button displayed
* @return content, generated HTML
*/
function userToHtml(loggedInUser, user, userlist, redir) {
  var content = '';
  var len = userlist.length-1;
  for (var i=len; i >= 0; i--) {
    var u = users.getUserById(userlist[i]);
    var btntext;
    if (u.username === loggedInUser.username) { 
      content += '<p><b>'+u.name+'</b> <a href="/'+u.username+'/profile">@'+u.username+'</a></p>';
    } else {
      if (users.isFollowing(loggedInUser, u)) {
      btntext = "unfollow";
      } else {
        btntext = "follow";
      }
      content += '<b>'+u.name+'</b> <a href="/'+u.username+'/profile">@'+u.username+'</a>';
      content += '<form method="post" id="unfollow" action="/'
      				+user.username+'/'+btntext+'/'+u.username+'/'+redir+'">'+
                  '<input type="submit" name="submit" value="'+btntext+'" />'+
                  '</form><br>';
    }
  }
  return content;
}

// ### *function*: tweetsToHtml
/*
* Generate HTML to display tweets list which includes
* name, @username(hyperlink to user profile), tweet message, date, and Detail(link to detailedTweet page)
*
* @param tl, array of tweets
* @return content, converted HTML
*/
function tweetsToHtml(tl) {
  var j = tl.length;
  var content='';
  for (var i=0; i < j; i++) {
    var t = tl[i];
    var usr = users.getUserById(t.username);
    var a = t.msg.split(" ");
    content += '<p><b>'+t.name+'</b> <a href="/'+t.username+'/profile">@'+t.username+'</a><br>'
              +msgToHtml(t.msg)+'<br>'
              +t.date+'<br>'
              +'<a href="/'+t.id+'/detailedTweet">Detail</a></p>';
  }
  return content;
}

// ### *function*: msgToHtml
/**
 * Find @username and #hashtag in a tweet message and convert them to a html href link.
 * In order to be recognized as a @username mention, @ symbol must be the start
 * of a word. And @username@username is considered invalid and is ignored.
 * hashtag starts with # and end before a space. #ford! is considered a hashtag.
 * Note: word starting with @ && cannot have another @, #ford! <- ! in else if statement.
 */
function msgToHtml(msg) {
  msg = msg.split(" ");
  var content = '';
  var len = msg.length;
  for (var i=0; i < len; i++) {
    var word = msg[i];
    if (word.charAt(0) === "@" && word.split("\@").length === 2) {
      content += ' <a href="/'+word.substring(1)+'/profile">'+word+'</a> ';
    } else if (word.charAt(0) === "#" && word.split("\#").length === 2) {
      content += ' <a href="/search/'+word.substring(1)+'">'+word+'</a> ';
    } else {
      content += word+" ";
    } 
  }
  return content;
}


