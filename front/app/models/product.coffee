`import Ember from 'ember'`
`import DS from 'ember-data'`

Product = DS.Model.extend
  forWhat: DS.attr "string"
  summary: DS.attr "string"
  exposition: DS.attr "string"
  pic: DS.attr "string"
  materialName: DS.attr "string"

  isSale: Ember.computed.equal "forWhat", "sale"
  isPurchase: Ember.computed.equal "forWhat", "purchase"
  
`export default Product`