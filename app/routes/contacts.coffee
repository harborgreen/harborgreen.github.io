`import Ember from 'ember'`

ContactsRoute = Ember.Route.extend
  renderTemplate: ->
    @render "headers/contacts",
      outlet: "header"
    @_super arguments...
  model: ->
    main: @store.find("contact", "main")
    contacts: @store.find("contact")

`export default ContactsRoute`
