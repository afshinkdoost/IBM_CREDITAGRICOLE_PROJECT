var express = require('express'),
    app = express(),
    url  = require('url'),
    qs = require('querystring'),
    http = require('http'),
    twilio = require('twilio');


var port = (process.env.VCAP_APP_PORT || 3000);

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();
// Pull in Twilio config from the BlueMix environment
// The VCAP_SERVICES environment variable contains a JSON string with all your
// Bluemix environment data

var config = JSON.parse(process.env.VCAP_SERVICES);

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// Loop through user-provided config info and pull out our Twilio credentials
var accountSid, authToken;
if (process.env.VCAP_SERVICES) {
    var env = JSON.parse(process.env.VCAP_SERVICES);
    var credentials = env['user-provided'][0]['credentials'];
    accountSid = credentials.accountSID;
    authToken = credentials.authToken;
}

app.get('/message', function (req, res) {
    var client = new twilio.RestClient(accountSid, authToken);
    client.sendMessage({
        to:'+33667041767',
        from:'+33644601092',
        body:'Welcome To BlueMix service'
    },function(err, responseData) { //this function is executed when a response is received from Twilio

    if (!err) { // "err" is an error received during the request, if any

	res.send('Message received from: '+responseData.from+'contenant:'+responseData.body);
    }
    });
});



http.createServer(function (req, res) {

  if(req.url=='/yourresponse'){
  	var body = '';

  	req.setEncoding('utf8');

  	req.on('data', function(data) {
    		body += data;
  	});

  	req.on('end', function() {
    		var data = qs.parse(body);
    		var twiml = new twilio.TwimlResponse();
    		var jsonString = JSON.stringify(data);
    		var jsonDataObject = JSON.parse(jsonString);
    		twiml.message('Thanks, your message of ' + jsonDataObject.Body + ' was received!');
    		res.writeHead(200, {'Content-Type': 'text/xml'});
    	res.end(twiml.toString());
 	});
  }

}).listen(port);
