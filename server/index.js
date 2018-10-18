var express = require('express');
var socket = require('socket.io');
var path = require('path');

//App setup
var app = express();

var server = app.listen(8000, function() {
    console.log("listening...");
});

app.use(express.static('html'));
app.use(express.static('.'));
app.use(express.static('imports'));

//Socket setup
var io = socket(server);

io.on('connection', function() {
    console.log('connection made to socket');
});