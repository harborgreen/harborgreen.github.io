`import Ember from 'ember'`

ProductsRoute = Ember.Route.extend
  model: ->
    @store.find "product"

`export default ProductsRoute`
