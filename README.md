Every PaaS
==========

Considering running your Node.JS app on a Platform-as-a-Service provider such
as Heroku, dotCloud, Nodejitsu - or testing it with Travis or doing testing &
continuous deployment with Strider?

EveryPaaS handles all the annoying platform-specific details so that you don't
have to. EveryPaas also makes local development a breeze according to 12-factor
app best practices.

EveryPaaS detects which environment your app is running in and abstracts away
the details of how to connect to external resources.

If you write your app with EveryPaaS, you will be able to seamlessly run it on
your dev box and any of a number of platform providers.

Supported Platforms
-------------------

* Heroku
* dotCloud
* Nodejitsu
* Travis CI
* Strider

Supported Services
------------------

* MongoDB - `everypaas.getMongodbUrl()`
  - including MongoLab and MongoHQ in Heroku Marketplace

* MySQL - `everypaas.getMysqlUrl()`
  - including ClearDB and Xeround in Heroku Marketplace

* PostgreSQL - `everypaas.getPostgresqlUrl()`

* Redis - `everypaas.getRedisUrl()`
  - including Redis To Go and Open Redis in Heroku Marketplace

* Solr - `everypaas.getSolrUrl()`
  - including Web Solr in Heroku Marketplace




