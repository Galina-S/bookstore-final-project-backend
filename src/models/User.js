import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
	username: String,
	email: String,
	hash: String,
});

export const User = mongoose.model("user", userSchema)

