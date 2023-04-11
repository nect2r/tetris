function connection(room) {

    room.on('connection', function (socket) {

        let roomName = null;

        // 현재 방에 있는 유저들의 소켓을 가져온다.
        async function roomUsers() {
            return await room.in(roomName).fetchSockets();
        }

        //joinRoom
        socket.on('joinRoom', function (data) {
            socket.join(data);
            roomName = data;
        });

        socket.on('lobbyUsers', function (data) {
            roomUsers().then((sockets) => {
                var names = new Array();

                for (var socketItem of sockets) {
                    names.push(socketItem.name);
                }

                room.to(roomName).to(socket.id).emit('lobbyUsersRes', names);
            });
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
};

module.exports.connection = connection;