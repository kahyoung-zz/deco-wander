'use strict';

/* Controllers */
function WanderCtrl(scope, rootScope, cookies, FB) {
	// FB.init({
	// 		appId      : js_appId,                    // App ID from the app dashboard
	// 		status     : true,                                 // Check Facebook Login status
	// 		xfbml      : true                                  // Look for social plugins on the page
	// 	});
	function closeStream() {
		scope.$broadcast('close_stream', true);
	}

	scope.logout = FB.logout;
	scope.login = FB.loginNoPopup;
	scope.closeStream = closeStream;
}

function LoginCtrl(scope) {
	FB.getLoginStatus(function(response) {
		if (response.status === 'connected') {
			window.location = FB.getRedirectURL() + '/#/app';	
		}
	});
}


function MapCtrl(scope, cookies, location, FB) {
	FB.getLoginStatus(function(response) {
		if (response.status != 'connected') {
			window.location = FB.getRedirectURL();
		}
	});
	var map;
	var geocoder = new google.maps.Geocoder();

	var mapStyles = [
		{
			featureType: "water",
			elementType: "labels",
			stylers: [
				{
					visibility: "off",
				}
			]
		},
		{
			featureType: "water",
			stylers: [
				{
					color: "#FFFFFF",
				}
			]
		},
		{
			featureType: "poi",
			stylers: [
				{
					visibility: "off",
				}
			]
		},
		{
			featureType: "road",
			stylers: [
				{
					visibility: "off",
				}
			]
		},
		{
			featureType: "transit",
			stylers: [
				{
					visibility: "off",
				}
			]
		},
		{
			featureType: "landscape",
			stylers: [
				{
					color: "#BBBBBB",
				}
			]
		},
		{
			featureType: "administrative.province",
			elementType: "geometry.stroke",
			stylers: [
				{
					color: "#FDFDFD",
				}
			]
		},
		{
			featureType: "administrative.locality",
			stylers: [
				{
					visibility: "off"
				}
			]
		}

	]
	var mapOptions = {
		panControl: false,
		streetViewControl: false,
		mapTypeControl: false,
	    minZoom: 2,
	    maxZoom: 6,
	    zoom: 2,
	    backgroundColor: '#FFFFFF',
	    center: new google.maps.LatLng(35.0000, 135.000),
	    styles : mapStyles
	};


	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	var overlay = new google.maps.OverlayView();
	overlay.draw = function() {};
	overlay.setMap(map);

	/**
	*
		Depreciated function to recenter a given map - was used to create a mimic map in the banner for blur
	*/
	// function map_recenter(map,latlng,offsetx,offsety) {
	//     var point1 = map.getProjection().fromLatLngToPoint(
	//         (latlng instanceof google.maps.LatLng) ? latlng : map.getCenter()
	//     );
	//     var point2 = new google.maps.Point(
	//         ( (typeof(offsetx) == 'number' ? offsetx : 0) / Math.pow(2, map.getZoom()) ) || 0,
	//         ( (typeof(offsety) == 'number' ? offsety : 0) / Math.pow(2, map.getZoom()) ) || 0
	//     );  
	//     map.setCenter(map.getProjection().fromPointToLatLng(new google.maps.Point(
	//         point1.x - point2.x,
	//         point1.y + point2.y
	//     )));
	// }

	// Set min and max latitudes for the main map
	var minLat = new google.maps.LatLng(-43, -180).lat();
    var maxLat = new google.maps.LatLng(80, 180).lat();

    // Store the last valid center
	var lastValidCenter = map.getCenter();

	/**
	*
		Part of depreciated blur map
	*
	*/
	// google.maps.event.addListener(blurMap, 'projection_changed', function(){
	// 	map_recenter(blurMap, map.getCenter(), 0, -($('#map-canvas').height()/2 + $('#blur-map').height()/2));
	// });

	google.maps.event.addListener(map, 'center_changed', function(){ 
		var currentLat = map.getCenter().lat();
		if (currentLat > minLat && currentLat < maxLat) {
	        // still within valid bounds, so save the last valid position
	        lastValidCenter = map.getCenter();
	        // map_recenter(blurMap, map.getCenter(), 0, -($('#map-canvas').height()/2 + $('#blur-map').height()/2));
	    } else {
	    // not valid anymore => return to last valid position
		    var newCenter = new google.maps.LatLng(lastValidCenter.lat(), map.getCenter().lng());
	    	
	    	map.panTo(newCenter);
    	}
	});

	// google.maps.event.addListener(map, 'zoom_changed', function(e){
	// 	blurMap.setZoom(map.getZoom());
	// 	map_recenter(blurMap, map.getCenter(), 0, -($('#map-canvas').height()/2 + $('#blur-map').height()/2));
	// });


	scope.loadPlacesByPosition = function(x, y) {
		var latLng = overlay.getProjection().fromContainerPixelToLatLng(
		    new google.maps.Point(x, y)
		);

    	var geocoderOptions = {
			'latLng' : latLng
		}

		geocoder.geocode(geocoderOptions, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if(results[1]) {
					var adminLevel = results[results.length - 2];
					var region = adminLevel.address_components[0].short_name;
					var country = adminLevel.address_components[1].short_name;
					var lat = adminLevel.geometry.location.lb;
					var lon = adminLevel.geometry.location.mb;
					FB.getPlacesByLatLngAndKeywords(lat, lon, 'club', function(response) {
						scope.$broadcast('init_region', response);
					});
				} else { 
					console.log('Geocoder: No results found');
				}
			} else {
				console.log('Geocoder has failed because: ' + status);
			}
		});
	};
}

