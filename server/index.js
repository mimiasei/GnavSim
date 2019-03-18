const express = require('express');
const socket = require('socket.io');
const path = require('path');
const pg = require('pg'); 
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/gnavsim_dev'; 

//App setup
var app = express();

const port = process.env.PORT || 8000;

var server = app.listen(port, function() {
    console.log(`listening on port ${port}...`);
});

app.use(express.static('html'));
app.use(express.static('.'));
app.use(express.static('imports'));

//Socket setup
var io = socket(server);

io.on('connection', function(socket) {
    console.log('connection made to socket');

    socket.id = parseInt(Math.random() * 10000);

    socket.on('chat', function(data) {
        io.sockets.emit('chat', data);
    });

    socket.on('typing', function(data) {
        socket.broadcast.emit('typing', data);
    });
});