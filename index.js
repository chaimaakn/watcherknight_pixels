const express = require("express");
const cors=require("cors");
const app=express();
const Erreurhandler = require("./middelwer/errorhandler.js");
const dotenv=require("dotenv");
const ConnectDb=require("./dataBase/main.js");
const {genertatoken,verifytoken}=require("./util/jwt.js");

dotenv.config();


app.use(express.json());//middleware
app.use(cors());

app.use("/hallowdev/watcherKnight",require("./routes/Route1.js"));
app.use("/hallowdev/watcherKnight/votes",require("./routes/Route2.js"));
app.use(Erreurhandler);





async function start(){
    try{
    await ConnectDb(process.env.DATABASE_URL);
    app.listen(process.env.PORT,()=>{console.log('server is on the port ' +process.env.PORT );});}
    catch{
        console.log("une erreur est apparu");
    }
}

start();