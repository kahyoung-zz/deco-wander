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

  .directive('experienceGallery', ['$timeout','$compile', function($timeout, $compile) {
   return {
        scope: {
          experieces: '='
        },
        restrict: 'E', 
        templateUrl: '/resources/partials/experienceGallery.html',
        controller: ExperienceCtrl,
        link: function(scope, element, attrs){
          //   
        }
   };
 }])
  
  .directive('angularProcessing', function($compile) {
   return function(scope, iElement, iAttr){
        scope.$processing = new Processing(iElement[0], scope[iAttr.angularProcessing]);
   };
 });
