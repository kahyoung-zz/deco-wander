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
          			FB.login(function(response) {
                  console.log(response);
                });
            	});
           }
       }
  }])
  
  .directive('angularProcessing', function($compile) {
   return function(scope, iElement, iAttr){
        scope.$processing = new Processing(iElement[0], scope[iAttr.angularProcessing]);
   };
 });
