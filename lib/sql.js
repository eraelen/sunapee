// # Users Module
// This is a module for accessing user data and functions.

// ## In Memory User Database
var sqlite3 = require('sqlite3');
var async = require('async');
var db = new sqlite3.Database('./data/all.db');

// ## Functions

// ### *function*: getUserById
/**
 * Gets the user object by username
 *
 * @param {string} uname
 * @param {function} cb  -> {user object} 
 */
exports.getUserById = function(uname,cb) {
	db.get("select * from users where username=?", [uname], function(err, u){
		cb(u);
	});
}

// ### *function*: getFollowing
/**
 * Gets the following user association.
 *
 * @param {string} uname
 * @param {function} cb  -> {array of following associations} 
 */
exports.getFollowing = function(uname, cb) {
	db.all('select fusername from isfollowings where username=?',[uname],function(err, fl){
		cb(fl);
	});
}

// ### *function*: getRecentT
/**
 *
 * @param {string} uname
 * @param {function} cb  -> {array of tweets} 
 */
exports.getRecentT = function(uname,cb) {
	db.all('select * from tweets t, (select f.fusername from isfollowings f where f.username = ?) fu where t.username = fu.fusername order by date desc'
		,[uname], function(err, tl){
			    cb(undefined, tl);
		});
}

exports.getUserT = function(uname,cb){
	db.all('select * from tweets where username=?',[uname],function(err,tl){
		cb(tl);
	});
}

// ### *function*: getUserT
/**
 * Get the user's tweets
 *
 * @param {string} uname
 * @param {function} cb  -> {array of tweets} 
 */
exports.getUserT = function(uname,cb){
	db.all('select * from tweets where username=? order by date desc',[uname],function(err,tl){
		cb(tl);
   });
}

// ### *function*: getTNumberById
/**
 * Get the location of the tweet in the database 
 *
 * @param {string} uname
 * @param {function} cb  -> {number} 
 */
exports.getTNumberById = function(uname,cb) {
	db.get('select count(*) as n from tweets where username=?',[uname],function(err, n){
		console.log(n['n']);
		cb(n['n']);
	});
}

// ### *function*: getUserStats
/**
 * Get the user Statistics
 *
 * @param {string} uname
 * @param {function} cb  -> {"stats" object} 
 */
exports.getUserStats = function(uname,cb) {
	db.get('select count(*) as n from tweets where username=?',[uname],function(err, tweetN){
		db.get("select count(*) as n from isfollowings where username=?",[uname], function(err,followingN){
			db.get("select count(*) as n from isfollowings where fusername=?",[uname], function(err,followerN){
				var stats = {tweetN: tweetN.n, followingN: followingN.n-1, followerN: followerN.n-1};
				cb(stats);
			});
		});
	});
}

exports.test = function(cb){
	async.each([1,2,3], 
		function(n, cb2){ 
			console.log(n); 
			cb2(null);
		}, 
		function(err){ console.log("fff"); cb(null);});
}

// ### *function*: addTweet
/**
 * Adds the tweet to the database
 *
 * @param {string} nname
 * @param {string} nusername
 * @param {string} nmsg
 * @param {string} nreply
 * @param {string} nretweet
 * @param {function} cb  -> {} 
 */
exports.addTweet = function(nname, nusername, nmsg, nreply, nretweet,cb) {
	
	if (nreply !== null) {
		//check if that tweet is already in a convo
		db.get('select convo from tweets where tweetid=?',[nreply],function(err,convo){
			if (convo['convo'] !== null) {				
				db.serialize(function(){
					db.run('insert into tweets values (null,?,?,datetime("now","localtime"),?,?,?,?)',[nusername,nname,nmsg,nreply,nretweet,convo['convo']]
						,addAtHt(nusername, nmsg, nreply, nretweet, cb));
				});
			} else {
				console.log("went inside convo !== null ELSE");
				//if not yet in a convo, add new convo
				db.serialize(function(){
					//update convo for old tweet
					db.run('update tweets set convo=? where tweetid=?',[nreply,nreply]);
					db.serialize(function(){
						db.run('insert into tweets values (null,?,?,datetime("now","localtime"),?,?,?,?)',[nusername,nname,nmsg,nreply,nretweet,nreply]
							,addAtHt(nusername, nmsg, nreply, nretweet, cb));
					});
				});
			}
		});		
	} else {
		//this tweet is not a reply to anything
		console.log("add new tweet without reply");
		db.run('insert into tweets values (null,?,?,datetime("now","localtime"),?,?,?,?)',[nusername,nname,nmsg,nreply,nretweet,null]
			,addAtHt(nusername, nmsg, nreply, nretweet, cb));
	}


	
}

