import express from "express";
import mongoose from "mongoose";
import router from "./router.js";
import cors from "cors";
import session from "express-session";
import * as tools from "./tools.js";
import * as config from "./config.js";
import cookieParser from "cookie-parser";
import * as model from "./model.js";
import Book from "./src/models/Book.js";
import User from "./src/models/User.js";
import Comment from "./src/models/Comment.js";
import bcrypt from "bcrypt";

mongoose.set("strictQuery", false);

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: config.FRONTEND_URL,
    methods: ["POST", "GET", "DELETE", "PUT", "OPTIONS", "HEAD"],
    credentials: true,
  })
);
app.use(cookieParser());

//app.use(cors());
// Enable CORS
//app.use((req, res, next) => {
//  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5174");
//  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//  res.setHeader("Access-Control-Allow-Credentials", "true");
//  next();
//});

app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: config.SESSION_SECRET,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    },
  })
);

app.get("/", (req, res) => {
  res.send(model.getApiInstructionsHtml());
});

app.use("/", router);

app.get("/test", (req, res) => {
  res.json(model.getTest());
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await model.getUser(username, password);
  if (user !== null) {
    const isCorrect = await tools.passwordIsCorrect(password, user.hash);
    if (isCorrect) {
      const frontendUser = {
        _id: user._id,
        username: user.username,
        img: user.img,
        accessGroups: user.accessGroups,
        favorites: user.favorites,
      };
      req.session.user = frontendUser;

      // Set the user ID in the session
      req.session.userId = user._id;
      // console.log(req.session.userId);

      req.session.cookie.expires = new Date(
        Date.now() + config.SECONDS_TILL_SESSION_TIMEOUT * 1000
      );
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

app.get("/get-current-user", async (req, res) => {
  if (req.session.user) {
    res.send(req.session.user);
  } else {
    const anonymousUser = await model.getAnonymousUser();
    res.status(200).send(anonymousUser);
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.send("ERROR");
    } else {
      res.send("logged out");
    }
  });
});

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      res.status(409).send("User already exists!");
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({
        username,
        email,
        hash: hashedPassword,
        comments: [],
        img: "https://i.ibb.co/0FnL399/no-image.jpg",
        accessGroups: ["members"],
        favorites: [],
      });

      await user.save();
      res.status(200).json({ message: "Registration successful." });
      // res.status(200).send('User created successfully!');
    }
  } catch (err) {
    // res.status(500).send(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PROTECTED ROUTES

const authorizeOnlyIfAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.accessGroups.includes("admins")) {
    next();
  } else {
    res.status(401).send({});
  }
};

const authorizeOnlyIfMember = (req, res, next) => {
  if (req.session.user && req.session.user.accessGroups.includes("members")) {
    next();
  } else {
    res.status(401).send({});
  }
};

const authorizeOnlyIfUnapprovedMember = (req, res, next) => {
  if (
    req.session.user &&
    req.session.user.accessGroups.includes("unapprovedMembers")
  ) {
    next();
  } else {
    res.status(401).send({});
  }
};

app.get("/get-member-info", authorizeOnlyIfMember, async (req, res) => {
  const members = await model.getMembers();
  const memberInfo = {
    message:
      "This is information that only **members** can see. Note that it is not loaded when the site initially loads, but only after the user has been identified (either at login or on page reload while session is still alive) and only when that user has **members** in their list of accessGroups.",
    members,
  };
  res.status(200).json(memberInfo);
});

app.get("/get-admin-info", authorizeOnlyIfAdmin, async (req, res) => {
  const members = await model.getMembers();
  const memberInfo = {
    message:
      "This is information that only **admins** can see. Note that it is not loaded when the site initially loads, but only after the user has been identified (either at login or on page reload while session is still alive) and only when that user has **admins** in their list of accessGroups.",
    members,
  };
  res.status(200).json(memberInfo);
});

app.get(
  "/get-unapproved-member-info",
  authorizeOnlyIfUnapprovedMember,
  async (req, res) => {
    const memberInfo = {
      message:
        "Your membership form has been received. When confirmed, you will have access to this page.",
    };
    res.status(200).json(memberInfo);
  }
);

app.patch("/approve-member", authorizeOnlyIfAdmin, async (req, res) => {
  const _id = req.body;
  const result = await model.approveMember(_id);
  res.status(200).send(result);
});

// Define a route for getting all books grouped by author
app.get("/authors/:authorID", async (req, res) => {
  try {
    const authorID = req.params.authorID.replace("+", " "); // replace + with space
    const books = await Book.find({ author: authorID });
    res.json({ author: authorID, books });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/books/:bookId/comments", async (req, res) => {
  const { bookId } = req.params;

  try {
    // Query the Comment model for all comments with the specified book ID
    const comments = await Comment.find({ bookId });

    // Send the comments as the response
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while retrieving comments");
  }
});

const startApp = async () => {
  try {
    // await mongoose.connect(config.MONGODB_CONNECTION)
    await mongoose.connect(process.env.MONGODB_CONNECTION);
    app.listen(process.env.PORT || 3005, () =>
      console.log(`Server started on Port ${process.env.PORT}`)
    );
  } catch (err) {
    console.log(err);
  }
};

app.get("/users/:userId/username", async (req, res) => {
  const { userId } = req.params;

  try {
    // Query the User model for the user with the specified ID
    const user = await User.findOne({ userId });

    // Send the username as the response
    res.json(user.username);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while retrieving the username");
  }
});

startApp();
