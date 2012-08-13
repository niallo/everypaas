var expect = require('chai').expect,
    everypaas = require('../index')

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

    it("should detect Strider if ", function() {
      everypaas.dotCloudEnvironment = undefined
      var r = everypaas.isStrider({PAAS_NAME:"STRIDER"})
      expect(r).to.be.true
    })

    it("should not detect Strider if PAAS_NAME not set", function() {
      var r = everypaas.isStrider({noPAAS_NAME:"STRIDER"})
      expect(r).to.be.false
    })


  })





})
