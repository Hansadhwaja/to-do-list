
//Server code start

const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const date=require(__dirname+"/date.js");
require("dotenv").config();

const app=express();
const connectionParams={useNewUrlParser:true,useUnifiedTopology:true};

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));

mongoose.connect(process.env.URL,connectionParams).then(()=>{
    console.log("Connected to DB");
}).catch((err)=>
        console.log("No connection",err)
        );

//Server code end



const itemSchema=mongoose.Schema({
    Name:String
});

const Items=mongoose.model("Item",itemSchema);

const item1=new Items({
    Name:"Welcome to your todolist."
});

const item2=new Items({
    Name:"Hit the + button to add a new item."
});
const item3=new Items({
    Name:"<--Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];

 const listSchema=mongoose.Schema({
    Name:String,
    items:[itemSchema]
 });

 const List=mongoose.model("List",listSchema);

 //const day=date.getDate();
 
   
app.get("/", function(req,res){

  
    async function itemInserted(){
        const items=await Items.find({});

        if(items.length===0){
            Items.insertMany(defaultItems);
            res.redirect("/");
        }
        else{
            res.render("list",{listItems: "Today",newWorks:items});
        }

    };
    
    itemInserted();
    
});


app.post("/",function(req,res){
    let item=req.body.newItem;

    const listName=req.body.button;
    const itemName=new Items({
        Name:item
     });

    if(listName==="Today"){
         itemName.save();
          res.redirect("/");
    }
    else{
        async function findNewItem(){
            const flag=await List.findOne({ Name: listName }).exec();
            flag.items.push(itemName);
            flag.save();
            res.redirect("/"+listName);
        };
        findNewItem();
    }

});

app.post("/delete",function(req,res){
    const checkedItemId=req.body.checkbox;
    const listName=req.body.listName;

    if(listName==="Today"){
        async function deleteItem(){
            await Items.deleteOne({_id:checkedItemId});
        };
        deleteItem();
        
        res.redirect("/");
   }
   else{
       async function deleteListItem(){
       
        await List.findOneAndUpdate({Name:listName},{$pull:{items:{_id:checkedItemId}}});
        res.redirect("/"+listName);
       };
       deleteListItem();
      
   }
});



app.get("/:template",function(req,res){
   
    const customListName=_.capitalize(req.params.template);

   

    async function findItem(){
        await List.deleteOne({Name:"Favicon.ico"});
        const flag=await List.findOne({ Name: customListName }).exec();;

        if(flag){
            res.render("list",{listItems: flag.Name,newWorks:flag.items});
        }
        else{
            const list=new List({
                Name:customListName,
                items:defaultItems
            });
            list.save();
           res.redirect("/"+customListName);
           
        }

    };
    
    findItem();
});



app.get("/about",function(req,res){
    res.render("about");
})

app.listen(process.env.PORT || 3000,function(req,res){
    console.log("Server running at port 3000");
});