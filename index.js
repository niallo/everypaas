var fs = require('fs')

function EveryPaaS(options) {
  this.DOTCLOUD = "dotcloud"
  this.HEROKU = "heroku"
  this.NODEJITSU = "nodejitsu"
  this.NONE = "none"
  this.STRIDER = "strider"

  this.detect()
}

EveryPaaS.prototype.detect = function(env, dcf) {
  env = env || process.env
  var dotCloudFilename = dcf || "/home/dotcloud/environment.json"
  this.paas = this.NONE
  try {
    this.getDotCloud(dotCloudFilename)
    this.paas = this.DOTCLOUD
    return this.paas
  } catch(e) {
    if (this.isHeroku(env)) {
      this.herokuEnvironment = env
      this.paas = this.HEROKU
      return this.paas
    }
    if (this.isStrider(env)) {
      this.paas = this.STRIDER
      return this.paas
    }
    if (this.isNodejitsu()) {
      this.paas = this.NODEJITSU
      return this.paas
    }
    return this.paas
  }
}

EveryPaaS.prototype.isHeroku = function (env) {

  return (env.PORT !== undefined && env.PAAS_NAME !== "strider")
}

EveryPaaS.prototype.getDotCloud = function(filename) {
  if (this.dotCloudEnvironment !== undefined) return this.dotCloudEnvironment
  try {
    var data = fs.readFileSync(filename)
    this.dotCloudEnvironment = JSON.parse(data)
    return this.dotCloudEnvironment
  } catch(e) {
    throw new Error("could not get dotcloud environment")
  }
}

EveryPaaS.prototype.isDotCloud = function() {
  return (this.dotCloudEnvironment !== undefined)
}

EveryPaaS.prototype.isNodejitsu = function() {

}

EveryPaaS.prototype.isStrider = function(env) {

  return (env.PAAS_NAME !== undefined
    && env.PAAS_NAME.toLowerCase() === "strider")
}

// Run detection when module loaded.
var ep = new EveryPaaS()

module.exports = ep;
