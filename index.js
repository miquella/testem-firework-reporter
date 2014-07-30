var spawn = require('child_process').spawn

function FireworkReporter(opts){
  var clientOpts = [], DB, URL

  if (DB = process.env.FIREWORK_REPORTER_DB)
    clientOpts = clientOpts.concat(['-db', DB])
  if (URL = process.env.FIREWORK_REPORTER_URL)
    clientOpts = clientOpts.concat(['-url', URL])

  if (clientOpts.length > 0) {
    this.client = spawn('firework_client', ['-stdin'].concat(clientOpts), {stdio: ['pipe', process.stdout, process.stderr]})
  }
}
FireworkReporter.prototype = {
  report: function(prefix, data) {
    if (this.client) {
      var result = {
        test: data['name'],
        success: data['passed'],
        environment: prefix.replace(/\s+/, '_')
      }
      if (data['error']) {
        if (data['error']['message'])
          result.details = '' + data['error']['message']
        if (data['error']['actual'])
          result.actual = '' + data['error']['actual']
        if (data['error']['expected'])
          result.expected = '' + data['error']['expected']
      }

      this.client.stdin.write(JSON.stringify(result) + '\n')
    }
  },
  finish: function() {}
}

var test_reporters = require('testem/lib/ci/test_reporters')
test_reporters['firework'] = FireworkReporter

module.exports = FireworkReporter
