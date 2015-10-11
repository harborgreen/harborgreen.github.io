`import DS from 'ember-data'`
`import Banners from '../fixtures/banners'`

Banner = DS.Model.extend
  promoHeader: DS.attr "string"
  pic: DS.attr "string"
  exposition: DS.attr "string"
  siteLink: DS.attr "string"
  address: DS.attr "string"
  contacts: DS.hasMany "contact", async: true
Banner.reopenClass FIXTURES: Banners

`export default Banner`