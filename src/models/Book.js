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

/**
var bookSchema = mongoose.Schema({
    title: {
      type: String,
      index: true,
      required: true,
      maxLength: 250,
      minLength: 1
    },
    description: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      min: 0,
      default: 0
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    pages: {
      type: Number,
      required: true,
      min: 1,
    },
    publishDate: Date,
    isbn: {
      type: String,
      index: true,
      required: true,
      maxLength: [13, 'ISBN number must be exactly 13 characters of number'],
      minLength: [13, 'ISBN number must be exactly 13 characters of number']
    },
    authors: [
      {
        type: String,
        required: true
      }
    ],
    publisher: {
      type: String,
      required: true
    },
    coverImage: String,
    coverKey: String,
    // since mongoose >= 4.x we can just use { timestamp: true},
    // but I need something to demosntrate using moongoose hooks so ..
    updated_at: Date,
    created_at: Date
  }); */

export default mongoose.model("test-learning", Book)