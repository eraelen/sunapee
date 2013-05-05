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

var db = require('../lib/sql.js');



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
	  var uname = loggedInUser.username;
	  console.log("uname "+uname);
	  users.getUserById(uname, function(user){
	  	//console.log(JSON.stringify(user));
	  	console.log("user "+user.username);
	  	if (user.username !== req.params.id){
	    	res.redirect('/'+user.username+'/home');
	    }else {
	    	db.getRecentT(uname, function(err, tl){
	    		db.getUserStats(uname, function(stats){
					db.getTrendingHT(function(ht){
						res.render('home', 
						 { title: 'Home',
						  name: user.name,
						  username: user.username,
						  profilepic: user.profilepic,
						  tweetN: stats.tweetN,
						  followerN: stats.followerN,
						  followingN: stats.followingN,
						  tweets: tl,
						  loggedInUser: user.username,
						  background: user.background,
						  ht: ht
						   } );
					});
	    		});
	    	});
	    }
	  });	
	}
  }


// ### newtweet
/*
* POST newtweet.
* Handles submiting request from new tweet button on Home page.
* And redirect to Home page.
*/
exports.newtweet = function(req, res) {
    var loggedInUser = req.session.user;
	var username = loggedInUser.username;
	db.addTweet(loggedInUser.name, username, req.body.msg, null, null,function(){
		db.getUserNT(username,function(t){
			db.getUserStats(username, function(stats){
				console.log(t);
				res.json([t,stats.tweetN]);
			});
		});
		
	});
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
		db.getUserById(req.params.id, function(user){
			if (user !== undefined) {
				//user exists
				db.checkProfilePermission(loggedInUser.username, user.username, function(allow){
					if (allow) {
						db.getUserStats(user.username, function(stats){
							db.isFollowing(loggedInUser.username, user.username, function(isFollowing){
								console.log("isFollowing in profile " + isFollowing);
								db.getUserT(user.username, function(tl){
									db.getTrendingHT(function(ht){
										res.render('profile',
										  {title: 'Profile',
										   loggedInUser: loggedInUser.username,
										   background: user.background,
										   name: user.name,
										   username: user.username,
										   profilepic: user.profilepic,
										   tweetN: stats.tweetN,
										   followerN: stats.followerN,
										   followingN: stats.followingN,
										   isFollowing: isFollowing,
										   tweets: tl,
										   background: loggedInUser.background,
										   ht: ht
										   });
									});
								});
							});
						});
					} else {
						res.render('error', {title: 'Error - Profile Permission',
				            background: loggedInUser.background, 
							errorHeader: "Profile Permission",
							msg: "You are not allowed to view " + user.username+ "'s profile.",
							username: loggedInUser.username,
							loggedInUser: loggedInUser.username});
					}
				});
			} else {
				//user doesn't exist
				res.render('error', {title: 'Error - User Nonexistent',
						background: loggedInUser.background,
						errorHeader: "User does NOT exist",
						msg: "No one with the username '" + req.params.id + "' exists in Tweetee. Invite your friend to register: tweetee.com/register",
						username: loggedInUser.username,
						loggedInUser: loggedInUser.username});
			}
		});

	}
}
/*
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
			            background: loggedInUser.background, 
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
}*/

// ### follower
/* 
* GET follower page.
*/
exports.follower = function(req, res) {
	var loggedInUser = req.session.user;
	if (loggedInUser === undefined || online[loggedInUser.uid] === undefined) {
		res.redirect('/');
	} else {
		db.getUserById(req.params.id, function(user){
			console.log("username "+user.username);
			console.log("logg "+loggedInUser.username);
			if (loggedInUser.username === user.username) {
				db.getFollowerList(loggedInUser.username, function(fl){
					console.log(fl);
					db.getTrendingHT(function(ht){
						res.render('myfollower',
							{title: 'Follower',
							 loggedInUser: loggedInUser.username,
							 background: loggedInUser.background,
							 name: loggedInUser.name,
							 username: loggedInUser.username,
							 followers: fl,
							 ht: ht
							 });
					});
				});
			} else {
				db.getFollowerList(user.username, function(fl){
					db.getTrendingHT(function(ht){
						res.render('follower', 
							{ title: 'Follower',
							  loggedInUser: loggedInUser.username,
							  background: loggedInUser.background,
							  name: user.name,
							  username: loggedInUser.username,
							  followers: fl,
							  ht: ht
							  });
					});
				});
			}
		});	
  }
}

/*exports.follower = function(req, res) {
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
}*/

