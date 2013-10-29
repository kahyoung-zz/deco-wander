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
        console.log(elm.offset());
        var options = {};

        scope.$on('revert_dragman', revertDragman);
        
        elm.addClass('touch');
        if(scope.$eval(attrs.dragMan)) options = scope.$eval(attrs.dragMan); //allow options to be passed in
        options.revert = 'invalid';
        options.scroll = false;
        options.revertDuration = 200;
        elm.draggable(options);

        function revertDragman(event) {
          elm.animate({top: 0, left: 0}, "fast");
        }
      }
    };
  })
  .directive('mapDroppable', function() {
    return {
      restrict: 'A',
      link: function(scope, elm, attrs) {
        var options = scope.$eval(attrs.mapDroppable); //allow options to be passed in
        options.drop = function(event, ui) {
          scope.loadPlacesByPosition(event.pageX, event.pageY);
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
              scope.$emit('revert_dragman', true);
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
                FB.getFriendsPhotosFromPlace(data[i].id, function(response) {
                  // 337393913034178 is id for place for testing
                  /* 
                    Get friends of photos and determine the following:
                    If there's less than 25 photos
                      Load all the photos, then load 25 from the general photos of the place
                    If there's only 25 photos
                      Load all the photos, then set the next page as the beginning of the general photos
                    If there's more than 25 photos
                      Load all the photos, then set the next page as the next page of friends' photos
                      Continue this until there's no more friends' photos, then start using general photos
                  */
                  var limit = 25;
                  var placeId = response.place;
                  var objects = response.data;
                  var photos = [];

                  // If there are objects, return them and push all the photos to an array
                  if(objects.length > 0 ){
                    for (var j = objects.length - 1; j >= 0; j--) {
                      if(objects[j].type == 'photo') {
                        limit--;
                        //Extract the id out of the photo
                        photos.push(objects[j].id);
                      }
                    };
                  }

                  // Only send the objects and broadcast if there are any photos
                  if(photos.length > 0 ) {
                    FB.getPhotoSourceById(photos, function(response) {
                     scope.$broadcast('incoming_friends_photos_' + placeId,response);
                     scope.$apply();
                    });
                  }

                  FB.getFriendsCheckedIn(placeId, function(response) {
                    // Get amount of friends checked in
                    scope.$broadcast('place_checkins_'+placeId, response);
                    scope.$apply();
                  });
                });

                FB.getPhotosFromPlace(data[i].id, 24, function(response) {
                  // Broadcast the response
                  scope.$broadcast('incoming_photos_'+response.place, response);
                  scope.$apply();
                });
                
                if(response.paging && response.paging.next) {
                  nextPage = response.paging.next;
                } else {
                  nextPage = undefined;
                }
                loadingPage = false;
              }
            }

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
            scope.$emit('revert_dragman', true);
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
        scope.fphotos = [];
        scope.place.loaded = false;
        //Flag on whether or not photos are currently being added;
        var loadingPhotos = false;
        var photoContainer =  element.find('.content-container');

        scope.$on('incoming_photos_'+scope.place.id, handlePhotos);
        scope.$on('incoming_friends_photos_'+scope.place.id, handleFriendsPhotos);
        scope.$on('place_checkins_'+scope.place.id, handleCheckins);
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

        function handleFriendsPhotos(event, photos) {
          handlePhotos(event, photos, true);
        }

        function handlePhotos(event, photos, friends) {
          if(!scope.place.loaded) scope.place.loaded = true;
          // Handles new photos and places it into this scope
          if(photos.data.length > 0) {
            for (var i = photos.data.length - 1; i >= 0; i--) {
              var photo = photos.data[i];
              for (var j = photo.images.length - 1; j >= 0; j--) {
                if(photo.images[j].height >= 150 && photo.images[j].width >= 150) {
                  photo.tile_src = photo.images[j].source;
                  break;
                }
              };
            };

            if(friends) {
              scope.fphotos = scope.fphotos.concat(photos.data);
            } else {
              scope.photos = scope.photos.concat(photos.data);
            }
          } else {
            photoContainer.unbind('scroll', scrollHandler);
          }

          scope.$apply();
        }

        function handleCheckins(event, checkinObject) {
          var checkins = checkinObject.data;
          if(checkins.length > 0) {
            scope.place.checkins = checkins;
            scope.$apply();
          }
        }

      }
    }
  }])
  .directive('itinerary', function() {
    return {
      restrict: 'E',
      controller: 'ItineraryCtrl',
      templateUrl: '/resources/partials/itinerary.html',
      link: function(scope, element, attrs) {
        scope.showItinerary = false;
        scope.openItinerary =  openItinerary;
        function openItinerary() {
          scope.showItinerary = true;
          scope.closeItinerary = closeItinerary;
          scope.$apply();
        }
        function closeItinerary() {
          delete scope.closeItinerary;
          scope.showItinerary = false;
        };
      }
    }
  })
  .directive('itineraryBar', ['$timeout','$compile', function($timeout, $compile) {
   return {
        restrict: 'E', 
        requires: '^itinerary',
        templateUrl: '/resources/partials/itineraryBar.html',
        link: function(scope, element, attrs){
          var options = {};
          options['accept'] = '.experience-gallery .photo-thumb';
          options['over'] = function(event, ui) {
            ui.helper.removeClass('preview');
          };
          options['out'] = function(event, ui) {
            ui.helper.addClass('preview');
          }
          options['drop'] = function(event, ui) {
            var photoScope = ui.draggable.scope();
            scope.$emit('itinerary_photo', photoScope.place, photoScope.photo);
            scope.$apply();
          };
          element.find('.itinerary').droppable(options);   
        }
   };
 }])

  .directive('itineraryIcon', ['$timeout','$compile', function($timeout, $compile) {
   return {
        restrict: 'E', 
        requires: '^itinerary',
        templateUrl: '/resources/partials/itineraryIcon.html',
        link: function(scope, element, attrs){
          if(!element.parents('.showcase-container').length > 0) {
            // Only open the itinerary if the icon isn't in a lightbox
            element.find('.itinerary-icon-container').bind('click', openItinerary);
          }
          function openItinerary() {
            scope.openItinerary();
          }
        }
   };
 }])
  .directive('smallerOnOver', function() {
    return {
      restrict: 'A',
      link: function(scope, elm, attrs) {
        elm.addClass('touch');
        var options = {};
        if(scope.$eval(attrs.smallerOnOver)) options = scope.$eval(attrs.smallerOnOver); //allow options to be passed in
        options['activeClass'] = 'active-drag';
        options['over'] = function(event, ui) {
          ui.helper.removeClass('preview');
        };
        options['out'] = function(event, ui) {
          ui.helper.addClass('preview');
        }
        elm.droppable(options);
      }
    }
  })
  .directive('droppableRemove', function() {
    return {
      restrict: 'A',
      requires: '^itinerary',
      link: function(scope, elm, attrs) {
        elm.addClass('touch');
        var options = {};
        options['accept'] = '.itinerary-lightbox .photo-thumb';
        options['over'] = function(event, ui) {
          ui.helper.addClass('bin-ready');
        };
        options['out'] = function(event, ui) {
          ui.helper.removeClass('bin-ready');
        }
        options['drop'] = function(event, ui) {
          // Remove active drag class from the parent
          $(this).closest('.active-drag').removeClass('active-drag');
          
          var photoElem = ui.helper;
          var index = photoElem.attr('index');
          if (typeof index !== 'undefined' && index !== false) {
            // If the index has been provided, then remove the photo from the place by the given index
            var place = photoElem.scope().place;
            console.log(place.photos);
            place.photos[index].inItinerary = false;
            place.photos.splice(index, 1);
            if(place.photos.length <= 0) {
              // If we just removed the last photo for this place, remove this place
              if(photoElem.scope().$parent) {
                photoElem.scope().$parent.removePlace(place);
              }
            }
            photoElem.scope().$apply();
          }
        };

        elm.droppable(options);
      }
    }
  })
  .directive('draggablePhoto', function() {
    return {
      restrict: 'A',
      link: function(scope, elm, attrs) {
        var options = {};
        scope.$on('get_new_photo_' + scope.photo.object_id, getNewPhoto);
        elm.addClass('touch');
        if(scope.$eval(attrs.draggablePhoto)) options = scope.$eval(attrs.draggablePhoto); //allow options to be passed in
        if(scope.$eval(attrs.index)) scope.photo.$index = scope.$eval(attrs.index);
        options.revert = 'invalid';
        options.scroll = false;
        options.helper = 'clone';
        options.distance = 15;
        options['start'] = function(event, ui) {
          var original = $(event.target);
          original.addClass('moving');
          ui.helper.addClass('preview');
        };
        options['stop'] = function(event, ui) {
          var original = $(event.target);
          original.removeClass('moving');
        };
        options.revertDuration = 200;
        //options.delay = 300;
        elm.draggable(options).click(function() {
            if ( $(this).is('.ui-draggable-dragging') ) {
              return;
            }
            // click action here
            scope.$emit('showcase_init', scope.place, scope.photo);
        });

        function getNewPhoto(event, type) {
          var index = scope.photos.indexOf(scope.photo);
          if(index != -1) {
            // If the index is the last one, reset to the first of this place
            if(type == 'next') {
              if(index < scope.photos.length - 1) {
                index++;
              } else {
                index = 0;
              }
            } else {
              if(index > 0) {
                index--;
              } else {
                index = scope.photos.length - 1;
              }
            }
          } else {
            alert('Photo does not exist');
          }
            
          var newPhoto = scope.photos[index];
          scope.$emit('new_showcase_photo', newPhoto);
          scope.$apply();
        }
      }
    };
  })
  .directive('responseMessage', function() {
    return {
      scope: true,
      restrict: 'E',
      templateUrl: '/resources/partials/responseMessage.html',
      link: function(scope, element, attrs) {
        var container = element.find('.response-message');
        var time = 200;
        var delay = 1500;
        scope.response = {};

        container.hide();

        scope.$on('response_message', handleResponse);

        function openMessage(callback) {
          var width = container.outerWidth();
          if(!container.is(":visible")) {
            container.css('right', '-' + width + 'px');
            container.show();
            container.animate({
              right : 0+"px"
            }, time, callback);
          }
        }

        function closeMessage(callback) {
          var width = container.outerWidth();
          if(container && $(container).is(":visible")) {
            container.animate({
              right : "-"+width+"px"
            }, time, function() {
              container.hide();
              if(callback) callback();
            });
          }
        }
        function handleResponse(event, type, message, autoclose) {
          // If message is visible, close it first
          if(!autoclose) autoclose = false;
          if(type != 'close') {
            if(container.is(":visible")) {
              closeMessage(function() {
                scope.response.type = type;
                scope.response.message = message;
                if(autoclose) {
                  openMessage(closeAfterTime(delay));
                } else {
                  openMessage();
                }
              });
            } else {
              // Just run open function
              scope.response.type = type;
              scope.response.message = message;
              scope.$apply();
              if(autoclose) {
                openMessage(closeAfterTime(delay));
              } else {
                openMessage();
              }
            }
          } else {
            closeMessage();
          }
        }

        function closeAfterTime(time, callback) {
          window.setTimeout(closeMessage, time);
        }
      }
    }
  })
  .directive('photoShowcase', ['$timeout','$compile', 'Facebook', function($timeout, $compile, FB) {
   return {
        restrict: 'E', 
        templateUrl: '/resources/partials/showcase.html',
        link: function(scope, element, attrs){
          scope.showcase = {};
          scope.showcase.show = false;
          scope.$on('showcase_init', initShowcase);
          scope.$on('new_showcase_photo', displayPhoto);
          
          // Bind a swipe event to handle swiping to next/previous photo
          element.swipe({
            swipe : function(event, direction, distance, duration, fingerCount) {
              switch(direction) {
                case 'left':
                  getNewPhoto(scope.showcase.photo.object_id, 'next');
                  break;
                case 'right':
                  getNewPhoto(scope.showcase.photo.object_id, 'prev');
                  break;
              }
            }
          });

          // Bind a 'tap' event to the arrows to go next and previous
          element.find('.showcase-inner .rightarrow').swipe({
            tap : function( event, target) {
              getNewPhoto(scope.showcase.photo.object_id, 'next');
            }
          });

          element.find('.showcase-inner .leftarrow').swipe({
            tap : function( event, target) {
              getNewPhoto(scope.showcase.photo.object_id, 'prev');
            }
          });
          
          // Bind a 'tap' event to the outer container to handle when the user clicks on the outer container rather than swipes
          element.find('.lightbox-outer').swipe({
            tap : function(event, target) {
              closeShowcase();
            }
          });

          scope.addToItinerary = function(place, photo) {
            scope.$emit('itinerary_photo', place, photo);
          };
          function closeShowcase() {
            // Clear the scope, hide the lightbox and remove close showcase functionality
            scope.showcase = {};
            scope.showcase.show = false;
            scope.$apply();
            delete scope.closeShowcase;
            delete scope.getNewPhoto;
            // Remove blur class - depreciated, IE10 does not support blur
            // element.next().removeClass('blur');
            // element.next().next().removeClass('blur');
          }

          function getNewPhoto(photoId, type) {
            scope.$broadcast('get_new_photo_' + photoId, type);
            scope.$apply();
          }

          function displayPhoto(event, photo) {
            FB.getUser(photo.owner, function(response) {
              if(scope.showcase){
                scope.showcase.user = {};
                scope.showcase.user.fullName = response.name;
              }
              scope.$apply();
            });
            scope.showcase.photo = photo;
          }

          function initShowcase(event, place, photo) { 
            // Initiate closing the showcase
            scope.closeShowcase = closeShowcase;
            scope.getNewPhoto = getNewPhoto;

            // Display the photo
            displayPhoto(null, photo);
            scope.showcase.place = place;
            scope.showcase.show = true;
            scope.$apply();

            //Add blur to the elements behind - depreciated, IE10 does not support blur
            // element.next().addClass('blur');
            // element.next().next().addClass('blur');
          }
        }
   };
 }]);