function addAtHt(username, msg, reply, retweet, cb) {
	console.log(username+" "+msg+" "+reply+" "+retweet);
	db.get('select tweetid from tweets where username=? order by date desc',[username],function(err, id){
		console.log("tweetidddd "+id.tweetid);
		var result = msgParse(msg);
		console.log('result '+result.at+' '+result.ht);
		async.each(result.at, function(at,cb1){ console.log('each at'+at); db.run('insert into mentions values (?,?)',[id.tweetid,at]); cb1(null);},
			function(err){
				console.log('finished mentions');
				async.each(result.ht, 
					function(ht,cb2){ console.log('each ht'+ht); db.run('insert into hashtags values (?,?)',[id.tweetid,ht]); cb2(null);},
					function(err) {
						console.log("finished hashtags");
						cb(null);
					}
				);}
		);	
	});
	
}


function msgParse(msg) {
  msg = msg.split(" ");
  var at = [];
  var ht = [];
  var len = msg.length;
  for (var i=0; i < len; i++) {
    var word = msg[i];
    if (word.charAt(0) === "@" && word.split("\@").length === 2) {
    	at.push(word.substring(1));
    } else if (word.charAt(0) === "#" && word.split("\#").length === 2) {
      	ht.push(word);
    } 
  }
  console.log("at ",at);
  console.log("ht", ht);
  return {at: at, ht: ht};
}

// ### *function*: getUserNT
/**
 * Gets the new tweet 
 *
 * @param {string} uname
 * @param {function} cb  -> {new tweet obj} 
 */
exports.getUserNT = function(uname,cb) {
	db.get('select * from tweets where username=? order by date desc',[uname],function(err,t){
		cb(t);
	});
}

// ### *function*: getFollowerList
/**
 * Gets the follower list 
 *
 * @param {string} uname
 * @param {function} cb  -> {array of follower associations} 
 */
exports.getFollowerList = function(uname,cb) {
	db.all('select f.username, u.name from isfollowings f, users u where f.fusername=? and f.username != ? and u.username = f.username',
		[uname,uname],function(err,fl){
			cb(fl);
	});
}

// ### *function*: getFollowingList
/**
 * Gets the following list 
 *
 * @param {string} uname
 * @param {function} cb  -> {array of following associations} 
 */
exports.getFollowingList = function(uname,cb) {
	db.all('select f.fusername as username, u.name from isfollowings f, users u where f.username=? and f.fusername != ? and u.username = f.fusername',
		[uname,uname],function(err,fl){
			cb(fl);
	});
}

// ### *function*: isFollowing
/**
 * Gets the association between the loggedinuser and uname.
 *
 * @param {string} loggedinuname
 * @param {string} uname
 * @param {function} cb  -> {array of 2 elements, string} 
 */
exports.isFollowing = function(loggedinuname, uname, cb) {
	db.serialize( function () {
		db.get('select * from isfollowings where username=? and fusername=?',[loggedinuname,uname],function(err,rows){
			if (rows===undefined) {
				var ret = false;
				cb(ret);
			} else {
				var ret = true;
				cb(ret);
			}
		});
	});
}

// ### *function*: deleteFollower
/**
 * Deletes a following user in the perspective of the loggedinuser.
 *
 * @param {string} loggedinuname
 * @param {string} unametbd
 * @param {function} cb  -> {} 
 */
