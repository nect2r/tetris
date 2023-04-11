function connection(lobby) {

    lobby.on('connection', function (socket) {

        function refreshLoginUser() {
            var names = new Array();

            for (var socketItem of lobby.sockets) {
                names.push(socketItem[1].name);
            }

            lobby.emit('lobbyUsersRes', names);
        }

        function publicRooms() {
            const {
                adapter: {
                    sids, rooms
                }
            } = lobby.server._nsps.get('/room');

            // public room list 만들기
            const publicRooms = [];
            rooms.forEach((_, key) => {
                if (sids.get(key) === undefined) {
                    publicRooms.push(key);
                }
            });

            return publicRooms;
        }

        socket.on('lobbyUsers', function (data) {
            var names = new Array();

            for (var socketItem of lobby.sockets) {
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
            refreshLoginUser();
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
            console.log(lobby);
        })

        socket.on('disconnect', function () {
            console.log('user disconnected: ' + socket.name);
        });
    });
};

module.exports.connection = connection;