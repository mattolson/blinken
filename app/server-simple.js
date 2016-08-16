var connect = require('connect');
var io = require('socket.io');
connect.createServer(
    connect.static('static')
).listen(8888);