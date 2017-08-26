const app = require('../app')
const https = require('https')
const fs = require('fs')

// reference:
//   https://aghassi.github.io/ssl-using-express-4/

const ssl_options = {
  key:  fs.readFileSync(`${__dirname}/../cert/key.pem`),
  cert: fs.readFileSync(`${__dirname}/../cert/cert.pem`),
  passphrase: 'f-droid'
}

https.createServer(ssl_options, app).listen(443, function () {
  console.log('HTTPS server is listening on port 443')
})
