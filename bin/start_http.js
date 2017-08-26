const app = require('../app')
const http = require('http')

http.createServer(app).listen(80, function () {
  console.log('HTTP server is listening on port 80')
})
