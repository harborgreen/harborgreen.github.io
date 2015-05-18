`import Ember from 'ember'`

CareersController = Ember.Controller.extend
  selectedTabId: "jobs"
  selectedTeam: Ember.computed.equal "selectedTabId", "team"
`export default CareersController`