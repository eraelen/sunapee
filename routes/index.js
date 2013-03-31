var users = require('../lib/users');
var tweets = require('../lib/tweets');
var entry = require('../routes/entry');

//var loggedInUser = "tim";
//var userdb = users.userdb;
var online = entry.online;
/*
 * GET home page.
 */
exports.home = function(req, res){
<<<<<<< HEAD
  var userid=req.cookies.userid;
  var onlineUser=online[userid];
  if ( onlineUser !== undefined && onlineUser.username == req.params.id){
    var u = users.getUserById(onlineUser.username);
    var tl = tweets.getRecentT(onlineUser.username, u.following, 20);
  	res.render('home', 
    			{ title: 'Home',
    			  name: u.name,
    			  username: u.username,
    			  followerN: u.follower.length,
    			  followingN: u.following.length,
            tweets: tweetsToHtml(tl)
    			   } );
  } else {
        res.send('Page Access Not Authorized.');
=======
  var user = req.session.user;
  var username = user.username;
  if (user === undefined || online[user.uid] === undefined) {
    req.flash('userAuth', 'Not logged in!');
    res.redirect('/');
  }else if(username !== req.params.id){
    res.redirect('/'+username+'/home');
  }else {
    var tl = tweets.getRecentT(username, user.following, 20);
  	res.render('home', 
    			{ title: 'Home',
    			  name: user.name,
    			  username: username,
    			  followerN: user.follower.length,
    			  followingN: user.following.length,
                  tweets: tweetsToHtml(tl)
    			   } );
>>>>>>> assign3branch
  }
}

/*
* Handles submiting request from new tweet button on Home page.
* And redirect to Home page.
*/
exports.newtweet = function(req, res) {
  var username = req.params.id;
  var u = users.getUserById(username);
  tweets.addTweet(tweets.tweetdb.length, u.name, u.username, req.body.message, null, null, null);
  users.addUserT(u.username, tweets.tweetdb.length-1);
  res.redirect('/'+username+'/home');
}

/*
* GET Profile page
*/
exports.profile = function(req, res) {
<<<<<<< HEAD
  var username = req.params.id;
  var u = users.getUserById(username);
  if (u !== undefined ) {
    var tl = tweets.getTByUser(username, 20);
    var j = tl.length;
    res.render('profile',
              {title: 'Profile',
               name: u.name,
               username: username,
               followerN: u.follower.length,
               followingN: u.following.length,
=======
  var user = users.getUserById(req.params.id);
  if (user !== undefined ) {
    var tl = tweets.getTByUser(user.username, 20);
    var j = tl.length;
    res.render('profile',
              {title: 'Profile',
               name: user.name,
               username: user.username,
               followerN: user.follower.length,
               followingN: user.following.length,
>>>>>>> assign3branch
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
* GET Follower page
*/
exports.follower = function(req, res) {
<<<<<<< HEAD
  var username = req.params.id;
  var user = users.getUserById(username);
  var followerlist = user.follower;
  var content = '';
  if (followerlist.length !== 0) {
    content += userToHtml(followerlist, "Delete");
=======
  var user = users.getUserById(req.params.id);
  var followerList = user.follower;
  var content = '';
  if (followerList.length !== 0) {
    content += userToHtml(followerList, "Delete");
>>>>>>> assign3branch
  }
	res.render('follower', 
  			{ title: 'Follower',
  			  name: user.name,
<<<<<<< HEAD
  			  username: username,
=======
  			  username: user.username,
>>>>>>> assign3branch
  			  content: content
  			   } );
}


/*
* GET Following page
*/
exports.following = function(req, res) {
<<<<<<< HEAD
	var username = req.params.id;
  var user = users.getUserById(username);
  var followinglist = user.following;
=======
  var user = users.getUserById(req.params.id);
  var username = user.username
  var followinglist = user.following;
  var user = users.getUserById(username);
>>>>>>> assign3branch
  var content = '';
  if (followinglist.length !== 0) {
    content += userToHtml(followinglist, "Unfollow");
  }
  res.render('following', 
        { title: 'Following',
          name: user.name,
          username: username,
          content: content
           } );
}

/*
* GET Interaction page
*/
exports.interaction = function(req, res) {
<<<<<<< HEAD
  var username = req.params.id;
  var user = users.getUserById(username);
  var tl = tweets.getTByMention(username, 20);

  res.render('interaction',
            { title: 'Interaction',
              name: user.name,
              username: user.username,
              tweets: tweetsToHtml(tl)
              });

=======
   var user = req.session.user;
   var username = user.username
  if (user === undefined || online[user.uid] === undefined) {
    res.send("You can only view the interaction page in the account you are logged in with.");
  }else if(username !== req.params.id){
    res.redirect('/'+username+'/interaction');
  }else {
    var tl = tweets.getTByMention(username, 20);
    res.render('interaction',
            { title: 'Interaction',
              name: user.name,
              username: username,
              tweets: tweetsToHtml(tl)
              });
  }
>>>>>>> assign3branch
}

// ### *function*: userToHtml
/*
* Generate HTML to display user list on follower and following page.
* HTML includes name, username (hyperlink to user profile), button
* 
* @param userlist, array of user objects
* @param btntext, text on the button displayed
* @return content, generated HTML
*/
function userToHtml(userlist, btntext) {
  //console.log("userlist: ", userlist);
  var content = '';
  var len = userlist.length-1;
  //console.log("len ",len);
  for (var i=len; i >= 0; i--) {
    //console.log("userlist[i]: ",userlist[i]);
    var u = users.getUserById(userlist[i]);
    //console.log("u: ",u);
    content += '<p><b>'+u.name+'</b> <a href="/'+u.username+'/profile">@'+u.username+'</a><br>';
    content += '<button onclick="deleteFollower()">'+btntext+'</button></p>';
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
    //console.log("");
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

var userdb = users.userdb;
var mytweets = tweets.tweetdb;
var conversation = tweets.conversation;
var settingsMsg = '';
var profileMsg = '';

// ## help
/**
 * Renders Help Page
 */
exports.help = function (req,res) {
	var userid=req.cookies.userid;
	var onlineUser=online[userid];
	var u = users.getUserById(onlineUser.username);
	res.render('help', {title: 'Help', username: u.username});
}

// ## search
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
	var userid=req.cookies.userid;
	var onlineUser=online[userid];
	var u = users.getUserById(onlineUser.username);
	//console.log("username "+u.username);
	var ht = '#ftw';
	var query = "#"+req.params.query;
	var results = tweets.searchTweetsByHT(ht);
	res.render('search', {title: 'Search Result',
								searchPhrase: query,
								rname : results[0].name,
								rusername: results[0].username,
								rmsg: msgToHtml(results[0].msg),
								rdate: results[0].date,
								username: u.username});	
	
};

// ## searchBox
/**
 * Supports searching using the search box. Simply passes query string from search box to search.
 */
exports.searchBox = function (req,res) {
	res.redirect('/search/'+req.body.query);
};

// ## detailedTweet
/**
 * Renders Detailed Tweet Page
 * 
 * Renders detailed conversation. A conversation is a thread of tweets through replies.
 * The page displays the first "original" tweet in the conversation and the user information of who posted that tweet.
 * There is a default text box that allows users to reply to the "original" tweet.
 * The rest of the conversation appears below the box.
 *
 * This version shows how the display looks like.
 * It also supports a fake reply post to the original tweet.
 */
exports.detailedTweet = function (req, res) {
	//fetching conv1 using tweet2
	var tweetId = req.params.tweetId;
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
	
	res.render('detailedTweet',{title: 'Detailed Tweet', 
						convo: content, 
						profilePic: userdb[0].profilePic,
						name: users.get_user(tweetconvo[0].username).name,
						origTweet: ot,
						username: tweetconvo[0].username});
};

// ## detailedTweetFakeReply
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
						convo: content, 
						profilePic: userdb[0].profilePic,
						name: users.get_user(tweetconvo[0].username).name,
						origTweet: ot,
						username: tweetconvo[0].username});

};

// ## editSettings
/**
 * Renders Edit Profile view
 */
exports.editProfile = function (req, res){
	var userid=req.cookies.userid;
	var onlineUser=online[userid];
	if ( onlineUser.username == req.params.id){
		var u = users.getUserById(onlineUser.username);
		res.render('editProfile', { title: 'Edit Profile',
			msg: profileMsg,
			name: u.name,
			username: u.username,
			email: u.email,
			location: u.location,
			website: u.website,
			profilePic: u.profilePic});
	} else {
        res.send('Page Access Not Authorized.');
	}
};

// ## editSettings
/**
 * Renders Edit Settings view
 *
 * This page also has the link for Edit Profile.
 * To get to this page, user can click on Tools icon.
 */
exports.editSettings = function (req, res){
	var userid=req.cookies.userid;
	var onlineUser=online[userid];
	if ( onlineUser.username == req.params.id){
		var u = users.getUserById(onlineUser.username);
		res.render('editSettings', {title: 'Edit Settings', 
			msg: settingsMsg, 
			pv: u.profVis, 
			fp: u.folPerm, 
			mp: u.mentionPerm, 
			pm: u.pmPerm,
			username: u.username});
	} else {
        res.send('Page Access Not Authorized.');
	}
};
// ## changeSettings
/**
 * Makes changes to user settings
 */
exports.changeSettings = function (req, res){
	var userid=req.cookies.userid;
	var onlineUser=online[userid];
	if ( onlineUser.username == req.params.id){
		var u = users.getUserById(onlineUser.username);
		if (req.body.profVis != undefined) {
			u.profVis = req.body.profVis;
		}
		if (req.body.folPerm != undefined) {
			u.folPerm = req.body.folPerm;
		}
		if (req.body.mentionPerm != undefined) {
			u.mentionPerm = req.body.mentionPerm;
		}
		if (req.body.pmPerm != undefined) {
			u.pmPerm = req.body.pmPerm;
		}
		settingsMsg = 'Changes saved.';
		res.redirect('/'+u.username+'/editSettings');
	} else {
        res.send('Page Access Not Authorized.');
	}
};

// ## changeProfile
/**
 * Makes changes to user profile excluding profile picture
 * 
 * This version has not been cleaned after conversation with Tim on what goes to /routes.
 * Most of the comparisons here will go to tweets.js.
 * Another late information that I acquired is the required attribute for forms/input.
 */
exports.changeProfile = function (req, res){
	var flag = false;
	
	var userid=req.cookies.userid;
	var onlineUser=online[userid];
	if ( onlineUser.username == req.params.id){
		var u = users.getUserById(onlineUser.username);
	
		//check if current password is entered
		if (req.body.currentpass !== '') {
			//check if current password entered matches saved password
			if (req.body.currentpass === u.password) {
				//check if user wants to change password
				if (req.body.newpass === req.body.newpassconfirm) {
						//make changes to info
						if (req.body.name == "") {
							//don't allow empty change
							flag = true;
							res.redirect('/'+u.username+'/editProfile');
						} else {
							u.name = req.body.name;
						}
						if (req.body.username == "") {
							//don't allow empty change
							flag = true;
							res.redirect('/'+u.username+'/editProfile');
						} else {
							u.username = req.body.username;
						}
						if (req.body.email == "") {
							//don't allow empty change
							flag = true;
							res.redirect('/'+u.username+'/editProfile');
						} else {
							u.email = req.body.email;
						}
						u.location = req.body.location;
						u.website = req.body.website;
						
						//check if np fields are not empty
						if ((req.body.newpass !== '') && (req.body.newpassconfirm !== '')) {
							//make changes, np fields not empty
							u.password = req.body.newpass;
						};
						if (flag) {
							profileMsg = 'Cannot allow name, username, email to be empty.';
						} else {
							profileMsg = 'Changes saved.';
						}
						res.redirect('/'+u.username+'/editProfile');
				//np fields did not match or one of them empty
				} else {
					profileMsg = 'Incorrect new password confirmation. No changes made. Please try again.';
					res.redirect('/'+u.username+'/editProfile');
				}
			//if current password entered is incorrect, display error msg
			} else {
				profileMsg = 'Current password entered is incorrect. No changes made. Please try again.';
				res.redirect('/'+u.username+'/editProfile');
			}
		//if current password is not entered, display error msg
		} else {
			profileMsg = 'Must enter current password to make changes. No changes made. Please try again.';
			res.redirect('/'+u.username+'/editProfile');
		}
	} else {
        res.send('Page Access Not Authorized.');
	}
};

// ## changeProfilePic
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
	
	var userid=req.cookies.userid;
	var onlineUser=online[userid];
	if ( onlineUser.username == req.params.id){
		var u = users.getUserById(onlineUser.username);
		u.profilePic = 'fakeChangedPic.jpg';
		profileMsg = 'Fake image generated here.';
		res.redirect('/'+u.username+'/editProfile');
	} else {
		res.send('Page Access Not Authorized.');
	}
};