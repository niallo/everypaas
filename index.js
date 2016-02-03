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

  return (env && (env.DYNO !== undefined && env.PAAS_NAME !== "strider"))
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

//
// ## Return an argument list which can be applied to nodemailer's createTransport function
//
EveryPaaS.prototype.getSMTP = function() {

  if (this.isHeroku()) {
    var res = {}
    if (this.herokuEnvironment.SENDGRID_USERNAME && this.herokuEnvironment.SENDGRID_PASSWORD) {
      return ["SMTP",{
        service: "SendGrid",
        auth: {
          user: this.herokuEnvironment.SENDGRID_USERNAME,
          pass: this.herokuEnvironment.SENDGRID_PASSWORD
        }
      }]
    }

    if (this.herokuEnvironment.MAILGUN_SMTP_SERVER) {
      return ["SMTP",{
        host:this.herokuEnvironment.MAILGUN_SMTP_SERVER,
        port:parseInt(this.herokuEnvironment.MAILGUN_SMTP_PORT),
        auth: {
          user: this.herokuEnvironment.MAILGUN_SMTP_LOGIN,
          pass: this.herokuEnvironment.MAILGUN_SMTP_PASSWORD
        }
      }]
    }

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

EveryPaaS.prototype.getRedisUrl = function() {
  if (this.isDotCloud()) {
    return getDotCloudVar(this.dotCloudEnvironment, "REDIS_URL")
  }

  if (this.isHeroku()) {
    if (this.herokuEnvironment.REDISTOGO_URL)
      return this.herokuEnvironment.REDISTOGO_URL
    if (this.herokuEnvironment.OPENREDIS_URL)
      return this.herokuEnvironment.OPENREDIS_URL
    return null
  }

  if (this.isStrider()) {
    if (this.striderEnvironment.REDIS_HOST) {
      return 'redis://root:' + this.striderEnvironment.REDIS_PASSWORD + '@' +
        this.striderEnvironment.REDIS_HOST + ':' + this.striderEnvironment.REDIS_PORT
    }
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
