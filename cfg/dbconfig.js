var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// var dbURI = 'mongodb://fjxx:818140@188.188.3.2:27017/fjxx'
// var dbURI = 'mongodb://fjxx:818140@fjxx.vicp.net:27017/fjxxv2'
var dbURI='mongodb://fjxx:818140@188.188.3.2:27017/fjxxv2'
// var dbURI='mongodb+srv://fjxx:818140@xmily-kxubs.mongodb.net/fjxxv2?retryWrites=true'
    //var dbURI='mongodb://localhost:27017/fjxx'
    //mongoose.connect(dbURI,{useMongoClient:true});
mongoose.connect(dbURI);


mongoose.connection.on('connected', function() {
    console.log('Mongoose数据库已连接到' + dbURI);
});

mongoose.connection.on('error', function(err) {
    console.log('Mongoose连接时发发生错误:' + err);
});

mongoose.connection.on('disconnected', function() {
    console.log('Mongoose已断开连接');
});

process.on('SIGINT', function() {
    mongoose.connection.close(function() {
        console.log('应用程序终止Mongoose已经断开连接');
        process.exit(0);
    });
});

module.exports=mongoose;