require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app = express()
const port = process.env.PORT
const passport = require('passport')
const path = require('path')
var https = require('https')
var http = require('http')
var fs = require('fs')

//Body Parser middleware
app.use(
    bodyParser.urlencoded({
        extended:false
    })
)
app.use(bodyParser.json());

const users = require('./routes/api/users');
const queue = require('./routes/api/queue');
const verify = require('./routes/api/verify');
// const admin = require('./routes/api/admin');

//DB config
const db = require('./config/keys').mongoUri;

//Connect Db
mongoose.connect(db,{ 
    useNewUrlParser: true,
    useUnifiedTopology: true
 }).
 then(() => console.log("Database Connected Successfully")).
 catch(err => console.log(err))

//Passport Middleware
app.use(passport.initialize());

//Passport config
require('./config/passport')(passport);

// app.use('/client/build', express.static('uploads'))
//Other Routes
app.use("/api/users",users);
app.use("/api/queue",queue);
app.use("/api/verify",verify);
// app.use("/api/admin",admin);

// serve on production
// if(process.env.NODE_ENV === 'production'){
//     //Set Static folder
//     app.use(express.static('client/build'));

//     app.get('*',(req,res) => {
//         res.sendFile(path.resolve(__dirname,'client','build','index.html'));
//     });
// }


// https.createServer({
//     key: fs.readFileSync('/opt/bitnami/apache2/conf/server.key'),
//     cert: fs.readFileSync('/opt/bitnami/apache2/conf/server.crt')
//   }, app)
//   .listen(port, function () {
//     console.log(`Server running on Port ${port}`);
//   })

app.listen(port, () => console.log(`Server running on Port ${port}`));