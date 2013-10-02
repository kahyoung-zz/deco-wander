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
        controller: ExperienceCtrl,
        link: function(scope, element, attrs){
          //   
        }
   };
 }])

  .directive('itinerary', ['$timeout','$compile', function($timeout, $compile) {
   return {
        restrict: 'E', 
        templateUrl: '/resources/partials/itinerary.html',
        controller: ExperienceCtrl,
        link: function(scope, element, attrs){
          //   
        }
   };
 }])

  .directive('experienceShowcase', ['$timeout','$compile', function($timeout, $compile) {
   return {
        restrict: 'E', 
        templateUrl: '/resources/partials/showcase.html',
        controller: ExperienceCtrl,
        link: function(scope, element, attrs){
          //   
        }
   };
 }])
  
  .directive('angularProcessing', function($compile) {
   return function(scope, iElement, iAttr){
        scope.$processing = new Processing(iElement[0], scope[iAttr.angularProcessing]);

        Hammer(iElement[0]).on("pinch", function(event) {
          event.preventDefault();
          scope.zoom(event.gesture.scale);
        });

        Hammer(iElement[0]).on("doubletap", function(event) {
          event.preventDefault();
        });
        Hammer(iElement[0]).on("touchend", function(event) {
          scope.touchEnd();
        });

        Hammer(iElement)
   };
 });
