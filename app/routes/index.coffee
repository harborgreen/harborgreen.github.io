`import Ember from 'ember'`

IndexRoute = Ember.Route.extend
  renderTemplate: ->
    @render "headers/index",
      outlet: "header"
    @_super arguments...
  model: ->
    Ember.RSVP.hash
      banners: @store.findByIds "banner", ["grain", "transload", "trade"]

`export default IndexRoute`