// function ExperienceCtrl(scope, rootScope, FB) {
// 	var regionPaging;
// 	var places = [];
// 	scope.iExperiences = [];
// 	places.indexing = [];
// 	scope.$on('init_region', initRegion);

// 	function indexById(id) {

// 		for (var i = places.indexing.length - 1; i >= 0; i--) {
// 			if(places.indexing[i] === id) {
// 				return i;
// 			}
// 		};

// 		return -1;
// 	}

// 	function initRegion(event, region) {
// 		console.log(region);
// 	}

// 	function initStream(event, initPlaces) {
// 		places = [];
// 		places.indexing = [];
// 		scope.showStream = false;
// 		scope.$apply();
// 		var callback = null;
// 		for (var i = initPlaces.length - 1; i >= 0; i--) {
// 			var index = indexById(initPlaces[i].id);
// 			if(index != -1) {
// 				if(!places[index].name) {
// 					places[index].name = initPlaces[i].name;
// 				} 
// 			} else {
// 				places.push({
// 					'id' : initPlaces[i].id,
// 					'name' : initPlaces[i].name,
// 					'experiences' : []
// 				});

// 				places.indexing.push(initPlaces[i].id);
// 				getExperiencesByPlace(initPlaces[i].id);
// 			}
// 		};
// 		// scope.showStream = true;
// 		// scope.closeStream = closeStream;
// 		// scope.loadExperience = loadExperience;
// 		// scope.getExperiencesByPlace = getExperiencesByPlace;
// 		// scope.getMorePlaces = getMorePlaces;
// 		// scope.places = places;
// 		// scope.$apply();
// 	}
// 	function closeStream() {
// 		places = [];
// 		places.indexing = [];
// 		scope.showStream = false;
// 		scope.$apply;
// 	}

// 	function addToItinerary(place, experience) {
// 		var experienceWithPlace = {};
// 		experienceWithPlace['experience'] = experience;
// 		experienceWithPlace['place'] = {};
// 		experienceWithPlace['place'].id = place.id;
// 		experienceWithPlace['place'].name = place.name;
// 		scope.$broadcast('addToItinerary', experienceWithPlace);
// 	}

// 	function sortExperiences(event, experiences) {
// 		// Sorts given experiences into categories
// 		for (var i = experiences.length - 1; i >= 0; i--) {
// 			var type = undefined;
// 			switch (experiences[i].name) {
// 				case 'checkins' :
// 				break;
// 				case 'photos' :
// 					if(!type) type = "photo";
// 				case 'statuses' :
// 					if(!type) type = "status";
// 					for (var j = experiences[i].fql_result_set.length - 1; j >= 0; j--) {
// 						var experience = experiences[i].fql_result_set[j];
// 						var index = indexById(experience.place_id);
// 						experience.type = type;
// 						if(index != -1) {
// 							places[index].experiences = places[index].experiences.concat(experience);
// 						} else {
// 							places.push({
// 								'id' : experience.place_id,
// 								'experiences' : experience
// 							});
// 							places.indexing.push(experience.place_id);
// 						}
// 					};
// 					break;
// 				case 'places' :
// 					for (var j = experiences[i].fql_result_set.length - 1; j >= 0; j--) {
// 						var place = experiences[i].fql_result_set[j];
// 						var index = indexById(place.page_id);
// 						if(index != -1) {
// 							if(!places[index].name) places[index].name = place.name;
// 						} else {
// 							places.push({
// 								'id' : place.page_id,
// 								'name' : place.name,
// 								'experiences' : []
// 							});
// 							places.indexing.push(place.page_id);
// 						}
// 					};
// 				break;
// 			}
// 		};

