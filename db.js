const mongoose = require("mongoose");
const mongoURI =
  "mongodb+srv://anikettote:root@mynotebookcluster.08xnkyj.mongodb.net/MyNotebook?retryWrites=true&w=majority";

mongoose.set("strictQuery", true);

const connectToMongo = () => {
  mongoose.connect(mongoURI, () => {
    console.log("connected to mongodb");
  });
};
module.exports = connectToMongo;
