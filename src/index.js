const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

// const cube = JSON.parse('{"cards": [{"name": "Lightning Bolt"}, {"name": "Dissolve"}, {"name": "Elvish Mystic"}]}')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('alert', generateMessage(`Welcome to the ${user.room} room, ${user.username}`, user.room))
        socket.broadcast.to(user.room).emit('alert', generateMessage(`${user.username} has joined the room`, user.room))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (text, sender, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('alert', generateMessage(text, sender))
        callback()
    })

    socket.on('sendLocation', (coords, sender, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`, sender))
        callback()
    })

    // socket.on('dealMe', (callback) => {
    //     callback(cube)
    // })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('alert', generateMessage(`${user.username} has left the room.`, user.username))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})