// 		scope.showStream = true;
// 		scope.closeStream = closeStream;
// 		scope.loadExperience = loadExperience;
// 		scope.getExperiencesByPlace = getExperiencesByPlace;
// 		scope.getMorePlaces = getMorePlaces;
// 		scope.places = places;
// 		scope.addToItinerary = addToItinerary;
// 		scope.$apply();
// 		// scope.loadExperience = loadExperience;
// 		// scope.getExperiencesByPlace = getExperiencesByPlace;
// 		// scope.getMorePlaces = getMorePlaces;
// 		// scope.places = places;
// 		// scope.$apply();
// 	}

// 	function addNewPlaces(placeArray) {
// 		var addedPlaces = [];
// 		for (var i = placeArray.length - 1; i >= 0; i--) {
// 			if(indexById(placeArray[i].id) == -1) {
// 				places.indexing.push(placeArray[i].id);
// 				places.push({
// 					'id' : placeArray[i].id,
// 					'name' : placeArray[i].name,
// 					'experiences' : []
// 				});
// 				addedPlaces.push(placeArray[i]);
// 			}
// 		};

// 		return addedPlaces;
// 	}

// 	function loadExperience(experience, type) {
// 		// Loads a given experience when shown
// 		scope.showcase = experience;
// 		scope.showcase.type = type;
// 		switch(type) {
// 			case 'checkin' :
// 				loadCheckin(experience);
// 				break;
// 			case 'photo' :
// 				loadPhoto(experience);
// 				break;
// 			case 'status' :
// 				loadStatus(experience);
// 				break;
// 		}
// 	}

// 	function getExperiencesByPlace(id) {
// 		var index = indexById(id);
// 		console.log(id);
// 		if(!places[index].paging) {
// 			FB.getExperiencesByPlace(id, function(response) {
// 				places[index].paging = response.paging;
// 				var sorted = FB.sortExperiencesByType(response.data);

// 				FB.getExtendedInformation(sorted, function(response){ 
// 					sortExperiences(null, response);
// 				});
// 			});
// 		} else {
// 			FB.getNewPage(places[index].paging.next, function(response) {
// 				places[index].paging = response.paging;
// 				var sorted = FB.sortExperiencesByType(response.data);

// 				FB.getExtendedInformation(sorted, function(response) {
// 					sortExperiences(null, response);
// 				});
// 			});
// 		}
// 	}

// 	function getMorePlaces(keywords) {
// 		if(regionPaging) {
// 			FB.getNewPage(regionPaging.next + "&q=" + keywords, function(response) { 
// 				regionPaging = response.paging;
// 				var addedPlaces = addNewPlaces(response.data);

// 				for (var i = addedPlaces.length - 1; i >= 0; i--) {
// 					getExperiencesByPlace(addedPlaces[i].id);
// 				};
// 			});
// 		} else {
// 			FB.findPlacesByKeywords(keywords, function(response) {
// 				regionPaging = response.paging;

// 				var addedPlaces = addNewPlaces(response.data);

// 				for (var i = addedPlaces.length - 1; i >= 0; i--) {
// 					getExperiencesByPlace(addedPlaces[i].id);
// 				};
// 			});
// 		}
// 	}

// 	function loadCheckin(checkin) {
// 		FB.getUser(checkin.author_uid, function(response) {
// 			scope.showcase.author = response;
// 			scope.$apply(scope.showcase);
// 		});
// 	}

// 	function loadPhoto(photo) {
// 		FB.getUser(photo.owner, function(response) {
// 			scope.showcase.author = response;
// 			scope.$apply(scope.showcase);
// 		});
// 	}

// 	function loadStatus(status) {
// 		FB.getUser(status.uid, function(response) {
// 			scope.showcase.author = response;
// 			scope.$apply(scope.showcase);
// 		});
// 	}
// }

function ItineraryCtrl(scope, rootScope, Facebook) {
	scope.$on('itinerary_photo', addToItinerary);
	scope.iplaces = [];
	var indexing = [];

	function addToItinerary(event, place, photo) {
		var index = indexing.indexOf(place.id);
		if(index == -1) {
			var last = indexing.length;
			indexing.push(place.id);

			scope.iplaces[last] = {};
			scope.iplaces[last].place = place;
			scope.iplaces[last].photos = [photo];
		} else {
			// If the photo already exists, then do nothing
			for (var i = scope.iplaces[index].photos.length - 1; i >= 0; i--) {
				if(scope.iplaces[index].photos[i].object_id == photo.object_id) {
					return;
				}
			};

			// Only add the photo if it is completely new
			scope.iplaces[index].photos.push(photo);
		}
	}
}

ItineraryCtrl.$inject = ['$scope', '$rootScope', 'Facebook'];
WanderCtrl.$inject = ['$scope', '$rootScope', '$cookies', 'Facebook'];
LoginCtrl.$inject = ['$scope'];
MapCtrl.$inject = ['$scope', '$cookies', '$location', 'Facebook'];
// ExperienceCtrl.$inject = ['$scope', '$rootScope', 'Facebook'];