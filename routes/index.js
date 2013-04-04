// # Route Handler: index.js
// ##Handles routes related to post user login.

// ## Global variables
//The user and tweet files in the lib directory is accessed. 
//Variable 'online' is a logged in database.
var users = require('../lib/users');
var tweets = require('../lib/tweets');
var entry = require('../routes/entry');
var online = entry.online;

var userdb = users.userdb;
var mytweets = tweets.tweetdb;
var conversation = tweets.conversation;
var settingsMsg = '';
var profileMsg = '';

// # User Server-Side Route-Handler

// ## 
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

/*
* POST newtweet.
* Handles submiting request from new tweet button on Home page.
* And redirect to Home page.
*/
exports.newtweet = function(req, res) {
  var user = req.session.user;
  var username = user.username;
  tweets.addTweet(user.name, username, req.body.message, null, null);
  res.redirect('/'+username+'/home');
}

/*
* GET profile page.
*/
exports.profile = function(req, res) {
  var loggedInUserName = "";
  if (req.session.user !== undefined) {
    loggedInUserName = req.session.user.username;
  }
  var user = users.getUserById(req.params.id);
  if (user !== undefined ) {
    var username = user.username;
    console.log(username+" "+user.following);
    var tl = tweets.getTByUser(username, 20);
    res.render('profile',
              {title: 'Profile',
               loggedInUser: loggedInUserName,
               name: user.name,
               username: username,
               tweetN: users.getTNumberById(username),
               followerN: user.follower.length,
               followingN: user.following.length,
               tweets: tweetsToHtml(tl)
               }
      );
  } else {
    res.render('error',
               {title: 'Error',
                msg: "Oops, this user does not exist."});
  }
}

/* 
* GET follower page.
*/
exports.follower = function(req, res) {
  var userl = req.session.user;
  if (userl === undefined || online[userl.uid] === undefined) {
    res.redirect('/');
  } else {
    var user = users.getUserById(req.params.id);
    var followerList = user.follower;
    var content = '';
    if (followerList.length !== 0) {
      content += userToHtml(followerList, "Delete");
    }
  	res.render('follower', 
    			{ title: 'Follower',
            loggedInUser: userl.username,
    			  name: user.name,
    			  username: user.username,
    			  content: content
    			   } );
  }
}


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
    var followinglist = user.following;
    var content = '';
    if (followinglist.length !== 0) {
      content += userToHtml(loggedInUser, user, followinglist);
    }
    res.render('following', 
          { title: 'Following',
            loggedInUser: loggedInUser.username,
            name: user.name,
            username: user.username,
            content: content
             } );
  }
}

/* 
* POST changed contents of the following/follower page by redirect
*/
exports.unfollow = function(req, res){
  var loggedInUser = req.session.user;
  if (loggedInUser === undefined || online[loggedInUser.uid] === undefined) {
     res.redirect('/');
  } else {
      users.unfollow(loggedInUser.username, req.params.rmuname);
      res.redirect('/'+req.params.uname+'/following');
  }

}
/* 
* GET Interaction page
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

// ### help
/**
 * Renders Help Page
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
   var username = user.username;
   if (user === undefined || online[user.uid] === undefined) { //if a user is logged in, search works.
     res.send("Login to view this page."); //Should we make it so that a search can only be conducted when a user is logged in?
   }else{
   	 var ht = '#ftw';
	 var query = "#"+req.params.query;
	 var results = tweets.searchTweetsByHT(ht);
	 res.render('search', {title: 'Search Result',
                loggedInUser: username,
								searchPhrase: query,
								rname : results[0].name,
								rusername: results[0].username,
								rmsg: msgToHtml(results[0].msg),
								rdate: results[0].date,
								username: user.username});	
   }
};

// ### searchBox
/**
 * Supports searching using the search box. Simply passes query string from search box to search.
 */
exports.searchBox = function (req,res) {
	res.redirect('/search/'+req.body.query);
};

// ### detailedTweet
/**
 * Renders Detailed Tweet Page
 * 
 * Renders detailed conversation. A conversation is a thread of tweets through replies.
 * The page displays the first "original" tweet in the conversation and the user information of who posted that tweet.
 * There is a default text box that allows users to reply to the "original" tweet.
 * The rest of the conversation appears below the box.
 *
 */
exports.detailedTweet = function (req, res) {
	var user = req.session.user;
	if (user === undefined || online[user.uid] === undefined) {
		req.flash('userAuth', 'Not logged in!');
		res.redirect('/');
	} else {
		var tweetId = req.params.tweetId;
		var tweetconvo = tweets.getTweetConvoByTweetID(tweetId);
		if (tweetconvo === null) {
			res.render('detailedTweet',{title: 'Detailed Tweet', 
						loggedInUser: user.username, 
						convo: "", 
						profilePic: userdb[0].profilePic, //change later
						origTweet: tweets.tweetdb[tweetId],
						//had to include this because text area did not like <%= origTweet.username %>
						username: tweets.tweetdb[tweetId].username});
		} else {
			for (var i=0; i<tweets.conversation.length; i++) {
			}
			for (var j=0; j<tweets.tweetdb.length; j++) {
				console.log("tweet reply for " + j + " " + tweets.tweetdb[j].reply);
				console.log("tweet convo for " + j + " " + tweets.tweetdb[j].convo);
			}
			res.render('detailedTweet',{title: 'Detailed Tweet', 
						loggedInUser: user.username, 
						convo: tweetconvo, 
						profilePic: userdb[0].profilePic, //change later
						origTweet: tweetconvo[0],
						//had to include this because text area did not like <%= origTweet.username %>
						username: tweetconvo[0].username});
		}
	}
}

