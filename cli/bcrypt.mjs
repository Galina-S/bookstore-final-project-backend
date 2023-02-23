import bcrypt from 'bcrypt';

const password = process.argv[2];

if (password === undefined) {
	console.log('SCRIPT: bcrypt');
	console.log('NAME: password-hash creator');
	console.log('-------------------------');
	console.log('EXAMPLE: npm run bcrypt mypassword');
	console.log('RESULT: bcrypt-hash for mypassword');
	process.exit();
} else {
	const salt = await bcrypt.genSalt(12);
	const hash = await bcrypt.hash(password, salt);
	console.log(hash)
	console.log(`hashing ${password} ...`);
}

//Qqqq111!  $2b$12$T2WLkU/SMxcMwxmtZc1vkuDThlbyz6L/N9VfiSOmxmJC9RwVQPPRi
//Gggg111!  $2b$12$aScZRDZKM.H6Pmhn9TyiPOs7oacQDMVh5revxqThgUmc/6APLpK7O
//Nnnn111!  $2b$12$UMD.V9JCmIwv9EeJLuqhI.W..jgLGmSH1xi09zOyvV2ta/OoUNT6q
//Mmmm111!  $2b$12$3GNnhJGyMt1RCUoUep9stezmldOstYrJ7OSMG4SfFNcvXxofcx/36