`import Ember from 'ember'`

ContactsRoute = Ember.Route.extend
  model: ->
    main: @store.find("contact", "main")
    contacts: @store.find("contact")

`export default ContactsRoute`
