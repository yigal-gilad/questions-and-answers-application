var elasticsearch = require('elasticsearch');
var env = require('./readenv')
var client = new elasticsearch.Client({
    host:
    'https://' + env.elastic_client_user + ':' + env.elastic_client_password + '@' + env.elastic_client_url
});

module.exports = client;