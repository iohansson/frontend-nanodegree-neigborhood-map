(function () {
  'use strict';
  
  ko.components.register('google-map', {
    viewModel: {
      createViewModel: function (params, componentInfo) {
        function MapViewModel(params, elementContainer) {
          this.preload();
          this.elementContainer = elementContainer;
          this.map = new google.maps.Map(elementContainer.querySelector('#map'), {
            center: new google.maps.LatLng(params.center[0], params.center[1]),
            zoom: params.zoom,
            disableDefaultUI: params.disableDefaultUI
          });
          this.places = params.places;
          this.bindMapListeners();
          this.showPlaces(this.places());
        }
        
        MapViewModel.prototype = {
          constructor: MapViewModel,
          
          hidePlaces: function (places) {
            _.forEach(places, function (place) {
              place.setMap(null);
            });
          },
          
          showPlaces: function (places) {
            _.forEach(places, function (place) {
              place.setMap(this.map);
            }, this);
          },
          
          getMap: function () {
            return this.map;
          },
          
          preload: function () {
            this.loading = ko.observable(true);
          },
          
          loadComplete: function () {
            this.loading(false);
          },
          
          animateOnShow: function () {
            $(this.elementContainer).velocity({ translateY: [0, '-100%'] }, { easing: [1000, 20], duration: 500 });
          },
          
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
          
          bindMapLoadListener: function () {
            this.mapLoadListener = this.bindMapListener('tilesloaded', function () {
              this.loadComplete();
              this.animateOnShow();
              this.unbindMapLoadListener();
            });
          },
          
          bindMapListeners: function () {
            this.loadListener = this.bindMapLoadListener();
          },
          
          getDOMNode: function () {
            return this.elementContainer;
          }
        };
        
        var mapViewModel = new MapViewModel(params, componentInfo.element);
        
        mapViewModel.places.subscribe(function (newPlaces) {
          console.dir(newPlaces);
          mapViewModel.showPlaces(newPlaces);
        });
        
        mapViewModel.places.subscribe(function (oldPlaces) {
          mapViewModel.hidePlaces(oldPlaces);
        }, null, 'beforeChange');
        
        $(mapViewModel.getDOMNode()).trigger('map.initialized', { map: mapViewModel.getMap() });
        
        return mapViewModel;
      }
    },
    template: { element: 'google-map.html' }
  });
}());