`import Ember from 'ember'`

CompanyRoute = Ember.Route.extend
  model: ({id}) ->
    @store.find "company", id
    .then (company) ->
      company.get("contacts")
      .then (contacts) ->
        {company, contacts}

`export default CompanyRoute`