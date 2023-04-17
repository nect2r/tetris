var express = require('express');
var app = express();
var server = require('http').createServer(app);

// http server를 socket.io server로 upgrade한다
var io = require('socket.io')(server);

var lobby = io.of('/lobby');
var lobbyModule = require('./js/lobby');
var room = io.of('/room');
var roomModule = require('./js/room');

// localhost:3000으로 서버에 접속하면 클라이언트로 index.html을 전송한다
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// 정적파일 접근허용
app.use('/', express.static(__dirname + '/'));

// connection이 수립되면 event handler function의 인자로 socket인 들어온다
lobbyModule.connection(lobby);
roomModule.connection(room);

server.listen(3000, function () {
    console.log('Socket IO server listening on port 3000');
});