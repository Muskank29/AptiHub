const mongoose = require("mongoose");
const initdata = require("./data.js");
const Question = require("../models/question.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/aptiHub";

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Question.deleteMany({});
    await Question.insertMany(initdata.data);
    console.log("data was initialized");
};

initDB();