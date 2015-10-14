`import Ember from 'ember'`
a = Ember.computed.alias

CompanyController = Ember.Controller.extend
  company: a "model.company"
  contacts: a "model.contacts"

  contactKeys: ["phone", "fax", "email", "address", "exposition"]
  iconMap:
    phone: "fa fa-phone fa-lg"
    fax: "fa fa-fax fa-lg"
    email: "fa fa-envelope-o fa-lg"
    address: "fa fa-map-marker fa-lg"
    exposition: "fa fa-info-o fa-lg"

`export default CompanyController`