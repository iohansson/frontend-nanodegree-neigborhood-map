/*global _, $*/

/* Depends on LoDash, jQuery */

/* I've written API classes for Google Streetview and Google Places 
   then I figured out that I had to use Places js library instead of plain API 
   so using only Streetview from this module */
(function (global) {
  'use strict';
  
  function ArrayParameter(param) {
    this.param = param;
    this.delimiter = ',';
  }
  
  ArrayParameter.prototype = {
    constructor: ArrayParameter,
    
    toString: function () {
      return this.param.join(this.delimiter);
    }
  };
  
  function GooglePlaceTypes(types) {
    ArrayParameter.call(this, types);
    this.delimiter = '|';
  }
  
  GooglePlaceTypes.prototype = Object.create(ArrayParameter.prototype);
  GooglePlaceTypes.prototype.constructor = GooglePlaceTypes;
  
  function GoogleLocation(location) {
    if (location instanceof google.maps.LatLng) {
      ArrayParameter.call(this, [location.lat(), location.lng()]);
    } else {
      ArrayParameter.call(this, location);
    }
  }
  
  GoogleLocation.prototype = Object.create(ArrayParameter.prototype);
  GoogleLocation.prototype.constructor = GoogleLocation;
  
  function GoogleMapsAPI(options) {
    var defaults = {
      format: 'json'
    };
    this.BASE_URL = 'https://maps.googleapis.com/maps/api';
    this.options = _.assign(defaults, this.buildOptions(options));
  }
  
  GoogleMapsAPI.prototype = {
    constructor: GoogleMapsAPI,
    
    buildOptions: function (options) {
      var PARAM_MAP = {
        'location': GoogleLocation,
        'types': GooglePlaceTypes
      };
      
      return _.mapValues(options, function (option, optionName) {
        if (PARAM_MAP.hasOwnProperty(optionName)) {
          return new PARAM_MAP[optionName](option);
        } else {
          return option;
        }
      });
    },
    
    buildParamString: function (paramValue, paramName) {
      return paramName + '=' + paramValue.toString();
    },
    
    buildParamsString: function (params) {
      return '?' + _.map(params, this.buildParamString, this).join('&');
    },
    
    buildQuery: function (apiMethod, params) {
      return _.compact([this.BASE_URL, apiMethod, params.format]).join('/') +
        this.buildParamsString(params);
    },
    
    ajaxCall: function (url) {
      return $.getJSON(url);
    },
    
    setLocation: function (location) {
      this.options.location = new GoogleLocation(location);
    }
  };
  
  function GooglePlaces(placeOptions) {
    var options = _.assign({}, placeOptions);
    GoogleMapsAPI.call(this, options);
    this.BASE_URL += '/place';
  }
  
  GooglePlaces.prototype = Object.create(GoogleMapsAPI.prototype);
  _.assign(GooglePlaces.prototype, {
    constructor: GooglePlaces,
    
    nearbySearch: function () {
      var params = this.options;
      return this.ajaxCall(this.buildQuery('nearbysearch', params));
    },
    
    getPlaceDetails: function (place) {
      var params = _.assign({ reference: place.googleReference }, this.options);
      return this.ajaxCall(this.buildQuery('details', params));
    }
  });
  
  /* Google Street View API*/
  function StreetView() {
    var defaults = {
      size: '600x200',
      sensor: false,
      format: 'streetview'
    };
    GoogleMapsAPI.call(this, defaults);
  }
  
  StreetView.prototype = Object.create(GoogleMapsAPI.prototype);
  _.assign(StreetView.prototype, {
    constructor: StreetView,
    
    /* get image for place */
    getImageUrlFor: function (place) {
      this.setLocation(place.location);
      return this.buildQuery('', this.options);
    }
  });
  
  global.StreetView = StreetView;
  global.GooglePlaces = GooglePlaces;
}(this));