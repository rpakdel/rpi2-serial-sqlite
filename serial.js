const SerialPort = require('serialport');
const db = require('./db.js');

const port = new SerialPort('/dev/ttyAMA0', {
    baudRate: 9600,
    parser: SerialPort.parsers.readline('\n')
});

let isPortOpen = false;
 
port.on('open', function() {
  isPortOpen = true;
  console.log('> Serial port is open.');
  port.write('Node.js', function(err) {
    if (err) {
      return console.log('> Serial port error on write: ', err.message);
    }
  });
});
 
// open errors will be emitted as an error event 
port.on('error', function(err) {
  console.log('> Serial port error: ', err.message);
})

function onData(callback) {
  port.on('data', function (data) {
    const d = JSON.parse(data);
    // assume the time the data is received is when it is recorded
    // according to Adafruit driver for the AM2302, there might be a 2 second delay
    // we read the data on the arduino every 5 seconds
    // there is some processing and transmission delay too
    d.date = new Date();
    //console.log(d);
    callback(d);
  });
}

function close() {
  if (isPortOpen) {
    console.log('> Closing serial port.');
    port.close();
    console.log('> Serial port is closed.');
    isPortOpen = false;
  } else {
    console.log('> Serial port is closed.');
  }

}

module.exports = { onData, close };