import express from "express";
import mongoose from "mongoose";
import router from "./router.js";
import cors from "cors";
import session from 'express-session';

import * as tools from './tools.js';
import * as config from './config.js';
import cookieParser from 'cookie-parser';
import * as model from './model.js';
import Book from "./src/models/Book.js";


mongoose.set('strictQuery', false)

const app = express();
app.use(express.json()); 

app.use(cors({
	origin: config.FRONTEND_URL,
	methods: ['POST', 'GET', 'DELETE', 'PUT', 'OPTIONS', 'HEAD'],
	credentials: true
}));
app.use(cookieParser());

app.use(
	session({
		resave: true,
		saveUninitialized: true,
		secret: config.SESSION_SECRET,
		cookie: {
			httpOnly: true,
			sameSite: 'lax',
			secure: false
		}
	})
);


const PORT = 3005;

app.get("/", (req, res) => {
    res.send(model.getApiInstructionsHtml())
});

app.use("/", router);


app.get("/test", (req, res) => {
    res.json(model.getTest())
})

app.post('/login', async (req, res) => {
	const { username, password } = req.body;
	const user = await model.getUser(username, password);
	if (user !== null) {
		const isCorrect = await tools.passwordIsCorrect(password, user.hash);
		if (isCorrect) {
			const frontendUser = {
				_id: user._id,
				username: user.username,
			
			}
			req.session.user = frontendUser;
			req.session.cookie.expires = new Date(Date.now() + config.SECONDS_TILL_SESSION_TIMEOUT * 1000);
			req.session.save();
			res.status(200).send(frontendUser);
		} else {
			const anonymousUser = await model.getAnonymousUser();
			res.status(200).send(anonymousUser);
		}
	} else {
		const anonymousUser = await model.getAnonymousUser();
		res.status(200).send(anonymousUser);
	}
});

app.get('/get-current-user', async (req, res) => {
	if (req.session.user) {
		res.send(req.session.user);
	} else {
		const anonymousUser = await model.getAnonymousUser();
		res.status(200).send(anonymousUser);
	}
});

app.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			res.send('ERROR');
		} else {
			res.send('logged out');
		}
	});
});





// app.use('/books/:id', (req, res, next) => {
// 	if (req.method === 'GET') {
// 	  // Redirect the GET request to /books/:id/open
// 	  res.redirect(`/book/${req.params.id}/open`);
// 	} else {
// 	  // Pass the request to the next middleware
// 	  next();
// 	}
//   });



//   app.put('/books/:id/open', async (req, res) => {
// 	try {
// 	const bookId = req.params.id;
// 	const book = req.body;

// 	if (!bookId) {
// 		res.status(400).json({ message: "ID Not found" }); /** testen */
// 	  }

// 	  const updateOneBook = await Book.findByIdAndUpdate(bookId, book);
// 	  return res.json(updateOneBook);

	// try {
	//   const book = await Book.findOneAndUpdate(
	// 	{ _id: req.params.id },
		
	// 	//{ $inc: { viewsCount: 1 } },
	// 	{ new: true }
	//   );
  
	//   res.json({ success: true, book });
	// } catch (err) {
	//   console.log(err);
	//   res.status(500).json({ success: false, message: 'Internal server error' });
	// }
// } catch (err) {
//     res.status(500).send(err);
// }
//   });
  

  app.get('/books/:id/views', async (req, res) => {
	const book = await Book.findById(req.params.id);
	book.viewsCount += 1;
	await book.save();
	res.send({ viewsCount: book.viewsCount });
  });
  
  
  
const startApp = async () => {
    try {
        await mongoose.connect(config.MONGODB_CONNECTION) 
        app.listen(PORT, () => console.log(`Server started on Port ${PORT}`));
    } catch (err) {
        console.log(err);
    }
} 

  
startApp();
