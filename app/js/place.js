/*global google, ko*/

(function (global) {
  'use strict';
  
  var ICONS = ['bar', 'restaurant', 'bakery', 'gym', 'book_store', 'cafe', 'hair_care'];
  
  function iconExist(type) {
    var i,
      iconsLength = ICONS.length;
    
    for (i = 0; i < iconsLength; i += 1) {
      if (type === ICONS[i]) { return true; }
    }
    
    return false;
  }
  
  function Place(data, ctrl) {
    var self = this;
    
    self.location = data.geometry.location;
    self.title = data.name;
    self.types = data.types;
    self.vicinity = data.vicinity;
    self.ctrl = ctrl;
    self.googleReference = data.reference;
    
    self.errors = ko.observableArray([]);
    
    self.marker = self.createMarker();
  }
  
  Place.prototype = {
    constructor: Place,
    
    setMap: function (map) {
      this.marker.setMap(map);
    },
    
    getIconUrl: function () {
      var i,
        types = this.types,
        typesLength = types.length;
      for (i = 0; i < typesLength; i += 1) {
        if (iconExist(types[i])) {
          return 'img/' + types[i] + '.png';
        }
      }
      
      return 'img/default.png';
    },
    
    createMarker: function () {
      var newMarker = new google.maps.Marker({
        position: this.createPosition(),
        map: null,
        title: this.title,
        icon: {
          url: this.getIconUrl()
        }
      });
      
      google.maps.event.addListener(newMarker, 'click', function () {
        this.ctrl.goToPlace(this);
      }.bind(this));
    
      return newMarker;
    },
    
    createPosition: function () {
      return new google.maps.LatLng(this.location.lat, this.location.lng);
    },
    
    animateMarker: function () {
      this.marker.setAnimation(google.maps.Animation.BOUNCE);
    },
    
    stopAnimatingMarker: function () {
      this.marker.setAnimation(null);
    },
    
    initReviews: function () {
      if (this.reviews === undefined) {
        this.reviews = ko.observableArray([]);
      }
    },
    
    hasReviews: function () {
      return this.reviews && this.reviews().length > 0;
    },
    
    populateReviews: function (api) {
      return api.getPlaceDetails(this);
    },
    
    prepareReviews: function (api) {
      this.initReviews();
      if (!this.hasReviews()) {
        return this.populateReviews(api);
      }
    }
  };
  
  ko.components.register('place', {
    viewModel: {
      createViewModel: function (params, componentInfo) {
        function PlaceViewModel() {
          this.place = params.place;
        }

        return new PlaceViewModel();
      }
    },
    template: { element: 'place.html' }
  });
  
  ko.bindingHandlers.hasHighlightableMarker = {
    init: function (element, valueAccessor) {
      var place = valueAccessor();

      element.addEventListener('mouseenter', place.animateMarker.bind(place));
      element.addEventListener('mouseleave', place.stopAnimatingMarker.bind(place));

      ko.utils.domNodeDisposal.addDisposeCallback(element, place.stopAnimatingMarker.bind(place));
    }
  };
  
  /* expose Place constructor */
  global.Place = Place;
}(this));