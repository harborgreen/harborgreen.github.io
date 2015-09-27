`import Ember from 'ember'`

AboutRoute = Ember.Route.extend
  renderTemplate: ->
    @render "headers/about",
      outlet: "header"
    @_super arguments...
  model: ->
    @store.find "about"
    
`export default AboutRoute`
