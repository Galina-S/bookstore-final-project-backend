
import mongoose from 'mongoose';
import * as config from './config.js';
import  User  from './src/models/User.js';

mongoose.set('strictQuery', false);
mongoose.connect(config.MONGODB_CONNECTION);

export const getUser = async (username, password) => {
	const user = await User.findOne({ username });
	return user;
}

export const getAnonymousUser = async () => {
	const user = await User.findOne({ username: 'anonymousUser' });
	return user;
}
