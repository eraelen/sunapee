// # Tweets Module

// ## In Memory Tweet Database
// We will use a simple array `tweetdb` to record user data.
// We could easily replace this with calls to a *database layer*
/*
* Fake tweets database
*/
var tweetdb = [
{id: 0, name: 'Tim Berners-Lee', username: "tim", date: new Date(), msg: "I'm in #Ford !", mention: null, reply: null, retweet: null, hashtag: ["#Ford"], convo:0},
{id: 1, name: 'Hazel Rozetta', username: "hazel", date: new Date(), msg: "@tim Good for you! Let's meet in CC tmr for web programming. @caleb", mention: ["@tim","@caleb"], reply: 0, retweet: null, hashtag: null, convo:0},
{id: 2, name: 'Caleb Marks', username: "caleb", date: new Date(), msg: "@tim @hazel Got it! See you both there!", mention: ["@tim","@hazel"], reply: 1, retweet: null, hashtag: null, convo:0},
{id: 3, name: 'Caleb Marks', username: "caleb", date: new Date(), msg: "Web programming #ftw", mention: null, reply: null, retweet: null, hashtag: ["#ftw"], convo:null},
{id: 4, name: 'Tim Berners-Lee', username: "tim", date: new Date(), msg: "#Nutella is great! Another all nighter!", mention: null, reply: null, retweet: null, hashtag: ["#Nutella"], convo:null},
{id: 5, name: 'Hazel Rozetta', username: "hazel", date: new Date(), msg: "This is just a boring tweet. You got some problem with that?", mention: null, reply: null, retweet: null, hashtag: null, convo:null},
{id: 6, name: 'Eeyore', username: "cheerfuldonkey", date: new Date(), msg: "No one cares about me... #alone", mention: null, reply: null, retweet: null, hashtag: ["#alone"], convo:null},
{id: 7, name: 'Eeyore', username: "cheerfuldonkey", date: new Date(), msg: "I lost my tail again. If it's not a bother, can you please return it to me if you find it? #noquesasked", mention: null, reply: null, retweet: null, hashtag: ["#noquesasked"], convo:1},
{id: 8, name: 'Winnie', username: "thepooh", date: new Date(), msg: "@cheerfuldonkey I don't know anything about your tail but my tummy says it's lunch time.", mention: ["@cheerfuldonkey"], reply: 7, retweet: null, hashtag: null, convo:1},
{id: 9, name: 'Eeyore', username: "cheerfuldonkey", date: new Date(), msg: "@thepooh Doesn't your tummy always say honey time?", mention: ["@thepooh"], reply: 8, retweet: null, hashtag: null, convo:1},
{id: 10, name: 'Winnie', username: "thepooh", date: new Date(), msg: "@cheerfuldonkey Yes, you're right. But I think I should really try #nutella.", mention: ["@cheerfuldonkey"], reply: 9, retweet: null, hashtag: ["#nutella"], convo:1},
{id: 11, name: 'Eeyore', username: "cheerfuldonkey", date: new Date(), msg: "@thepooh You should! It's the best thing that's ever happened to me. #happiness #finally", mention: ["@thepooh"], reply: 10, retweet: null, hashtag: ["#happiness","#finally"], convo:1}
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
	
	// add tweet to user's tweets
	users.addUserT(nusername, nid);
	
	return ntweet;
}

// ### *function*: updateHashtags
/*
* Updates hashtags list
* @param hashtag, hashtag
* @param tweetid, tweetID of tweet that contains this hashtag
*/
function updateHashtags (hashtag, tweetid) {
	for (var i=hashtags.length-1; i >= 0; i--) {
		if (hashtags[i] === hashtag) {
			hashtags[i].tweetID.push(tweetid);
			break;
		}
	}
}

// ### *function*: getTByUser
/*
* Get list of tweets by username
* @param username, username
* @param number, number of most recent tweets requested
* @return tlist, list of tweets requested
*/
function getTByUser(username, number) {
	var len = tweetdb.length;
	var tlist = [];
	for (var i=len-1; i >= 0 && i >= len-number; i--) {
		var t = tweetdb[i];
		if (t.username === username) {
			tlist.push(t);
		}
	}
	return tlist;
}
exports.getTByUser = getTByUser;

function getAllTweetsByUser(username) {
	var len = tweetdb.length;
	var tlist = [];
	for (var i=0; i < tweetdb.length; i++) {
		var t = tweetdb[i];
		if (t.username === username) {
			tlist.push(t);
		}
	}
	return tlist;
}
exports.getAllTweetsByUser = getAllTweetsByUser;


