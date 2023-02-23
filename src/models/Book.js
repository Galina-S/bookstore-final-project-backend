import mongoose from "mongoose";

const Book = new mongoose.Schema( {
    author: String,
    img: String,
    title: String,
    description: String,
    price: Number,
    ISBN: Number,
    puplication: Date,
    category: Array,
    age: Number, 
    pages: Number, 
    
});

export default mongoose.model("test-learning", Book)

