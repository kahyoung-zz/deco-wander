'use strict';

/* Controllers */
function WanderCtrl(scope, rootScope, cookies, FB) {
	// FB.init({
	// 		appId      : js_appId,                    // App ID from the app dashboard
	// 		status     : true,                                 // Check Facebook Login status
	// 		xfbml      : true                                  // Look for social plugins on the page
	// 	});
}

function LoginCtrl(scope) {
}


function SketchCtrl(scope, cookies, FB) {
	FB.me(function(response) {
		scope.user = response;
	});

	FB.api(function(response) {

	});

	scope.sketch = function(processing) {
		processing.setup = function() {
			processing.size(window.innerWidth, window.innerHeight);
		};

		processing.draw = function() {
			processing.background(255);
			processing.fill(0);
			processing.ellipse(0, 250, 10, 10);
			processing.textSize(32);
			if(scope.user) processing.text('Hello ' + scope.user.name, 500, 500);
		};
	}
}

WanderCtrl.$inject = ['$scope', '$rootScope', '$cookies', 'Facebook'];
LoginCtrl.$inject = ['$scope'];
SketchCtrl.$inject = ['$scope', '$cookies', 'Facebook'];