`import DS from 'ember-data'`

Contact = DS.Model.extend
  lat: DS.attr "number"
  lng: DS.attr "number"
  zoom: DS.attr "number"
  email: DS.attr "string"
  phone: DS.attr "string"
  address: DS.attr "string"
  
`export default Contact`