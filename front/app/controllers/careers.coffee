`import Ember from 'ember'`

CareersController = Ember.Controller.extend
  queryParams: ["selectedTabId", "jobId"]
  selectedTabId: "jobs"
  selectedTeam: Ember.computed.equal "selectedTabId", "team"

  actions:
    selectJob: (job) ->
      @set "jobId", job.get("id")
  
`export default CareersController`