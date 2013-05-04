var sqlite3 = require('sqlite3');
var async = require('async');
// Connect to the database:
var db = new sqlite3.Database('./data/all.db');

exports.getUserById = function(uname,cb) {
	var user;
	db.get("select * from users where username=?", [uname], function(err, u){
		//
		cb(u);
		//user = u;
		//console.log("u ",user);
	});
	//return user;
}

exports.getFollowing = function(uname, cb) {
	db.all('select fusername from isfollowings where username=?',[uname],function(err, fl){
		//console.log(fl);
		/*var l=[];
		async.each(fl, function(f){
			l.push(f.fusername);
		});*/
		//console.log(l);
		cb(fl);
	});
}

exports.getRecentT = function(uname,cb) {
	db.all('select * from tweets t, (select f.fusername from isfollowings f where f.username = ?) fu where t.username = fu.fusername order by date desc'
		,[uname], function(err, tl){
			//console.log(tl);
			cb(tl);
		});
}

exports.getTNumberById = function(uname) {
	db.get('select count(*) as n from tweets where username=?',[uname],function(err, n){
		console.log(n);
	});
}
//returns array
exports.getUserStats = function(uname,cb) {
	
	db.get('select count(*) as n from tweets where username=?',[uname],function(err, tweetN){
		//console.log(tweetN);
		//stats.push(tweetN.n);
		db.get("select count(*) as n from isfollowings where username=?",[uname], function(err,followingN){
			//console.log(followingN);
			//stats.push(followingN.n-1);
			db.get("select count(*) as n from isfollowings where fusername=?",[uname], function(err,followerN){
				//console.log(followerN);
				//stats.push(followerN.n-1);
				var stats = {tweetN: tweetN.n, followingN: followingN.n-1, followerN: followerN.n-1};
				//console.log("stats: ",stats);
				cb(stats);
			});
		});
	});
}

exports.getUserInfo = function(username, cb) {
	db.get("select * from users where username = ?", [username],function(err, u){
		var user = { uid: u['uid'], 
			username: u['username'], 
			name: u['name'],
			password: u['password'],
			email: u['password'],
			location: u['password'],
			website: u['password'],
			profilepic: u['pr'],
			profvis: u['profvis'],
			background: u['background'] 
		};
		cb(user);
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
function searchPeople (query,cb) {
	var userList = [];
	
	db.get("select * from users where username LIKE %?% and name LIKE %?%", [query,query], function(err, rows) {
		for (var i = 0; i < rows.length; i++) {
			var nuser = {uid: rows['uid'],
				username: rows['username'],
				name: rows['name']
			};
			userList.push(nuser);
		}
	});

	if (userList.length != 0) {
		cb(userList);
	} else {
		cb(null);
	}
}
exports.searchPeople = searchPeople;

function changeUserProfile(username, nname, nusername, nemail, nlocation, nwebsite, nnewpass, nconfirmnewpass, ncurrentpass, req, user) {
	db.get("select * from users where username = ?", [username], function(err,row) {
		if (err) {
			cb(err);
		} else {
			if (ncurrentpass === row['password']) {
				
				if (nnewpass !== '') {
					if ((nnewpass === nconfirmnewpass) && (nnewpass.length > 6)) {
						db.run("update users set password = ? where username = ?", [nnewpass, username], cb);
					} else {
						return {b: false, user: user, error: 'Changes not saved. New password must be at least 6 characters long. New password must match.'};
					}
				}
				
				if (nname !== '') {
					db.run("update users set name = ? where username = ?", [nname, username], cb);
					//use of foreign key will update tweets with update name
				}
				
				if (nusername != '') {
					db.run("update users set username = ? where username = ?", [nusername, username], cb);
					//use of foreign key will update isfollowings, tweets, mentions
				}
				
				if (nemail != '') {
					db.run("update users set email = ? where username = ?", [nemail, username], cb);
				}
				
				//can be empty
				db.run("update users set location = ? where username = ?", [nlocation, username], cb);
				db.run("update users set website = ? where username = ?", [nwebsite, username], cb);
			
				return {b: true, user: user, error: ''};
			} else {
				return {b: false, user: user, error: 'Changes not saved. Current password must be entered.'};
			}
		}
	});
}
exports.changeUserProfile = changeUserProfile;