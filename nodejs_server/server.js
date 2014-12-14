var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({port: 8080});
var http = require("http");

var server = http.createServer(function(request,response){
  response.writeHeader(200, {"Content-Type": "text/plain"});
  response.write("Hello" + wss.clients.length);
  var query = require('url').parse(request.url,true);

  if (query.pathname == "/game_call"){
    wss.broadcast(JSON.stringify({ type: 1, message: 'Mäng?' }));
  }
  else if(query.pathname == "/players") {
    wss.broadcast(JSON.stringify({ type: 2, message: query.query.message }));
  }

  response.end();
}).listen(8081);


wss.broadcast = function broadcast(data) {
  for(var i in this.clients) {
    this.clients[i].send(data);
  }
};


/*var WebSocketServer = require('ws').Server
, wss = new WebSocketServer({port: 8080}); */
wss.on('connection', function(ws) {
  console.log('connection');
/*  ws.on('message', function(message) {
    console.log('received: %s', message);
  });
  ws.send(JSON.stringify({ type: 1, message: 'Text' }));*/
});