exports.deleteFollower = function(loggedinuname, unametbd,cb) {
	db.run('delete from isfollowings where username=? and fusername=?',[unametbd,loggedinuname],cb);
}

// ### *function*: unfollow
/**
 * Unfollows a user in the perspective of the loggedinuser.
 *
 * @param {string} loggedinuname
 * @param {string} unametbd
 * @param {function} cb  -> {}
 */
exports.unfollow = function(loggedinuname, unametbd, cb) {
	db.run('delete from isfollowings where username=? and fusername=?',[loggedinuname,unametbd],cb);
}

// ### *function*: follow
/**
 *  Allows a user to follow another.
 *
 * @param {string} loggedinuname
 * @param {string} funame
 * @param {function} cb  -> {} 
 */
exports.follow = function(loggedinuname, funame, cb){
	db.run('insert into isfollowings values (?,?)',[loggedinuname,funame],cb);
}

// ### *function*: getUserInfo
/**
 *  A function that returns the user object.
 *
 * @param {string} username
 * @param {function} cb  -> {user obj} 
 */
exports.getUserInfo = function(username, cb) {
	db.serialize(function(){
		db.get("select * from users where username = ?", [username],function(err, u){
			var user = { uid: u['uid'], 
				username: u['username'], 
				name: u['name'],
				password: u['password'],
				email: u['email'],
				location: u['location'],
				website: u['website'],
				profilepic: u['profilepic'],
				profvis: u['profvis'],
				background: u['background'] 
			};
			cb(user);
		});
	});
}

// ### *function*: searchTweets
/**
 *  A function that searches for hashtags and user mentions of the query..
 *
 * @param {string} username
 * @param {string} number
 * @param {function} cb  -> {array of tweet obj} 
 */
exports.searchTweets = function(query, cb){
	db.serialize(function(){
		db.all("select * from tweets where msg like '%#"+query+"%' or msg like '%@"+query+"%'",function(err, u){
			if(err){
				cb(err);
			}else{
				console.log("1............");
				console.log(u);
			    cb(undefined, u);
			}
		});
	});
}

// ### *function*: searchPeople
/**
 *  A function that searches the user entered in the query.
 *
 * @param {string} query
 * @param {function} cb  -> {array of user obj} 
 */
exports.searchPeople = function(query, cb){
	db.serialize(function(){
		db.all("select * from users where username like '%"+query+"%' or name like '%"+query+"%'",function(err, u){
			if(err){
				cb(err);
			}else{
				console.log("2............");
				console.log(u);
		    	cb(undefined, u);
			}
		});
	});
}

// ### *function*: getTByMention
/**
 *  A function that gets the tweets of the user.
 *
 * @param {string} username
 * @param {string} number
 * @param {function} cb  -> {array of tweet obj} 
 */
exports.getTByMention = function(username, number, cb){
	console.log(username);
	db.all("select t.* from tweets t, mentions m where t.tweetid=m.tweetid and m.atusername=? order by date desc",[username],function(err, u){
		console.log("All MENTIONS!!!!111111");
		console.log(u);
        cb(u);
	});
}
/*
exports.getTByMention = function(username, number, cb){
	console.log(username);
	db.all("select * from tweets where msg like '%@"+username+"%' order by date desc",function(err, u){
		console.log("All MENTIONS!!!!111111");
		console.log(u);
        cb(undefined, u);
	});
}*/

// ### *function*: changeUserSettings
/*
*  Changes user settings or permission for viewing user's profile, mentioning user in tweets and sending user private messages.
*  @param {string} username of logged in user
*  @param {string} profile visibility permission
*/
exports.changeUserSettings = function (username, nprofvis, cb) {
	db.get("select * from users where username = ?", [username], function(err,row) {
		if (err) {
			cb(err);
		} else { 
			var uid = row['uid'];
			if (nprofvis !== undefined) {
				db.run("update users set profvis = ? where uid = ?", [nprofvis,uid], cb);
			}
		}
	});
}

