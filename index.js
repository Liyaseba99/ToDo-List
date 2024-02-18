import express from "express";
import bodyParser from "body-parser";
import mongoose, { connect } from "mongoose";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todoListDB");

const listsSchema = {
  name: String,
};

const itemsSchema = {
  name: String,
  listId: String,
};

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listsSchema);

const item1 = new Item({
  name: "Welcome to ToDo List",
  listId: "0",
});

const item2 = new Item({
  name: "How are you doing?",
  listId: "0",
});

app.get("/", function (req, res) {
  List.find({}).then((lists) => {
    res.render("index.ejs", {
      stylesheet: "css/style.css",
      myList: lists,
    });
  });
});

app.get("/listDetails/:id", function (req, res) {
  const id = req.params["id"];
  let list = {};
  List.findById(id).then((res) => {
    list = res;
  });
  Item.find()
    .where("listId")
    .in([id, "0"])
    .then((items) => {
      if (items.length == 0) {
        Item.insertMany([item1, item2]);
        res.redirect("/");
      } else {
        res.render("listDetails.ejs", {
          listItems: items,
          stylesheet: "/css/listDetails.css",
          listDet: list,
        });
      }
    });
});

app.post("/listDetails/delete", function (req, res) {
  const id = req.body.item;
  Item.deleteOne({ listId: `${id}` }).then(() => {});

  res.redirect(`/listDetails/${id}`);
});

app.post("/listDetails/:id", function (req, res) {
  const id = req.params["id"];
  const item = req.body.newItem;
  const newItem = new Item({
    name: item,
    listId: id,
  });
  newItem.save();
  res.redirect(`/listDetails/${id}`);
});

app.get("/add", function (req, res) {
  res.render("newListSubmit.ejs", {
    stylesheet: "css/newListSubmit.css",
  });
});

app.post("/add", function (req, res) {
  const list = req.body.newList;
  const newList = new List({
    name: list,
  });
  newList.save();
  res.redirect("/add");
});

app.listen(port, () => {
  console.log(`Server running on port ${port} `);
});
