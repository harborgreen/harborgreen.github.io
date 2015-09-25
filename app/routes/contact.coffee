`import Ember from 'ember'`

AboutRoute = Ember.Route.extend
  model: ->
    @store.find "contact", 119317261825

`export default AboutRoute`
