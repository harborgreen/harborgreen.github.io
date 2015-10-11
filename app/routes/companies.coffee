`import Ember from 'ember'`

CompaniesRoute = Ember.Route.extend
  renderTemplate: ->
    @render "headers/companies",
      outlet: "header"
    @_super arguments...
  model: ->
    @store.find "banner"

`export default CompaniesRoute`
