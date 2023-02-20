import express from "express";
import mongoose from "mongoose";
import router from "./router.js";
import cors from "cors";
import * as model from "./bookModel.js"



mongoose.set('strictQuery', false)

const app = express();
app.use(express.json()); 
app.use(cors())

const PORT = 3005;
const DB_URL = "mongodb+srv://akrabinelly:5454@cluster0.3mwt3bw.mongodb.net/?retryWrites=true&w=majority"

app.get("/", (req, res) => {
    res.send(model.getApiInstructionsHtml())
});

app.use("/", router);


app.get("/test", (req, res) => {
    res.json(model.getTest())
})


const startApp = async () => {
    try {
        await mongoose.connect(DB_URL) 
        app.listen(PORT, () => console.log(`Server started on Port ${PORT}`));
    } catch (err) {
        console.log(err);
    }
} 
startApp();