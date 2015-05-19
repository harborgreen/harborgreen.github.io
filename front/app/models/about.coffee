`import DS from 'ember-data'`

About = DS.Model.extend
  title: DS.attr "string"
  pic: DS.attr "string"
  paragraphs: DS.attr "strings"
  
`export default About`