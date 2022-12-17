var express = require("express");
var app = express();
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
    res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"
  );
  next();
});
const port =process.env.PORT||2410;
app.listen(port,()=>console.log(`Node app listen port ${port}!`))

const {Client}=require ("pg")
const client=new Client({
   user:"postgres",
   password:"@mobile_DB#2000",
   database:"postgres",
   port:"5432",
   host:"db.uynzfvniovevwhgbnpdo.supabase.co",
   ssl:{rejectUnauthorized:false}
})
client.connect(function (res,err){
   console.log('Connected!!!')
})

app.get("/svr/mobiles",function(req,res){
   let brand=req.query.brand;
   let ram=req.query.RAM;
   let rom=req.query.ROM;
   let os=req.query.OS;
   let sql="SELECT*FROM mobiles"
   client.query(sql,function(err,result){
      if(err) res.status(404).send(err.message)
      else {
      let data=result
      let {rows}=data
      rows=filterParams(rows,"brand",brand)
      rows=filterParams(rows,"ram",ram)
      rows=filterParams(rows,"rom",rom)
      rows=filterParams(rows,"os",os)
      res.send({...data,rows:rows})
   }
   // client.end();
   })
})
filterParams=(arr,name,value)=>{
if(!value) return arr;
let ValueArr=value.split(",")
let arr1=arr.filter((a1)=>ValueArr.find((val)=>val===a1[name]));
return arr1;
}


app.get("/svr/mobiles/:opt",function(req,res){
   let opt=req.params.opt
   let response={}
   let query1=`SELECT*FROM mobiles`
   client.query(query1,function(err,result){
      if(err) res.send(err)
       else{
           response=result
           let {rows}=response
           let name1=rows.reduce((acc,curr)=>acc.find(a1=>a1===curr.name)?acc:[...acc,curr.name],[])
           let brand1=rows.reduce((acc,curr)=>acc.find(a1=>a1===curr.brand)?acc:[...acc,curr.brand],[])
           let Ram1=rows.reduce((acc,curr)=>acc.find(a1=>a1===curr.ram)?acc:[...acc,curr.ram],[])
           let Rom1=rows.reduce((acc,curr)=>acc.find(a1=>a1===curr.rom)?acc:[...acc,curr.rom],[])
           let OS1=rows.reduce((acc,curr)=>acc.find(a1=>a1===curr.os)?acc:[...acc,curr.os],[])
           
           let sql=brand1.findIndex(b1=>b1===opt)>=0
   ?`SELECT*FROM mobiles WHERE brand=$1`
   :Ram1.findIndex(b1=>b1===opt)>=0
   ?`SELECT*FROM mobiles WHERE ram=$1`
   :Rom1.findIndex(b1=>b1===opt)>=0
   ?`SELECT*FROM mobiles WHERE rom=$1`
   :OS1.findIndex(b1=>b1===opt)>=0
   ?`SELECT*FROM mobiles WHERE os=$1`
   :name1.findIndex(b1=>b1===opt)>=0
   ?`SELECT*FROM mobiles WHERE name=$1`
   :''
   
   client.query(sql,[opt],function(err,result){
      if(err) res.send(err)
       res.send(result)
      //  client.end();
      })
}
})
})

app.post("/svr/mobiles",function(req,res){
   let body=req.body
   let sql=`INSERT INTO mobiles(name, price, brand, ram, rom, os) VALUES ($1,$2,$3,$4,$5,$6)`
   let mobile=[body.name,body.price,body.brand,body.ram,body.rom,body.os]
   client.query(sql,mobile,function(err,result){
      if(err) res.status(404).send(err)
      else res.send(`${result.rowCount} insertion Successfully`)
   })
})

app.put("/svr/mobiles/:id",function(req,res){ 
   let id=req.params.id;
   let body=req.body
   let sql=`UPDATE mobiles SET price=$1,brand=$2,ram=$3,rom=$4,os=$5 WHERE id=$6`
   client.query(sql,[body.price,body.brand,body.ram,body.rom,body.os,id],function(err,result){
      if(err) res.status(404).send(err)
      else res.send({...body,id:id})
   })
})

app.delete("/svr/mobiles/:name",function(req,res){
   let name=req.params.name;
   let sql=`DELETE FROM mobiles WHERE name=$1`
   client.query(sql,[name],function(err,result){
      if (err) res.status(404).send(err)
      else res.send ("Deleted Successfully")
   })
})

 