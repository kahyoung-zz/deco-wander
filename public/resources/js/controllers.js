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


function SketchCtrl(scope, cookies, location, FB) {
	var onscreenData = [];
	// FB.api('/me?fields=name,hometown,picture,birthday,photos.limit(1)', function(response) {
	// 	scope.user = response;
	// });

	// Runs a search function to return all necessary data about a particular location
	FB.searchLocationByCenter('11.3333', '123.0167', 10000, function(response) {
		for (var i = response.length - 1; i >= 0; i--) {
			scope[response[i].name] = response[i].fql_result_set;
			scope.$apply(scope[response[i].name]);
		};
	});

	scope.sketch = function(processing) {
		var profile_pic;
		var online;

		processing.setup = function() {
			processing.size(window.innerWidth, window.innerHeight);
		};

		processing.draw = function() {
			processing.background(255);
			processing.fill(0);
			processing.textSize(32);
			if(onscreenData.length > 0) {
				for (var i = onscreenData.length - 1; i >= 0; i--) {
					processing.text(onscreenData[i].type + " from " + onscreenData[i].from.name, 100, 100 * i);
				};
			}
			// if(scope.user) {
			// 	if(!scope.user.error) {
			// 		if(scope.user.name) processing.text('Hello ' + scope.user.name, 500, 100);
			// 		if(scope.user.hometown) processing.text('Your hometown is ' + scope.user.hometown.name, 500, 150);
			// 		if(scope.user.birthday) processing.text('Your birthday is ' + scope.user.birthday, 500, 200);
			// 		if(scope.user.picture) processing.text('Heres a photo of you', 500, 250);
			// 		var photo_url = scope.user.photos.data[0].source;
			// 		var profile_pic_url = scope.user.picture.data.url;
			// 		if(online) { 
			// 			processing.image(online, 600, 300);
			// 		} else {
			// 			online = processing.loadImage(photo_url, "jpg");
			// 		}

			// 		if(profile_pic) {
			// 			processing.image(profile_pic, 400, 75);
			// 		} else {
			// 			profile_pic = processing.loadImage(profile_pic_url, "jpg");
			// 		}
			// 	} else {
			// 		processing.text('You need to go back to the root URL of the site', 500, 100);
			// 	}
			// }
		};

		function clickLocation(location) {
			// Show loading screen
			FB.searchLocationByCenter(location['lat'], location['lon'], location['dist'], function(response) {
				onscreenData = onscreenData.concat(response.data);
				// assign paging information
			});
		}

		function getMore(url) {
			// Run get request
		}
	}
}

WanderCtrl.$inject = ['$scope', '$rootScope', '$cookies', 'Facebook'];
LoginCtrl.$inject = ['$scope'];
SketchCtrl.$inject = ['$scope', '$cookies', '$location', 'Facebook'];