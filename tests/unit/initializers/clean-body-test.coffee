`import Ember from 'ember'`
`import { initialize } from '../../../initializers/clean-body'`
`import { module, test } from 'qunit'`

application = null
registry = null

module 'Unit | Initializer | clean body',
  beforeEach: ->
    Ember.run ->
      application = Ember.Application.create()
      registry = application.registry
      application.deferReadiness()

# Replace this with your real tests.
test 'it works', (assert) ->
  initialize registry, application

  # you would normally confirm the results of the initializer here
  assert.ok true
