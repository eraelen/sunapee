var postNewTweet = function (tweetMsg) {
	$.ajax({
		type: 'POST',
		url: '/newtweet',
		data: {msg: tweetMsg},
		success: function(par) {
			$('#tweetCount').text("Tweets: "+par[1]);
			$('#tweetList').prepend(tweetToHtml(par[0]));
			delTweet();
		}
		}).done(function(msg) {
			console.log("ejs msg ",msg);
		});
};

var postNewTweetConvo = function (tweetMsg) {
	$.ajax({
		type: 'POST',
		url: '/newtweet',
		data: {msg: tweetMsg},
		success: function(par) {
			$('#tweetCount').text("Tweets: "+par[1]);
			$('#tweetList').append(tweetToHtml(par[0]));
			delTweet();
		}
		}).done(function(msg) {
			console.log("ejs msg ",msg);
		});
};

var deleteTweet = function (tweetID) {
	$.ajax({
		type: 'POST',
		url: '/deleteTweet',
		data: {tweetID: tweetID},
		success: function(pair) {
			console.log("pair[0] ",pair[0]);
			$('#t'+pair[0]).remove();
			$('#tweetCount').text("Tweets: "+pair[1]);
		}
		}).done(function(msg) { 
			console.log("ejs msg ",msg); 
		});
};

function newTweet() {
		$('#newtweetSubmit').bind('click',
		function (event) {
			// Get tweet message
			var data = $('textarea').val();  
			postNewTweet(data);

			// Reset input field:
			$('textarea').val("What\'s on your mind?");
			return false;
		});
}

function newTweetConvo() {
		$('#newtweetSubmit').bind('click',
		function (event) {
			// Get tweet message
			var data = $('textarea').val();  
			postNewTweetConvo(data);

			// Reset input field:
			$('textarea').val("What\'s on your mind?");
			return false;
		});
}
	
function delTweet() {
	$('.delT').bind('click',
	function (event) {
		// Get tweet message
		var tweetID = $(this).attr("id");  
		deleteTweet(tweetID);

		return false;
	});
}

