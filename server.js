const { default: axios } = require('axios');
require('dotenv').config();
const io = require('socket.io')(process.env.SOCKET_APP_PORT, {
    cors: {
        orgin: [process.env.CIENT_URL]
    }
});
const users = {};
// let onlineUsers = [];
const addShift = (socketId, ipAddress, userId) => {
    axios
        .post(`${process.env.SERVER_URL}/api/startshift`, {
            userId,
            ipAddress,
            socketId,
        })
        .then((response) => {
            console.log(response.data.message);
        })
        .catch((error) => {
            console.log("error");
        });
}
const removeShift = (socketId) => {
    axios
        .post(`${process.env.SERVER_URL}/api/endshift`, {
            socketId
        })
        .then((response) => {
            console.log(response.data.message);
        })
        .catch((error) => {
            console.log(error);
        });
}

io.on("connection", socket => {
    socket.on('new-user-login', (user) => {
        // console.log("Client connected", socket.server);
        addShift(socket.id, socket.handshake.address, user._id);
        users[socket.id] = user;
        // onlineUsers=Object.values(users)
        // console.log(users)
        socket.emit('status-message', "You Joined")
        // socket.broadcast.emit('user-connected', users)
        socket.broadcast.emit('online-users', Object.values(users))
    })


    socket.on('send-feedback', user => {
        console.log("send notify")
        socket.broadcast.emit('receive-feedback', { user })
    })

    socket.on('send-notification', user => {
        console.log("send notify")
        socket.broadcast.emit('receive-notification', { user })
    })
    socket.on('send-chat-message', message => {
        // console.log(message)
        socket.broadcast.emit('receive-message', { message, users, userdetails: users[socket.id] })
    })

    //     socket.on("message",(data)=>{
    //          console.log(`Message: ${data}`);
    //          socket.send(`${data}`.toUpperCase());
    //    })

    socket.on('get-online-users', message => {
        // console.log(message)
        socket.emit('online-users', Object.values(users))
    })
    socket.on('disconnect', () => {

        if (users[socket.id]) {
            delete users[socket.id]
        }

        // socket.emit('disconnect-message', "You Disconnected")
        // socket.broadcast.emit('user-disconnected', users)
        socket.broadcast.emit('online-users', Object.values(users))
        // console.log("Client disconnected");
        removeShift(socket.id);
    })
})