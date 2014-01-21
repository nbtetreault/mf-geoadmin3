var webdriver = require('browserstack-webdriver');
var assert = require('assert');

// Input capabilities
var capabilities = {
  'browser' : 'Chrome',
  'browser_version' : '31.0',
  'os' : 'Windows',
  'os_version' : '7',
  'resolution' : '1280x1024', 
  'browserstack.user' : 'oskartruffer',
  'browserstack.key' : '6jCLw3RPpCBmpAapFhe4',
  'browserstack.debug' : 'true'
}

var driver = new webdriver.Builder().
  usingServer('http://hub.browserstack.com/wd/hub').
  withCapabilities(capabilities).
  build();

driver.get('http://map3.geo.admin.ch/');
driver.manage().timeouts().implicitlyWait(1000);
driver.findElement(webdriver.By.xpath("//*[@type='search']")).sendKeys('Bern');
driver.findElement(webdriver.By.xpath("//*[contains(text(), 'Bern (BE)')]")).click();
driver.sleep(2000);
driver.getCurrentUrl().then(function(url) {
  assert.equal(url, 'http://map3.geo.admin.ch/?X=200393.27&Y=596671.16&zoom=6&lang=en&topic=ech&bgLayer=ch.swisstopo.pixelkarte-farbe');
});

driver.quit();
