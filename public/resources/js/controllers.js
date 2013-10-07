'use strict';

/* Controllers */
function WanderCtrl(scope, rootScope, cookies, FB) {
	// FB.init({
	// 		appId      : js_appId,                    // App ID from the app dashboard
	// 		status     : true,                                 // Check Facebook Login status
	// 		xfbml      : true                                  // Look for social plugins on the page
	// 	});
	scope.logout = FB.logout;
}

function LoginCtrl(scope) {
}


function MapCtrl(scope, cookies, location, FB) {
	var map;
	var blurMap;
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
					color: "#F8F8F8",
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
	    minZoom: 3,
	    maxZoom: 6,
	    zoom: 3,
	    center: new google.maps.LatLng(-25.0000, 135.000),
	    styles : mapStyles
	};


	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	blurMap = new google.maps.Map(document.getElementById('blur-map'), mapOptions);
	blurMap.setOptions({draggable: false, zoomControl: false, scrollwheel: false, disableDoubleClickZoom: true});

	function map_recenter(map,latlng,offsetx,offsety) {
	    var point1 = map.getProjection().fromLatLngToPoint(
	        (latlng instanceof google.maps.LatLng) ? latlng : map.getCenter()
	    );
	    var point2 = new google.maps.Point(
	        ( (typeof(offsetx) == 'number' ? offsetx : 0) / Math.pow(2, map.getZoom()) ) || 0,
	        ( (typeof(offsety) == 'number' ? offsety : 0) / Math.pow(2, map.getZoom()) ) || 0
	    );  
	    map.setCenter(map.getProjection().fromPointToLatLng(new google.maps.Point(
	        point1.x - point2.x,
	        point1.y + point2.y
	    )));
	}

	google.maps.event.addListener(blurMap, 'projection_changed', function(){
		map_recenter(blurMap, map.getCenter(), 0, -($('#map-canvas').height()/2 + $('#blur-map').height()/2));
	});

	google.maps.event.addListener(map, 'drag', function(){ 
		map_recenter(blurMap, map.getCenter(), 0, -($('#map-canvas').height()/2 + $('#blur-map').height()/2));
	});

	google.maps.event.addListener(map, 'dragend', function(){ 
		map_recenter(blurMap, map.getCenter(), 0, -($('#map-canvas').height()/2 + $('#blur-map').height()/2));
	});

	google.maps.event.addListener(map, 'center_changed', function(){ 
		map_recenter(blurMap, map.getCenter(), 0, -($('#map-canvas').height()/2 + $('#blur-map').height()/2));
	});

	google.maps.event.addListener(map, 'zoom_changed', function(e){ 
		blurMap.setZoom(map.getZoom());
		map_recenter(blurMap, map.getCenter(), 0, -($('#map-canvas').height()/2 + $('#blur-map').height()/2));
	});



	google.maps.event.addListener(map, 'click', function(e) {
		var geocoderOptions = {
			'latLng' : e.latLng
		}
		geocoder.geocode(geocoderOptions, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if(results[1]) {
					var adminLevel = results[results.length - 2];
					var region = adminLevel.address_components[0].short_name;
					var country = adminLevel.address_components[1].short_name;
					var lat = adminLevel.geometry.location.lb;
					var lon = adminLevel.geometry.location.mb;
					// FB.getPlacesWithExperiencesByCoords(lat, lon, function(response) {
					// 	console.log(response);
					// });
					FB.findPlacesByKeywords([region, country], function(response) {
						scope.$broadcast('load_experiences', response.data);
						scope.$apply();
					});
				} else { 
					console.log('Geocoder: No results found');
				}
			} else {
				console.log('Geocoder has failed because: ' + status);
			}
		});
	});
}

