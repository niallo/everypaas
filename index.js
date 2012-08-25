var fs = require('fs')

function EveryPaaS() {
  this.DOTCLOUD = "dotcloud"
  this.HEROKU = "heroku"
  this.NODEJITSU = "nodejitsu"
  this.NONE = "none"
  this.STRIDER = "strider"

  this.detect()
}

EveryPaaS.prototype.detect = function(env, dcf) {
  var env = env || process.env
  var dotCloudFilename = dcf || "/home/dotcloud/environment.json"
  this.paas = this.NONE
  this.herokuEnvironment = undefined
  this.striderEnvironment = undefined
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
      this.striderEnvironment = env
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
  var env = env || this.herokuEnvironment

  return (env && (env.PORT !== undefined && env.PAAS_NAME !== "strider"))
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
  var env = env || this.striderEnvironment

  return (env && env.PAAS_NAME !== undefined
    && env.PAAS_NAME.toLowerCase() === "strider")
}

EveryPaaS.prototype.getMongodbUrl = function() {

  if (this.isDotCloud()) {
    return getDotCloudVar(this.dotCloudEnvironment, "MONGODB_URL")
  }

  if (this.isHeroku()) {
    if (this.herokuEnvironment.MONGOLAB_URI)
      return this.herokuEnvironment.MONGOLAB_URI
    if (this.herokuEnvironment.MONGOHQ_URL)
      return this.herokuEnvironment.MONGOHQ_URL
    return null
  }

  if (this.isStrider()) {
    if (this.striderEnvironment.MONGODB_URL)
      return this.striderEnvironment.MONGODB_URL
    return null
  }

  return null
}

EveryPaaS.prototype.getMysqlUrl = function() {

  if (this.isDotCloud()) {
    return getDotCloudVar(this.dotCloudEnvironment, "MYSQL_URL")
  }

  if (this.isHeroku()) {
    if (this.herokuEnvironment.CLEARDB_DATABASE_URL)
      return this.herokuEnvironment.CLEARDB_DATABASE_URL
    if (this.herokuEnvironment.XEROUND_DATABASE_INTERNAL_URL)
      return this.herokuEnvironment.XEROUND_DATABASE_INTERNAL_URL
    return null
  }

  if (this.isStrider()) {
    if (this.striderEnvironment.MYSQL_URL)
      return this.striderEnvironment.MYSQL_URL
    return null
  }

  return null
}

function getDotCloudVar(dotCloudEnvironment, key) {
  for (var k in dotCloudEnvironment) {
    if (k.indexOf("DOTCLOUD_") === 0
      && k.lastIndexOf(key) !== -1) {
        return dotCloudEnvironment[k]
    }
  }

  return null
}

// Run detection when module loaded.
var ep = new EveryPaaS()

module.exports = ep
