`import Ember from 'ember'`

CompaniesRoute = Ember.Route.extend
  model: ->
    @store.find "company"

`export default CompaniesRoute`
