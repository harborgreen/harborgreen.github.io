`import Ember from 'ember'`
a = Ember.computed.alias

IndexController = Ember.Controller.extend
  banners: a "model.banners"
  trade: a "model.trade"
  transload: a "model.transload"
  grain: a "model.grain"
    
  actions:
    externalSite: (link) ->
      window.open link, "_blank"
    scrollBack: ->
      Ember.$ "body"
      .animate 
        scrollTop: 0

`export default IndexController`