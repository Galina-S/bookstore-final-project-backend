import mongoose from "mongoose";

export const User = new mongoose.Schema({
  username: String,
  email: String,
  hash: String,
  img: String,
  favorites: {
    type: Array,
  },
  cartItems: {
    type: Array,
  },
  accessGroups: [String],
});

export default mongoose.model("user", User);
