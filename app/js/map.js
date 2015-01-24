/*global ko, google, $, _*/

(function () {
  'use strict';
  
  /* Map component */
  ko.components.register('google-map', {
    viewModel: {
      createViewModel: function (params, componentInfo) {
        function MapViewModel(params, elementContainer) {
          this.preload();
          this.elementContainer = elementContainer;
          /* create new Google Map with params from html component */
          this.map = new google.maps.Map(elementContainer.querySelector('#map'), {
            center: new google.maps.LatLng(params.center[0], params.center[1]),
            zoom: params.zoom,
            disableDefaultUI: params.disableDefaultUI
          });
          /* reference to observable array of places */
          this.places = params.places;
          this.bindMapListeners();
          
          /* show places in case if array is populated before we subscribe on
             observable array */
          this.showPlaces(this.places());
        }
        
        MapViewModel.prototype = {
          constructor: MapViewModel,
          
          /* hide markers */
          hidePlaces: function (places) {
            _.forEach(places, function (place) {
              place.setMap(null);
            });
          },
          
          /* show markers */
          showPlaces: function (places) {
            _.forEach(places, function (place) {
              place.setMap(this.map);
            }, this);
          },
          
          getMap: function () {
            return this.map;
          },
          
          /* preloading */
          preload: function () {
            this.loading = ko.observable(true);
          },
          
          /* map loaded */
          loadComplete: function () {
            this.loading(false);
          },
          
          /* animate map on show */
          animateOnShow: function () {
            $(this.elementContainer).velocity({ translateY: [0, '-100%'] }, { easing: [1000, 20], duration: 500 });
          },
          
          /* bind listener function to map */
          bindMapListener: function (eventName, callback) {
            return google.maps.event.addListener(this.getMap(), eventName, function () {
              callback.call(this);
            }.bind(this));
          },
          
          unbindMapListener: function (listener) {
            google.maps.event.removeListener(listener);
          },
          
          unbindMapLoadListener: function () {
            this.unbindMapListener(this.mapLoadListener);
          },
          
          /* listen for tilesloaded event */
          bindMapLoadListener: function () {
            this.mapLoadListener = this.bindMapListener('tilesloaded', function () {
              /* stop preloading */
              this.loadComplete();
              /* animate map */
              this.animateOnShow();
              /* unbind load listener */
              this.unbindMapLoadListener();
            });
          },
          
          bindMapListeners: function () {
            this.loadListener = this.bindMapLoadListener();
          },
          
          /* get map container DOM element */
          getDOMNode: function () {
            return this.elementContainer;
          }
        };
        
        var mapViewModel = new MapViewModel(params, componentInfo.element);
        
        /* subscribe to observable array of places */
        mapViewModel.places.subscribe(function (newPlaces) {
          mapViewModel.showPlaces(newPlaces);
        });
        
        mapViewModel.places.subscribe(function (oldPlaces) {
          mapViewModel.hidePlaces(oldPlaces);
        }, null, 'beforeChange');
        
        /* notify app that map has been created */
        $(mapViewModel.getDOMNode()).trigger('map.initialized', { map: mapViewModel.getMap() });
        
        return mapViewModel;
      }
    },
    template: { element: 'google-map.html' }
  });
}());