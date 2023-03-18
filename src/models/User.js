import mongoose from 'mongoose';

export const User= new mongoose.Schema({
	username: String,
	email: String,
	hash: String,
	img:String,
	comments: {type: Array, default: [] },
	favorites:{type: Array, default: [] }
});

export default mongoose.model("user", User)

