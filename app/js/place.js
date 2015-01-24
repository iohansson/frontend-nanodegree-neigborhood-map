/*global google, ko*/

(function (global) {
  'use strict';
  
  /* images that we have for marker icons */
  var ICONS = ['bar', 'restaurant', 'bakery', 'gym', 'book_store', 'cafe', 'hair_care'];
  
  /* checks if image exist for place type */
  function iconExist(type) {
    var i,
      iconsLength = ICONS.length;
    
    for (i = 0; i < iconsLength; i += 1) {
      if (type === ICONS[i]) { return true; }
    }
    
    return false;
  }
  
  /* Place constructor function 
     data - response from Google Places API library
     ctrl - application ViewModel */
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
    
    /* search for appropriate icon for place */
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
    
    /* create marker on map for place */
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
      return this.location;
    },
    
    animateMarker: function () {
      this.marker.setAnimation(google.maps.Animation.BOUNCE);
    },
    
    stopAnimatingMarker: function () {
      this.marker.setAnimation(null);
    },
    
    /* prepare request object for Google Places API library to get place details */
    getDetailsRequest: function () {
      return { reference: this.googleReference };
    }
  };
  
  /* Place component */
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
  
  /* attaches listeners to animate marker on map */
  ko.bindingHandlers.hasHighlightableMarker = {
    init: function (element, valueAccessor) {
      var place = valueAccessor();

      element.addEventListener('mouseenter', place.animateMarker.bind(place));
      element.addEventListener('mouseleave', place.stopAnimatingMarker.bind(place));

      ko.utils.domNodeDisposal.addDisposeCallback(element, place.stopAnimatingMarker.bind(place));
    }
  };
  
  /* Places list component */
  ko.components.register('places-list', {
    viewModel: {
      createViewModel: function (params, componentInfo) {
        function PlacesListViewModel() {
          this.places = params.places;
        }

        return new PlacesListViewModel();
      }
    },
    template: { element: 'places-list.html' }
  });
  
  /* Place reviews component */
  ko.components.register('place-reviews', {
    viewModel: {
      createViewModel: function (params, componentInfo) {
        function PlaceReviewsViewModel() {
          /* api - reference to Google Places API object */
          var api = params.api;

          this.place = params.place;
          this.errors = ko.observableArray([]);
          this.reviews = ko.observableArray([]);
          
          /* get place details */
          api.getDetails(this.place.getDetailsRequest(), this.handleReviews.bind(this));
        }

        PlaceReviewsViewModel.prototype = {
          constructor: PlaceReviewsViewModel,

          handleReviews: function (place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              this.reviews(place.reviews);
            } else {
              this.errors.push('Unable to get reviews');
            }
          }
        };

        return new PlaceReviewsViewModel();
      }
    },
    template: { element: 'place-reviews.html' }
  });
  
  /* expose Place constructor */
  global.Place = Place;
}(this));