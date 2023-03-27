import mongoose from "mongoose";

const Comment = new mongoose.Schema({
   
    commentId: {
        type: String,
    }, 

    userId: {
        type: String,
    },

    bookId: {
        type: String,
    },

    title: {
        type: String,
    },

    content: {
        type: String,
    },

    dateCreated: {
        type: Date,
        default: Date.now 
    },

    dateModified: {
        type: Date,
        default: Date.now 
    }
},
);

export default mongoose.model('comment',Comment);

