`import Ember from 'ember'`

AboutRoute = Ember.Route.extend
  model: ->
    @store.find "about"

`export default AboutRoute`
