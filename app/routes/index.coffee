`import Ember from 'ember'`

IndexRoute = Ember.Route.extend
  renderTemplate: ->
    @render "headers/index",
      outlet: "header"
    @_super arguments...
  model: ->
    @store.find "banner"

`export default IndexRoute`
