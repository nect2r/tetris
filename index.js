// const { createClient } = require("redis");
// const { createAdapter } = require("@socket.io/redis-adapter");

var express = require('express');
var app = express();
var server = require('http').createServer(app);

// const pubClient = createClient({ url: "redis://localhost:6379" });
// const subClient = pubClient.duplicate();

// http server를 socket.io server로 upgrade한다
var io = require('socket.io')(server);
// io.adapter(createAdapter(pubClient, subClient));

var lobby = io.of('/lobby');
var room = io.of('/room');

// localhost:3000으로 서버에 접속하면 클라이언트로 index.html을 전송한다
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// 정적파일 접근허용
app.use('/', express.static(__dirname + '/'));

room.on('connection', function (socket) {

    let roomName = null;

    function roomUsers() {
        // var sockets = new Array();

        room.sockets.forEach(sock => {
            console.log(sock);
        });

        // room.adapter.rooms.forEach(socketId => {
        //     console.log(room.sockets); // sockets.push();
        // });

        // console.log(roomUsers);

        // return sockets;
    }

    //joinRoom
    socket.on('joinRoom', function (data) {
        socket.join(data);
        roomName = data;
    });

    socket.on('lobbyUsers', function (data) {
        var sockets = room.sockets;
        var names = new Array();

        // console.log(room.adapter.rooms.get(roomName));
        roomUsers();

        for (var socketItem of sockets) {  
            names.push(socketItem[1].name);
        }

        room.to(roomName).to(socket.id).emit('lobbyUsersRes', names);
    });

    // 접속한 클라이언트의 정보가 수신되면
    socket.on('login', function (data) {
        console.log('Client logged-in:\n name:' + data.name + '\n userid: ' + data.userid);

        // socket에 클라이언트 정보를 저장한다
        socket.name = data.name;
        socket.userid = data.userid;

        // 접속된 모든 클라이언트에게 메시지를 전송한다
        room.to(roomName).emit('login', data.name);
    });

    // 클라이언트로부터의 메시지가 수신되면
    socket.on('chat', function (data) {
        console.log('Message from %s: %s', socket.name, data.msg);

        var msg = {
            from: {
                name: socket.name,
                userid: socket.userid
            },
            msg: data.msg
        };

        // 접속된 모든 클라이언트에게 메시지를 전송한다
        room.to(roomName).emit('chat', msg);
    });

    socket.on('makeRoom', function () {
        socket.join("room_" + socket.id);
        roomName = "room_" + socket.id;
    });
});

// connection이 수립되면 event handler function의 인자로 socket인 들어온다
lobby.on('connection', function (socket) {

    console.log("로비");

    function publicRooms() {
        const {
            adapter : {
                    sids, rooms           
            } 
        } = room;

        // public room list 만들기
        const publicRooms = [];
        rooms.forEach((_, key) => {
            if(sids.get(key) === undefined) {
                publicRooms.push(key);
            }
        });

        return publicRooms;
    }

    socket.on('lobbyUsers', function (data) {
        var sockets = lobby.sockets;
        var names = new Array();

        for (var socketItem of sockets) {  
            names.push(socketItem[1].name);
        }

        lobby.to(socket.id).emit('lobbyUsersRes', names, publicRooms());
    });

    // 접속한 클라이언트의 정보가 수신되면
    socket.on('login', function (data) {
        console.log('Client logged-in:\n name:' + data.name + '\n userid: ' + data.userid);

        // socket에 클라이언트 정보를 저장한다
        socket.name = data.name;
        socket.userid = data.userid;

        // 접속된 모든 클라이언트에게 메시지를 전송한다
        lobby.emit('login', data.name);
    });

    // 클라이언트로부터의 메시지가 수신되면
    socket.on('chat', function (data) {
        console.log('Message from %s: %s', socket.name, data.msg);

        var msg = {
            from: {
                name: socket.name,
                userid: socket.userid
            },
            msg: data.msg
        };

        // 메시지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메시지를 전송한다
        // socket.broadcast.emit('chat', msg);

        // 메시지를 전송한 클라이언트에게만 메시지를 전송한다
        // socket.emit('s2c chat', msg);

        // 접속된 모든 클라이언트에게 메시지를 전송한다
        lobby.emit('chat', msg);

        // 특정 클라이언트에게만 메시지를 전송한다
        // lobby.to(id).emit('s2c chat', data);
    });

    // force client disconnect from server
    socket.on('forceDisconnect', function () {
        socket.disconnect();
    })

    socket.on('disconnect', function () {
        console.log('user disconnected: ' + socket.name);
    });
});

server.listen(3000, function () {
    console.log('Socket IO server listening on port 3000');
});