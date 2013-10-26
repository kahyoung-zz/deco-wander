'use strict';

/* Directives */


angular.module('WanderApp.directives', ['ngCookies']).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])
  .directive('dragMan', function() {
    return {
      restrict: 'A',
      link: function(scope, elm, attrs) {
        var options = {};
        if(scope.$eval(attrs.dragMan)) options = scope.$eval(attrs.dragMan); //allow options to be passed in
        options.revert = 'invalid';
        options.scroll = false;
        options.revertDuration = 200;
        elm.draggable(options);
      }
    };
  })
  .directive('mapDroppable', function() {
    return {
      restrict: 'A',
      link: function(scope, elm, attrs) {
        var options = scope.$eval(attrs.mapDroppable); //allow options to be passed in
        options.drop = function(event, ui) {
          scope.loadPlacesByPosition(event.pageX, event.pageY - $('.sub-main .top').outerHeight());
          ui.draggable.draggable('option', 'revert', true);
        };
        elm.droppable(options);
      }
    };
  })
  .directive('fbButton',['Facebook', '$cookies', function(FB, $cookies){
  	return {
            restrict: 'E',
            template: '<a href="">Login to Facebook</a>',
            link: function(scope, element, attrs) {
            	element.bind('click', function(e) {
          			FB.login();
            	});
           }
       }
  }])

  .directive('stopEvent', function() {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        element.bind(attr.stopEvent, function(e) {
          e.stopPropagation();
        })
      }
    }
  })

  .directive('experienceStream', ['$timeout','$compile', '$http', 'Facebook', function($timeout, $compile, $http,  FB) {
   return {
        scope: true,
        restrict: 'E', 
        templateUrl: '/resources/partials/experienceStream.html',
        link: function(scope, element, attrs){
          var nextPage;
          var currentPage;
          var loadingPage = false;

          scope.$on('init_region', initRegion);
          scope.$on('close_stream', closeStream);
          scope.$on('load_more_places', loadMorePlaces);

          function initRegion(event, region) {
            scope.places = [];

            if(region.data && region.data.length > 0) {
              var data = region.data;
              addPlacesToRegion(region);
              openStream();
            } else {
              alert('This region has no places!');
            }

            if(region.paging) {
              nextPage = region.paging.next;
            }

            scope.$apply();
          };

          // When given a response, add the places from the response to this scope
          function addPlacesToRegion(response) {
            if(response.data) {
              var data = response.data;
              scope.places = scope.places.concat(data);
              for (var i = data.length - 1; i >= 0; i--) {
                FB.getPhotosFromPlace(data[i].id, function(response) {
                    // Broadcast the response
                    scope.$broadcast('incoming_photos_'+response.place, response);
                });
              }
            }

            if(response.paging && response.paging.next) {
              nextPage = response.paging.next;
            } else {
              nextPage = undefined;
            }
            loadingPage = false;
          }

          function loadMorePlaces() {
            if(!loadingPage && nextPage) {
              loadingPage = true;
              $http.get(nextPage).success(addPlacesToRegion).error(function(response) {
                loadingPage = false;
              });
            }
          }
          function openStream() {
            scope.showStream = true;
            scope.close = closeStream;
          }
          function closeStream() {
            scope.showStream = false;
          }
        }
   };
 }])
  .directive('experienceGallery', ['$timeout','$compile', function($timeout, $compile) {
   return {
        restrict: 'E', 
        templateUrl: '/resources/partials/experienceGallery.html',
        link: function(scope, element, attrs){
          var container = element.find('.experience-gallery');
          // Reset the scroll position when a new place has been initialized
          scope.$on('init_region', function() { container.scrollLeft(0) });
          // Infinite scroll - when horizontal scrollbar reaches specific percent, send an emit to get more places
          container.bind('scroll', function(event) {
            var scrollLeft = container.scrollLeft();
            var scrollWidth = container[0].scrollWidth - container.width();
            if(scrollLeft/scrollWidth > 0.75) {
              scope.$emit('load_more_places', true);
            }
          });
        }
   };
  }])

  .directive('fbPlace', ['Facebook', function(FB) {
    return {
      scope: {
        place : "=fbPlace"
      },
      restrict: 'A',
      link: function(scope, element, attrs) {
        // On new photo event, call handlePhotos function
        scope.photos = [];
        scope.place.loaded = false;
        //Flag on whether or not photos are currently being added;
        var loadingPhotos = false;
        var photoContainer =  element.find('.content-container');

        scope.$on('incoming_photos_'+scope.place.id, handlePhotos);
        photoContainer.bind('scroll', scrollHandler);

        function scrollHandler(event) {
            var scrollTop = photoContainer.scrollTop();
            var scrollHeight = photoContainer[0].scrollHeight - photoContainer.height();
            if(!loadingPhotos && scrollTop/scrollHeight > 0.75) {
              loadingPhotos = true;
              FB.getMorePhotosFromPlace(scope.place.id, scope.photos.length, function(response) {
                handlePhotos(null, response);
              });
            }
        }

        function handlePhotos(event, photos) {
          if(!scope.place.loaded) scope.place.loaded = true;
          // Handles new photos and places it into this scope
          if(photos.data.length > 0) {
            scope.photos = scope.photos.concat(photos.data);
          } else {
            photoContainer.unbind('scroll', scrollHandler);
          }

          scope.$apply();
        }

      }
    }
  }])

  .directive('itinerary', ['$timeout','$compile', function($timeout, $compile) {
   return {
        restrict: 'E', 
        templateUrl: '/resources/partials/itinerary.html',
        controller: ItineraryCtrl,
        link: function(scope, element, attrs){
          //   
        }
   };
 }])

  .directive('itineraryIcon', ['$timeout','$compile', function($timeout, $compile) {
   return {
        restrict: 'E', 
        templateUrl: '/resources/partials/itineraryIcon.html',
        link: function(scope, element, attrs){
          //   
        }
   };
 }])
  .directive('draggablePhoto', function() {
    return {
      restrict: 'A',
      link: function(scope, elm, attrs) {
        var options = {};
        if(scope.$eval(attrs.draggablePhoto)) options = scope.$eval(attrs.dragMan); //allow options to be passed in
        options.revert = 'invalid';
        options.scroll = false;
        options.revertDuration = 200;
        elm.draggable(options).click(function() {
           if ( $(this).is('.ui-draggable-dragging') ) {

                  return;
            }
            scope.openExperience(scope.place, scope.experience);
            // click action here
        });
      }
    };
  })
  .directive('experienceShowcase', ['$timeout','$compile', 'Facebook', function($timeout, $compile, FB) {
   return {
        restrict: 'E', 
        templateUrl: '/resources/partials/showcase.html',
        link: function(scope, element, attrs){
          scope.showcase = {};
          scope.showcase.show = false;
          
          function closeExperience() {
            scope.showcase = {};
            scope.showcase.show = false;
            scope.closeExperience = null;
            element.next().removeClass('blur');
            element.next().next().removeClass('blur');
          }

          scope.openExperience = function(place, experience) { 
            element.next().addClass('blur');
            element.next().next().addClass('blur');
            FB.getUser(experience.owner, function(response) {
              if(scope.showcase){
                scope.showcase.user = {};
                scope.showcase.user.fullName = response.name;
              }
              scope.$apply();
            });

            scope.showcase.show = true;
            scope.showcase.place = place;
            scope.showcase.experience = experience;
            scope.closeExperience = closeExperience;
          }
        }
   };
 }]);