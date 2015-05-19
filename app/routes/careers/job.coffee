`import Ember from 'ember'`

CareersJobRoute = Ember.Route.extend
  model: ({jobId})->
    @store.find "job", jobId

`export default CareersJobRoute`
