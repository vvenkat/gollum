var fs = require('fs');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var express = require('express');
var os = require('os');
var numCPUs = require("os").cpus().length;
var crossdomain = require('crossdomain');
var app = express();
var util = require('./util');
var cluster = require('cluster');
var port = parseInt(process.argv[2]);
var connectDomain = require("connect-domain");
var errorHandler;
var opError;

var log4js = require('log4js');
var dir = "./logs";



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
// Do I really need it this way? Can this be changed?
log4js.configure({
  appenders: [
    //{ type: 'console' },
    { type: 'file', filename: 'logs/event.log', maxLogSize: 1000000000, backups:7, category: 'event' },
    { type: 'file', filename: 'logs/error.log', maxLogSize : 10000000, backups:7, category: 'error'}
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

app.all("*", function(req,res,next){
	console.log("The request method is " + req.method);
	if(req.method === "POST" || req.method === "GET" || req.method === "OPTIONS"){
		next();
	}
	else
	{
		var err = new Error();
		err.status = 405;
		next (err);
		//res.send(405);
		//console.log("stub for 405");
	}

});

//app.post("/:env/logging/clientEvent", function(req, res) {
	app.post("/:env/logging/:env2", function(req, res) {



	var event_remote_ip = "";
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
	var event_logger = hostname;
	console.log("hostname is " + hostname);
	console.log("event_date_pst is " + event_date_pst);
	console.log("event_uuid is " + event_uuid);

		var body = {};
		var target = req.originalUrl;
		var url = req.url;
		var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;


        body = req.body;
        body.event_source = event_source;
        body.event_type = event_type;
        body.event_uuid = event_uuid;
        body.event_unixtime = event_unixtime;
        body.event_date_pst = event_date_pst;
        body.event_remote_ip = event_remote_ip;
        body.event_logger = event_logger;
        console.log(body);
        try{
			var json_string = JSON.stringify(body);
	}
		catch(e){
			errorLogger.error(e);
		}
		res.set("Access-Control-Allow-Origin", "*");
        res.set("Allow-Control-Allow-Methods", "POST,OPTIONS");
        res.set("Access-Control-Max-Age", "1728000");

		//This can probably be moved further upstream? Should I really always send 200?
		res.send(200);

		//Placeholder code before I forget
		//writeToFile(json_string);
		//json_string.event_source = event_source;
		
//check the presence of logs directory. Consider moving this up earlier in the code.
		fs.lstat(dir, function(err, nodeStatus){
			if(err){
				if(err.code == 'ENOENT'){
					console.log("No file or directory exists, creating dir ", dir);
					try {
 						 fs.mkdirSync('./logs');
				  } catch (e) {
  						if (e.code != 'EEXIST') {
 			   console.error("Could not set up log directory, error was: ", e);
		    process.exit(1);
		  }
		}
	}
}
			else{
				logger.info(json_string);
			}
			
			

		});
		
});
//.use(errorHandler);



app.get("/heartbeat", function(req,res){
	res.send(200);
	
});
//.use(errorHandler);

//Need to verify this working.
app.get("/crossdomain.xml", function(req, res, next){
	var xml = crossdomain({ domain: '*' });
  	res.set('Content-Type', 'application/xml; charset=utf-8');
  	res.send(xml, 200);

});
//.use(errorHandler);

app.options("/", function(req, res){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Allow-Control-Allow-Methods", "POST,OPTIONS");
    res.header("Access-Control-Max-Age", "1728000");
    res.send(200);
});
//.use(errorHandler);

//Make sure this is added in the end. Only to handle post requests that do not match with above routes.
app.post("*", function(req, res){
	//res.send(404);
	res.status(404);
}).use(errorHandler);

//For any routes other than mentioned above error out
/*app.post("*", function(req, res, next)
	//opError = new Error();
	//opError.status = 404;

	next err;
});*/

/*app.use(function(err, req, res, next){
	if(err.status != 404){
		return next;
	}
	res.status(404);
	errorLogger.error(err);
	console.log(err.stack);
	res.send(err.message);
});*/

app.use(connectDomain());  
app.use(app.router);
/*errorHandler = function (err, req, res, next) {  
    res.send(404, {
        "status": "error",
        "message": err.message
    });
    next(err);
    console.log("Connect domain kicking in", err.stack);
};*/

//Not sure if we need 500 at all?
app.use(function(err, req,res, next){
	if(err.status == 404){
		errorLogger.error (err);
		console.log(err.stack);
		res.send(404);

	}
	else if(err.status == 405){
		errorLogger.error (err);
		console.log(err.stack);
		res.send(405);
	}

	

	if(err.status!= 500){
		return next;
	}
	
});

app.listen(8081);
}




 
