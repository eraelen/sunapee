var sqlite3 = require('sqlite3');
var async = require('async');
// Connect to the database:
var db = new sqlite3.Database('./data/all.db');

exports.getUserById = function(uname,cb) {
	db.get("select * from users where username=?", [uname], function(err, u){
		//
		cb(u);
	});
}

exports.getFollowing = function(uname, cb) {
	db.all('select fusername from isfollowings where username=?',[uname],function(err, fl){
		console.log(fl);
		var fll=[];
		async.each(fl, function(f){
			fll.push(f.fusername);
		});
		console.log(fll);
	});
}