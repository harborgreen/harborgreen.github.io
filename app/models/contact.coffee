`import DS from 'ember-data'`
`import Contacts from '../fixtures/contacts'`

Contact = DS.Model.extend
  lat: DS.attr "number"
  lng: DS.attr "number"
  zoom: DS.attr "number"
  email: DS.attr "string"
  phone: DS.attr "string"
  fax: DS.attr "string"
  contactName: DS.attr "string"
  businessName: DS.attr "string"
  address: DS.attr "string"
  locationPic: DS.attr "string"
  exposition: DS.attr "string"
  siteLink: DS.attr "string"
  banner: DS.belongsTo "banner", async: true

Contact.reopenClass FIXTURES: Contacts
`export default Contact`