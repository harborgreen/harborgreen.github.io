`import DS from 'ember-data'`

Banner = DS.Model.extend
  promoHeader: DS.attr "string"
  pic: DS.attr "string"
  exposition: DS.attr "string"
  
`export default Banner`