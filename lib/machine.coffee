path = require("path")

class Writer
  fs = require("fs-extra")

  constructor: (@base) ->

  write: (@fileContents) -> @

  intoFile: (name) ->
    filename = @makeFileName(name) 
    fs.outputFileSync(filename, @fileContents)

  makeFileName: (name) ->
    path.normalize path.join(@base, "#{name}.html")

class Machine
  asyncMap = require("./async-map")

  @buildApp = (driver, webdriver) ->
    new Machine(driver, webdriver)
    .build()

  constructor: (@driver, @webdriver) ->
    @routes = require("./paths")
    @baseURI = "http://localhost:4200"
    @by = @webdriver.By
    @until = @webdriver.until
    @writer = new Writer("selenium-dist")

  write: (string) -> @writer.write(string)

  build: ->
    asyncMap @routes, @generatePage.bind(@)

  generatePage: (route) ->
    @driver
    .get @calculateURI route
    .then =>
      @driver.wait @until.titleMatches(/~ok$/), 1000
    .then =>
      @driver.getPageSource()
    .then (source) =>
      @write(source).intoFile(@calculateFilename route)

  calculateURI: (route) ->
    path.normalize path.join(@baseURI, route)

  calculateFilename: (route) ->
    endsInSlash = /\/$/
    switch
      when endsInSlash.exec(route)? then path.join(route, "index")
      else route

module.exports = Machine