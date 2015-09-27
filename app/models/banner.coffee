`import DS from 'ember-data'`
`import Banners from '../fixtures/banners'`

Banner = DS.Model.extend
  promoHeader: DS.attr "string"
  pic: DS.attr "string"
  exposition: DS.attr "string"

Banner.reopenClass FIXTURES: Banners

`export default Banner`