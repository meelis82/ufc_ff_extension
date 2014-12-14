var L = console.log;
$(document).ready(function()
{
  $('#client-form input[type="button"]').click(function (e)
  {
    e.preventDefault();
    self.postMessage({ type: "removeButton" });
    self.postMessage({type: "send", message: $(this).data('msg')});
  });
});

self.port.on("wsmessage", function(m) {
  $('#log').append(m);
});

self.port.on("timerstart", function(){
  self.postMessage({ type: "showButton" });
  $("#counter").countdown360({
    radius      : 60,
    seconds     : 10,
    fontColor   : '#FFFFFF',
    onComplete: function() {
        self.postMessage({ type: "removeButton" });
    }
  }).start();
});

self.port.on("askmail", function(message) {
  var mail = prompt("Sisesta e-maili aadress!");
  self.postMessage({ type: 'mail', address: mail, message: message });
});

self.port.on("resend", function(m) {
  self.postMessage({ type: "send", message: m });
});