exports.detailedTweetReply = function (req, res) {
	var user = req.session.user;
	if (user === undefined || online[user.uid] === undefined) {
		req.flash('userAuth', 'Not logged in!');
		res.redirect('/');
	} else {
		var tweetId = req.params.tweetId;	
		tweets.addTweet(user.name, user.username, req.body.message, parseInt(tweetId), null);
		//users.addUserT(user.username, tweets.tweetdb.length-1);
		res.redirect('/'+tweetId+'/detailedTweet');
	}
}

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
					profilePic: userdb[0].profilePic, //change later
					origTweet: tweets.tweetdb[tweetId],
					//had to include this because text area did not like <%= origTweet.username %>
					username: tweets.tweetdb[tweetId].username});
	}
}

exports.displaySimpleReply = function (req, res) {
	var user = req.session.user;
	var tweetId = req.params.tweetId;	
	tweets.addTweet(user.name, user.username, req.body.message, parseInt(tweetId), null);
	//users.addUserT(user.username, tweets.tweetdb.length-1);
	res.redirect('/'+tweetId+'/simpleReply');
}

// ### detailedTweetFakeReply
/**
 * This version shows how the display looks like with a fake reply post to the original tweet.
 * It allows the user to send a tweet reply but reply is stored in static position in the conversation,
 * i.e. the last position.
 *
 */
exports.detailedTweetFakeReply = function (req, res) {	
	var tweetId = 2;
	var tweetconvo = tweets.getTweetConvoByTweetID(tweetId);
	var content = '';
	
	var username = tweetconvo[0].username;
	var name = users.get_user(username).name;
	var ot = '<p><b>' + name + '</b> <a href="/' + username + '/profile">@' + username
			+ '</a><br>' + msgToHtml(tweetconvo[0].msg) + '<br>' 
			+ tweetconvo[0].date + '</p>';
	
	for (var i=1; i < tweetconvo.length; i++) {
		username = tweetconvo[i].username;
		name = users.get_user(username).name;
		content += '<p><b>' + name + '</b> <a href="/' + username + '/profile">@' + username
			+ '</a><br>' + msgToHtml(tweetconvo[i].msg) + '<br>' 
			+ tweetconvo[i].date + '</p>';
	}
	
	content += '<p><b>Hazel Rozetta</b><a href="/">@hazel</a><br>' + req.body.replyTweet + '<br>'+ tweetconvo[0].date +'</p>';
	
	res.render('detailedTweet',{title: 'Detailed Tweet Fake Reply', 
            loggedInUser:"", //Should change this later
						convo: content, 
						profilePic: userdb[0].profilePic,
						name: users.get_user(tweetconvo[0].username).name,
						origTweet: ot,
						username: tweetconvo[0].username});

};

// ### editProfile
/**
 * Renders Edit Profile view
 */
exports.editProfile = function (req, res){
   var user = req.session.user;
   var username = user.username;
   if (user === undefined || online[user.uid] === undefined) {
     res.send("Login to view this page.");
   }else if(username !== req.params.id){
     res.redirect('/'+username+'/editProfile');
   }else {
	 res.render('editProfile', { title: 'Edit Profile',
      loggedInUser: username,
			msg: profileMsg,
			name: user.name,
			username: username,
			email: user.email,
			location: user.location,
			website: user.website,
			profilePic: user.profilePic});
   }
};

// ### editSettings
/**
 * Renders Edit Settings view
 *
 * This page also has the link for Edit Profile.
 * To get to this page, user can click on Tools icon.
 */
exports.editSettings = function (req, res){
   var user = req.session.user;
   if (user === undefined || online[user.uid] === undefined) {
     //res.send("Login to view this page.");
     res.redirect('/');
   } else {
    var username = user.username;
    if(username !== req.params.id){
      res.redirect('/'+username+'/editSettings');
    } else {
      res.render('editSettings', {title: 'Edit Settings', 
      loggedInUser: username,
      msg: settingsMsg, 
      pv: user.profVis, 
      fp: user.folPerm, 
      mp: user.mentionPerm, 
      pm: user.pmPerm,
      username: user.username});
    }
   } 
};
// ### changeSettings
/**
 * Makes changes to user settings
 */
