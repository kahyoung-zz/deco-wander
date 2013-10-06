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
          function closeExperience() {
            scope.showcase = null;
            scope.closeExperience = null;
            element.next().removeClass('blur');
            scope.$apply();
          }
          scope.openExperience = function(experience) { 
            element.next().addClass('blur');
            FB.getUser(experience.owner, function(response) {
              console.log(response);
              if(scope.showcase) scope.showcase.user_fullName = response.name;
              console.log(scope.showcase);
              scope.$apply();
            });

            FB.getPlace(experience.place_id, function(response) {
              console.log(response);
              if(scope.showcase) scope.showcase.place_name = response.name;
              console.log(scope.showcase);
              scope.$apply();
            });
            
            scope.showcase = experience;
            scope.closeExperience = closeExperience;
          }
        }
   };
 }]);