function connection(lobby) {

    // lobby namespace에 접속하면
    lobby.on('connection', function (socket) {

        /* 정보 이벤트 시작 */

        // lobby 접속자 목록 갱신
        function refreshLoginUser() {
            var names = new Array();

            for (var socketItem of lobby.sockets) {
                names.push(socketItem[1].name);
            }

            lobby.emit('lobbyUsersRes', names);
        }

        // public room list 갱신
        function refreshPublicRooms() {
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
        /* 정보 이벤트 끝 */

        /* 클라이언트 연결,종료이벤트 시작 */

        // 접속한 클라이언트의 정보가 수신되면
        socket.on('login', function (data) {
            console.log('Client logged-in:\n name:' + data.name + '\n userid: ' + data.userid);

            // socket에 클라이언트 정보를 저장한다
            socket.name = data.name;
            socket.userid = data.userid;

            // 접속된 모든 클라이언트에게 메시지를 전송한다
            lobby.emit('login', data.name);

            // lobby 접속자 목록 갱신
            refreshLoginUser();
        });

        // 클라이언트가 접속을 강제종료하면
        socket.on('forceDisconnect', function () {
            socket.disconnect();
        })

        // 클라이언트가 접속을 종료하면
        socket.on('disconnect', function () {
            console.log('user disconnected: ' + socket.name);
            lobby.emit('logout', socket.name);
            refreshLoginUser();
        });
        /* 클라이언트 연결,종료이벤트 끝 */
        
        /* 클라이언트 활동 이벤트 시작 */

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
            lobby.emit('chat', msg);

            // 메시지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메시지를 전송한다
            // socket.broadcast.emit('chat', msg);

            // 메시지를 전송한 클라이언트에게만 메시지를 전송한다
            // socket.emit('s2c chat', msg);

            // 특정 클라이언트에게만 메시지를 전송한다
            // lobby.to(id).emit('s2c chat', data);
        });
        /* 클라이언트 활동 이벤트 끝 */
    });
};

module.exports.connection = connection;