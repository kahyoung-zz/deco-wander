'use strict';

/* Directives */


angular.module('WanderApp.directives', ['ngCookies']).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])

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
  .directive('experienceStream', ['$timeout','$compile', function($timeout, $compile) {
   return {
        restrict: 'E', 
        templateUrl: '/resources/partials/experienceStream.html',
        controller: 'ExperienceCtrl',
        link: function(scope, element, attrs){
          //   
        }
   };
 }])
  .directive('experienceGallery', ['$timeout','$compile', function($timeout, $compile) {
   return {
        restrict: 'E', 
        templateUrl: '/resources/partials/experienceGallery.html',
        link: function(scope, element, attrs){
          //   
        }
   };
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

  .directive('experienceShowcase', ['$timeout','$compile', 'Facebook', function($timeout, $compile, FB) {
   return {
        restrict: 'E', 
        templateUrl: '/resources/partials/showcase.html',
        controller: ExperienceCtrl,
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