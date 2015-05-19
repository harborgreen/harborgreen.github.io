`import Ember from 'ember'`

ContactController = Ember.Controller.extend
  lat: Ember.computed.alias "model.lat"
  lng: Ember.computed.alias "model.lng"
  zoom: Ember.computed.alias "model.zoom"
  mapType: "road"
  marker: Ember.computed "lat", "lng", ->
    return if Ember.isBlank @get "lat"
    return if Ember.isBlank @get "lng"
    title: "Our Office"
    lat: @get "lat"
    lng: @get "lng"
  markers: Ember.computed.collect "marker"


`export default ContactController`