`import Ember from 'ember'`

AppRoute = Ember.Route.extend
  title: (tokens=[]) ->
    base = "Harbor Green Group"
    if Ember.isPresent(tokens)
      tokens.reverse().join(" - ")  + " - #{base} ~ok"
    else
      "#{base} ~ok"

`export default AppRoute`