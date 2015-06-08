/* jshint ignore:start */

/* jshint ignore:end */

define('front/adapters/application', ['exports', 'ember-tumblr-data'], function (exports, ETD) {

  'use strict';

  var ApplicationAdapter;

  ApplicationAdapter = ETD['default'].TumblrAdapter.extend({
    apiKey: 'NWuLW6BklHitWoKijif1DlLKUAd2fP8WbhPuNJKBhBGQTaaNfj',
    namespace: 'v2/blog/mlrecycling.tumblr.com'
  });

  exports['default'] = ApplicationAdapter;

});
define('front/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'front/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

  var App;

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    Resolver: Resolver['default']
  });

  loadInitializers['default'](App, config['default'].modulePrefix);

  exports['default'] = App;

});
define('front/components/actionable-collapsible', ['exports', 'ember-cli-materialize/components/md-collapsible'], function (exports, MdCollapsibleComponent) {

  'use strict';

  var Comp;

  Comp = MdCollapsibleComponent['default'].extend({
    accordion: true,
    didInsertElement: function didInsertElement() {
      this._super.apply(this, arguments);
      return this.$().on("click", this.interacted.bind(this));
    },
    willDestroyElement: function willDestroyElement() {
      this._super.apply(this, arguments);
      return this.$().off("click");
    },
    interacted: function interacted() {
      return this.sendAction("action", this.get("payload"));
    }
  });

  exports['default'] = Comp;

});
define('front/components/ember-modal-dialog-positioned-container', ['exports', 'ember-modal-dialog/components/positioned-container'], function (exports, Component) {

	'use strict';

	exports['default'] = Component['default'];

});
define('front/components/ember-wormhole', ['exports', 'ember-wormhole/components/ember-wormhole'], function (exports, Component) {

	'use strict';

	exports['default'] = Component['default'];

});
define('front/components/google-map', ['exports', 'ember', 'ember-google-map/core/helpers', 'ember-google-map/mixins/google-object'], function (exports, Ember, helpers, GoogleObjectMixin) {

  'use strict';

  /* globals google */
  var computed = Ember['default'].computed;
  var oneWay = computed.oneWay;
  var on = Ember['default'].on;
  var observer = Ember['default'].observer;
  var fmt = Ember['default'].String.fmt;
  var forEach = Ember['default'].EnumerableUtils.forEach;
  var getProperties = Ember['default'].getProperties;
  var $get = Ember['default'].get;
  var dummyCircle;

  var VALID_FIT_BOUND_TYPES = ['markers', 'infoWindows', 'circles', 'polylines', 'polygons'];

  function getDummyCircle(center, radius) {
    if (radius == null) {
      radius = $get(center, 'radius');
    }
    if (!(center instanceof google.maps.LatLng)) {
      center = helpers['default']._latLngToGoogle(center);
    }
    if (dummyCircle) {
      dummyCircle.setCenter(center);
      dummyCircle.setRadius(radius);
    } else {
      dummyCircle = new google.maps.Circle({ center: center, radius: radius });
    }
    return dummyCircle;
  }

  function collectCoordsOf(type, array, items) {
    if (['markers', 'infoWindows'].indexOf(type) !== -1) {
      // handle simple types
      return array.reduce(function (previous, item) {
        var coords = getProperties(item, 'lat', 'lng');
        if (coords.lat != null && coords.lng != null) {
          previous.push(coords);
        }
        return previous;
      }, items || []);
    } else if (type === 'circles') {
      // handle circles
      return array.reduce(function (previous, item) {
        var opt = getProperties(item, 'lat', 'lng', 'radius'),
            bounds;
        if (opt.lat != null && opt.lng != null && opt.radius != null) {
          bounds = getDummyCircle(opt).getBounds();
          previous.push(helpers['default']._latLngFromGoogle(bounds.getNorthEast()));
          previous.push(helpers['default']._latLngFromGoogle(bounds.getSouthWest()));
        }
        return previous;
      }, items || []);
    } else if (['polylines', 'polygons']) {
      // handle complex types
      return array.reduce(function (previous, item) {
        return $get(item, '_path').reduce(function (previous, item) {
          var coords = getProperties(item, 'lat', 'lng');
          if (coords.lat != null && coords.lng != null) {
            previous.push(coords);
          }
          return previous;
        }, items || []);
      }, items || []);
    }
  }

  function obj(o) {
    return Ember['default'].Object.create(o);
  }

  var MAP_TYPES = Ember['default'].A([obj({ id: 'road', label: 'road' }), obj({ id: 'satellite', label: 'satellite' }), obj({ id: 'terrain', label: 'terrain' }), obj({ id: 'hybrid', label: 'hybrid' })]);

  var PLACE_TYPES = Ember['default'].A([obj({ id: helpers['default'].PLACE_TYPE_ADDRESS, label: 'address' }), obj({ id: helpers['default'].PLACE_TYPE_LOCALITY, label: 'locality' }), obj({ id: helpers['default'].PLACE_TYPE_ADMIN_REGION, label: 'administrative region' }), obj({ id: helpers['default'].PLACE_TYPE_BUSINESS, label: 'business' })]);

  exports['default'] = Ember['default'].Component.extend(GoogleObjectMixin['default'], {
    googleFQCN: 'google.maps.Map',

    classNames: ['google-map'],

    /**
     * Defines all properties bound to the google map object
     * @property googleProperties
     * @type {Object}
     */
    googleProperties: {
      zoom: { event: 'zoom_changed', cast: helpers['default'].cast.integer },
      type: {
        name: 'mapTypeId',
        event: 'maptypeid_changed',
        toGoogle: helpers['default']._typeToGoogle,
        fromGoogle: helpers['default']._typeFromGoogle
      },
      'lat,lng': {
        name: 'center',
        event: 'center_changed',
        toGoogle: helpers['default']._latLngToGoogle,
        fromGoogle: helpers['default']._latLngFromGoogle
      }
      /**
       * available options (prepend with `gopt_` to use):
       * `backgroundColor`, `disableDefaultUI`, `disableDoubleClickZoom`, `draggable`, `keyboardShortcuts`,
       * `mapTypeControl`, `maxZoom`, `minZoom`, `overviewMapControl`, `panControl`, `rotateControl`, `scaleControl`,
       * `scrollwheel`, `streetViewControl`, `zoomControl`
       */
    },

    /**
     * @inheritDoc
     */
    googleEvents: {},

    /**
     * Our google map object
     * @property googleObject
     * @type {google.maps.Map}
     * @private
     */
    googleObject: null,

    /**
     * Always auto-fit bounds
     * @property alwaysAutoFitBounds
     * @type {boolean}
     */
    alwaysAutoFitBounds: false,

    /**
     * Auto fit bounds to type of items
     * @property autoFitBounds
     * @type {boolean|string}
     */
    autoFitBounds: false,

    /**
     * Fit bounds to view all coordinates
     * @property fitBoundsArray
     * @type {Array.<{lat: number, lng: number}>}
     */
    fitBoundsArray: computed('autoFitBounds', '_markers.[]', '_infoWindow.[]', '_polylines.@each._path.[]', '_polygons.@each._path.[]', '_circles.[]', function (key, value /*, oldValue*/) {
      var auto;
      if (arguments.length > 1) {
        // it's a set, save that the use defined them
        this._fixedFitBoundsArray = value;
      } else {
        if (this._fixedFitBoundsArray) {
          value = this._fixedFitBoundsArray;
        } else {
          // here comes our computation
          auto = this.get('autoFitBounds');
          if (auto) {
            auto = auto === true ? VALID_FIT_BOUND_TYPES : auto.split(',');
            value = [];
            forEach(auto, function (type) {
              collectCoordsOf(type, this.get('_' + type), value);
            }, this);
          } else {
            value = null;
          }
        }
      }
      return value;
    }),

    /**
     * Initial center's latitude of the map
     * @property lat
     * @type {Number}
     */
    lat: 0,

    /**
     * Initial center's longitude of the map
     * @property lng
     * @type {Number}
     */
    lng: 0,

    /**
     * Initial zoom of the map
     * @property zoom
     * @type {Number}
     * @default 5
     */
    zoom: 5,

    /**
     * Initial type of the map
     * @property type
     * @type {String}
     * @enum ['road', 'hybrid', 'terrain', 'satellite']
     * @default 'road'
     */
    type: 'road',

    /**
     * List of markers to handle/show on the map
     * @property markers
     * @type {Array.<{lat: Number, lng: Number, title: String}>}
     */
    markers: null,

    /**
     * The array controller holding the markers
     * @property _markers
     * @type {Ember.ArrayController}
     * @private
     */
    _markers: computed(function () {
      return this.container.lookupFactory('controller:google-map/markers').create({
        parentController: this
      });
    }).readOnly(),

    /**
     * Controller to use for each marker
     * @property markerController
     * @type {String}
     * @default 'google-map/marker'
     */
    markerController: 'google-map/marker',

    /**
     * View to use for each marker
     * @property markerViewClass
     * @type {String}
     * @default 'google-map/marker'
     */
    markerViewClass: 'google-map/marker',

    /**
     * Info-window template name to use for each marker
     * @property markerInfoWindowTemplateName
     * @type {String}
     * @default 'google-map/info-window'
     */
    markerInfoWindowTemplateName: 'google-map/info-window',

    /**
     * Whether the markers have an info-window by default
     * @property markerHasInfoWindow
     * @type {Boolean}
     * @default true
     */
    markerHasInfoWindow: true,

    /**
     * List of polylines to handle/show on the map
     * @property polylines
     * @type {Array.<{path: Array.<{lat: Number, lng: Number}>>}
     */
    polylines: null,

    /**
     * The array controller holding the polylines
     * @property _polylines
     * @type {Ember.ArrayController}
     * @private
     */
    _polylines: computed(function () {
      return this.container.lookupFactory('controller:google-map/polylines').create({
        parentController: this
      });
    }).readOnly(),

    /**
     * Controller to use for each polyline
     * @property polylineController
     * @type {String}
     * @default 'google-map/polyline'
     */
    polylineController: 'google-map/polyline',

    /**
     * Controller to use for each polyline's path
     * @property polylinePathController
     * @type {String}
     * @default 'google-map/polyline-path'
     */
    polylinePathController: 'google-map/polyline-path',

    /**
     * View to use for each polyline
     * @property polylineViewClass
     * @type {String}
     * @default 'google-map/polyline'
     */
    polylineViewClass: 'google-map/polyline',

    /**
     * List of polygons to handle/show on the map
     * @property polygons
     * @type {Array.<{path: Array.<{lat: Number, lng: Number}>>}
     */
    polygons: null,

    /**
     * The array controller holding the polygons
     * @property _polygons
     * @type {Ember.ArrayController}
     * @private
     */
    _polygons: computed(function () {
      return this.container.lookupFactory('controller:google-map/polygons').create({
        parentController: this
      });
    }).readOnly(),

    /**
     * Controller to use for each polygon
     * @property polygonController
     * @type {String}
     * @default 'google-map/polygon'
     */
    polygonController: 'google-map/polygon',

    /**
     * Controller to use for each polygon's path
     * @property polygonPathController
     * @type {String}
     * @default 'google-map/polygon-path'
     */
    polygonPathController: 'google-map/polygon-path',

    /**
     * View to use for each polygon
     * @property polygonViewClass
     * @type {String}
     * @default 'google-map/polygon'
     */
    polygonViewClass: 'google-map/polygon',

    /**
     * List of circles to handle/show on the map
     * @property circles
     * @type {Array.<{lat: Number, lng: Number, radius: Number}>}
     */
    circles: null,

    /**
     * The array controller holding the circles
     * @property _circles
     * @type {Ember.ArrayController}
     * @private
     */
    _circles: computed(function () {
      return this.container.lookupFactory('controller:google-map/circles').create({
        parentController: this
      });
    }).readOnly(),

    /**
     * Controller to use for each circle
     * @property circleController
     * @type {String}
     * @default 'google-map/circle'
     */
    circleController: 'google-map/circle',

    /**
     * View to use for each circle
     * @property circleViewClass
     * @type {String}
     * @default 'google-map/circle'
     */
    circleViewClass: 'google-map/circle',

    /**
     * Array of al info-windows to handle/show (independent from the markers' info-windows)
     * @property infoWindows
     * @type {Array.<{lat: Number, lng: Number, title: String, description: String}>}
     */
    infoWindows: null,

    /**
     * The array controller holding the info-windows
     * @property _infoWindows
     * @type {Ember.ArrayController}
     * @private
     */
    _infoWindows: computed(function () {
      return this.container.lookupFactory('controller:google-map/info-windows').create({
        parentController: this
      });
    }).readOnly(),

    /**
     * Controller for each info-window
     * @property infoWindowController
     * @type {String}
     * @default 'google-map/info-window'
     */
    infoWindowController: 'google-map/info-window',

    /**
     * View for each info-window
     * @property infoWindowViewClass
     * @type {String}
     * @default 'google-map/info-window'
     */
    infoWindowViewClass: 'google-map/info-window',

    /**
     * Template for each info-window
     * @property infoWindowTemplateName
     * @type {String}
     * @default 'google-map/info-window'
     */
    infoWindowTemplateName: 'google-map/info-window',

    /**
     * The google map object
     * @property map
     * @type {google.maps.Map}
     */
    map: oneWay('googleObject'),

    /**
     * Schedule an auto-fit of the bounds
     *
     * @method _scheduleAutoFitBounds
     */
    _scheduleAutoFitBounds: function _scheduleAutoFitBounds() {
      Ember['default'].run.schedule('afterRender', this, function () {
        Ember['default'].run.debounce(this, '_fitBounds', 200);
      });
    },

    /**
     * Observes the length of the autoFitBounds array
     *
     * @method _observesAutoFitBoundLength
     * @private
     */
    _observesAutoFitBoundLength: on('init', observer('fitBoundsArray.length', function () {
      if (this.get('alwaysAutoFitBounds')) {
        this._scheduleAutoFitBounds();
      }
    })),

    /**
     * Fit the bounds to contain given coordinates
     *
     * @method _fitBounds
     */
    _fitBounds: function _fitBounds() {
      var map, bounds, coords;
      if (this.isDestroying || this.isDestroyed) {
        return;
      }
      map = this.get('googleObject');
      if (this._state !== 'inDOM' || !map) {
        this._scheduleAutoFitBounds(coords);
        return;
      }
      coords = this.get('fitBoundsArray');
      if (!coords) {
        return;
      }
      if (Ember['default'].isArray(coords)) {
        // it's an array of lat,lng
        coords = coords.slice();
        if (coords.get('length')) {
          bounds = new google.maps.LatLngBounds(helpers['default']._latLngToGoogle(coords.shift()));
          forEach(coords, function (point) {
            bounds.extend(helpers['default']._latLngToGoogle(point));
          });
        } else {
          return;
        }
      } else {
        // it's a bound object
        bounds = helpers['default']._boundsToGoogle(coords);
      }
      if (bounds) {
        // finally make our map to fit
        map.fitBounds(bounds);
      }
    },

    /**
     * Initialize the map
     */
    initGoogleMap: on('didInsertElement', function () {
      var canvas;
      this.destroyGoogleMap();
      if (helpers['default'].hasGoogleLib()) {
        canvas = this.$('div.map-canvas')[0];
        this.createGoogleObject(canvas, null);
        this._scheduleAutoFitBounds();
      }
    }),

    /**
     * Destroy the map
     */
    destroyGoogleMap: on('willDestroyElement', function () {
      if (this.get('googleObject')) {
        Ember['default'].debug(fmt('[google-map] destroying %@', this.get('googleName')));
        this.set('googleObject', null);
      }
    })
  });

  exports.MAP_TYPES = MAP_TYPES;
  exports.PLACE_TYPES = PLACE_TYPES;

});
define('front/components/labeled-radio-button', ['exports', 'ember-radio-button/components/labeled-radio-button'], function (exports, LabeledRadioButton) {

	'use strict';

	exports['default'] = LabeledRadioButton['default'];

});
define('front/components/materialize-badge', ['exports', 'ember', 'front/components/md-badge'], function (exports, Ember, MaterializeBadge) {

  'use strict';

  exports['default'] = MaterializeBadge['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-badge}} has been deprecated. Please use {{md-badge}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-button-submit', ['exports', 'ember', 'front/components/md-btn-submit'], function (exports, Ember, MaterializeButtonSubmit) {

  'use strict';

  exports['default'] = MaterializeButtonSubmit['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-button-submit}} has been deprecated. Please use {{md-btn-submit}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-button', ['exports', 'ember', 'front/components/md-btn'], function (exports, Ember, MaterializeButton) {

  'use strict';

  exports['default'] = MaterializeButton['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-button}} has been deprecated. Please use {{md-btn}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-card-action', ['exports', 'ember', 'front/components/md-card-action'], function (exports, Ember, MaterializeCardAction) {

  'use strict';

  exports['default'] = MaterializeCardAction['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-card-action}} has been deprecated. Please use {{md-card-action}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-card-content', ['exports', 'ember', 'front/components/md-card-content'], function (exports, Ember, MaterializeCardContent) {

  'use strict';

  exports['default'] = MaterializeCardContent['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-card-content}} has been deprecated. Please use {{md-card-content}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-card-panel', ['exports', 'ember', 'front/components/md-card-panel'], function (exports, Ember, MaterializeCardPanel) {

  'use strict';

  exports['default'] = MaterializeCardPanel['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-card-panel}} has been deprecated. Please use {{md-card-panel}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-card-reveal', ['exports', 'ember', 'front/components/md-card-reveal'], function (exports, Ember, MaterializeCardReveal) {

  'use strict';

  exports['default'] = MaterializeCardReveal['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-card-reveal}} has been deprecated. Please use {{md-card-reveal}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-card', ['exports', 'ember', 'front/components/md-card'], function (exports, Ember, MaterializeCard) {

  'use strict';

  exports['default'] = MaterializeCard['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-card}} has been deprecated. Please use {{md-card}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-checkbox', ['exports', 'ember', 'front/components/md-check'], function (exports, Ember, materializeCheckbox) {

  'use strict';

  exports['default'] = materializeCheckbox['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-checkbox}} has been deprecated. Please use {{md-check}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-checkboxes', ['exports', 'ember', 'front/components/md-checks'], function (exports, Ember, materializeCheckboxes) {

  'use strict';

  exports['default'] = materializeCheckboxes['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-checkboxes}} has been deprecated. Please use {{md-checks}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-collapsible-card', ['exports', 'ember', 'front/components/md-card-collapsible'], function (exports, Ember, MaterializeCollapsibleCard) {

  'use strict';

  exports['default'] = MaterializeCollapsibleCard['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-collapsible-card}} has been deprecated. Please use {{md-card-collapsible}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-collapsible', ['exports', 'ember', 'front/components/md-collapsible'], function (exports, Ember, MaterializeCollapsible) {

  'use strict';

  exports['default'] = MaterializeCollapsible['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-collapsible}} has been deprecated. Please use {{md-collapsible}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-copyright', ['exports', 'ember', 'front/components/md-copyright'], function (exports, Ember, materializeCopyright) {

  'use strict';

  exports['default'] = materializeCopyright['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-copyright}} has been deprecated. Please use {{md-copyright}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-date-input', ['exports', 'ember', 'front/components/md-input-date'], function (exports, Ember, materializeDateInput) {

  'use strict';

  exports['default'] = materializeDateInput['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-date-input}} has been deprecated. Please use {{md-input-date}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-input-field', ['exports', 'ember', 'front/components/md-input-field'], function (exports, Ember, materializeInputField) {

  'use strict';

  exports['default'] = materializeInputField['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-input-field}} has been deprecated. Please use {{md-input-field}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-input', ['exports', 'ember', 'front/components/md-input'], function (exports, Ember, materializeInput) {

  'use strict';

  exports['default'] = materializeInput['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-input}} has been deprecated. Please use {{md-input}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-loader', ['exports', 'ember', 'front/components/md-loader'], function (exports, Ember, materializeLoader) {

  'use strict';

  exports['default'] = materializeLoader['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-loader}} has been deprecated. Please use {{md-loader}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-modal', ['exports', 'ember', 'front/components/md-modal'], function (exports, Ember, MaterializeModal) {

  'use strict';

  exports['default'] = MaterializeModal['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-modal}} has been deprecated. Please use {{md-modal}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-navbar', ['exports', 'ember', 'front/components/md-navbar'], function (exports, Ember, MaterializeNavBar) {

  'use strict';

  exports['default'] = MaterializeNavBar['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-navbar}} has been deprecated. Please use {{md-navbar}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-pagination', ['exports', 'ember', 'front/components/md-pagination'], function (exports, Ember, materializePagination) {

  'use strict';

  exports['default'] = materializePagination['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-pagination}} has been deprecated. Please use {{md-pagination}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-parallax', ['exports', 'ember', 'front/components/md-parallax'], function (exports, Ember, materializeParallax) {

  'use strict';

  exports['default'] = materializeParallax['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-parallax}} has been deprecated. Please use {{md-parallax}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-radio', ['exports', 'ember', 'front/components/md-radio'], function (exports, Ember, materializeRadio) {

  'use strict';

  exports['default'] = materializeRadio['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-radio}} has been deprecated. Please use {{md-radio}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-radios', ['exports', 'ember', 'front/components/md-radios'], function (exports, Ember, materializeRadios) {

  'use strict';

  exports['default'] = materializeRadios['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-radios}} has been deprecated. Please use {{md-radios}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-range', ['exports', 'ember', 'front/components/md-range'], function (exports, Ember, materializeRange) {

  'use strict';

  exports['default'] = materializeRange['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-range}} has been deprecated. Please use {{md-range}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-select', ['exports', 'ember', 'front/components/md-select'], function (exports, Ember, materializeSelect) {

  'use strict';

  exports['default'] = materializeSelect['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-select}} has been deprecated. Please use {{md-select}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-switch', ['exports', 'ember', 'front/components/md-switch'], function (exports, Ember, materializeSwitch) {

  'use strict';

  exports['default'] = materializeSwitch['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-switch}} has been deprecated. Please use {{md-switch}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-switches', ['exports', 'ember', 'front/components/md-switches'], function (exports, Ember, materializeSwitches) {

  'use strict';

  exports['default'] = materializeSwitches['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-switches}} has been deprecated. Please use {{md-switches}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-tabs-tab', ['exports', 'ember', 'front/components/md-tab'], function (exports, Ember, materializeTabsTab) {

  'use strict';

  exports['default'] = materializeTabsTab['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-tabs-tab}} has been deprecated. Please use {{md-tab}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-tabs', ['exports', 'ember', 'front/components/md-tabs'], function (exports, Ember, materializeTabs) {

  'use strict';

  exports['default'] = materializeTabs['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-tabs}} has been deprecated. Please use {{md-tabs}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/materialize-textarea', ['exports', 'ember', 'front/components/md-textarea'], function (exports, Ember, materializeTextarea) {

  'use strict';

  exports['default'] = materializeTextarea['default'].extend({
    init: function init() {
      this._super.apply(this, arguments);
      Ember['default'].deprecate('{{materialize-textarea}} has been deprecated. Please use {{md-textarea}} instead', false, { url: 'https://github.com/sgasser/ember-cli-materialize/issues/67' });
    }
  });

});
define('front/components/md-badge', ['exports', 'ember-cli-materialize/components/md-badge'], function (exports, materializeBadge) {

	'use strict';

	exports['default'] = materializeBadge['default'];

});
define('front/components/md-btn-submit', ['exports', 'ember-cli-materialize/components/md-btn-submit'], function (exports, MaterializeButtonSubmit) {

	'use strict';

	exports['default'] = MaterializeButtonSubmit['default'];

});
define('front/components/md-btn', ['exports', 'ember-cli-materialize/components/md-btn'], function (exports, MaterializeButton) {

	'use strict';

	exports['default'] = MaterializeButton['default'];

});
define('front/components/md-card-action', ['exports', 'ember-cli-materialize/components/md-card-action'], function (exports, MaterializeCardAction) {

	'use strict';

	exports['default'] = MaterializeCardAction['default'];

});
define('front/components/md-card-collapsible', ['exports', 'ember-cli-materialize/components/md-card-collapsible'], function (exports, MaterializeCollapsibleCard) {

	'use strict';

	exports['default'] = MaterializeCollapsibleCard['default'];

});
define('front/components/md-card-content', ['exports', 'ember-cli-materialize/components/md-card-content'], function (exports, MaterializeCardContent) {

	'use strict';

	exports['default'] = MaterializeCardContent['default'];

});
define('front/components/md-card-panel', ['exports', 'ember-cli-materialize/components/md-card-panel'], function (exports, MaterializeCardPanel) {

	'use strict';

	exports['default'] = MaterializeCardPanel['default'];

});
define('front/components/md-card-reveal', ['exports', 'ember-cli-materialize/components/md-card-reveal'], function (exports, MaterializeCardReveal) {

	'use strict';

	exports['default'] = MaterializeCardReveal['default'];

});
define('front/components/md-card', ['exports', 'ember-cli-materialize/components/md-card'], function (exports, MaterializeCard) {

	'use strict';

	exports['default'] = MaterializeCard['default'];

});
define('front/components/md-check', ['exports', 'ember-cli-materialize/components/md-check'], function (exports, materializeCheckbox) {

	'use strict';

	exports['default'] = materializeCheckbox['default'];

});
define('front/components/md-checks', ['exports', 'ember-cli-materialize/components/md-checks'], function (exports, materializeCheckboxes) {

	'use strict';

	exports['default'] = materializeCheckboxes['default'];

});
define('front/components/md-collapsible', ['exports', 'ember-cli-materialize/components/md-collapsible'], function (exports, MaterializeCollapsible) {

	'use strict';

	exports['default'] = MaterializeCollapsible['default'];

});
define('front/components/md-copyright', ['exports', 'ember-cli-materialize/components/md-copyright'], function (exports, materializeCopyright) {

	'use strict';

	exports['default'] = materializeCopyright['default'];

});
define('front/components/md-input-date', ['exports', 'ember-cli-materialize/components/md-input-date'], function (exports, materializeDateInput) {

	'use strict';

	exports['default'] = materializeDateInput['default'];

});
define('front/components/md-input-field', ['exports', 'ember-cli-materialize/components/md-input-field'], function (exports, materializeInputField) {

	'use strict';

	exports['default'] = materializeInputField['default'];

});
define('front/components/md-input', ['exports', 'ember-cli-materialize/components/md-input'], function (exports, materializeInput) {

	'use strict';

	exports['default'] = materializeInput['default'];

});
define('front/components/md-loader', ['exports', 'ember-cli-materialize/components/md-loader'], function (exports, materializeLoader) {

	'use strict';

	exports['default'] = materializeLoader['default'];

});
define('front/components/md-modal-container', ['exports', 'ember-cli-materialize/components/md-modal-container'], function (exports, mdModalContainer) {

	'use strict';

	exports['default'] = mdModalContainer['default'];

});
define('front/components/md-modal', ['exports', 'ember-cli-materialize/components/md-modal'], function (exports, materializeModal) {

	'use strict';

	exports['default'] = materializeModal['default'];

});
define('front/components/md-navbar', ['exports', 'ember-cli-materialize/components/md-navbar'], function (exports, MaterializeNavBar) {

	'use strict';

	exports['default'] = MaterializeNavBar['default'];

});
define('front/components/md-pagination', ['exports', 'ember-cli-materialize/components/md-pagination'], function (exports, materializePagination) {

	'use strict';

	exports['default'] = materializePagination['default'];

});
define('front/components/md-parallax', ['exports', 'ember-cli-materialize/components/md-parallax'], function (exports, materializeParallax) {

	'use strict';

	exports['default'] = materializeParallax['default'];

});
define('front/components/md-radio', ['exports', 'ember-cli-materialize/components/md-radio'], function (exports, materializeRadio) {

	'use strict';

	exports['default'] = materializeRadio['default'];

});
define('front/components/md-radios', ['exports', 'ember-cli-materialize/components/md-radios'], function (exports, materializeRadios) {

	'use strict';

	exports['default'] = materializeRadios['default'];

});
define('front/components/md-range', ['exports', 'ember-cli-materialize/components/md-range'], function (exports, materializeRange) {

	'use strict';

	exports['default'] = materializeRange['default'];

});
define('front/components/md-select', ['exports', 'ember-cli-materialize/components/md-select'], function (exports, materializeSelect) {

	'use strict';

	exports['default'] = materializeSelect['default'];

});
define('front/components/md-switch', ['exports', 'ember-cli-materialize/components/md-switch'], function (exports, materializeSwitch) {

	'use strict';

	exports['default'] = materializeSwitch['default'];

});
define('front/components/md-switches', ['exports', 'ember-cli-materialize/components/md-switches'], function (exports, materializeSwitches) {

	'use strict';

	exports['default'] = materializeSwitches['default'];

});
define('front/components/md-tab', ['exports', 'ember-cli-materialize/components/md-tab'], function (exports, materializeTabsTab) {

	'use strict';

	exports['default'] = materializeTabsTab['default'];

});
define('front/components/md-tabs', ['exports', 'ember-cli-materialize/components/md-tabs'], function (exports, materializeTabs) {

	'use strict';

	exports['default'] = materializeTabs['default'];

});
define('front/components/md-textarea', ['exports', 'ember-cli-materialize/components/md-textarea'], function (exports, materializeTextarea) {

	'use strict';

	exports['default'] = materializeTextarea['default'];

});
define('front/components/modal-dialog', ['exports', 'ember-modal-dialog/components/modal-dialog'], function (exports, Component) {

	'use strict';

	exports['default'] = Component['default'];

});
define('front/components/radio-button', ['exports', 'ember-radio-button/components/radio-button'], function (exports, RadioButton) {

	'use strict';

	exports['default'] = RadioButton['default'];

});
define('front/controllers/array', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('front/controllers/careers', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var CareersController;

  CareersController = Ember['default'].Controller.extend({
    queryParams: ["selectedTabId", "jobId"],
    selectedTabId: "jobs",
    selectedTeam: Ember['default'].computed.equal("selectedTabId", "team"),
    actions: {
      selectJob: function selectJob(job) {
        return this.set("jobId", job.get("id"));
      }
    }
  });

  exports['default'] = CareersController;

});
define('front/controllers/contact', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var ContactController;

  ContactController = Ember['default'].Controller.extend({
    lat: Ember['default'].computed.alias("model.lat"),
    lng: Ember['default'].computed.alias("model.lng"),
    zoom: Ember['default'].computed.alias("model.zoom"),
    mapType: "road",
    marker: Ember['default'].computed("lat", "lng", function () {
      if (Ember['default'].isBlank(this.get("lat"))) {
        return;
      }
      if (Ember['default'].isBlank(this.get("lng"))) {
        return;
      }
      return {
        title: "Our Office",
        lat: this.get("lat"),
        lng: this.get("lng")
      };
    }),
    markers: Ember['default'].computed.collect("marker")
  });

  exports['default'] = ContactController;

});
define('front/controllers/google-map/circle', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].ObjectController.extend({});

});
define('front/controllers/google-map/circles', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].ArrayController.extend({
    itemController: Ember['default'].computed.alias('parentController.circleController'),
    model: Ember['default'].computed.alias('parentController.circles')
  });

});
define('front/controllers/google-map/info-window', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].ObjectController.extend({});

});
define('front/controllers/google-map/info-windows', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].ArrayController.extend({
    itemController: Ember['default'].computed.alias('parentController.infoWindowController'),
    model: Ember['default'].computed.alias('parentController.infoWindows')
  });

});
define('front/controllers/google-map/marker', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].ObjectController.extend({});

});
define('front/controllers/google-map/markers', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].ArrayController.extend({
    itemController: Ember['default'].computed.alias('parentController.markerController'),
    model: Ember['default'].computed.alias('parentController.markers')
  });

});
define('front/controllers/google-map/polygon-path', ['exports', 'front/controllers/google-map/polyline-path'], function (exports, GoogleMapPolylinePathController) {

	'use strict';

	exports['default'] = GoogleMapPolylinePathController['default'].extend({});

});
define('front/controllers/google-map/polygon', ['exports', 'front/controllers/google-map/polyline'], function (exports, GoogleMapPolylineController) {

	'use strict';

	exports['default'] = GoogleMapPolylineController['default'].extend({});

});
define('front/controllers/google-map/polygons', ['exports', 'ember', 'front/controllers/google-map/polylines'], function (exports, Ember, GoogleMapPolylinesController) {

  'use strict';

  exports['default'] = GoogleMapPolylinesController['default'].extend({
    itemController: Ember['default'].computed.alias('parentController.polygonController'),
    model: Ember['default'].computed.alias('parentController.polygons'),
    pathController: Ember['default'].computed.alias('parentController.polygonPathController')
  });

});
define('front/controllers/google-map/polyline-path', ['exports', 'ember', 'ember-google-map/mixins/google-array', 'ember-google-map/core/helpers'], function (exports, Ember, GoogleArrayMixin, helpers) {

  'use strict';

  exports['default'] = Ember['default'].ArrayController.extend(GoogleArrayMixin['default'], {
    model: Ember['default'].computed.alias('parentController.path'),
    googleItemFactory: helpers['default']._latLngToGoogle,
    emberItemFactory: function emberItemFactory(googleLatLng) {
      return Ember['default'].Object.create(helpers['default']._latLngFromGoogle(googleLatLng));
    },
    observeEmberProperties: ['lat', 'lng']
  });

});
define('front/controllers/google-map/polyline', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].ObjectController.extend({
    pathController: Ember['default'].computed.alias('parentController.pathController'),

    _path: Ember['default'].computed('path', 'pathController', function () {
      return this.container.lookupFactory('controller:' + this.get('pathController')).create({
        parentController: this
      });
    }).readOnly()
  });

});
define('front/controllers/google-map/polylines', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].ArrayController.extend({
    itemController: Ember['default'].computed.alias('parentController.polylineController'),
    model: Ember['default'].computed.alias('parentController.polylines'),
    pathController: Ember['default'].computed.alias('parentController.polylinePathController')
  });

});
define('front/controllers/object', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('front/controllers/products', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var ProductsController;

  ProductsController = Ember['default'].Controller.extend({
    queryParams: ["forWhat"],
    forWhat: "all",
    products: Ember['default'].computed("model.@each", "forWhat", function () {
      if ("all" === this.get("forWhat")) {
        return this.get("model");
      }
      return this.get("model").filterBy("forWhat", this.get("forWhat"));
    }),
    showAll: Ember['default'].computed.equal("forWhat", "all"),
    actions: {
      selectTab: function selectTab(tabName) {
        return this.set("forWhat", tabName);
      }
    }
  });

  exports['default'] = ProductsController;

});
define('front/initializers/add-modals-container', ['exports', 'ember-modal-dialog/initializers/add-modals-container'], function (exports, initialize) {

  'use strict';

  exports['default'] = {
    name: 'add-modals-container',
    initialize: initialize['default']
  };

});
define('front/initializers/app-version', ['exports', 'front/config/environment', 'ember'], function (exports, config, Ember) {

  'use strict';

  var classify = Ember['default'].String.classify;
  var registered = false;

  exports['default'] = {
    name: 'App Version',
    initialize: function initialize(container, application) {
      if (!registered) {
        var appName = classify(application.toString());
        Ember['default'].libraries.register(appName, config['default'].APP.version);
        registered = true;
      }
    }
  };

});
define('front/initializers/ember-google-map', ['exports', 'ember-google-map/utils/load-google-map'], function (exports, loadGoogleMap) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    application.register('util:load-google-map', loadGoogleMap['default'], { instantiate: false });
    application.inject('route', 'loadGoogleMap', 'util:load-google-map');
  }

  exports['default'] = {
    name: 'ember-google-map',
    initialize: initialize
  };

});
define('front/initializers/export-application-global', ['exports', 'ember', 'front/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    var classifiedName = Ember['default'].String.classify(config['default'].modulePrefix);

    if (config['default'].exportApplicationGlobal && !window[classifiedName]) {
      window[classifiedName] = application;
    }
  }

  ;

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };

});
define('front/initializers/key-responder', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = {
    name: 'ember-key-responder',

    initialize: function initialize(container, application) {
      application.inject('view', 'keyResponder', 'key-responder:main');
      application.inject('component', 'keyResponder', 'key-responder:main');

      //TextField/TextArea are currently uninjectable, so we're going to hack our
      //way in
      Ember['default'].TextSupport.reopen({
        keyResponder: Ember['default'].computed(function () {
          return this.container.lookup('key-responder:main');
        }).readOnly()
      });

      // Set up a handler on the document for keyboard events that are not
      // handled by Ember's event dispatcher.
      Ember['default'].$(document).on('keyup.outside_ember_event_delegation', null, function (event) {

        if (Ember['default'].$(event.target).closest('.ember-view').length === 0) {
          var keyResponder = container.lookup('key-responder:main');
          var currentKeyResponder = keyResponder.get('current');
          if (currentKeyResponder && currentKeyResponder.get('isVisible')) {
            return currentKeyResponder.respondToKeyEvent(event, currentKeyResponder);
          }
        }

        return true;
      });

      // Set up a handler on the ApplicationView for keyboard events that were
      // not handled by the current KeyResponder yet
      container.lookupFactory('view:application').reopen({
        delegateToKeyResponder: Ember['default'].on('keyUp', function (event) {
          var currentKeyResponder = this.get('keyResponder.current');
          if (currentKeyResponder && currentKeyResponder.get('isVisible')) {
            // check to see if the event target is the keyResponder or the
            // keyResponders parents.  if so, no need to dispatch as it has
            // already had a chance to handle this event.
            var id = '#' + currentKeyResponder.get('elementId');
            if (Ember['default'].$(event.target).closest(id).length === 1) {
              return true;
            }
            return currentKeyResponder.respondToKeyEvent(event, currentKeyResponder);
          }
          return true;
        })
      });
    }
  };

});
define('front/initializers/link-view', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports.initialize = initialize;

  function initialize() {
    Ember['default'].LinkView.reopen({
      attributeBindings: ['data-activates']
    });
  }

  exports['default'] = {
    name: 'link-view',
    initialize: initialize
  };
  /* container, application */

});
define('front/key-responder', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var get = Ember['default'].get;

  /*
    Holds a stack of key responder views. With this we can neatly handle
    restoring the previous key responder when some modal UI element is closed.
    There are a few simple rules that governs the usage of the stack:
     - mouse click does .replace (this should also be used for programmatically taking focus when not a modal element)
     - opening a modal UI element does .push
     - closing a modal element does .pop

    Also noteworthy is that a view will be signaled that it loses the key focus
    only when it's popped off the stack, not when something is pushed on top. The
    idea is that when a modal UI element is opened, we know that the previously
    focused view will re-gain the focus as soon as the modal element is closed.
    So if the previously focused view was e.g. in the middle of some edit
    operation, it shouldn't cancel that operation.
  */
  var KeyResponder = Ember['default'].ArrayProxy.extend({
    init: function init() {
      this.set('isActive', true);
      this.set('content', Ember['default'].A());
      this._super.apply(this, arguments);
    },

    current: Ember['default'].computed.readOnly('lastObject'),
    pushView: function pushView(view, wasTriggeredByFocus) {
      if (!Ember['default'].isNone(view)) {
        view.trigger('willBecomeKeyResponder', wasTriggeredByFocus);
        this.pushObject(view);
        view.trigger('didBecomeKeyResponder', wasTriggeredByFocus);
      }
      return view;
    },

    resume: function resume() {
      this.set('isActive', true);
    },

    pause: function pause() {
      this.set('isActive', false);
    },

    popView: function popView(wasTriggeredByFocus) {
      if (get(this, 'length') > 0) {
        var view = get(this, 'current');
        if (view) {
          view.trigger('willLoseKeyResponder', wasTriggeredByFocus);
        }
        view = this.popObject();
        if (view) {
          view.trigger('didLoseKeyResponder', wasTriggeredByFocus);
        }
        return view;
      } else {
        return undefined;
      }
    },

    replaceView: function replaceView(view, wasTriggeredByFocus) {
      if (get(this, 'current') !== view) {
        this.popView(wasTriggeredByFocus);
        return this.pushView(view, wasTriggeredByFocus);
      }
    }
  });

  exports['default'] = KeyResponder;

  var KEY_EVENTS = {
    8: 'deleteBackward',
    9: 'insertTab',
    13: 'insertNewline',
    27: 'cancel',
    32: 'insertSpace',
    37: 'moveLeft',
    38: 'moveUp',
    39: 'moveRight',
    40: 'moveDown',
    46: 'deleteForward'
  };

  var MODIFIED_KEY_EVENTS = {
    8: 'deleteForward',
    9: 'insertBacktab',
    37: 'moveLeftAndModifySelection',
    38: 'moveUpAndModifySelection',
    39: 'moveRightAndModifySelection',
    40: 'moveDownAndModifySelection'
  };

  var KeyResponderSupportViewMixin = Ember['default'].Mixin.create({
    // Set to true in your view if you want to accept key responder status (which
    // is needed for handling key events)
    acceptsKeyResponder: false,
    canBecomeKeyResponder: Ember['default'].computed('acceptsKeyResponder', 'disabled', 'isVisible', function () {
      return get(this, 'acceptsKeyResponder') && !get(this, 'disabled') && get(this, 'isVisible');
    }).readOnly(),

    becomeKeyResponderViaMouseDown: Ember['default'].on('mouseDown', function (evt) {
      var responder = this.get('keyResponder');
      if (responder === undefined) {
        return;
      }

      Ember['default'].run.later(function () {
        responder._inEventBubblingPhase = undefined;
      }, 0);

      if (responder._inEventBubblingPhase === undefined) {
        responder._inEventBubblingPhase = true;
        this.becomeKeyResponder(false);
      }
    }),

    /*
      Sets this view as the target of key events. Call this if you need to make
      this happen programmatically.  This gets also called on mouseDown if the
      view handles that, returns true and doesn't have property
      'acceptsKeyResponder'
      set to false. If mouseDown returned true but 'acceptsKeyResponder' is
      false, this call is propagated to the parent view.
       If called with no parameters or with replace = true, the current key
      responder is first popped off the stack and this view is then pushed. See
      comments for Ember.KeyResponderStack above for more insight.
    */
    becomeKeyResponder: function becomeKeyResponder(replace, wasTriggeredByFocus) {
      if (wasTriggeredByFocus === undefined) {
        wasTriggeredByFocus = false;
      }

      var keyResponder = get(this, 'keyResponder');

      if (!keyResponder) {
        return;
      }

      if (get(keyResponder, 'current') === this) {
        return;
      }

      if (get(this, 'canBecomeKeyResponder')) {
        if (replace === undefined || replace === true) {
          return keyResponder.replaceView(this, wasTriggeredByFocus);
        } else {
          return keyResponder.pushView(this, wasTriggeredByFocus);
        }
      } else {
        var parent = get(this, 'parentView');

        if (parent && parent.becomeKeyResponder) {
          return parent.becomeKeyResponder(replace, wasTriggeredByFocus);
        }
      }
    },

    becomeKeyResponderViaFocus: function becomeKeyResponderViaFocus() {
      return this.becomeKeyResponder(true, true);
    },

    /*
      Resign key responder status by popping the head off the stack. The head
      might or might not be this view, depending on whether user clicked anything
      since this view became the key responder. The new key responder
      will be the next view in the stack, if any.
    */
    resignKeyResponder: function resignKeyResponder(wasTriggeredByFocus) {
      if (wasTriggeredByFocus === undefined) {
        wasTriggeredByFocus = false;
      }

      var keyResponder = get(this, 'keyResponder');

      if (!keyResponder) {
        return;
      }

      keyResponder.popView(wasTriggeredByFocus);
    },

    resignKeyResponderViaFocus: function resignKeyResponderViaFocus() {
      return this.resignKeyResponder(true);
    },

    respondToKeyEvent: function respondToKeyEvent(event) {
      Ember['default'].run(this, function () {
        if (get(this, 'keyResponder.isActive')) {
          if (get(this, 'keyResponder.current.canBecomeKeyResponder')) {
            get(this, 'keyResponder.current').interpretKeyEvents(event);
          }
        }
      });
    },

    interpretKeyEvents: function interpretKeyEvents(event) {
      var mapping = event.shiftKey ? MODIFIED_KEY_EVENTS : KEY_EVENTS;
      var eventName = mapping[event.keyCode];

      if (eventName && this.has(eventName)) {
        return this.trigger(eventName, event);
      }

      return false;
    }
  });

  Ember['default'].View.reopen(KeyResponderSupportViewMixin);
  Ember['default'].Component.reopen(KeyResponderSupportViewMixin);

  var KeyResponderInputSupport = Ember['default'].Mixin.create({
    acceptsKeyResponder: true,
    init: function init() {
      this._super.apply(this, arguments);
      this.on('focusIn', this, this.becomeKeyResponderViaFocus);
      this.on('focusOut', this, this.resignKeyResponderViaBlur);
    },

    didBecomeKeyResponder: function didBecomeKeyResponder(wasTriggeredByFocus) {
      if (!wasTriggeredByFocus && this._state === 'inDOM') {
        this.$().focus();
      }
    },

    didLoseKeyResponder: function didLoseKeyResponder(wasTriggeredByFocus) {
      if (!wasTriggeredByFocus && this._state === 'inDOM') {
        this.$().blur();
      }
    }
  });

  Ember['default'].TextSupport.reopen(KeyResponderInputSupport);
  Ember['default'].Checkbox.reopen(KeyResponderInputSupport);
  Ember['default'].Select.reopen(KeyResponderInputSupport);

  exports.KEY_EVENTS = KEY_EVENTS;
  exports.MODIFIED_KEY_EVENTS = MODIFIED_KEY_EVENTS;
  exports.KeyResponderInputSupport = KeyResponderInputSupport;

});
define('front/models/about', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  var About;

  About = DS['default'].Model.extend({
    title: DS['default'].attr("string"),
    pic: DS['default'].attr("string"),
    paragraphs: DS['default'].attr("strings")
  });

  exports['default'] = About;

});
define('front/models/banner', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  var Banner;

  Banner = DS['default'].Model.extend({
    promoHeader: DS['default'].attr("string"),
    pic: DS['default'].attr("string"),
    exposition: DS['default'].attr("string")
  });

  exports['default'] = Banner;

});
define('front/models/contact', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  var Contact;

  Contact = DS['default'].Model.extend({
    lat: DS['default'].attr("number"),
    lng: DS['default'].attr("number"),
    zoom: DS['default'].attr("number"),
    email: DS['default'].attr("string"),
    phone: DS['default'].attr("string"),
    address: DS['default'].attr("string")
  });

  exports['default'] = Contact;

});
define('front/models/job', ['exports', 'ember-cpm', 'ember-data'], function (exports, CPM, DS) {

  'use strict';

  var Job;

  Job = DS['default'].Model.extend({
    location: DS['default'].attr('string'),
    position: DS['default'].attr('string'),
    explanation: DS['default'].attr('string'),
    requirements: DS['default'].attr('strings'),
    preferences: DS['default'].attr('strings'),
    headline: CPM['default'].Macros.join('position', 'location', ' - ')
  });

  exports['default'] = Job;

});
define('front/models/product', ['exports', 'ember', 'ember-data'], function (exports, Ember, DS) {

  'use strict';

  var Product;

  Product = DS['default'].Model.extend({
    forWhat: DS['default'].attr('string'),
    summary: DS['default'].attr('string'),
    exposition: DS['default'].attr('string'),
    pic: DS['default'].attr('string'),
    materialName: DS['default'].attr('string'),
    isSale: Ember['default'].computed.equal('forWhat', 'sale'),
    isPurchase: Ember['default'].computed.equal('forWhat', 'purchase')
  });

  exports['default'] = Product;

});
define('front/router', ['exports', 'ember', 'front/config/environment'], function (exports, Ember, config) {

  'use strict';

  var Router;

  Router = Ember['default'].Router.extend({
    location: config['default'].locationType
  });

  Router.map(function () {
    this.resource('products', {
      path: '/products'
    }, function () {
      this.route('buy');
      return this.route('sell');
    });
    this.route('about');
    this.resource('careers', {
      path: '/careers'
    }, function () {
      this.route('team');
      return this.resource('careers.job', {
        path: '/job/:jobId'
      }, function () {});
    });
    return this.route('contact');
  });

  exports['default'] = Router;

});
define('front/routes/about', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var AboutRoute;

  AboutRoute = Ember['default'].Route.extend({
    model: function model() {
      return this.store.find("about");
    }
  });

  exports['default'] = AboutRoute;

});
define('front/routes/careers', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var CareersRoute;

  CareersRoute = Ember['default'].Route.extend({
    queryParams: {
      jobId: {
        refreshModel: false
      },
      selectedTabId: {
        refreshModel: false
      }
    },
    model: function model(arg) {
      var jobId;
      jobId = arg.jobId;
      return this.store.find("job").then(function (jobs) {
        var job;
        job = jobs.findBy("id", jobId);
        if (Ember['default'].isBlank(job)) {
          return jobs;
        }
        job.set("isActive", true);
        return jobs;
      });
    }
  });

  exports['default'] = CareersRoute;

});
define('front/routes/careers/job', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var CareersJobRoute;

  CareersJobRoute = Ember['default'].Route.extend({
    model: function model(arg) {
      var jobId;
      jobId = arg.jobId;
      return this.store.find("job", jobId);
    }
  });

  exports['default'] = CareersJobRoute;

});
define('front/routes/contact', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var AboutRoute;

  AboutRoute = Ember['default'].Route.extend({
    model: function model() {
      return this.store.find("contact", 119317261825);
    }
  });

  exports['default'] = AboutRoute;

});
define('front/routes/index', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var IndexRoute;

  IndexRoute = Ember['default'].Route.extend({
    model: function model() {
      return this.store.find("banner");
    },
    renderTemplate: function renderTemplate() {
      this.render("index/extra", {
        outlet: "header"
      });
      return this._super.apply(this, arguments);
    }
  });

  exports['default'] = IndexRoute;

});
define('front/routes/products', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var ProductsRoute;

  ProductsRoute = Ember['default'].Route.extend({
    model: function model() {
      return this.store.find("product");
    }
  });

  exports['default'] = ProductsRoute;

});
define('front/serializers/application', ['exports', 'ember-tumblr-data'], function (exports, ETD) {

	'use strict';

	var ApplicationSerializer;

	ApplicationSerializer = ETD['default'].TumblrYamlSerializer.extend();

	exports['default'] = ApplicationSerializer;

});
define('front/templates/about', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 1,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createElement("p");
            dom.setAttribute(el1,"class","exposition");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement, blockArguments) {
            var dom = env.dom;
            var hooks = env.hooks, set = hooks.set, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
            set(env, context, "exposition", blockArguments[0]);
            content(env, morph0, context, "exposition");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","row");
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","col s12");
          var el3 = dom.createElement("h4");
          dom.setAttribute(el3,"class","section-title");
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3,"class","center-align");
          var el4 = dom.createElement("img");
          dom.setAttribute(el4,"class","thumbnail");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, content = hooks.content, get = hooks.get, block = hooks.block, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [0, 0]);
          var element1 = dom.childAt(element0, [2, 0]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [0]),0,0);
          var morph1 = dom.createMorphAt(element0,1,1);
          set(env, context, "about", blockArguments[0]);
          content(env, morph0, context, "about.title");
          block(env, morph1, context, "each", [get(env, context, "about.paragraphs")], {}, child0, null);
          element(env, element1, context, "bind-attr", [], {"src": get(env, context, "about.pic")});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","about");
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","image-padder");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","container");
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","row");
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","col s12");
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","page-title");
        var el7 = dom.createTextNode("about ML Recycling");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","about-content");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","container");
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0, 1, 0]),0,0);
        block(env, morph0, context, "each", [get(env, context, "model")], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('front/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createElement("span");
            dom.setAttribute(el1,"class","link-title");
            var el2 = dom.createTextNode("about our company");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createElement("span");
            dom.setAttribute(el1,"class","link-title");
            var el2 = dom.createTextNode("our products");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child2 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createElement("span");
            dom.setAttribute(el1,"class","link-title");
            var el2 = dom.createTextNode("careers at ML");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child3 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createElement("span");
            dom.setAttribute(el1,"class","link-title");
            var el2 = dom.createTextNode("get in touch");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("li");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
          var morph1 = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
          var morph2 = dom.createMorphAt(dom.childAt(fragment, [2]),0,0);
          var morph3 = dom.createMorphAt(dom.childAt(fragment, [3]),0,0);
          block(env, morph0, context, "link-to", ["about"], {}, child0, null);
          block(env, morph1, context, "link-to", ["products"], {}, child1, null);
          block(env, morph2, context, "link-to", ["careers"], {}, child2, null);
          block(env, morph3, context, "link-to", ["contact"], {}, child3, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","link-title");
          var el2 = dom.createTextNode("home");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","link-title");
          var el2 = dom.createTextNode("about our company");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child3 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","link-title");
          var el2 = dom.createTextNode("our products");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child4 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","link-title");
          var el2 = dom.createTextNode("careers at ML");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child5 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","link-title");
          var el2 = dom.createTextNode("get in touch");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("main");
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"id","header");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"id","content");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"id","footer");
        var el3 = dom.createElement("footer");
        dom.setAttribute(el3,"class","page-footer");
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","container");
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","row");
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","col l8 s12");
        var el7 = dom.createElement("h5");
        var el8 = dom.createTextNode("ML Recycling");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("p");
        var el8 = dom.createTextNode("recycling our way to a greener future");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","col l4 s12");
        var el7 = dom.createElement("h5");
        var el8 = dom.createTextNode("links");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("ul");
        var el8 = dom.createElement("li");
        var el9 = dom.createComment("");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("li");
        var el9 = dom.createComment("");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("li");
        var el9 = dom.createComment("");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("li");
        var el9 = dom.createComment("");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("li");
        var el9 = dom.createComment("");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, inline = hooks.inline, block = hooks.block, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [0]);
        var element2 = dom.childAt(element0, [2, 0]);
        var element3 = dom.childAt(element2, [0, 0, 1, 1]);
        var morph0 = dom.createUnsafeMorphAt(element1,0,0);
        var morph1 = dom.createMorphAt(element1,1,1);
        var morph2 = dom.createUnsafeMorphAt(dom.childAt(element0, [1]),0,0);
        var morph3 = dom.createMorphAt(dom.childAt(element3, [0]),0,0);
        var morph4 = dom.createMorphAt(dom.childAt(element3, [1]),0,0);
        var morph5 = dom.createMorphAt(dom.childAt(element3, [2]),0,0);
        var morph6 = dom.createMorphAt(dom.childAt(element3, [3]),0,0);
        var morph7 = dom.createMorphAt(dom.childAt(element3, [4]),0,0);
        var morph8 = dom.createMorphAt(element2,1,1);
        var morph9 = dom.createMorphAt(fragment,1,1,contextualElement);
        dom.insertBoundary(fragment, null);
        inline(env, morph0, context, "outlet", ["header"], {});
        block(env, morph1, context, "md-navbar", [], {"name": "ML Recycling", "classNames": "cloudy z-depth-2"}, child0, null);
        content(env, morph2, context, "outlet");
        block(env, morph3, context, "link-to", ["index"], {}, child1, null);
        block(env, morph4, context, "link-to", ["about"], {}, child2, null);
        block(env, morph5, context, "link-to", ["products"], {}, child3, null);
        block(env, morph6, context, "link-to", ["careers"], {}, child4, null);
        block(env, morph7, context, "link-to", ["contact"], {}, child5, null);
        inline(env, morph8, context, "md-copyright", [], {"text": "ML Recycling", "startYear": 2008});
        content(env, morph9, context, "md-modal-container");
        return fragment;
      }
    };
  }()));

});
define('front/templates/careers', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          var morph1 = dom.createMorphAt(fragment,1,1,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          inline(env, morph0, context, "md-tab", [], {"value": "team", "title": "Our Team"});
          inline(env, morph1, context, "md-tab", [], {"value": "jobs", "title": "Open Positions"});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","row");
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","col-xs-12");
          var el3 = dom.createElement("h4");
          dom.setAttribute(el3,"class","page-bs");
          var el4 = dom.createTextNode("stuff about our team");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3,"class","divider");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("p");
          dom.setAttribute(el3,"class","exposition");
          var el4 = dom.createTextNode("Our team is composed of dedicated professionals who are committed to protecting the environment while providing our customers with excellent service. Our agents are located across the nation close to several of the largest shipping hubs to allow for swift and convenient transport at a moment’s notice. Their work goes far beyond contact with only principal recyclers, reaching out to the industrial, agricultural, and other commercial interests that might otherwise find no outlet for the plastic waste byproducts produced.");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          var child0 = (function() {
            return {
              isHTMLBars: true,
              revision: "Ember@1.12.0",
              blockParams: 0,
              cachedFragment: null,
              hasRendered: false,
              build: function build(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createComment("");
                dom.appendChild(el0, el1);
                return el0;
              },
              render: function render(context, env, contextualElement) {
                var dom = env.dom;
                var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
                dom.detectNamespace(contextualElement);
                var fragment;
                if (env.useFragmentCache && dom.canClone) {
                  if (this.cachedFragment === null) {
                    fragment = this.build(dom);
                    if (this.hasRendered) {
                      this.cachedFragment = fragment;
                    } else {
                      this.hasRendered = true;
                    }
                  }
                  if (this.cachedFragment) {
                    fragment = dom.cloneNode(this.cachedFragment, true);
                  }
                } else {
                  fragment = this.build(dom);
                }
                var morph0 = dom.createUnsafeMorphAt(fragment,0,0,contextualElement);
                dom.insertBoundary(fragment, null);
                dom.insertBoundary(fragment, 0);
                inline(env, morph0, context, "render", ["careers/job", get(env, context, "job")], {});
                return fragment;
              }
            };
          }());
          return {
            isHTMLBars: true,
            revision: "Ember@1.12.0",
            blockParams: 1,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement, blockArguments) {
              var dom = env.dom;
              var hooks = env.hooks, set = hooks.set, get = hooks.get, block = hooks.block;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
              dom.insertBoundary(fragment, null);
              dom.insertBoundary(fragment, 0);
              set(env, context, "job", blockArguments[0]);
              block(env, morph0, context, "actionable-collapsible", [], {"title": get(env, context, "job.headline"), "payload": get(env, context, "job"), "action": "selectJob", "active": get(env, context, "job.isActive")}, child0, null);
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, null);
            dom.insertBoundary(fragment, 0);
            block(env, morph0, context, "each", [get(env, context, "model")], {}, child0, null);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","row");
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","col s12");
          var el3 = dom.createElement("h4");
          dom.setAttribute(el3,"class","page-bs");
          var el4 = dom.createTextNode("we have positions open");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("p");
          dom.setAttribute(el3,"class","exposition");
          var el4 = dom.createTextNode("some junk about the benefits");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","row");
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","col s12");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1, 0]),0,0);
          block(env, morph0, context, "md-card-collapsible", [], {}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","careers");
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","image-padder");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","container");
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","row");
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","col s12");
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","page-title");
        var el7 = dom.createTextNode("your career at ML Recycling");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","careers-content");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","container");
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","row");
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","col-xs-12");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0, 1, 0]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [0, 0]),0,0);
        var morph1 = dom.createMorphAt(element0,1,1);
        block(env, morph0, context, "md-tabs", [], {"selected": get(env, context, "selectedTabId"), "class": "tabs-divider"}, child0, null);
        block(env, morph1, context, "if", [get(env, context, "selectedTeam")], {}, child1, child2);
        return fragment;
      }
    };
  }()));

});
define('front/templates/careers/job', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("li");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
          set(env, context, "req", blockArguments[0]);
          content(env, morph0, context, "req");
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("li");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
          set(env, context, "pref", blockArguments[0]);
          content(env, morph0, context, "pref");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","job-description");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","bold-section");
        var el2 = dom.createTextNode("required experience");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("ul");
        dom.setAttribute(el1,"class","requirements");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","bold-section");
        var el2 = dom.createTextNode("preferred experience");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("ul");
        dom.setAttribute(el1,"class","requirements");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","bold-section");
        var el2 = dom.createTextNode("how to apply");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","instructions");
        var el2 = dom.createElement("span");
        var el3 = dom.createTextNode("Send a copy of your resume and cover letter to ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("a");
        dom.setAttribute(el2,"href","mailto:mlresources.inc@gmail.com");
        var el3 = dom.createElement("span");
        var el4 = dom.createTextNode("mlresources.inc@gmail.com");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [2]),0,0);
        var morph2 = dom.createMorphAt(dom.childAt(fragment, [4]),0,0);
        content(env, morph0, context, "model.explanation");
        block(env, morph1, context, "each", [get(env, context, "model.requirements")], {}, child0, null);
        block(env, morph2, context, "each", [get(env, context, "model.preferences")], {}, child1, null);
        return fragment;
      }
    };
  }()));

});
define('front/templates/components/google-map', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
            inline(env, morph0, context, "view", ["google-map/info-window"], {"context": get(env, context, "marker")});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(" @ ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(",");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element0,0,0);
          var morph1 = dom.createMorphAt(element0,2,2);
          var morph2 = dom.createMorphAt(element0,4,4);
          var morph3 = dom.createMorphAt(fragment,3,3,contextualElement);
          dom.insertBoundary(fragment, null);
          content(env, morph0, context, "marker.title");
          content(env, morph1, context, "marker.lat");
          content(env, morph2, context, "marker.lng");
          block(env, morph3, context, "if", [get(env, context, "view.hasInfoWindow")], {}, child0, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          inline(env, morph0, context, "view", [get(env, context, "infoWindowViewClass")], {"context": get(env, context, "iw")});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","map-canvas");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"style","display: none;");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element1 = dom.childAt(fragment, [2]);
        var morph0 = dom.createMorphAt(dom.childAt(element1, [1]),1,1);
        var morph1 = dom.createMorphAt(dom.childAt(element1, [3]),1,1);
        var morph2 = dom.createMorphAt(dom.childAt(element1, [5]),1,1);
        var morph3 = dom.createMorphAt(dom.childAt(element1, [7]),1,1);
        var morph4 = dom.createMorphAt(dom.childAt(element1, [9]),1,1);
        block(env, morph0, context, "each", [get(env, context, "_markers")], {"itemViewClass": get(env, context, "markerViewClass"), "keyword": "marker"}, child0, null);
        block(env, morph1, context, "each", [get(env, context, "_infoWindows")], {"keyword": "iw"}, child1, null);
        inline(env, morph2, context, "each", [get(env, context, "_polylines")], {"itemViewClass": get(env, context, "polylineViewClass"), "keyword": "polyline"});
        inline(env, morph3, context, "each", [get(env, context, "_polygons")], {"itemViewClass": get(env, context, "polygonViewClass"), "keyword": "polygon"});
        inline(env, morph4, context, "each", [get(env, context, "_circles")], {"itemViewClass": get(env, context, "circleViewClass"), "keyword": "circle"});
        return fragment;
      }
    };
  }()));

});
define('front/templates/components/labeled-radio-button', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "radio-button", [], {"changed": "innerRadioChanged", "disabled": get(env, context, "disabled"), "groupValue": get(env, context, "groupValue"), "name": get(env, context, "name"), "required": get(env, context, "required"), "value": get(env, context, "value")});
        content(env, morph1, context, "yield");
        return fragment;
      }
    };
  }()));

});
define('front/templates/components/modal-dialog', ['exports', 'ember-modal-dialog/templates/components/modal-dialog'], function (exports, template) {

	'use strict';

	exports['default'] = template['default'];

});
define('front/templates/contact', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          inline(env, morph0, context, "google-map", [], {"lat": get(env, context, "lat"), "lng": get(env, context, "lng"), "type": get(env, context, "mapType"), "zoom": get(env, context, "zoom"), "markers": get(env, context, "markers")});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","contact");
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","image-padder");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","container");
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","row");
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","col s12");
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","page-title");
        var el7 = dom.createTextNode("get in touch");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","contact-content");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","row final");
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","col l6 s12 details");
        var el5 = dom.createElement("dl");
        dom.setAttribute(el5,"class","expositions");
        var el6 = dom.createElement("dt");
        var el7 = dom.createTextNode("email");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("dd");
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("dt");
        var el7 = dom.createTextNode("phone");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("dd");
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("dt");
        var el7 = dom.createTextNode("address");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("dd");
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","col l6 hidden-on-small-and-down maps");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0, 1, 0]);
        var element1 = dom.childAt(element0, [0, 0]);
        var morph0 = dom.createMorphAt(dom.childAt(element1, [1]),0,0);
        var morph1 = dom.createMorphAt(dom.childAt(element1, [3]),0,0);
        var morph2 = dom.createMorphAt(dom.childAt(element1, [5]),0,0);
        var morph3 = dom.createMorphAt(dom.childAt(element0, [1]),0,0);
        content(env, morph0, context, "model.email");
        content(env, morph1, context, "model.phone");
        content(env, morph2, context, "model.address");
        block(env, morph3, context, "if", [get(env, context, "marker")], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('front/templates/google-map/info-window', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h3");
        dom.setAttribute(el1,"style","margin-top: 0;");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("p");
        dom.setAttribute(el1,"style","margin-bottom: 0;");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [2]),0,0);
        content(env, morph0, context, "title");
        content(env, morph1, context, "description");
        return fragment;
      }
    };
  }()));

});
define('front/templates/google-map/polyline', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(",");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element0,0,0);
          var morph1 = dom.createMorphAt(element0,2,2);
          content(env, morph0, context, "point.lat");
          content(env, morph1, context, "point.lng");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("ul");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),1,1);
        block(env, morph0, context, "each", [get(env, context, "_path")], {"keyword": "point"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('front/templates/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            revision: "Ember@1.12.0",
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createElement("span");
              dom.setAttribute(el1,"class","exposition");
              var el2 = dom.createComment("");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, content = hooks.content;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
              content(env, morph0, context, "banner.exposition");
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
            dom.insertBoundary(fragment, null);
            dom.insertBoundary(fragment, 0);
            block(env, morph0, context, "md-card-content", [], {}, child0, null);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","col l4 s12");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
          set(env, context, "banner", blockArguments[0]);
          block(env, morph0, context, "md-card", [], {"image": get(env, context, "banner.pic"), "title": get(env, context, "banner.promoHeader"), "class": "small"}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","index");
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","hero");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","container");
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","row");
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","col s3 m2 l1");
        var el6 = dom.createElement("h1");
        dom.setAttribute(el6,"class","site-title");
        var el7 = dom.createElement("img");
        dom.setAttribute(el7,"src","images/recycle.png");
        dom.setAttribute(el7,"class","logo-image");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","col s9 m10 l11");
        var el6 = dom.createElement("h1");
        dom.setAttribute(el6,"class","site-title");
        var el7 = dom.createTextNode("ML Recycling");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","row");
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","col s12");
        var el6 = dom.createElement("h2");
        dom.setAttribute(el6,"class","site-catchphrase");
        var el7 = dom.createTextNode("Recycling our way to a greener future");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","followup");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","container");
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","row");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0, 1, 0, 0]),0,0);
        block(env, morph0, context, "each", [get(env, context, "model")], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('front/templates/index/extra', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","extra");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        return fragment;
      }
    };
  }()));

});
define('front/templates/products', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createElement("span");
            dom.setAttribute(el1,"class","opt-expo");
            var el2 = dom.createTextNode("See all the products we buy and sell");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","opt-expo");
            var el2 = dom.createTextNode("We sell all our product in bulk, if you are a bulk purchaser, please contact us.");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","opt-expo");
            var el2 = dom.createTextNode("Send us an email here: mlresources.inc@gmail.com");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child2 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","opt-expo");
            var el2 = dom.createTextNode("We buy all of our materials in bulk, if you have large amounts of material for sale, please let us know.");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","opt-expo");
            var el2 = dom.createTextNode("Send us an email here: mlresources.inc@gmail.com");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          var morph1 = dom.createMorphAt(fragment,1,1,contextualElement);
          var morph2 = dom.createMorphAt(fragment,2,2,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "actionable-collapsible", [], {"payload": "all", "title": "all", "active": get(env, context, "showAll"), "action": "selectTab"}, child0, null);
          block(env, morph1, context, "actionable-collapsible", [], {"payload": "sale", "title": "what we sell", "action": "selectTab"}, child1, null);
          block(env, morph2, context, "actionable-collapsible", [], {"payload": "purchase", "title": "what we buy", "action": "selectTab"}, child2, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createUnsafeMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          set(env, context, "product", blockArguments[0]);
          inline(env, morph0, context, "render", ["products/product", get(env, context, "product")], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","products");
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","image-padder");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","container");
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","row");
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","col s12");
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","page-title");
        var el7 = dom.createTextNode("ML Recycling's products");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","products-content");
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","container");
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","row");
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","col l3 m12 s12");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","col l9 m12 s12");
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","row");
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, get = hooks.get;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0, 1, 0, 0]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [0]),0,0);
        var morph1 = dom.createMorphAt(dom.childAt(element0, [1, 0]),0,0);
        block(env, morph0, context, "md-card-collapsible", [], {}, child0, null);
        block(env, morph1, context, "each", [get(env, context, "products")], {}, child1, null);
        return fragment;
      }
    };
  }()));

});
define('front/templates/products/product', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createElement("span");
            dom.setAttribute(el1,"class","summary");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
            content(env, morph0, context, "model.summary");
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.12.0",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createElement("span");
            dom.setAttribute(el1,"class","exposition");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
            content(env, morph0, context, "model.exposition");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.12.0",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          var morph1 = dom.createMorphAt(fragment,1,1,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "md-card-content", [], {}, child0, null);
          block(env, morph1, context, "md-card-reveal", [], {}, child1, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.12.0",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","col l6 m6 s12");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
        block(env, morph0, context, "md-card", [], {"title": get(env, context, "model.materialName"), "image": get(env, context, "model.pic"), "activator": true, "class": "medium"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('front/tests/app.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('app.js should pass jshint', function() { 
    ok(true, 'app.js should pass jshint.'); 
  });

});
define('front/tests/helpers/resolver', ['exports', 'ember/resolver', 'front/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('front/tests/helpers/resolver.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/resolver.js should pass jshint', function() { 
    ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('front/tests/helpers/start-app', ['exports', 'ember', 'front/app', 'front/router', 'front/config/environment'], function (exports, Ember, Application, Router, config) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
define('front/tests/helpers/start-app.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/start-app.js should pass jshint', function() { 
    ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('front/tests/test-helper', ['front/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('front/tests/test-helper.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('test-helper.js should pass jshint', function() { 
    ok(true, 'test-helper.js should pass jshint.'); 
  });

});
define('front/transforms/strings', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  var StringsTransform;

  StringsTransform = DS['default'].Transform.extend({
    deserialize: function deserialize(serialized) {
      return serialized;
    },
    serialize: function serialize(deserialized) {
      return deserialized;
    }
  });

  exports['default'] = StringsTransform;

});
define('front/views/application', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].View.extend({});

});
define('front/views/google-map/circle', ['exports', 'ember', 'ember-google-map/core/helpers', 'front/views/google-map/core'], function (exports, Ember, helpers, GoogleMapCoreView) {

  'use strict';

  var computed = Ember['default'].computed;
  var alias = computed.alias;

  /**
   * @class GoogleMapCircleView
   * @extends GoogleMapCoreView
   */
  exports['default'] = GoogleMapCoreView['default'].extend({
    googleFQCN: 'google.maps.Circle',

    googleProperties: {
      isClickable: { name: 'clickable', optionOnly: true },
      isVisible: { name: 'visible', event: 'visible_changed' },
      isDraggable: { name: 'draggable', event: 'draggable_changed' },
      isEditable: { name: 'editable', event: 'editable_changed' },
      radius: { event: 'radius_changed', cast: helpers['default'].cast.number },
      strokeColor: { optionOnly: true },
      strokeOpacity: { optionOnly: true, cast: helpers['default'].cast.number },
      strokeWeight: { optionOnly: true, cast: helpers['default'].cast.number },
      fillColor: { optionOnly: true },
      fillOpacity: { optionOnly: true, cast: helpers['default'].cast.number },
      zIndex: { cast: helpers['default'].cast.integer, optionOnly: true },
      map: { readOnly: true },
      'lat,lng': {
        name: 'center',
        event: 'center_changed',
        toGoogle: helpers['default']._latLngToGoogle,
        fromGoogle: helpers['default']._latLngFromGoogle
      }
    },

    // aliased from controller so that if they are not defined they use the values from the controller
    radius: alias('controller.radius'),
    zIndex: alias('controller.zIndex'),
    isVisible: alias('controller.isVisible'),
    isDraggable: alias('controller.isDraggable'),
    isClickable: alias('controller.isClickable'),
    isEditable: alias('controller.isEditable'),
    strokeColor: alias('controller.strokeColor'),
    strokeOpacity: alias('controller.strokeOpacity'),
    strokeWeight: alias('controller.strokeWeight'),
    fillColor: alias('controller.fillColor'),
    fillOpacity: alias('controller.fillOpacity'),
    lat: alias('controller.lat'),
    lng: alias('controller.lng')
  });

});
define('front/views/google-map/core', ['exports', 'ember', 'ember-google-map/core/helpers', 'ember-google-map/mixins/google-object'], function (exports, Ember, helpers, GoogleObjectMixin) {

  'use strict';

  var computed = Ember['default'].computed;
  var oneWay = computed.oneWay;
  var on = Ember['default'].on;

  /**
   * @class GoogleMapCoreView
   * @extends Ember.View
   * @uses GoogleObjectMixin
   */
  exports['default'] = Ember['default'].View.extend(GoogleObjectMixin['default'], {
    googleMapComponent: oneWay('parentView'),

    googleEventsTarget: oneWay('googleMapComponent.targetObject'),

    map: oneWay('googleMapComponent.map'),

    initGoogleObject: on('didInsertElement', function () {
      // force the creation of the object
      if (helpers['default'].hasGoogleLib() && !this.get('googleObject')) {
        this.createGoogleObject();
      }
    }),

    destroyGoogleObject: on('willDestroyElement', function () {
      var object = this.get('googleObject');
      if (object) {
        // detach from the map
        object.setMap(null);
        this.set('googleObject', null);
      }
    })
  });

});
define('front/views/google-map/info-window', ['exports', 'ember', 'ember-google-map/core/helpers', 'front/views/google-map/core', 'front/views/google-map/marker'], function (exports, Ember, helpers, GoogleMapCoreView, MarkerView) {

  'use strict';

  var observer = Ember['default'].observer;
  var on = Ember['default'].on;
  var scheduleOnce = Ember['default'].run.scheduleOnce;
  var computed = Ember['default'].computed;
  var alias = computed.alias;
  var oneWay = computed.oneWay;
  var any = computed.any;

  /**
   * @class GoogleMapInfoWindowView
   * @extends GoogleMapCoreView
   */
  exports['default'] = GoogleMapCoreView['default'].extend({
    classNames: ['google-info-window'],

    googleFQCN: 'google.maps.InfoWindow',

    // will be either the marker using us, or the component if this is a detached info-window
    templateName: any('controller.templateName', 'parentView.infoWindowTemplateName'),

    googleProperties: {
      zIndex: { event: 'zindex_changed', cast: helpers['default'].cast.integer },
      map: { readOnly: true },
      'lat,lng': {
        name: 'position',
        event: 'position_changed',
        toGoogle: helpers['default']._latLngToGoogle,
        fromGoogle: helpers['default']._latLngFromGoogle
      }
    },

    isMarkerInfoWindow: computed('parentView', function () {
      return this.get('parentView') instanceof MarkerView['default'];
    }),

    googleMapComponent: computed('isMarkerInfoWindow', function () {
      return this.get(this.get('isMarkerInfoWindow') ? 'parentView.parentView' : 'parentView');
    }),

    _coreGoogleEvents: ['closeclick'],

    // aliased from controller so that if they are not defined they use the values from the controller
    zIndex: alias('controller.zIndex'),
    lat: alias('controller.lat'),
    lng: alias('controller.lng'),
    anchor: oneWay('parentView.infoWindowAnchor'),

    visible: computed('parentView.isInfoWindowVisible', 'controller.isVisible', function (key, value) {
      var isMarkerIW = this.get('isMarkerInfoWindow');
      if (arguments.length < 2) {
        if (isMarkerIW) {
          value = this.get('parentView.isInfoWindowVisible');
        } else {
          value = this.getWithDefault('controller.isVisible', true);
          this.set('controller.isVisible', value);
        }
      } else {
        if (isMarkerIW) {
          this.set('parentView.isInfoWindowVisible', value);
        } else {
          this.set('controller.isVisible', value);
        }
      }
      return value;
    }),

    initGoogleObject: on('didInsertElement', function () {
      scheduleOnce('afterRender', this, '_initGoogleInfoWindow');
    }),

    handleInfoWindowVisibility: observer('visible', function () {
      if (this._changingVisible) {
        return;
      }
      var iw = this.get('googleObject');
      if (iw) {
        if (this.get('visible')) {
          iw.open(this.get('map'), this.get('anchor') || undefined);
        } else {
          iw.close();
        }
      }
    }),

    _initGoogleInfoWindow: function _initGoogleInfoWindow() {
      // force the creation of the marker
      if (helpers['default'].hasGoogleLib() && !this.get('googleObject')) {
        this.createGoogleObject({ content: this._backupViewElement() });
        this.handleInfoWindowVisibility();
      }
    },

    destroyGoogleObject: on('willDestroyElement', function () {
      var infoWindow = this.get('googleObject');
      if (infoWindow) {
        this._changingVisible = true;
        infoWindow.close();
        // detach from the map
        infoWindow.setMap(null);
        // free the content node
        this._restoreViewElement();
        this.set('googleObject', null);
        this._changingVisible = false;
      }
    }),

    _backupViewElement: function _backupViewElement() {
      var element = this.get('element');
      if (!this._placeholderElement) {
        this._placeholderElement = document.createElement(element.nodeName);
        element.parentNode.replaceChild(this._placeholderElement, element);
      }
      return element;
    },

    _restoreViewElement: function _restoreViewElement() {
      var element = this.get('element');
      if (this._placeholderElement) {
        this._placeholderElement.parentNode.replaceChild(element, this._placeholderElement);
        this._placeholderElement = null;
      }
      return element;
    },

    _handleCoreEvent: function _handleCoreEvent(name) {
      if (name === 'closeclick') {
        this._changingVisible = true;
        this.set('visible', false);
        this._changingVisible = false;
      }
    }
  });

});
define('front/views/google-map/marker', ['exports', 'ember', 'ember-google-map/core/helpers', 'front/views/google-map/core'], function (exports, Ember, helpers, GoogleMapCoreView) {

  'use strict';

  var computed = Ember['default'].computed;
  var alias = computed.alias;
  var oneWay = computed.oneWay;
  /**
   * @class GoogleMapMarkerView
   * @extends GoogleMapCoreView
   */
  exports['default'] = GoogleMapCoreView['default'].extend({
    googleFQCN: 'google.maps.Marker',

    googleProperties: {
      isClickable: { name: 'clickable', event: 'clickable_changed' },
      isVisible: { name: 'visible', event: 'visible_changed' },
      isDraggable: { name: 'draggable', event: 'draggable_changed' },
      title: { event: 'title_changed' },
      opacity: { cast: helpers['default'].cast.number },
      icon: { event: 'icon_changed' },
      zIndex: { event: 'zindex_changed', cast: helpers['default'].cast.integer },
      map: { readOnly: true },
      'lat,lng': {
        name: 'position',
        event: 'position_changed',
        toGoogle: helpers['default']._latLngToGoogle,
        fromGoogle: helpers['default']._latLngFromGoogle
      }
    },

    _coreGoogleEvents: ['click'],

    // aliased from controller so that if they are not defined they use the values from the controller
    title: alias('controller.title'),
    opacity: alias('controller.opacity'),
    zIndex: alias('controller.zIndex'),
    isVisible: alias('controller.isVisible'),
    isDraggable: alias('controller.isDraggable'),
    isClickable: alias('controller.isClickable'),
    icon: alias('controller.icon'),
    lat: alias('controller.lat'),
    lng: alias('controller.lng'),

    // get the info window template name from the component or own controller
    infoWindowTemplateName: computed('controller.infoWindowTemplateName', 'parentView.markerInfoWindowTemplateName', function () {
      return this.get('controller.infoWindowTemplateName') || this.get('parentView.markerInfoWindowTemplateName');
    }).readOnly(),

    infoWindowAnchor: oneWay('googleObject'),

    isInfoWindowVisible: alias('controller.isInfoWindowVisible'),

    hasInfoWindow: computed('parentView.markerHasInfoWindow', 'controller.hasInfoWindow', function () {
      var fromCtrl = this.get('controller.hasInfoWindow');
      if (fromCtrl === null || fromCtrl === undefined) {
        return !!this.get('parentView.markerHasInfoWindow');
      }
      return fromCtrl;
    }).readOnly(),

    /**
     * @inheritDoc
     */
    _handleCoreEvent: function _handleCoreEvent(name) {
      if (name === 'click') {
        this.set('isInfoWindowVisible', true);
      }
    }
  });

});
define('front/views/google-map/polygon', ['exports', 'ember', 'ember-google-map/core/helpers', 'front/views/google-map/polyline'], function (exports, Ember, helpers, GoogleMapPolylineView) {

  'use strict';

  var computed = Ember['default'].computed;
  var alias = computed.alias;

  /**
   * @class GoogleMapPolygonView
   * @extends GoogleMapPolylineView
   */
  exports['default'] = GoogleMapPolylineView['default'].extend({
    googleFQCN: 'google.maps.Polygon',

    googleProperties: computed(function () {
      return Ember['default'].merge(this._super(), {
        fillColor: { optionOnly: true },
        fillOpacity: { optionOnly: true, cast: helpers['default'].cast.number }
      });
    }).readOnly(),

    // aliased from controller so that if they are not defined they use the values from the controller
    fillColor: alias('controller.fillColor'),
    fillOpacity: alias('controller.fillOpacity')
  });

});
define('front/views/google-map/polyline', ['exports', 'ember', 'ember-google-map/core/helpers', 'front/views/google-map/core'], function (exports, Ember, helpers, GoogleMapCoreView) {

  'use strict';

  var computed = Ember['default'].computed;
  var alias = computed.alias;
  var on = Ember['default'].on;

  /**
   * @class GoogleMapPolylineView
   * @extends GoogleMapCoreView
   */
  exports['default'] = GoogleMapCoreView['default'].extend({
    googleFQCN: 'google.maps.Polyline',

    templateName: 'google-map/polyline',

    googleProperties: computed(function () {
      return {
        isClickable: { name: 'clickable', optionOnly: true },
        isVisible: { name: 'visible', event: 'visible_changed' },
        isDraggable: { name: 'draggable', event: 'draggable_changed' },
        isEditable: { name: 'editable', event: 'editable_changed' },
        isGeodesic: { name: 'geodesic', optionOnly: true },
        icons: { optionOnly: true },
        zIndex: { optionOnly: true, cast: helpers['default'].cast.integer },
        map: { readOnly: true },
        strokeColor: { optionOnly: true },
        strokeWeight: { optionOnly: true, cast: helpers['default'].cast.number },
        strokeOpacity: { optionOnly: true, cast: helpers['default'].cast.number }
      };
    }).readOnly(),

    // aliased from controller so that if they are not defined they use the values from the controller
    strokeColor: alias('controller.strokeColor'),
    strokeWeight: alias('controller.strokeWeight'),
    strokeOpacity: alias('controller.strokeOpacity'),
    zIndex: alias('controller.zIndex'),
    isVisible: alias('controller.isVisible'),
    isDraggable: alias('controller.isDraggable'),
    isClickable: alias('controller.isClickable'),
    isEditable: alias('controller.isEditable'),
    icons: alias('controller.icons'),

    initGoogleObject: on('didInsertElement', function () {
      // force the creation of the polyline
      if (helpers['default'].hasGoogleLib() && !this.get('googleObject')) {
        this.createGoogleObject({ path: this.get('controller._path.googleArray') });
      }
    })
  });

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('front/config/environment', ['ember'], function(Ember) {
  var prefix = 'front';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("front/tests/test-helper");
} else {
  require("front/app")["default"].create({"name":"front","version":"0.0.0.aea5abe4"});
}

/* jshint ignore:end */
//# sourceMappingURL=front.map