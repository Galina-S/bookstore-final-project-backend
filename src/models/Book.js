import mongoose from "mongoose";

const Book = new mongoose.Schema( {
    author: String,
    img: {type: String, default :"https://i.ibb.co/mh9LSfd/keinBild.jpg"},
    title: String,
    description: String,
    price: Number,
    ISBN: Number,
    puplication: Date,
    category: Array,
    publisher: String, 
    pages: Number, 
    viewsCount: {type: Number, default: 0 },
    comments: {type:Array, default:[]}
});

export default mongoose.model("test-learning", Book)