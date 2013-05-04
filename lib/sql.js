var sqlite3 = require('sqlite3');
var async = require('async');
// Connect to the database:
var db = new sqlite3.Database('./data/all.db');

exports.getUserById = function(uname,cb) {
	db.get("select * from users where username=?", [uname], function(err, u){
		cb(u);
	});
}

exports.getFollowing = function(uname, cb) {
	db.all('select fusername from isfollowings where username=?',[uname],function(err, fl){
		cb(fl);
	});
}

exports.getRecentT = function(uname,cb) {
	db.all('select * from tweets t, (select f.fusername from isfollowings f where f.username = ?) fu where t.username = fu.fusername order by date desc'
		,[uname], function(err, tl){
			    cb(undefined, tl);
		});
}

exports.getTNumberById = function(uname) {
	db.get('select count(*) as n from tweets where username=?',[uname],function(err, n){
		console.log(n);
	});
}

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

exports.addTweet = function(nname, nusername, nmsg, nreply, nretweet,cb) {
	if (nreply !== null) {
		//check if that tweet is already in a convo
		db.get('select convo from tweets t where tweetid=?',[nreply],function(err,convo){
			if (convo !== null) {
				db.serialize(function(){
					db.run('insert into tweets values (null,?,?,datetime("now","localtime"),?,?,?,?)',[nusername,nname,nmsg,nreply,nretweet,convo],cb);
				});
			} else {
				//if not yet in a convo, add new convo
				db.serialize(function(){
					//update convo for old tweet
					db.run('update tweets set convo=? where tweetid=?',[nreply,nreply]);
					db.serialize(function(){
						db.run('insert into tweets values (null,?,?,datetime("now","localtime"),?,?,?,?)',[nusername,nname,nmsg,nreply,nretweet,nreply],cb);
					});
				});
			}
		});
		
	} else {
		//this tweet is not a reply to anything
		db.run('insert into tweets values (null,?,?,datetime("now","localtime"),?,?,?,?)',[nusername,nname,nmsg,nreply,nretweet,null],cb);
	}
}

exports.getUserNT = function(uname,cb) {
	db.get('select * from tweets where username=? order by date desc',[uname],function(err,t){
		cb(t);
	});
}

exports.getFollowerList = function(uname,cb) {
	db.all('select f.username, u.name from isfollowings f, users u where f.fusername=? and f.username != ? and u.username = f.username',
		[uname,uname],function(err,fl){
			cb(fl);
	});
}

exports.getFollowingList = function(uname,cb) {
	db.all('select f.fusername as username, u.name from isfollowings f, users u where f.username=? and f.fusername != ? and u.username = f.fusername',
		[uname,uname],function(err,fl){
			cb(fl);
	});
}

exports.deleteFollower = function(loggedinuname, unametbd,cb) {
	db.run('delete from isfollowings where username=? and fusername=?',[unametbd,loggedinuname],cb);
}

exports.unfollow = function(loggedinuname, unametbd, cb) {
	db.run('delete from isfollowings where username=? and fusername=?',[loggedinuname,unametbd],cb);
}

exports.follow = function(loggedinuname, funame, cb){
	db.run('insert into isfollowings values (?,?)',[loggedinuname,funame],cb);
}


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

exports.searchTweets = function(query, cb){
	db.serialize(function(){
		db.all("select * from tweets where msg like '%#"+query+"%'",function(err, u){
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

exports.searchPeople = function(query, cb){
	db.serialize(function(){
		db.all("select * from users where username like '%"+query+"%'",function(err, u){
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

exports.getTByMention = function(username, number, cb){
	console.log(username);
	db.all("select * from tweets where msg like '%@"+username+"%'",function(err, u){
		console.log("All MENTIONS!!!!111111");
		console.log(u);
        cb(undefined, u);
	});
}

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
function checkProfilePermission(loggedin, profileowner,cb) {
	//MAJOR ASSUMPTION: loggedin and profileowner are both strings i.e. usernames
	var profperm = "Public";
	db.get("select * from userinfo where username = ?" [profileowner], function (err, rows) {
		profperm = rows['profvis'];
	});
	if (profperm === "Followers Only") {
		db.get("select username from isfollowing where fusername = ?", [loggedin], function (err, rows) {
		if (rows.length != 0) {
			cb(true);
		} else {
			cb(false);
		}
		});
	} else if (profperm === "Only Me") {
		if (loggedin === profileowner) {
			cb(true);
		} else {
			cb(false);
		}
	} else {
		cb(true);
	}	
}
exports.checkProfilePermission = checkProfilePermission;

// ### *function*: searchPeople
/*
*  Searches database for users having names and/or usernames matching query string.
*  @param {string} query 
*  @return {object} list of users matching (partial or complete) query or null if none found
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
						var validChange = {b: false, username: username, error: 'Changes not saved. New password must be at least 6 characters long. New password must match.'};
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
							
				var validChange = {b: true, username: un, error: ''};
				cb(validChange);				
			} else {
				var validChange = {b: false, username: username, error: 'Changes not saved. Current password must be entered.'};
				cb(validChange);
			}
		}
	});
}
exports.changeUserProfile = changeUserProfile;

function changeprofilepic (username, profilepic) {
	db.serialize(function(){
		db.run("update users set profilepic = ? where username = ?", [profilepic, username]);
		db.get("select profilepic from users where username = ?", [username], function(err, p) {
			console.log(p);
		});
	});
}
exports.changeprofilepic = changeprofilepic;

function getTweetConvoByTweetID(tid, cb) {
	console.log(tid);
	var tweetList = [];
	db.serialize(function() {
		db.get("select * from tweets where tweetid = ?", [tid], function(err, rt) {
			if (rt === null) {
				cb(null); 
			} else {
				console.log("convo is " + rt['convo']);
				db.serialize(function() {
					db.all("select * from tweets where convo = ? order by date asc", [rt['convo']], function(err, tl) {
						for (var i=0; i<tl.length; i++) {
							tweetList.push(tl);
						}
						console.log("tweetList");
						console.log(tweetList);
						cb(tweetList);
					});
				});
			}
		});
	});
		/*var myConvo = tweetdb[tweetID].convo;
		if (myConvo === null) {
			return null;
		} else {
			var myConvList = conversation[myConvo].convlist;
			var len = myConvList.length;
			for (var i=0; i < len; i++) {
				tweetList.push(tweetdb[myConvList[i]]);
			}
			return tweetList;
		}*/
}
exports.getTweetConvoByTweetID = getTweetConvoByTweetID;

exports.isF = function isF (loggedinuser, tweeter, cb) {
	db.get("select * from isfollowings where username = ? and fusername = ?", [loggedinuser,tweeter], function(err,b) {
		if (b!==null) {
			cb(true);
		} else {
			cb(false);
		}
	});
}


