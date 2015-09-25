`import Ember from 'ember'`

Grain = 
  pic: "assets/images/doge.jpg"
  promoHeader: "Harbor Green Grain"
  exposition: "Our flagship company in the grass, grain, and produce market"
  target: "companies.grain"
Gateway = 
  pic: "assets/images/doge.jpg"
  promoHeader: "Gateway Transload"
  exposition: "An industry leader in optimized logistics and warehouse management"
  target: "companies.transload"
Trade = 
  pic: "assets/images/doge.jpg"
  promoHeader: "Riverstar"
  exposition: "Our massive resources and recycling branch is responsible for keeping waste out of our ecosystem"
  target: "companies.trade"


IndexRoute = Ember.Route.extend
  model: ->
    Ember.A [Grain, Gateway, Trade]

`export default IndexRoute`
