var notifications = require("sdk/notifications");
var Request = require("sdk/request").Request
var data = require("sdk/self").data;
var pageWorkers = require("sdk/page-worker");
var tabs = require("sdk/tabs");
var prefs = require("sdk/simple-prefs").prefs;
const tmr = require('sdk/timers');
var timerID = 0;
var button;

var wsWorker = pageWorkers.Page({
  contentUrl: data.url('worker.html'),
  contentScriptFile: data.url('worker.js')
});
var myPanel = require("sdk/panel").Panel({
  width: 180,
  height: 235,
  contentURL: data.url('client.html'),
  contentScriptFile: [data.url('jquery.min.js'), data.url('countdown.js'),data.url('client.js')],
  contentStyleFile: data.url("style.css")
});

wsWorker.on('message', function(m) {
  var object = JSON.parse(m);

  if(object.type == 1) {
    myPanel.show();
    myPanel.port.emit("timerstart");
    myPanel.port.emit("wsmessage", object.message);
  }
  else if(object.type == 2) {
    notifications.notify({
      title: 'Mängus osalevad:',
      text: object.message,
      iconURL: data.url('ic_launcher.png')
    });
  }
});

myPanel.on('message', function(m) {
  if (m.type == 'send') {
    if (typeof prefs.mailAddress != 'undefined' && prefs.mailAddress != '') {
      var latestRequest = Request({
        url: "http://ufc.fenomen.ee/api/play",
        content: {
          'email': prefs.mailAddress,
          'confirm': m.message
        },
        onComplete: function (response) {
          notifications.notify({
            text: "Mängu päring saadetud!",
            iconURL: data.url('ic_launcher.png')
          });
        }
      });
      latestRequest.post();
      myPanel.hide();
    }
    else {
      myPanel.port.emit("askmail", m.message);
    }
  }
  else if(m.type == 'mail') {
    prefs.mailAddress = m.address;
    myPanel.port.emit("resend", m.message);
  }
  else if(m.type == 'showButton') {
    button = require("sdk/ui/button/action").ActionButton({
      id: "ufcicon",
      label: "Open the Websocket Client Page",
      icon: {
        "16": data.url('ic_launcher.png')
      },
      onClick: function(state) {
          myPanel.show();
      }
    });
  }
  else if(m.type == 'removeButton') {
      button.destroy();
      myPanel.hide();
  }
});

wsWorker.on('message', function(message) {
    switch(message.type) {
        case 'message':
            notifications.notify({ text: message.message });
            break;
        case 'timerStart':
            if (timerID) {
                tmr.clearInterval(timerID);
            }
            timerID = tmr.setInterval(function(){
                wsWorker.port.emit("start");
            }, 5000);
            break;
        case 'timerStop':
            if (timerID) {
                tmr.clearInterval(timerID);
            }
        break;
    }
});