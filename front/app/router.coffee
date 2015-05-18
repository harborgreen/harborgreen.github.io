`import Ember from 'ember'`
`import config from './config/environment'`

Router = Ember.Router.extend
  location: config.locationType

Router.map ->
  @resource "products", path: "/products", ->
    @route "buy"
    @route "sell"

  @route "about"

  @resource "careers", path: "/careers", ->
    @resource "job", path: "/job/:jobId", ->

  @route "contact"

`export default Router`