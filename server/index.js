var express = require('express');
var socket = require('socket.io');
var path = require('path');

//App setup
var app = express();

var server = app.listen(process.env.PORT || 8000, function() {
    console.log("listening...");
});

app.use(express.static('html'));
app.use(express.static('.'));
app.use(express.static('imports'));

//Socket setup
var io = socket(server);

io.on('connection', function(socket) {
    console.log('connection made to socket');

    socket.on('chat', function(data) {
        io.sockets.emit('chat', data);
    });

    socket.on('typing', function(data) {
        socket.broadcast.emit('typing', data);
    });
});