// ### *function*: checkProfilePermission
/*
*  Checks and sets profile permission.
*  If "Public", any user can view profile.
*  If "Followers Only", only followers of this user can view this profile.
*  If "Only Me", only profile owner can view profile.
*  @param {string} username of loggedin user
*  @param {string} username of profile owner
*  @return {boolean} whether logged in user has permission to view profile
*/
exports.checkProfilePermission = function (loggedin, profileowner,cb) {

		db.get("select * from users where username = ?", [profileowner], function (err, p) {
			profperm = p.profvis;	
			if (profperm.match("Public")!==null) {
				var allow = true;
				cb(allow);
			} else if (profperm.match("Followers Only")!==null) {
					db.get("select * from isfollowings where username=? and fusername=?", [loggedin,profileowner], function (err, rows) {
						if (rows===undefined) {
							var allow = false;
							cb(allow);
						} else {
							var allow = true;
							console.log("allow here is " + allow);
							cb(allow);
						}
					});

			} else if (profperm.match("Only Me")!==null) {
				if (loggedin === profileowner) {
					var allow = true;
					cb(allow);
				} else {
					var allow = false;
					cb(allow);
				}
			} else {
				var allow = true;
				cb(allow);
			}
		});

}

// ### *function*: changeUserProfile
/*
*  Changes user profile according to parameters passed. Current password must be entered before information is changed.
*  username, name, email are required fields while location and website are not
*
*  @param {string} username of loggedin user
*  @param {string} username of new name
*  @param {string} username of new username
*  @param {string} username of new email
*  @param {string} username of new location
*  @param {string} username of new website
*  @param {string} username of new password
*  @param {string} username of new password confirmation
*  @param {string} username of current password
*  @return {object} boolean for valid change, loggedin user, error msg
*/
function changeUserProfile(username, nname, nusername, nemail, nlocation, nwebsite, nnewpass, nconfirmnewpass, ncurrentpass, cb) {
	db.get("select * from users where username = ?", [username], function(err,row) {
		if (err) {
			cb(err);
		} else {
			if (ncurrentpass === row['password']) {
				var un = username;
				
				if (nnewpass !== '') {
					if ((nnewpass === nconfirmnewpass) && (nnewpass.length > 6)) {
						db.serialize(function(){
							db.run("update users set password = ? where uid = ?", [nnewpass, row['uid']]);
						});
					} else {
						var validChange = {b: false, uid: row['uid'], username: username, error: 'Changes not saved. New password must be at least 6 characters long. New password must match.'};
						cb(validChange);
					}
				}
				
				if (nname !== '') {
					db.serialize(function(){
						db.run("update users set name = ? where uid = ?", [nname, row['uid']]);
					});
					//use of foreign key will update tweets with update name
				}
				
				if (nusername !== '') {
					db.serialize(function(){
						db.run("update users set username = ? where uid = ?", [nusername, row['uid']]);
						db.run("update isfollowings set username = ? where username = ?", [nusername, username]);
						db.run("update isfollowings set fusername = ? where fusername = ?", [nusername, fusername]);
						
						db.all("select * from mentions where atusername = ?", [username], function(err, tl) {
							for (var i=0; i<tl.length; i++) {
								db.get("select * from tweets where username = ?", [username], function(err, t) {
									var m = t.msg;
									m = m.replace("@"+username,"@"+nusername);
									db.run("update tweets set msg = ? where uid = ?", [m, t.uid]);
								});
							}
						});
						
						db.run("update tweets set username = ? where username = ?", [nusername, username]);
						db.run("update mentions set atusername = ? where username = ?", [atusername, username]);
						
						un = nusername;
					});
					//use of foreign key will update isfollowings, tweets, mentions
				}
				
				if (nemail !== '') {
					db.serialize(function(){
						db.run("update users set email = ? where uid = ?", [nemail, row['uid']]);
					});
				}
				
				//can be empty
				db.serialize(function(){
					db.run("update users set location = ? where uid = ?", [nlocation, row['uid']]);
				});
				db.serialize(function(){
					db.run("update users set website = ? where uid = ?", [nwebsite, row['uid']]);
				});
							
				var validChange = {b: true, uid: row['uid'], username: un, error: ''};
				cb(validChange);				
			} else {
				var validChange = {b: false, uid: row['uid'], username: username, error: 'Changes not saved. Current password must be entered.'};
				cb(validChange);
			}
		}
	});
}
exports.changeUserProfile = changeUserProfile;

