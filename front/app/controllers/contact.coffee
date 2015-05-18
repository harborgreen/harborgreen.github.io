`import Ember from 'ember'`

ContactController = Ember.Controller.extend
  lat: 33.7978494
  lng: -118.1790263
  zoom: 11
  mapType: "road"
  marker:
    title: "Our Office"
    lat: 33.7978494
    lng: -118.1790263
  markers: Ember.computed.collect "marker"


`export default ContactController`