// ### *function*: getTByHashtag
/*
* Get list of tweets by hashtag
* @param hashtag, hashtag
* @param number, number of most recent tweets requested
* @return tlist, list of tweets requested
*/
function getTByHashtag(hashtag, number) {
	var len = hashtags.length;
	var tlist = [];
	for (var i=len-1; i >= 0; i--) {
		var ht = hashtags[i];
		if (ht.label === hashtag) {
			var tl = ht.tweetID;
			var l = tl.length;
			for (var n=l-1; n >= 0 && i >= len-number; n--) {
				tlist.push(tweetdb[tl[n]]);
			}
			break;
		}
	}
	return tlist;
}
exports.getTByHashtag = getTByHashtag;

// ### *function*: getTByMention
/*
* Get list of tweets by mention (tweets that mentions the user, i.e. has @username).
* To display on Interaction page
* @param username, username
* @param number, number of most recent tweets requested
* @return tlist, list of tweets requested
*/
function getTByMention(username, number) {
	var len = tweetdb.length;
	var tlist = [];
	for (var i = len-1; i >= 0 && i >= len-number; i--) {
		if (tweetdb[i].mention !== null && (tweetdb[i].mention).indexOf("@"+username) > -1) {
			tlist.push(tweetdb[i]);
		}
	}
	console.log("mention: "+tlist);
	return tlist;
}
exports.getTByMention = getTByMention;

function getAllTByMention(username) {
	var len = tweetdb.length;
	var tlist = [];
	for (var i = 0; i < len; i++) {
		if (tweetdb[i].mention !== null && (tweetdb[i].mention).indexOf("@"+username) > -1) {
			tlist.push(tweetdb[i]);
		}
	}
	console.log("mention: "+tlist);
	return tlist;
}
exports.getAllTByMention = getAllTByMention;

// ### *function*: getRecentT
/*
* Get most recent tweets from followings, including user's own tweets.
* @param selfname, username of the useritself
* @param following, list of the users the current user is following
* @param number, number of most recent tweets requested
* @return tlist, list of tweets requested
*/
function getRecentT(selfname, following, number) {
	var len = tweetdb.length;
	var tlist = [];
	for (var i = len-1; i >= 0 && i >= len-number; i--) {
		if ((following.indexOf(tweetdb[i].username) > -1 || selfname === tweetdb[i].username)) {
		// if this tweet is from whom the user is following, or from the user itself
			tlist.push(tweetdb[i]);
		}
	}
	return tlist;
}
exports.getRecentT = getRecentT;

// ### *function*: searchTweets
/*
*  Searches database for tweets (message section only) containing query string.
*  @param {string} query 
*  @return {object} list of tweets matching (partial or complete) query or null if none found
*/
function searchTweets (query) {
	var tweetList = [];
	var reQuery = new RegExp(query, "gi");
	
	for (var i=0; i<tweetdb.length; i++) {
		var msg = tweetdb[i].msg;
		if (msg.match(reQuery) !== null) {
			tweetList.push(tweetdb[i]);
		}
	}
	
	if (tweetList.length != 0) {
		return tweetList;
	} else {
		return null;
	}
}
exports.searchTweets = searchTweets;

// ### *function*:getTweetConvoByTweetID
/**
 * This function gets conversation thread given a single tweet in that thread.
 * 
 * @param tweetID - id of the tweet being searched
 * @returns tweetList - list of tweets that has id as one of its members or null if tweet doesn't have replies
*/
function getTweetConvoByTweetID(tweetID) {
	var tweetList = [];
	var myConvo = tweetdb[tweetID].convo;
	if (myConvo === null) {
		return null;
	} else {
		var myConvList = conversation[myConvo].convlist;
		var len = myConvList.length;
		for (var i=0; i < len; i++) {
			tweetList.push(tweetdb[myConvList[i]]);
		}
		return tweetList;
	}
}
exports.getTweetConvoByTweetID = getTweetConvoByTweetID;

function getTweetByTID(tweetID) {
	var len = tweetdb.length;
	for (var i=0; i < len ; i++) {
		var t = tweetdb[i];
		if (t.id === tweetID) {
			return t;
		}
	}
	return null;
}
exports.getTweetByTID = getTweetByTID;

function deleteTweet(username, tweetID) {
	var tweet = getTweetByTID(parseInt(tweetID));
	if (tweet !== null) {
		tweetdb.splice(tweet.id,1);
		users.delUserT(username, tweetID);
	} else {
		console.log("Tweet NOT found.");
	}
}
exports.deleteTweet = deleteTweet;