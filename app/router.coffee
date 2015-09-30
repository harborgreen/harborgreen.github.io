`import Ember from 'ember'`
`import config from './config/environment'`

Router = Ember.Router.extend
  location: config.locationType

Router.map ->
  @resource "companies", path: "/companies", ->
    @resource "companies.company", path: "/:id", ->
  @route "about"

`export default Router`