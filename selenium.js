require("coffee-script").register();
Machine = require("./lib/machine");

module.exports = function(options) {
  var webdriver = options.webdriver;
  var chrome = options.chrome;
  var By = webdriver.By;
  var until = webdriver.until;

  var chromeOptions = new chrome.Options();
  chromeOptions.addArguments(['--incognito']);

  var driver = new webdriver.Builder()
        .forBrowser('chrome')
        .setChromeOptions(
          new chrome.Options()
            .addArguments('--incognito')
        )
        .build();

  return Machine.buildApp(driver, webdriver).then(function() { return driver.quit(); });
};