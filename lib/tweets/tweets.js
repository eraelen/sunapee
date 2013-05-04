var async = require('async');
//var users = require('../lib/users');

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
			function(f){});
		tweets.findAll({where: {username: uname}})
	});

<<<<<<< HEAD
// ## In Memory Tweet Database
// We will use a simple array `tweetdb` to record user data.
// We could easily replace this with calls to a *database layer*
/*
* Fake tweets database
*/
var tweetdb = [
{id: 0, name: 'Tim Berners-Lee', username: "tim", date: new Date("March 13, 2013 20:56:03"), msg: "I'm in #Ford !", mention: null, reply: null, retweet: null, hashtag: ["#Ford"], convo:0},
{id: 1, name: 'Hazel Rozetta', username: "hazel", date: new Date("March 13, 2013 21:35:00"), msg: "@tim Good for you! Let's meet in CC tmr for web programming. @caleb", mention: ["@tim","@caleb"], reply: 0, retweet: null, hashtag: null, convo:0},
{id: 2, name: 'Caleb Marks', username: "caleb", date: new Date("March 13, 2013 21:50:45"), msg: "@tim @hazel Got it! See you both there!", mention: ["@tim","@hazel"], reply: 1, retweet: null, hashtag: null, convo:0},
{id: 3, name: 'Caleb Marks', username: "caleb", date: new Date("March 14, 2013 10:00:00"), msg: "Web programming #ftw", mention: null, reply: null, retweet: null, hashtag: ["#ftw"], convo:null},
{id: 4, name: 'Tim Berners-Lee', username: "tim", date: new Date("March 15, 2013 23:59:59"), msg: "#Nutella is great! Another all nighter!", mention: null, reply: null, retweet: null, hashtag: ["#Nutella"], convo:null},
{id: 5, name: 'Hazel Rozetta', username: "hazel", date: new Date("March 18, 2013 13:29:45"), msg: "This is just a boring tweet. You got some problem with that?", mention: null, reply: null, retweet: null, hashtag: null, convo:null},
{id: 6, name: 'Eeyore', username: "cheerfuldonkey", date: new Date("April 13, 2013 13:13:13"), msg: "No one cares about me... #alone", mention: null, reply: null, retweet: null, hashtag: ["#alone"], convo:null},
{id: 7, name: 'Eeyore', username: "cheerfuldonkey", date: new Date("April 16, 2013 12:12:12"), msg: "I lost my tail again. If it's not a bother, can you please return it to me if you find it? #noquesasked", mention: null, reply: null, retweet: null, hashtag: ["#noquesasked"], convo:1},
{id: 8, name: 'Winnie', username: "thepooh", date: new Date("April 16, 2013 12:16:16"), msg: "@cheerfuldonkey I don't know anything about your tail but my tummy says it's lunch time.", mention: ["@cheerfuldonkey"], reply: 7, retweet: null, hashtag: null, convo:1},
{id: 9, name: 'Eeyore', username: "cheerfuldonkey", date: new Date("April 16, 2013 12:18:18"), msg: "@thepooh Doesn't your tummy always say honey time?", mention: ["@thepooh"], reply: 8, retweet: null, hashtag: null, convo:1},
{id: 10, name: 'Winnie', username: "thepooh", date: new Date("April 16, 2013 12:20:12"), msg: "@cheerfuldonkey Yes, you're right. But I think I should really try #nutella.", mention: ["@cheerfuldonkey"], reply: 9, retweet: null, hashtag: ["#nutella"], convo:1},
{id: 11, name: 'Eeyore', username: "cheerfuldonkey", date: new Date("April 16, 2013 12:25:32"), msg: "@thepooh You should! It's the best thing that's ever happened to me. #happiness #finally", mention: ["@thepooh"], reply: 10, retweet: null, hashtag: ["#happiness","#finally"], convo:1}
];
exports.tweetdb = tweetdb;

/*
* Fake conversation list.
* id: tweetID for original tweet of the conversation
* convlist: list of tweetID that belongs to this conversation
*/
var conversation = [
{id: 0, convlist: [0,1,2]},
{id: 1, convlist: [7,8,9,10,11]}
];
exports.conversation = conversation;

/*
* Fake hashtag list
*/
var hashtags = [
{label: "#Ford", tweetID: [0]},
{label: "#ftw", tweetID: [3]},
{label: "#Nutella", tweetID: [4]},
{label: "#alone", tweetID: [6]},
{label: "#noquesasked", tweetID: [7]},
{label: "#nutella", tweetID: [10]},
{label: "#happiness", tweetID: [11]},
{label: "#finally", tweetID: [11]}
];

var users = require('../users');

// ### *function*: addTweet
/*
* Adds a tweet to tweetdb, and update conversation and hashtags list
* @param nname, name
* @param nusername, username
* @param nmsg, tweet message
* @param nreply, tweetId that this tweet replies to, null if none
* @param nretweet, tweetId that this tweet retweets from, null if none
*/
function addTweet (nname, nusername, nmsg, nreply, nretweet) {
	var nid = tweetdb.length;
	var ntweet;
	//check if replying
	if (nreply !== null) {
		//check if that tweet is already in a convo
		if (tweetdb[nreply].convo !== null) {
			ntweet = createNewTweet(nid, nname, nusername, new Date(), nmsg, nreply, nretweet, tweetdb[nreply].convo);
			tweetdb.push(ntweet);
			conversation[tweetdb[nreply].convo].convlist.push(nid);
		} else {
			//if not yet in a convo, add new convo
			nconvo = conversation.length;
			ntweet = createNewTweet(nid, nname, nusername, new Date(), nmsg, nreply, nretweet, nconvo);
			tweetdb.push(ntweet);
			//update old tweet
			tweetdb[nreply].convo = nconvo;
			conversation.push({id: nconvo, convlist: [nreply, nid]});
			
		}
	} else {
		//this tweet is not a reply to anything
		ntweet = createNewTweet(nid, nname, nusername, new Date(), nmsg, nreply, nretweet, null);
		tweetdb.push(ntweet);
	}
	return ntweet;
}
exports.addTweet = addTweet;

function createNewTweet (nid, nname, nusername, ndate, nmsg, nreply, nretweet, nconvo) {
	var ntweet = {id: nid,
					name: nname,
					username: nusername,
					date: ndate,
					msg: nmsg,
					mention: nmsg.match(/@\b[\w]*/gi),
					reply: nreply,
					retweet: null,
					hashtag: nmsg.match(/#\b[\w]*/gi),
					convo: nconvo};
	
	// add any hashtag
	if (ntweet.hashtag !== null) {
		for (var i=0; i < ntweet.hashtag.length; i++) {
			updateHashtags(ntweet.hashtag[i], nid);
		}
	}
=======
>>>>>>> origin/p5-db
	
}
