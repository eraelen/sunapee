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