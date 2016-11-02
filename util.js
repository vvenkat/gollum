var fs = require('fs');
var util = {};
util.curDate = function(){
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

if(dd<10) {
    dd='0'+dd
} 

if(mm<10) {
    mm='0'+mm
} 

return mm+'/'+dd+'/'+yyyy;
}

   util.checkFileDir = function(path) {
          fs.lstat(path, function(err, nodeStatus){
          console.log("entered fs.lstat");
          console.log(path);  
          //if(path.isDirectory == "true"){
            if(path == "./logs"){
            console.log("This is a directory");
          if(err && err.code == "ENOENT"){
            console.log("Error occurred" + err.code);
            
               try {
                    fs.mkdirSync('./logs');
                    } 
               catch (e) {
                    if (e.code != 'EEXIST') {
                     console.error("Could not set up log directory, error was: ", e);
                        process.exit(1);
                   }
              }
         //}
    }
}
else{
    console.log("this is a file");

    //this is a file
      if(err && err.code = "ENOENT"){
            console.log("No file exists, creating one");
           //if(err.code == 'ENOENT'){ //check for presence of file or dir here
               process.exit(1); //if you hit this, then the log files were removed somewhere in the middle of logging. Exit out of the process in this case. 
               
                 //}
                 fs.writeFile('./event.', 'Creating log', function(err){
                    if(err) throw err;
                    console.log ("New log file created");    

                 });
             }


         }


    });
}


// 
util.createGuid = function()
{
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}



module.exports = util;
