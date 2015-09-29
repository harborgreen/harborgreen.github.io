RSVP = require "rsvp"

asyncMap = (xs=[], promiseF, output=[]) ->
  [first, rest...] = xs
  if xs.length is 0 
    new RSVP.Promise (resolve) -> resolve(output)
  else
    promiseF first
    .then (result) -> 
      asyncMap(rest, promiseF, output.concat(result))

module.exports = asyncMap