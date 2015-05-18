`import MdCollapsibleComponent from 'ember-cli-materialize/components/md-collapsible'`

Comp = MdCollapsibleComponent.extend
  accordion: true
  didInsertElement: ->
    @_super arguments...
    @$().on "click", @interacted.bind @

  willDestroyElement: ->
    @_super arguments...
    @$().off "click"

  interacted: ->
    @sendAction "action", @get "payload"

`export default Comp`