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
{id: 5, name: 'Hazel Rozetta', username: "hazel", date: new Date(), msg: "This is just a boring tweet. You got some problem with that?", mention: null, reply: null, retweet: null, hashtag: null, convo:null}
];
exports.tweetdb = tweetdb;

/*
* Fake conversation list.
* id: tweetID for original tweet of the conversation
* convlist: list of tweetID that belongs to this conversation
*/
var conversation = [
{id: 0, convlist: [0,1,2]}
];
exports.conversation = conversation;

/*
* Fake hashtag list
*/
var hashtags = [
{label: "#Ford", tweetID: [0]},
{label: "#ftw", tweetID: [3]},
{label: "#Nutella", tweetID: [4]}
];

var users = require('../users');

// ### *function*: addTweet
/*
* Adds a tweet to tweetdb, and update conversation and hashtags list
* @param inid, tweetId
* @param inname, name
* @param inuser, username
* @param inmsg, tweet message
* @param inrep, tweetId that this tweet replies to, null if none
* @param inret, tweetId that this tweet retweets from, null if none
* @param inconvo, tweetId of original tweet for the conversation, null if none
*/
function addTweetOld(inid, inname, inuser, inmsg, inrep, inret) {
	console.log("in");
	var tweet = {
		id: inid,
		name: inname,
		username: inuser,
		date: new Date(),
		msg: inmsg, 
		mention: inmsg.match(/@\b[\w]*/gi), //only allow underscore in username, returns null if no match
		reply: inrep,
		retweet: inret,
		hashtag: inmsg.match(/#\b[\w]*/gi),
		convo: null}; // #one#two -> #one, #two //changed to null
	tweetdb.push(tweet);
	// add to hashtag
	if (tweet.hashtag !== null) {
		for (var i=0; i < tweet.hashtag.length; i++) {
			updateHashtags(tweet.hashtag[i], id);
		}
	}
	
	var found = false;
	// add to conversation
	if (tweet.reply !== null) {
		for (var i=0; i < conversation.length-1; i++) {
			var cl = conversation[i].convlist;
			if (cl.indexOf(reply) !== -1) {
				conversation[i].convlist.push(tweet.id);
				found = true;
				break;
			}
		}
		if (found === false) {
			//didn't find tweet in any current convo
			conversation[conversation.length] = {id: conversation.length, convlist: [tweet.reply, tweet.id]};
			tweetdb[tweet.convo].convo = conversation.length;
		}
		//for (var i=conversation.length-1; i >= 0; i--) {
		//	if (conversation[i] === tweet.convo) {
		//		tweet.convo.convlist.push(tweet.id);
		//		break;
		//	}
		//}
	}
}
//exports.addTweet = addTweet;

function addTweet (nname, nusername, nmsg, nreply, nretweet) {
	var nid = tweetdb.length;
	//check if replying
	if (nreply !== null) {
		//check if that tweet is already in a convo
		if (tweetdb[nreply].convo !== null) {
			tweetdb.push(createNewTweet(nid, nname, nusername, new Date(), nmsg, nreply, nretweet, tweetdb[nreply].convo));
			conversation[tweetdb[nreply].convo].convlist.push(nid);
		} else {
			//if not yet in a convo, add new convo
			nconvo = conversation.length;
			tweetdb.push(createNewTweet(nid, nname, nusername, new Date(), nmsg, nreply, nretweet, nconvo));
			//update old tweet
			tweetdb[nreply].convo = nconvo;
			conversation.push({id: nconvo, convlist: [nreply, nid]});
			
		}
	} else {
		//this tweet is not a reply to anything
		tweetdb.push(createNewTweet(nid, nname, nusername, new Date(), nmsg, nreply, nretweet, null));
	}
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

// ### *function*:searchTweetsByHT
/**
 * This function searches tweets by hashtag. Used by search functionality.
 * 
 * @param ht - hashtag search keyword, excludes #
 * @returns tweetList - list of tweets if hashtag is found; null if hashtag is not found
*/
function searchTweetsByHT (ht) {
	var tweetList = [];
	var i = 0
	var found = [];
	
	if (len !== 0) {
		//try to look for ht in hashtags 
		while (hashtags[i].label !== ht) {
			i++;
		}
		
		if (hashtags[i].label === ht) {
			found = hashtags[i].tweetID;
			var len = found.length;
			for (var j=0; j<=len-1; j++) {
				tweetList.push(tweetdb[found[j]]);
			}
			console.log(tweetList);
			return tweetList;
		} 
		// return null if no tweets have hashtag ht
		return null;
		
	} else {
		//return null if there are no hashtags in the db
		return null;
	}
}
exports.searchTweetsByHT = searchTweetsByHT;

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