//## Functions

// ### *function*: userToHtml
/*
* Generate HTML to display user list on follower and following page.
* HTML includes name, username (hyperlink to user profile), button
* 
* @param userlist, array of user objects
* @param btntext, text on the button displayed
* @return content, generated HTML
*/

function userToHtml(loggedInUser, user, userlist, redir) {
  var content = '';
  var len = userlist.length-1;
  for (var i=len; i >= 0; i--) {
    var u = getUserById(userlist[i]);
    var btntext;
    if (u.username === loggedInUser.username) { 
      content += '<p><b>'+u.name+'</b> <a href="/'+u.username+'/profile">@'+u.username+'</a></p>';
    } else {
      if (isFollowing(loggedInUser, u)) {
      btntext = "unfollow";
      } else {
        btntext = "follow";
      }
      content += '<b>'+u.name+'</b> <a href="/'+u.username+'/profile">@'+u.username+'</a>';
      content += '<form method="post" id="unfollow" action="/'
              +user.username+'/'+btntext+'/'+u.username+'/'+redir+'">'+
                  '<input type="submit" name="submit" value="'+btntext+'" />'+
                  '</form><br>';
    }
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
    console.log("t "+t);
    console.log("t.username "+t.username);
    //var usr = getUserById(t.username);
    var a = t.msg.split(" ");
    content += '<div id = "newtweet" ><b>'+t.name+'</b> <a href="/'+t.username+'/profile"> @'+t.username+'</a>'
              +'<div class="tmsg">'+msgToHtml(t.msg)+'</div>'
              +new Date(t.date)+'<br>'
              +'<a href="/'+t.id+'/detailedTweet">Detail</a> '
              +'<a href="/'+t.id+'/simpleReply">Reply</a>'
			        +'</div>';
  }
  return content;
}

// ### *function*: tweetToHtml
/*
* Generate HTML to display tweet which includes
* name, @username(hyperlink to user profile), tweet message, date, and Detail(link to detailedTweet page)
*
* @param t, tweet object
* @return content, converted HTML
*/
function tweetToHtml(t) {
	var content='';
	var a = t.msg.split(" ");
	content += '<div id = "newtweet" ><b>'+t.name+'</b> <a href="/'+t.username+'/profile"> @'+t.username+'</a>'
		  +'<div class="tmsg">'+msgToHtml(t.msg)+'</div>'
		  +new Date(t.date)+'<br>'
		  +'<a href="/'+t.id+'/detailedTweet">Detail</a> '
		  +'<a href="/'+t.id+'/simpleReply">Reply</a>'
		  +'</div>';
  return content;
}

// ### *function*: msgToHtml
/**
 * Find @username and #hashtag in a tweet message and convert them to a html href link.
 * In order to be recognized as a @username mention, @ symbol must be the start
 * of a word. And @username@username is considered invalid and is ignored.
 * hashtag starts with # and end before a space. #ford! is considered a hashtag.
 * Note: word starting with @ && cannot have another @, #ford! <- ! in else if statement.
 */
function msgToHtml(msg) {
  msg = msg.split(" ");
  var content = '';
  var len = msg.length;
  for (var i=0; i < len; i++) {
    var word = msg[i];
    if (word.charAt(0) === "@" && word.split("\@").length === 2) {
      content += ' <a href="/'+word.substring(1)+'/profile">'+word+'</a> ';
    } else if (word.charAt(0) === "#" && word.split("\#").length === 2) {
      content += ' <a href="/searchT/'+word.substring(1)+'">'+word+'</a> ';
    } else {
      content += word+" ";
    } 
  }
  return content;
}