//  ### Delete Follower
/*
*	In our implementation, users can delete followers.
*	Deleting followers use AJAX. 
*   The user to be deleted is passed to this route and that same user is passed back to the script to delete the user from the list displayed.
*/
exports.deleteFollower = function(req, res) {
	var loggedInUser = req.session.user;
	var username = req.body.usertbd;
	db.deleteFollower(loggedInUser.username, username, function(){
		res.send(username);
	});
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
		db.getUserById(req.params.id, function(user){
			db.getFollowingList(user.username,function(fl){
				db.getTrendingHT(function(ht){
					res.render('following', 
					{ title: 'Following',
					  loggedInUser: loggedInUser.username,
					  background: loggedInUser.background,
					  name: user.name,
					  username: user.username,
					  following: fl,
					  ht: ht
					  } );
				});
			});
		});
  }
}
/*
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
}*/

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
		db.unfollow(loggedInUser.username, rmusername, function(){
			db.getUserStats(rmusername,function(stats){
				res.json([rmusername, stats.followerN]);
			});
		});
	}
}

/*exports.unfollow = function(req, res){
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
}*/

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
	  db.follow(loggedInUser.username, adduname,function(){
	  	db.getUserStats(adduname, function(stats){
	  		res.json([adduname, stats.followerN]);
	  	})
	  });
  }

}
/*exports.follow = function(req, res){
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

}*/

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

       db.getTByMention(username, 20, function(tl){
       	console.log("tl "+tl);
		db.getTrendingHT(function(ht){
          res.render('interaction',
              { title: 'Interaction',
                name: user.name,
                username: username,
                background: user.background,
                tweets: tl,
                loggedInUser: user.username,
				ht: ht
                });
		});
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
		db.searchTweets(query, function(err, results){
			if(err){
				results(err);
			}else{
                db.getTrendingHT(function(ht){
					res.render('searchT', {title: 'Search Result',
								loggedInUser: user.username,
								background: user.background,
								searchPhrase: query,
								tweets: results, 
								username: user.username,
								ht: ht});
				});
			}	
		});
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
		db.searchPeople(query, function(err,results){
			if(err){
				results(err);
			}else{
				db.getTrendingHT(function(ht){
					res.render('searchP', {title: 'Search Result',
								loggedInUser: user.username,
								background: user.background,
								searchPhrase: query,
								users: results, username: 
								user.username,
								ht:ht});
				});
			}	
		});
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
		//loggedInUser = users.getUserById(loggedInUser.username);*/
		var loggedinusername = req.session.user.username;
		var tweetId = req.params.tweetId;
		var isFollowing = false; //default
		db.getTweetConvoByTweetID(parseInt(tweetId), function(myReturn) {
			var tc = myReturn.tc;
			var len = myReturn.length;
			console.log("tc is --- " + tc.username);
			if (len === 1) {
				console.log("only one tweet");
				db.getUserById(tc.username,function(user) {
					db.isFollowing(loggedinusername, user.username, function(isFollowing){	
						res.render('detailedTweet',{title: 'Detailed Tweet',
									loggedInUser: loggedinusername, 
									background: user.background,
									convo: "", 
									profilePic: user.profilepic, 
									origTweet: tc,
									isFollowing: isFollowing,
									//had to include this because text area did not like <%= origTweet.username %>
									username: tc.username});
					});
				});
			} else {
				db.getUserById(tc[0].username,function(user) {
					db.isFollowing(loggedinusername, user.username, function(isFollowing){	
						var temp = tc.slice(1);
						res.render('detailedTweet',{title: 'Detailed Tweet',
										loggedInUser: loggedinusername, 
										background: user.background,
										convo: tc.slice(1), 
										profilePic: user.profilepic, 
										origTweet: tc[0],
										isFollowing: isFollowing,
										//had to include this because text area did not like <%= origTweet.username %>
										username: tc[0].username});
					});
				});
			}
		});
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
		db.addTweet(user.name, user.username, req.body.message, parseInt(tweetId), null, function() {
			res.redirect('/'+tweetId+'/detailedTweet');
		});		
	}
}

// ### Simple Reply Page View
/**
*  In our system, we have two kinds of replies that we track. One is replying from the detailed page and the other is replying from the "Reply" link from the tweet itself.
*  This renders the detailed tweet page view with the tweet that the user wants to reply to appears. 
*  Can be improved: Create a div for compose box once the "Reply" link is clicked.
*/
exports.simpleReply = function (req, res) {
	var isFollowing = false;
	var loggedInUser = req.session.user;
	if (loggedInUser === undefined || online[loggedInUser.uid] === undefined) {
		req.flash('userAuth', 'Not logged in!');
		res.redirect('/');
	} else {
		var loggedinusername = loggedInUser.username;
		var tweetId = req.params.tweetId;
		db.getTweetById(parseInt(tweetId), function(t) {
			db.getUserById(t.username,function(user) {
				db.isFollowing(loggedinusername, t.username, function(isFollowing){	
					res.render('detailedTweet',{title: 'Simple Reply',
								loggedInUser: loggedinusername, 
								background: user.background,
								convo: "", 
								profilePic: user.profilepic, 
								origTweet: t,
								isFollowing: isFollowing,
								//had to include this because text area did not like <%= origTweet.username %>
								username: t.username});
				});
			});
		});
	}
}

