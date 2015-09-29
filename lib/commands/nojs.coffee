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

  run: (options, rawArgs) ->
    ui = @ui
    root = @project.root
    execOptions = 
      cwd: root

    runCmd("git checkout master", execOptions)
    .then ->
      runCmd("cp -Rf dist/* .", execOptions)
    .then ->
      runCmd("git add . --all && git commit -m 'auto commit from nojs build'", execOptions)
    .then ->
      runCommand("git checkout `git reflog HEAD | sed -n " +
        "'/checkout/ !d; s/.* \\(\\S*\\)$/\\1/;p' | sed '2 !d'`", execOptions)
    .then ->
      ui.write "should be good to push"


runCmd = (cmd, opts) ->
  new RSVP.Promise (resolve, reject) ->
    exec cmd, opts, (err, stdout, stderr) ->
      return reject err if err?
      console.log stdout if stdout?
      console.log stderr if stderr?
      resolve(stdout)

