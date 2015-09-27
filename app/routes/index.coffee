`import Ember from 'ember'`

IndexRoute = Ember.Route.extend
  model: ->
    @store.find "banner"

`export default IndexRoute`
