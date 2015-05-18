`import Ember from 'ember'`

IndexRoute = Ember.Route.extend
  renderTemplate: ->
    @render "index/extra",
      outlet: "header"
    @_super arguments...

`export default IndexRoute`