exports.changeSettings = function (req, res){
   var user = req.session.user;
   var username = user.username;
   if (user === undefined || online[user.uid] === undefined) {
     res.send("Login to view this page.");
   }else if(username !== req.params.id){
	  res.redirect('/'+username+'/editSettings'); //Direct to user's edit setting page
   }else {
     if (req.body.profVis != undefined) {
			user.profVis = req.body.profVis;
		}
		if (req.body.folPerm != undefined) {
			user.folPerm = req.body.folPerm;
		}
		if (req.body.mentionPerm != undefined) {
			user.mentionPerm = req.body.mentionPerm;
		}
		if (req.body.pmPerm != undefined) {
			user.pmPerm = req.body.pmPerm;
		}
		settingsMsg = 'Changes saved.';
		res.redirect('/'+username+'/editSettings');
   }
};

// ### changeProfile
/**
 * Makes changes to user profile excluding profile picture
 * 
 * This version has not been cleaned after conversation with Tim on what goes to /routes.
 * Most of the comparisons here will go to tweets.js.
 * Another late information that I acquired is the required attribute for forms/input.
 */
exports.changeProfile = function (req, res){
   var flag = false;
    
   var user = req.session.user;
   var username = user.username;
   if (user === undefined || online[user.uid] === undefined) {
     res.send("Login to view this page.");
   }else if(username !== req.params.id){
	 res.redirect('/'+username+'/editProfile'); //Change to another default if desired
   }else {
     //check if current password is entered
		if (req.body.currentpass !== '') {
			//check if current password entered matches saved password
			if (req.body.currentpass === user.password) {
				//check if user wants to change password
				if (req.body.newpass === req.body.newpassconfirm) {
						//make changes to info
						if (req.body.name == "") {
							//don't allow empty change
							flag = true;
							res.redirect('/'+user.username+'/editProfile');
						} else {
							user.name = req.body.name;
						}
						if (req.body.username == "") {
							//don't allow empty change
							flag = true;
							res.redirect('/'+user.username+'/editProfile');
						} else {
							user.username = req.body.username;
						}
						if (req.body.email == "") {
							//don't allow empty change
							flag = true;
							res.redirect('/'+user.username+'/editProfile');
						} else {
							user.email = req.body.email;
						}
						user.location = req.body.location;
						user.website = req.body.website;
						
						//check if np fields are not empty
						if ((req.body.newpass !== '') && (req.body.newpassconfirm !== '')) {
							//make changes, np fields not empty
							user.password = req.body.newpass;
						};
						if (flag) {
							profileMsg = 'Cannot allow name, username, email to be empty.';
						} else {
							profileMsg = 'Changes saved.';
						}
						res.redirect('/'+username+'/editProfile');
				//np fields did not match or one of them empty
				} else {
					profileMsg = 'Incorrect new password confirmation. No changes made. Please try again.';
					res.redirect('/'+username+'/editProfile');
				}
			//if current password entered is incorrect, display error msg
			} else {
				profileMsg = 'Current password entered is incorrect. No changes made. Please try again.';
				res.redirect('/'+username+'/editProfile');
			}
		//if current password is not entered, display error msg
		} else {
			profileMsg = 'Must enter current password to make changes. No changes made. Please try again.';
			res.redirect('/'+username+'/editProfile');
		}
   }
};

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
    var username = user.username;
    if (user === undefined || online[user.uid] === undefined) {
      res.send("Login to view this page.");
    }else if(username !== req.params.id){
	   res.redirect('/'+username+'/editProfile'); //just go to the user's edit page
    }else {
       var u = users.getUserById(user.username);
		u.profilePic = 'fakeChangedPic.jpg';
		profileMsg = 'Fake image generated here.';
		res.redirect('/'+u.username+'/editProfile');
    }
};


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
function userToHtml(loggedInUser, user, userlist) {
  var content = '';
  var len = userlist.length-1;
  for (var i=len; i >= 0; i--) {
    var u = users.getUserById(userlist[i]);
    var btntext;
    if (u.username === loggedInUser.username) {
      content += '<b>'+u.name+'</b> <a href="/'+u.username+'/profile">@'+u.username+'</a><br>';
    } else {
      if (users.isFollowing(loggedInUser, u)) {
      btntext = "unfollow";
      } else {
        btntext = "follow";
      }
      content += '<b>'+u.name+'</b> <a href="/'+u.username+'/profile">@'+u.username+'</a>';
      content += '<form method="post" id="unfollow" action="/'+user.username+'/'+btntext+'/'+u.username+'">'+
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
              //+t.msg+'<br>'
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
 * #hashtag starts with # and end before a space. #ford! is considered a hashtag.
 */
function msgToHtml(msg) {
  msg = msg.split(" ");
  var content = '';
  var len = msg.length;
  for (var i=0; i < len; i++) {
    var word = msg[i];
    // word starting with @ && cannot have another @
    if (word.charAt(0) === "@" && word.split("\@").length === 2) {
      content += ' <a href="/'+word.substring(1)+'/profile">'+word+'</a> ';
    } else if (word.charAt(0) === "#" && word.split("\#").length === 2) { //#ford! <- !
      content += ' <a href="/search/'+word.substring(1)+'">'+word+'</a> ';
    } else {
      content += word+" ";
    } 
  }
  return content;
}
