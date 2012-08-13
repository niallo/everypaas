var expect = require('chai').expect,
    everypaas = require('../index')
    path = require('path')

describe("everypaas", function() {

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





})
