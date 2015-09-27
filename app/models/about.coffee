`import DS from 'ember-data'`
`import Abouts from '../fixtures/abouts'`

About = DS.Model.extend
  title: DS.attr "string"
  pic: DS.attr "string"
  paragraphs: DS.attr "strings"
  
About.reopenClass FIXTURES: Abouts

`export default About`