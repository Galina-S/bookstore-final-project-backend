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
    publisher: String, 
    pages: Number, 
    viewsCount: {type: Number, default: 0 }
});

export default mongoose.model("test-learning", Book)