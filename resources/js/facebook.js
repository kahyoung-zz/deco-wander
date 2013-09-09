var appId = '568077023249265';

window.fbAsyncInit = function() {
	// init the FB JS SDK
	FB.init({
		appId      : appId,                    // App ID from the app dashboard
		status     : true,                                 // Check Facebook Login status
		xfbml      : true                                  // Look for social plugins on the page
	});
	
	var uri = encodeURI('http://localhost:8000/wander');
	FB.getLoginStatus(function(response) {
		if (response.status === 'connected') {
			$.cookie("fbwat", response.authResponse.accessToken);
			
			if(window.location.pathname != "/wander/") {
				window.location.href = uri;
			}
			
			FB.api('/me', function(response) {
				var jsString = response.name;
			});
			
		} else {
			window.location = encodeURI("https://www.facebook.com/dialog/oauth?client_id=" + appId + "&redirect_uri="+uri+"&response_type=token");
		}
	});
};
// Load the SDK asynchronously
(function(d, s, id){
	 var js, fjs = d.getElementsByTagName(s)[0];
	 if (d.getElementById(id)) {return;}
	 js = d.createElement(s); js.id = id;
	 js.src = "//connect.facebook.net/en_US/all.js";
	 fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));