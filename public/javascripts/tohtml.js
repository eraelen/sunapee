// ### *function*: tweetToHtml
/*
* Generate HTML to display tweet which includes
* name, @username(hyperlink to user profile), tweet message, date, and Detail(link to detailedTweet page)
*
* @param t, tweet object
* @return content, converted HTML
*/
function tweetToHtml(t) {
	console.log("went to tweettohtml");
	var content='';
	var a = t.msg.split(" ");
	content += '<div class="tweet" id = "t'+t.tweetid+'" ><b>'+t.name+'</b> <a href="/'+t.username+'/profile"> @'+t.username+'</a>'
		  +'<div class="tmsg">'+msgToHtml(t.msg)+'</div>'
		  + t.date +'<br>'
		  +'<a href="/'+t.tweetid+'/detailedTweet">Detail</a> | ' 
		  +'<a href="/'+t.tweetid+'/simpleReply">Reply</a> | '
		  +'<a href="/">Retweet</a> | '
		  + '<a class="delT" id="'+t.tweetid+'" href=>Delete</a> '
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