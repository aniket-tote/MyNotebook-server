const mongoose = require("mongoose");
require("dotenv").config();

const pass = process.env.ATLAS;
const mongoURI = `mongodb+srv://anikettote:${pass}@mynotebookcluster.08xnkyj.mongodb.net/MyNotebook?retryWrites=true&w=majority`;

mongoose.set("strictQuery", true);

const connectToMongo = () => {
  mongoose.connect(mongoURI, () => {
    console.log("connected to mongodb");
  });
};
module.exports = connectToMongo;
