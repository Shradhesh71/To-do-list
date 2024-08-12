const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;
const path = require('path');
const date = require(__dirname +"/date.js");
const mongoose = require('mongoose');
const _ = require("lodash");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.warn("connect...");
});

const itemSchema = {
    name:String
};

const day = date.getDay();

const Item = mongoose.model("Item",itemSchema); 

const item1 = new Item({
    name:"Wlecome to your To do list"
});
const item2 = new Item({
    name:"Hit the + button to add a new item"
});
const item3 = new Item({
    name:"<--Hit this to delete an item"
});
const defaultItem = [item1,item2,item3];

const listSchema = {
    name:String,
    items:[itemSchema]
}
const List = mongoose.model("List",listSchema);

// console.log(date());

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static("css"));
app.use(express.static(path.join(__dirname,"public")));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));
// app.use(express.urlencoded({extended: true})); 

// const items = ["Sleep","More Sleep","Eat food then Sleep"];
// const workitems = [];

app.get('/', (req, res) => {
    // let today = new Date();
    // let options ={
    //     weekday : "long",
    //     day:"numeric",
    //     month : "long",
    //     year : "numeric",
    // };
    // let day = today.toLocaleDateString("en-US",options);


    // var date = today.getDate();
    // var month = today.getMonth()+1;
    // var day ="";
    // if(today.getDay() == 6 || today.getDay() == 0){
    //     day = "weekend";
    // }
    // else{
    //     day = "Weekday";
    // }
    // let day = date.getDay();

    // Item.find({},(err,foundItems) => {
    //     console.log(foundItems);
    //     res.render("list",{listitle: day,itemadds: foundItems});
    // });
    Item.find({}).then((FoundItems) => {        // find all items inside items 
        if(FoundItems.length===0){
            Item.insertMany(defaultItem)
            .then( () =>{
                console.log("Successfully saved defult items to DB");
            }).catch( (err) =>{
                console.log(err);
                console.log("Failed to save defult items to DB");
            }); 
            res.redirect("/");
        }else{
            res.render("list", {listitle: day, itemadds:FoundItems});
        }   
    });
    // res.render("list",{listitle: day,itemadds: items});
});

app.get("/:customlistname",(req,res)=>{
    const customlistname = _.capitalize(req.params.customlistname);
    console.log(customlistname+" Webpage Successfully!!");

    List.findOne({name:customlistname})
    .then((foundItem)=>{
        // if(!err){
            if(!foundItem){
                console.log("Does't exist!!");

                const list =new List({
                name :customlistname,
                items:defaultItem
                });
                console.log("Add common item");
                list.save();

                res.redirect("/"+customlistname);
            }else{
                console.log("Found");
                res.render("list",{listitle: foundItem.name, itemadds:foundItem.items});
            }
        // }
    }).catch( (err) =>{
        console.log(err);
        console.log("Failed to Load Website");
    });
  

}); 

app.post('/',(req,res)=>{
    // var today = new Date();
    // var options ={
    //     weekday : "long",
    //     day:"numeric",
    //     month : "long",
    //     year : "numeric",
    // };
    // var day = today.toLocaleDateString("en-US",options);
    // let item = req.body.additem;
    // if(req.body.list==="Work list"){
    //     console.log(req.body);
    //     workitems.push(item);
    //     res.redirect("/Work");
    // }else{
    //     console.log(req.body);
    //     items.push(item);
    //     res.redirect("/");
    // }
    
    // const param ={kindofday: day,itemadd:"<li>"+ item+"</li>"};
    // res.render("list",param); 

    // for mongo
    const itemName = req.body.additem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });
    if(listName === day){
        console.log(itemName+" added Successfully!!");
        item.save();
        res.redirect("/");
    } else{
        List.findOne({name:listName})
        .then((foundItem)=>{
            foundItem.items.push(item);
            foundItem.save();
            console.log("Content Save & Website Open "+listName);
            res.redirect("/"+listName);
        })
        .catch((err)=>{
            console.log(err);
        })
    }
    
});



//   in find we get array back
// in findone we get object back


// app.get('/Work', (req, res) => {
//     res.render("list",{listitle:"Work list",itemadds: workitems});
// });

// app.get('/about',(req,res)=>{
//     res.render("about");
// })

app.post('/delete',(req,res)=>{
    const checkedItemId = req.body.checkbox;
    console.log("THis ID item is delete: "+checkedItemId);

    const listName = req.body.listName;
    if(listName === day){
        Item.findByIdAndRemove(checkedItemId)
        .then( () =>{
            res.redirect("/");
            console.log("Successfully delete item to DB");
        }).catch( (err) =>{
            console.log(err);
            console.log("Failed to delete item to DB");
        });
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then( () =>{
                console.log("Successfully loaded" + listName);
                res.redirect("/" + listName);
        })
        .catch( (err) =>{
            console.log(err);
            console.log("Failed to load  Hiiiii");
        });
    }
     
});

app.listen(port,() => {
    console.log('listening on port '+port);
});