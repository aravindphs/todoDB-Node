const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://aravind94977034:itsmedevil008@todoapplication.un8qzmr.mongodb.net/todolistDB", { useNewUrlParser:true });

const todoSchema = {
  todoName : {
    type : String,
    required : true,
  }
};

const Item = mongoose.model("item", todoSchema);

const listSchema = {
  name : String,
  items : [todoSchema]
};

const List = mongoose.model("List", listSchema);

const item1 = new Item({
  todoName : "Walking"
});
const item2 = new Item({
  todoName : "Cooking"
});

const defaultItem = [item1, item2];



app.get("/", async function(req, res) {
  const day = date.getDate();

  try {
    const items = await Item.find({});
    if(items.length === 0){
      async function insertDefaultItems() {
        try {
          await Item.insertMany(defaultItem);
          console.log("Successfully saved into DB.");
        } catch (err) {
          console.log(err);
        }
      }
      
      insertDefaultItems();
      res.redirect("/");
    } else {
      res.render("list", {listTitle: day, newListItems: items});
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/:customListName", async (req, res) => {
  const customListName = req.params.customListName;

  try {
    const foundList = await List.findOne({ name: customListName });
    if (!foundList) {
      const list = new List({
      name: customListName,
      items: defaultItem
      });
      
      list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
    }
  } catch (err) {
    console.log(err);
  }

  
});


app.post("/delete", async (req, res) => {
  const checkedItemId = req.body.checkbox;
  try {
    await Item.findByIdAndRemove(checkedItemId).exec();
    console.log("Successfully deleted!");
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});


app.post("/", async function(req, res){
  const itemName = req.body.newItem;

  if (itemName.length > 0) {
    const item = new Item({
      todoName: itemName
    });

    try {
      const result = await item.save();
      console.log("Successfully saved into DB.");
      res.redirect("/");
    } catch (err) {
      if (err.code === 11000) {
        console.log("Duplicate key error: This item already exists.");
        // Handle the error as needed, e.g., show a message to the user.
      } else {
        console.log(err);
      }
      res.redirect("/");
    }
  } else {
    res.redirect("/");
  }
});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
