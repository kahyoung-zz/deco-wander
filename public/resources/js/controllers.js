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
	var scale = 1;
	var prevScale = 1;
	var tranX = window.innerWidth/2;
	var tranY = window.innerHeight/2;
	// FB.api('/me?fields=name,hometown,picture,birthday,photos.limit(1)', function(response) {
	// 	scope.user = response;
	// });

	// Runs a search function to return all necessary data about a particular location
	FB.searchLocationByCenter('-33.8600', '151.2111', 100000, function(response) {
		scope.$broadcast('load_experiences', response);
	});

	scope.sketch = function(processing) {
		var profile_pic;
		var online;

		processing.setup = function() {
			processing.size(window.innerWidth, window.innerHeight);
		};

		processing.draw = function() {
			processing.translate(tranX, tranY);
			processing.scale(scale);
			processing.background(255);
			processing.fill(0);
			processing.ellipse(0, 0, 100, 100);
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

	scope.zoom = function(touch_scale) {
		scale *= (touch_scale/prevScale);
		prevScale = touch_scale;
	}

	scope.touchEnd = function() {
		prevScale = 1;
	}
}

function ExperienceCtrl(scope, rootScope, FB) {
	scope.$on('load_experiences', sortExperiences);

	function sortExperiences(event, experiences) {
		// Sorts given experiences into categories
		for (var i = experiences.length - 1; i >= 0; i--) {
			scope[experiences[i].name] = experiences[i].fql_result_set;
			scope.$apply(scope[experiences[i].name]);
		};

		scope.loadExperience = loadExperience;
		scope.$apply(loadExperience);
	}

	function loadExperience(experience, type) {
		// Loads a given experience when shown
		scope.showcase = experience;
		scope.showcase.type = type;
		switch(type) {
			case 'checkin' :
				loadCheckin(experience);
				break;
			case 'photo' :
				loadPhoto(experience);
				break;
			case 'status' :
				loadStatus(experience);
				break;
		}
	}

	function loadCheckin(checkin) {
		FB.getUser(checkin.author_uid, function(response) {
			scope.showcase.author = response;
			scope.$apply(scope.showcase);
		});
	}

	function loadPhoto(photo) {
		FB.getUser(photo.owner, function(response) {
			scope.showcase.author = response;
			scope.$apply(scope.showcase);
		});
	}

	function loadStatus(status) {
		FB.getUser(status.uid, function(response) {
			scope.showcase.author = response;
			scope.$apply(scope.showcase);
		});
	}
}

WanderCtrl.$inject = ['$scope', '$rootScope', '$cookies', 'Facebook'];
LoginCtrl.$inject = ['$scope'];
SketchCtrl.$inject = ['$scope', '$cookies', '$location', 'Facebook'];
ExperienceCtrl.$inject = ['$scope', '$rootScope', 'Facebook'];