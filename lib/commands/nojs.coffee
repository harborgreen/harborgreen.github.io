RSVP = require 'rsvp'
{exec, spawn} = require "child_process"

EnvOpt = 
  name: 'environment'
  type: String
  default: 'production'
  description: 'The ember environment to create a build for'

module.exports =
  name: "nojs:publish"
  description: "Builds and publishes the application using the selenium machine"
  works: "insideProject"
  availableOptions: [EnvOpt]

  run: ->

runCmd = (cmd, opts) ->
  new RSVP.Promise (resolve, reject) ->
    exec cmd, opts, (err, stdout, stderr) ->
      return reject err if err?
      console.log stdout if stdout?
      console.log stderr if stderr?
      resolve(stdout)

