function delFollower(username) {
	$.ajax({
		type: 'POST',
		url: '/deleteFollower',
		data: 'usertbd=' + username,
		success: function(bid) {
			$("li#"+bid).remove();
		}
		}).error(function(msg) {
			console.log("error ",msg);
		});
};



function onUnfollow() {
	$('.unfollow').bind('click',
    function (event) {
		var username = $(this).attr("id");
		unfollow(username);	
		return false;
    });
}

function onFollow() {
	$('.follow').bind('click',
    function (event) {
		var username = $(this).attr("id");
		follow(username);	
		return false;
    });
}

function unfollow(username) {
	$.ajax({
		type: 'POST',
		url: '/unfollow',
		data: {rmusername: username},
		success: function(pair) {
			// change button link and text
			$('#button').html('<button class="follow" id="'+pair[0]+'"> Follow </button>');
			onFollow();
			// change follower number
			$('#followerN').text("Follower: "+pair[1]);
		}
		});
}

function follow(username) {
	$.ajax({
		type: 'POST',
		url: '/follow',
		data: {adduname: username},
		success: function(pair) {
			// change button link and text
			$('#button').html('<button class="unfollow" id="'+pair[0]+'"> Unfollow </button>');
			onUnfollow();
			// change follower number
			$('#followerN').text("Follower: "+pair[1]);
		}
		});
}
