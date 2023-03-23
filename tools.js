
import bcrypt from 'bcrypt';

export const passwordIsCorrect = async (password, hash) => {
	const isCorrect = await bcrypt.compare(password, hash);
	//console.log(isCorrect)
	return isCorrect;
}