'use strict';

/* Controllers */
function WanderCtrl($scope, $rootScope, $cookies, FB) {
	// FB.init({
	// 		appId      : js_appId,                    // App ID from the app dashboard
	// 		status     : true,                                 // Check Facebook Login status
	// 		xfbml      : true                                  // Look for social plugins on the page
	// 	});
}

function LoginCtrl($scope) {
}


function SketchCtrl($scope, $cookies, FB) {
	FB.me(function(response) {
		console.log(response);
	});
	$scope.sketch = function(processing) {
		processing.setup = function() {
			processing.size(window.innerWidth, window.innerHeight);
		};

		processing.draw = function() {
			processing.ellipse(0, 250, 10, 10);
		};
	}
}

WanderCtrl.$inject = ['$scope', '$rootScope', '$cookies', 'Facebook'];
LoginCtrl.$inject = ['$scope'];
SketchCtrl.$inject = ['$scope', '$cookies', 'Facebook'];