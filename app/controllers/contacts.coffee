`import Ember from 'ember'`

ContactsController = Ember.Controller.extend
  mainContact: Ember.computed.alias "model.main"
  contacts: Ember.computed.alias "model.contacts"
  lat: Ember.computed.alias "mainContact.lat"
  lng: Ember.computed.alias "mainContact.lng"
  zoom: Ember.computed.alias "mainContact.zoom"
  mapType: "road"
  marker: Ember.computed "lat", "lng", ->
    return if Ember.isBlank @get "lat"
    return if Ember.isBlank @get "lng"
    title: "Our Office"
    lat: @get "lat"
    lng: @get "lng"
  markers: Ember.computed.collect "marker"


`export default ContactsController`