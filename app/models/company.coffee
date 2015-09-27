`import DS from 'ember-data'`
`import Companies from '../fixtures/companies'`

Company = DS.Model.extend
  title: DS.attr "string"
  state: DS.attr "string"
  pic: DS.attr "string"
  address: DS.attr "string"

  contacts: DS.hasMany "contact", async: true

Company.reopenClass FIXTURES: Companies

`export default Company`