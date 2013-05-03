var async = require('async');
var users = require('../lib/users');

// Data access layer for sailors.
var Sequelize = require('sequelize');

var sequelize = new Sequelize('database', 'username', 'password', {
  // sqlite! now!
  dialect: 'sqlite',

  // disable logging to console.log
  logging: false,

  // the storage engine for sqlite
  // - default ':memory:'
  storage: './data/tweets.db'
});


var tweets = sequelize.define('tweets', {
  tweetid: Sequelize.INTEGER,
  username: Sequelize.STRING,
  name: Sequelize.STRING,
  date: Sequelize.DATE,
  msg: Sequelize.STRING,
  reply: Sequelize.STRING,
  retweet: Sequelize.STRING,
  convo: Sequelize.INTEGER
  });
sequelize.sync();

exports.getUserTweets = function (uname, scb) {
    //sequelize.query("SELECT * FROM tweets where username='"+uname+"'").success(scb);
    tweets.findAll({where: {username: uname}}).success(scb);
 }

exports.getRecentT = function(uname, scb) {
	users.getFollowing(uname, function(fl){
		var fl = JSON.parse(fl).push(uname);
		async.each(fl, 
			function(following, cb) {

			},
			function());
		tweets.findAll({where: {username: uname}})
	});

	
}