// ### Simple Reply Page Handler
/**
*  In our system, we have two kinds of replies that we track. One is replying from the detailed page and the other is replying from the "Reply" link from the tweet itself.
*  This route handles replies from clicking on the "Reply" link attached to each tweet. 
*/
exports.displaySimpleReply = function (req, res) {
	var user = req.session.user;
	if (user === undefined || online[user.uid] === undefined) {
		req.flash('userAuth', 'Not logged in!');
		res.redirect('/');
	} else {
		var tweetId = req.params.tweetId;
		db.addTweet(user.name, user.username, req.body.message, parseInt(tweetId), null, function() {
			res.redirect('/'+tweetId+'/simpleReply');
		});		
	}
}

// ### Edit Settings Page View
/**
 *
 * This page also has the link for Edit Profile.
 * To get to this page, user can click on Tools icon.
 */
exports.editSettings = function (req, res){
	var settingsMsg = req.flash('changeSettings') || '';
	
	var user = req.session.user;
	if (user === undefined || online[user.uid] === undefined) {
		res.redirect('/');
	} else {
		var username = user.username;
		if(username !== req.params.id){
			res.redirect('/'+username+'/editSettings');
		} else {
			db.getUserInfo(username, function(user) {
				res.render('editSettings', {title: 'Edit Settings', 
							loggedInUser: user.username,
							msg: settingsMsg, 
							background: user.background,
							pv: user.profvis, 
							username: user.username});
			});
		}
	}
}

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
		db.changeUserSettings(username, req.body.profVis);		
		req.flash('changeSettings', 'Changes saved.');
		res.redirect('/'+username+'/editSettings');
	}
}

// ### Edit Profile Page View
/**
 * Allows users to edit name, username, email, location, website, profile picture and password.
 * User's name, username and email cannot be empty.
 * User must always enter current password to allow changes.
 */
exports.editProfile = function (req, res){
	var profileMsg = req.flash('changeProfile') || '';
	
	var user = req.session.user;
	if (user === undefined || online[user.uid] === undefined) {
		res.redirect('/');
	} else {
		var username = user.username;
		db.getUserInfo(username, function(user) {
				res.render('editProfile', { title: 'Edit Profile',
							loggedInUser: user.username,
							msg: profileMsg,
							background: user.background,
							name: user.name,
							username: user.username,
							email: user.email,
							location: user.location,
							website: user.website,
							profilePic: user.profilepic});
		});
   }
}

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
		db.changeUserProfile(username, req.body.name, req.body.username, req.body.email, req.body.location, req.body.website, req.body.newpass, req.body.confirmnewpass, req.body.currentpass, function(validChange) {		
			if (validChange.b) {
				username = validChange.username;
				db.getUserInfoById(validChange.uid, function(user) {	
					req.session.user.username = user.username;
					req.flash('changeProfile', 'Changes saved.');
					res.redirect('/'+username+'/editProfile');	
				});
			} else {
				req.flash('changeProfile', validChange.error);
				res.redirect('/'+username+'/editProfile');
			}
			
		});
	}
}

// ### changeProfilePic
/**
 * Makes changes to profile picture. This is separated from the rest of the form for changing profile information.
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
			fs.readFile(req.files.profilepic.path, function (err, data) {
				var newPath = __dirname + "/../public/images/users/" + req.files.profilepic.name;
				fs.writeFile(newPath, data, function (err) {
					var ppp = "/images/users/" + req.files.profilepic.name;
					db.changeprofilepic(user.username, ppp);
					res.redirect('/'+user.username+'/editProfile');
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

// ### deleteTweet
/*
*	Deletes tweet using AJAX. Users can only delete their own tweets.
*/
exports.deleteTweet = function (req, res) {
	var user = req.session.user
	if (user === undefined || online[user.uid] === undefined) {
		res.redirect('/');
    } else {
		var tweetId = req.body.tweetID;
		db.deleteTweet(tweetId);
		db.getTNumberById(user.username, function(tc) {
			res.json([req.body.tweetID,tc]);
		});		
	}	
}

