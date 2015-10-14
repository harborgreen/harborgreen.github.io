`import Ember from 'ember'`
a = Ember.computed.alias

IndexController = Ember.Controller.extend
  banners: a "model.banners"
  mainContact: a "model.main"
  contacts: a "model.contacts"
  lat: a "mainContact.lat"
  lng: a "mainContact.lng"
  zoom: a "mainContact.zoom"
  mapType: "road"
  marker: Ember.computed "lat", "lng", ->
    return if Ember.isBlank @get "lat"
    return if Ember.isBlank @get "lng"
    title: "Our Office"
    lat: @get "lat"
    lng: @get "lng"
  markers: Ember.computed.collect "marker"

  contactKeys: ["contactName", "phone", "fax", "email", "address"]
  iconMap:
    contactName: "fa fa-user fa-lg"
    phone: "fa fa-phone fa-lg"
    fax: "fa fa-fax fa-lg"
    email: "fa fa-envelope-o fa-lg"
    address: "fa fa-map-marker fa-lg"
    
  actions:
    externalSite: (link) ->
      window.open link, "_blank"
    scrollBack: ->
      Ember.$ "body"
      .scrollTop 0

`export default IndexController`