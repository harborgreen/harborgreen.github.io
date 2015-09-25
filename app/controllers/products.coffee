`import Ember from 'ember'`

ProductsController = Ember.Controller.extend
  queryParams: ["forWhat"]
  forWhat: "all"
  products: Ember.computed "model.@each", "forWhat", ->
    return @get "model" if "all" is @get "forWhat"
    @get "model"
    .filterBy "forWhat", @get "forWhat"
  
  showAll: Ember.computed.equal "forWhat", "all"

  actions:
    selectTab: (tabName) ->
      @set "forWhat", tabName
  
`export default ProductsController`