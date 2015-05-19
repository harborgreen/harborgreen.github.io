`import Ember from 'ember'`

IndexRoute = Ember.Route.extend
  model: ->
    @store.find "banner"
  renderTemplate: ->
    @render "index/extra",
      outlet: "header"
    @_super arguments...

`export default IndexRoute`
