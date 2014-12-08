var L = console.log;
var ws = new WebSocket('ws://192.168.1.2:8080', 'jetpack-protocol');
ws.onmessage = function(ev) {
  self.postMessage(ev.data);
}
self.port.on('message', function(m) {
  ws.send(m);
});