import Book from "./src/models/Book.js";
import User from "./src/models/User.js";
import * as model from './model.js';
import * as tools from './tools.js';
import * as config from './config.js';

const findNovels = async (req, res) => {
 try {
  const novels = await Book.find({category: 'Liebe' || 'Frauen'});
  return res.status(200).json(novels);
 } catch (err) {
  res.status(500).send(err);
  
 }

};

const getAllBooks = async (req, res) => {
  try {
    const getAllBooks = await Book.find();
    return res.status(200).json(getAllBooks);
  } catch (err) {
    res.status(500).send(err);
  }
};

const getOneBook = async (req, res) => {
  const bookId = req.params.id;
  let book;
  try {
    book = await Book.findOneAndUpdate({_id: bookId}, {
      $inc: { viewsCount: 1},  //increment
  },{
    returnDocument: 'after', //return an actual doc after update
});
  } catch (err) {
    res.status(500).json({message: 'Could not get any book'} );
  }
  if (!book) {
    return res.status(404).json({ message: "No book found" }); /** testen */
  }
  return res.status(200).json({book});  
};


const addNewBook = async (req, res) => {
      const {author, img, title, description, price, ISBN, 
        puplication, category, publisher, pages, viewsCount} =req.body;
      let book;
  try {
     book =  await Book.create({
      author, img, title, description, price, ISBN, 
        puplication, category, publisher, pages, viewsCount
    });

    await book.save();
  } catch (err) {
    console.log(err)
  }  
  if (!book) {
    return res.status(500).json({ message: "Unable to Add new Book" }); /** testen */
  }
  return res.status(201).json({ book }); 
};



const updateBook = async (req, res) => {
  const bookId = req.params.id;
  let book;
  const {author, img, title, description, price, 
    ISBN, puplication, category, publisher, pages, viewsCount} = req.body;
  try {
    
      book = await Book.findByIdAndUpdate(bookId, 
      {author, img, title, description, price, ISBN, puplication, category, publisher, pages, viewsCount});
      book = await book.save();
   
  } catch (err) {
    console.log(err);
  }
  if (!bookId) {
    return res.status(404).json({ message: "Unable to update by this ID" }); /** testen */
  }
  return res.status(201).json({ book }); 
};


const deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    if (!bookId) {
      res.status(400).json({
        error: true,
        message: `Book with id ${bookId} does not exist. Delete failed`,
      }); /** testen */
    }
    const deleteBook = await Book.findByIdAndDelete(bookId);
    return res.status(200).json({message: "Book successfully deleted"});
  } catch (err) {
    res.status(500).send(err);
  }
};

const registerNewUser = async (req, res) => {
   
  try {
    if (!username || !password || !matchPassword) {
      return res.status(400).json({ message: 'Please fill in all fields.' });
    }

    // Store the data in a database
    
    const user = await User.create(req.body);
    console.log(user)
    await user.save();
    
    return res.status(200).json({ message: 'Registration successful.' });
  } catch (err) {
    res.status(500).send(err);
  }
};

const loginUser =  async (req, res) => {
	const { username, password } = req.body;
	const user = await model.getUser(username, password);
  console.log(user)
	if (user !== null) {
		const passwordIsCorrect = await tools.passwordIsCorrect(password, user.hash);
		if (passwordIsCorrect) {

      const frontendUser = {
				_id: user._id,
				username: user.username,
				email: user.email,
        img: user.img
			}
      //console.log(frontendUser)
			req.session.user = frontendUser;
			req.session.cookie.expires = new Date(Date.now() + config.SECONDS_TILL_SESSION_TIMEOUT * 1000);
			req.session.save();
			res.status(200).send(frontendUser);
		} else {
			res.status(401).send('Bad password');
		}
	} else {
		res.status(401).send('Bad username or both fields');
	}
};


const getCurrentUser = async (req, res) => {
	if (req.session.user) {
		res.send(req.session.user);
	} else {
		const anonymousUser = await model.getAnonymousUser();
		res.status(200).send(anonymousUser);
	}
};






export { getAllBooks, addNewBook, 
  getOneBook, updateBook,
   deleteBook, registerNewUser, 
   loginUser, getCurrentUser,
   findNovels,

  };
