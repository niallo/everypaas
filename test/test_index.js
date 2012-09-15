var expect = require('chai').expect,
    everypaas = require('../index')
    path = require('path')

describe("everypaas", function() {

  before(function() {
    // clear process environment
    process.env = {}
  })

  describe("#isHeroku", function() {
    it("should detect Heroku if PORT variable set", function() {
      var r = everypaas.isHeroku({PORT:123})
      expect(r).to.be.true
    })

    it("should not detect Heroku if PORT variable not set", function() {
      var r = everypaas.isHeroku({noPORT:123})
      expect(r).to.be.false
    })
  })

  describe("#isStrider", function() {

    it("should detect Strider if PAAS_NAME variable set", function() {
      var r = everypaas.isStrider({PAAS_NAME:"STRIDER"})
      expect(r).to.be.true
    })

    it("should not detect Strider if PAAS_NAME not set", function() {
      var r = everypaas.isStrider({noPAAS_NAME:"STRIDER"})
      expect(r).to.be.false
    })


  })

  describe("#isDotCloud", function() {

    // Reset dotCloud cache
    beforeEach(function() {
      everypaas.dotCloudEnvironment = undefined
    })

    it("should detect dotCloud if valid environment.json", function() {
      var r = everypaas.detect(process.env, path.join(__dirname, 'dotcloud-env-good.json'))
      expect(everypaas.isDotCloud()).to.be.true
      expect(everypaas.paas).to.eql(everypaas.DOTCLOUD)
      expect(r).to.eql(everypaas.DOTCLOUD)
    })

    it("should not detect dotCloud if non-existant environment.json", function() {
      var r = everypaas.detect(process.env, path.join(__dirname, 'dotcloud-env-nonexistant.json'))
      expect(everypaas.isDotCloud()).to.be.false
      expect(everypaas.paas).to.eql(everypaas.NONE)
      expect(r).to.eql(everypaas.NONE)
    })

    it("should not detect dotCloud if invalid environment.json", function() {
      var r = everypaas.detect(process.env, path.join(__dirname, 'dotcloud-env-bad.json'))
      expect(everypaas.isDotCloud()).to.be.false
      expect(everypaas.paas).to.eql(everypaas.NONE)
      expect(r).to.eql(everypaas.NONE)
    })

  })

  describe("#detect", function() {

    // Reset dotCloud cache
    beforeEach(function() {
      everypaas.dotCloudEnvironment = undefined
    })

    it("should set `paas` property to NONE when no PaaS found", function() {
      var r = everypaas.detect({}, path.join(__dirname, 'dotcloud-env-nonexistant.json'))
      expect(everypaas.paas).to.eql(everypaas.NONE)
      expect(r).to.eql(everypaas.NONE)
    })

    it("should set `paas` property to HEROKU when Heroku found", function() {
      var r = everypaas.detect({"PORT":123}, path.join(__dirname, 'dotcloud-env-nonexistant.json'))
      expect(everypaas.paas).to.eql(everypaas.HEROKU)
      expect(r).to.eql(everypaas.HEROKU)
    })

    it("should set `paas` property to DOTCLOUD when dotCloud found", function() {
      var r = everypaas.detect({"PORT":123, "PAAS_NAME":"strider"}, path.join(__dirname, 'dotcloud-env-good.json'))
      expect(everypaas.paas).to.eql(everypaas.DOTCLOUD)
      expect(r).to.eql(everypaas.DOTCLOUD)
    })

    it("should set `paas` property to STRIDER when Strider found", function() {
      var r = everypaas.detect({"PORT":123, "PAAS_NAME":"strider"}, path.join(__dirname, 'dotcloud-env-bad.json'))
      expect(everypaas.paas).to.eql(everypaas.STRIDER)
      expect(r).to.eql(everypaas.STRIDER)
    })

  })

  describe("#getMongodbUrl", function() {

    describe("#on dotCloud", function() {
      // Reset dotCloud cache
      beforeEach(function() {
        everypaas.dotCloudEnvironment = undefined
      })

      it("should return correct URL", function() {
        everypaas.detect({}, path.join(__dirname, 'dotcloud-env-good.json'))
        // Set a valid MongoDB service named "db"
        var url = "mongodb://valid/"
        everypaas.dotCloudEnvironment.DOTCLOUD_DB_MONGODB_URL = url
        expect(everypaas.getMongodbUrl()).to.eql(url)
        // now unset and set another service named "data"
        delete everypaas.dotCloudEnvironment['DOTCLOUD_DB_MONGODB_URL']
        everypaas.dotCloudEnvironment.DOTCLOUD_DATA_MONGODB_URL = url
        expect(everypaas.getMongodbUrl()).to.eql(url)

      })
      it("should fail when service not configured", function() {
        // no MongoDB service
        everypaas.detect({}, path.join(__dirname, 'dotcloud-env-good.json'))
        expect(everypaas.getMongodbUrl()).to.not.exist;
      })

      after(function() {
        delete everypaas.dotCloudEnvironment
      })

    })
    describe("#on Heroku", function() {
      it("should return correct URL for MongoLab", function() {
        var url = "mongodb://valid/"
        everypaas.detect({PORT:123, "MONGOLAB_URI":url})
        expect(everypaas.paas).to.eql(everypaas.HEROKU)
        expect(everypaas.getMongodbUrl()).to.eql(url)
      })
      it("should return correct URL for MongoHQ", function() {
        var url = "mongodb://valid/"
        everypaas.detect({PORT:123, "MONGOHQ_URL":url})
        expect(everypaas.paas).to.eql(everypaas.HEROKU)
        expect(everypaas.getMongodbUrl()).to.eql(url)
      })
      it("should fail when service not configured", function() {
        // no MongoDB service
        everypaas.detect({PORT:123, "NONE":"foo"})
        expect(everypaas.getMongodbUrl()).to.not.exist;
      })

    })

    describe("#on Strider", function() {
      it("should return correct URL for MongoDB", function() {
        var url = "mongodb://valid/"
        everypaas.detect({PAAS_NAME:"strider", "MONGODB_URL":url})
        expect(everypaas.paas).to.eql(everypaas.STRIDER)
        expect(everypaas.getMongodbUrl()).to.eql(url)
      })

      it("should fail when service not configured", function() {
        // no MongoDB service
        everypaas.detect({PAAS_NAME:"strider", "NONE":"foo"})
        expect(everypaas.getMongodbUrl()).to.not.exist;
      })

    })


  })

  describe("#getMysqlUrl", function() {
    describe("#on dotCloud", function() {
      // Reset dotCloud cache
      beforeEach(function() {
        everypaas.dotCloudEnvironment = undefined
      })

      it("should return correct URL", function() {
        everypaas.detect({}, path.join(__dirname, 'dotcloud-env-good.json'))
        // Set a valid MySQL service named "db"
        var url = "mysql://valid/"
        everypaas.dotCloudEnvironment.DOTCLOUD_DB_MYSQL_URL = url
        expect(everypaas.getMysqlUrl()).to.eql(url)
        // now unset and set another service named "data"
        delete everypaas.dotCloudEnvironment['DOTCLOUD_DB_MYSQL_URL']
        everypaas.dotCloudEnvironment.DOTCLOUD_DATA_MYSQL_URL = url
        expect(everypaas.getMysqlUrl()).to.eql(url)

      })
      it("should fail when service not configured", function() {
        // no MySQL service
        everypaas.detect({}, path.join(__dirname, 'dotcloud-env-good.json'))
        expect(everypaas.getMysqlUrl()).to.not.exist;
      })

      after(function() {
        delete everypaas.dotCloudEnvironment
      })

    })
    describe("#on Heroku", function() {
      it("should return correct URL for ClearDB MySQL", function() {
        var url = "mysql://valid/"
        everypaas.detect({PORT:123, "CLEARDB_DATABASE_URL":url})
        expect(everypaas.paas).to.eql(everypaas.HEROKU)
        expect(everypaas.getMysqlUrl()).to.eql(url)
      })
      it("should return correct URL for Xeround MySQL", function() {
        var url = "mysql://valid/"
        everypaas.detect({PORT:123, "XEROUND_DATABASE_INTERNAL_URL":url})
        expect(everypaas.paas).to.eql(everypaas.HEROKU)
        expect(everypaas.getMysqlUrl()).to.eql(url)
      })
      it("should fail when service not configured", function() {
        // no MySQL service
        everypaas.detect({PORT:123, "NONE":"foo"})
        expect(everypaas.getMysqlUrl()).to.not.exist;
      })

    })

    describe("#on Strider", function() {
      it("should return correct URL for MySQL", function() {
        var url = "mysql://valid/"
        everypaas.detect({PAAS_NAME:"strider", "MYSQL_URL":url})
        expect(everypaas.paas).to.eql(everypaas.STRIDER)
        expect(everypaas.getMysqlUrl()).to.eql(url)
      })

      it("should fail when service not configured", function() {
        // no MySQL service
        everypaas.detect({PAAS_NAME:"strider", "NONE":"foo"})
        expect(everypaas.getMysqlUrl()).to.not.exist;
      })

    })


  })

  describe("#getSMTP", function() {

    describe("#on Heroku", function() {
      it("should return correct transport for SendGrid", function() {
        var sgusername = "foobar"
        var sgpassword = "boff"
        everypaas.detect({PORT:123, SENDGRID_USERNAME:sgusername, SENDGRID_PASSWORD: sgpassword})
        expect(everypaas.paas).to.eql(everypaas.HEROKU)
        expect(everypaas.getSMTP()).to.eql(["SMTP", {
          service: "SendGrid",
          auth: {
            user: sgusername,
            pass: sgpassword
          }
        }])
      })

      it("should return correct transport for Mailgun", function() {
        var mgusername = "foobar"
        var mgpassword = "boff"
        var mgport = "587"
        var mghost = "mailgun.example.com"
        everypaas.detect({PORT:123,
            MAILGUN_SMTP_LOGIN:mgusername,
            MAILGUN_SMTP_PASSWORD: mgpassword,
            MAILGUN_SMTP_PORT: mgport,
            MAILGUN_SMTP_SERVER: mghost
        })
        expect(everypaas.paas).to.eql(everypaas.HEROKU)
        expect(everypaas.getSMTP()).to.eql(["SMTP", {
          host:mghost,
          port:parseInt(mgport),
          auth: {
            user: mgusername,
            pass: mgpassword
          }
        }])

      })

      it("should fail when SMTP not configured", function() {
        // no SMTP service
        everypaas.detect({PORT:123, "NONE":"foo"})
        expect(everypaas.getSMTP()).to.not.exist;
      })

    })

  })

  describe("#getPostgresqlUrl", function() {


  })

  describe("#getRedisUrl", function() {


  })

  describe("#getSolrUrl", function() {


  })


})