function ExperienceCtrl(scope, rootScope, FB) {
	var regionPaging;
	var places = [];
	scope.iExperiences = [];
	places.indexing = [];
	scope.$on('load_experiences', initStream);

	function indexById(id) {

		for (var i = places.indexing.length - 1; i >= 0; i--) {
			if(places.indexing[i] === id) {
				return i;
			}
		};

		return -1;
	}

	function initStream(event, initPlaces) {
		places = [];
		places.indexing = [];
		scope.showStream = false;
		scope.$apply();
		var callback = null;
		for (var i = initPlaces.length - 1; i >= 0; i--) {
			var index = indexById(initPlaces[i].id);
			if(index != -1) {
				if(!places[index].name) {
					places[index].name = initPlaces[i].name;
				} 
			} else {
				places.push({
					'id' : initPlaces[i].id,
					'name' : initPlaces[i].name,
					'experiences' : []
				});

				places.indexing.push(initPlaces[i].id);
				console.log(initPlaces[i].id);
				getExperiencesByPlace(initPlaces[i].id);
			}
		};
		scope.showStream = true;
		scope.backToMap = backToMap;
		scope.loadExperience = loadExperience;
		scope.getExperiencesByPlace = getExperiencesByPlace;
		scope.getMorePlaces = getMorePlaces;
		scope.places = places;
		scope.$apply();
	}
	function backToMap() {
		places = [];
		places.indexing = [];
		scope.showStream = false;
		scope.$apply;
	}

	function sortExperiences(event, experiences) {
		// Sorts given experiences into categories
		for (var i = experiences.length - 1; i >= 0; i--) {
			var type = undefined;
			switch (experiences[i].name) {
				case 'checkins' :
				break;
				case 'photos' :
					if(!type) type = "photo";
				case 'statuses' :
					if(!type) type = "status";
					for (var j = experiences[i].fql_result_set.length - 1; j >= 0; j--) {
						var experience = experiences[i].fql_result_set[j];
						var index = indexById(experience.place_id);
						experience.type = type;
						if(index != -1) {
							places[index].experiences = places[index].experiences.concat(experience);
						} else {
							places.push({
								'id' : experience.place_id,
								'experiences' : experience
							});
							places.indexing.push(experience.place_id);
						}
					};
					break;
				case 'places' :
					for (var j = experiences[i].fql_result_set.length - 1; j >= 0; j--) {
						var place = experiences[i].fql_result_set[j];
						var index = indexById(place.page_id);
						if(index != -1) {
							if(!places[index].name) places[index].name = place.name;
						} else {
							places.push({
								'id' : place.page_id,
								'name' : place.name,
								'experiences' : []
							});
							places.indexing.push(place.page_id);
						}
					};
				break;
			}
		};
		scope.loadExperience = loadExperience;
		scope.getExperiencesByPlace = getExperiencesByPlace;
		scope.getMorePlaces = getMorePlaces;
		scope.places = places;
		scope.$apply();
	}

	function addNewPlaces(placeArray) {
		var addedPlaces = [];
		for (var i = placeArray.length - 1; i >= 0; i--) {
			if(indexById(placeArray[i].id) == -1) {
				places.indexing.push(placeArray[i].id);
				places.push({
					'id' : placeArray[i].id,
					'name' : placeArray[i].name,
					'experiences' : []
				});
				addedPlaces.push(placeArray[i]);
			}
		};

		return addedPlaces;
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

	function getExperiencesByPlace(id) {
		var index = indexById(id);
		console.log(id);
		if(!places[index].paging) {
			FB.getExperiencesByPlace(id, function(response) {
				places[index].paging = response.paging;
				var sorted = FB.sortExperiencesByType(response.data);

				FB.getExtendedInformation(sorted, function(response){ 
					sortExperiences(null, response);
				});
			});
		} else {
			FB.getNewPage(places[index].paging.next, function(response) {
				places[index].paging = response.paging;
				var sorted = FB.sortExperiencesByType(response.data);

				FB.getExtendedInformation(sorted, function(response) {
					sortExperiences(null, response);
				});
			});
		}
	}

	function getMorePlaces(keywords) {
		if(regionPaging) {
			FB.getNewPage(regionPaging.next + "&q=" + keywords, function(response) { 
				regionPaging = response.paging;
				var addedPlaces = addNewPlaces(response.data);

				for (var i = addedPlaces.length - 1; i >= 0; i--) {
					getExperiencesByPlace(addedPlaces[i].id);
				};
			});
		} else {
			FB.findPlacesByKeywords(keywords, function(response) {
				regionPaging = response.paging;

				var addedPlaces = addNewPlaces(response.data);

				for (var i = addedPlaces.length - 1; i >= 0; i--) {
					getExperiencesByPlace(addedPlaces[i].id);
				};
			});
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
MapCtrl.$inject = ['$scope', '$cookies', '$location', 'Facebook'];
ExperienceCtrl.$inject = ['$scope', '$rootScope', 'Facebook'];