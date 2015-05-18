`import CPM from 'ember-cpm'`
`import DS from 'ember-data'`

Job = DS.Model.extend
  location: DS.attr "string"
  position: DS.attr "string"
  explanation: DS.attr "string"
  requirements: DS.attr "strings"
  preferences: DS.attr "strings"

  headline: CPM.Macros.join "position", "location", " - "
  
`export default Job`