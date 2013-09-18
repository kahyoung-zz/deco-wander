window.fbAsyncInit = function() {
	// init the FB JS SDK
	
	
	var uri = encodeURI('http://localhost:5000/wander');
	$(".facebook-login").click(function() {
		FB.getLoginStatus(function(response){
			if(response.status === 'connected') {
				$.cookie(response.authResponse.userID, response.authResponse.accessToken);
				$.cookie("wauserId", response.authResponse.userID);
				window.location.href = '/wander';
			} else {
				FB.login(function(response) {
					if(response.authResponse) {
						$.cookie(response.authResponse.userID, response.authResponse.accessToken);
						$.cookie("wauserId", response.authResponse.userID);
						window.location.href = '/wander';
					}
				}, {scope: 'user_about_me,user_birthday,user_checkins,user_events,user_hometown,user_interests,user_location,user_relationships,user_status,user_subscriptions,friends_about_me,friends_birthday,friends_checkins,friends_events,friends_hometown,friends_interests,friends_location,friends_relationships	,friends_status,friends_subscriptions'});
			}
		});
	});
};