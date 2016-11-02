var fs = require('fs');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var express = require('express');
var os = require('os');
var numCPUs = require("os").cpus().length;
var crossdomain = require('crossdomain');
var app = express();
var util = require('./	util');
var cluster = require('cluster');
var port = parseInt(process.argv[2]);

var log4js = require('log4js');



if (cluster.isMaster) {
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", function(worker, code, signal) {
    cluster.fork();
  });
  	}
  
  else{


//configure this to the right values as mentioned in nhttpserver code
log4js.configure({
  appenders: [
    //{ type: 'console' },
    { type: 'file', filename: 'logs/event.log', maxLogSize: 1000000000, backups:7, category: 'event' },
    { type: 'file', filename: 'logs/error.log', maxLogSize : 1000000000, backups:7, category: 'error'}
  ]
});
var logger = log4js.getLogger('event');
var errorLogger = log4js.getLogger('error');
logger.setLevel('INFO');
errorLogger.setLevel('ERROR');


process.on('uncaughtException', function(err){
	errorLogger.error(err);
});


app.use(bodyParser());

app.all("*", function(req,res, next){
	console.log("The request method is " + req.method);
	if(req.method === "POST" || req.method === "GET" || req.method === "OPTIONS"){
		next();
	}
	else
	{
		res.send(405);
		//console.log("stub for 405");
	}

});

//app.post("/:env/logging/clientEvent", function(req, res) {
	app.post("/:env/logging/:env2", function(req, res) {



	var event_remote_ip = null;
	var event_type = req.params.env2;
	if(req.get('X-Forwarded-For') != null){
		event_remote_ip = req. get('X-Forwarded-For');
	}
	console.log("remoteIP is " + event_remote_ip);

	var event_source = req.params.env;
	var event_unixtime = Math.round(+new Date()/1000);
	var event_uuid = util.createGuid();
	var event_date_pst = util.curDate();
	var hostname = os.hostname();
	console.log("hostname is " + hostname);
	console.log("event_date_pst is " + event_date_pst);
	console.log("event_uuid is " + event_uuid);

		var body = {};
		var target = req.originalUrl;
		var url = req.url;
		var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;


        body = req.body;
        console.log(body);
		var json_string = JSON.stringify(body);
		res.set("Access-Control-Allow-Origin", "*");
        res.set("Allow-Control-Allow-Methods", "POST,OPTIONS");
        res.set("Access-Control-Max-Age", "1728000");

		//This can probably be moved further upstream?
		res.send(200);

		console.log("target is" + target);
		console.log("url is" + url);
		console.log("fullurl is" + fullUrl);
		console.log("Response is " + res.toString());

		//Placeholder code before I forget
		//writeToFile(json_string);
		logger.info(json_string);
});



app.get("/heartbeat", function(req,res){
	res.send(200);
	
});

//Need to verify this working.
app.get("/crossdomain.xml", function(req, res, next){
	var xml = crossdomain({ domain: '*' });
  	res.set('Content-Type', 'application/xml; charset=utf-8');
  	res.send(xml, 200);

});

app.options("/", function(req, res){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Allow-Control-Allow-Methods", "POST,OPTIONS");
    res.header("Access-Control-Max-Age", "1728000");
    res.send(200);
});

//Make sure this is added in the end. Only to handle post requests that do not match with above routes.
app.post("*", function(req, res){
	res.send(	);
	//or is it res.status(404);
});

app.listen(8081);
}


url': 'stun:stun.l.google.com:19302'


 