// ### *function*: changeprofilepic
/*	Changes profile picture of loggedin user. Does not require password.
*	
*	@param {string} loggedin user's username
*	@param {string} path to profile pic
*/
function changeprofilepic (username, profilepic) {
	db.serialize(function(){
		db.run("update users set profilepic = ? where username = ?", [profilepic, username]);
	});
}
exports.changeprofilepic = changeprofilepic;

// ### *function*: getTweetConvoByTweetID
/*	Returns conversation that tweet belongs to.
*
*	@param {integer} tweet id
*	@return {object} list of tweets, length of list
*/
function getTweetConvoByTweetID(tid, cb) {
	var tweetList = [];
	db.serialize(function() {
		db.get("select * from tweets where tweetid = ?", [tid], function(err, rt) {
			if (rt['convo'] === null) {
				var myReturn = {tc: rt, length: 1};
				cb(myReturn); 
			} else {
				console.log("convo is " + rt['convo']);
				db.serialize(function() {
					db.all("select * from tweets where convo = ? order by date asc", [rt['convo']], function(err, tl) {
						for (var i=0; i<tl.length; i++) {
							tweetList.push(tl[i]);
						}
						var myReturn = {tc: tweetList, length: tl.length};
						cb(myReturn);
					});
				});
			}
		});
	});
}
exports.getTweetConvoByTweetID = getTweetConvoByTweetID;

// ### *function*: getTweetByID
/*	Returns tweet with tweet id.
*
*	@param {integer} tweet id
*	@return {object} tweet
*/
exports.getTweetById = function getTweetById (tweetId, cb) {
	db.get("select * from tweets where tweetid = ?", [tweetId], function(err, t) {
		if (err) {
			cb(err);
		} else {
			cb(t);
		}
	});
}

// ### *function*: deleteTweet
/*	Deletes tweet.
*
*	@param {integer} tweet id
*/
exports.deleteTweet = function deleteTweet(tweetId) {
	db.run("delete from tweets where tweetid = ?", [tweetId]);
}

// ### *function*: getTrendingHT
/*	Returns list of 5 most recent hashtags currently in the database.
*
*	@return {list} list of hashtags
*/
exports.getTrendingHT = function getTrendingHT(cb) {
	var htList = [];
	db.all("select distinct hashtag from hashtags order by tweetid desc", function(err,ht) {
		if (ht.length > 5) {
			var len = 5;
		} else {
			var len = ht.length;
		}
		for (var i=0; i<len; i++) {
			htList.push(ht[i].hashtag);
		}
		cb(htList);
	});
}

exports.getUserInfoById = function(id, cb) {
	db.serialize(function(){
		db.get("select * from users where uid = ?", [id],function(err, u){
			var user = { uid: u['uid'], 
				username: u['username'], 
				name: u['name'],
				password: u['password'],
				email: u['email'],
				location: u['location'],
				website: u['website'],
				profilepic: u['profilepic'],
				profvis: u['profvis'],
				background: u['background'] 
			};
			cb(user);
		});
	});
}

// ### *function*: isF
/**
 *  A function that checks the isfollowings table if the the logged in user 
 *  is following the other user. 
 *
 * @param {string} loggedinuser
 * @param {string} tweeter
 * @param {function} cb  -> {boolean} 
 */
exports.isF = function isF (loggedinuser, tweeter, cb) {
	db.get("select * from isfollowings where username = ? and fusername = ?", [loggedinuser,tweeter], function(err,b) {
		if (b!==null) {
			cb(true);
		} else {
			cb(false);
		}
	});
}
