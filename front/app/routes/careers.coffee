`import Ember from 'ember'`

CareersRoute = Ember.Route.extend
  queryParams: 
    jobId:
      refreshModel: false  
    selectedTabId:
      refreshModel: false
  model: ({jobId}) ->
    @store.find "job"
    .then (jobs) ->
      job = jobs.findBy "id", jobId
      return jobs if Ember.isBlank job
      job.set "isActive", true
      jobs

`export default CareersRoute`
