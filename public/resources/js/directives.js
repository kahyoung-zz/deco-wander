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

  .directive('experienceShowcase', ['$timeout','$compile', function($timeout, $compile) {
   return {
        restrict: 'E', 
        templateUrl: '/resources/partials/showcase.html',
        link: function(scope, element, attrs){
          //   
        }
   };
 }]);