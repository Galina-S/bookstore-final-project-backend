
import mongoose from 'mongoose';
import  User  from './src/models/User.js';


// mongoose.set('strictQuery', false);
// mongoose.connect(process.env.MONGODB_CONNECTION);

export const getMembers = async () => {
	const docFrontendUsers = await User.find({ accessGroups: { "$in": ['members', 'unapprovedMembers'] } });
	const frontendUsers= [];
	docFrontendUsers.forEach((docUser) => {
		frontendUsers.push({
			_id: docUser._id,
			username: docUser.username,
			// firstName: docUser.firstName,
			// lastName: docUser.lastName,
			accessGroups: docUser.accessGroups,
			favorites: docUser.favorites,
		});
	})
	return frontendUsers;
}


export const getUser = async (username, password) => {
	const user = await User.findOne({ username });
	return user;
}

export const getAnonymousUser = async () => {
	const user = await User.findOne({ username: 'anonymousUser' });
	return user;
}


export const approveMember = async (_id) => {
	const user = await User.findOne({ _id });
	user.accessGroups = user.accessGroups.map(m => m === 'unapprovedMembers' ? 'members' : m)
	await user.save();
}
  