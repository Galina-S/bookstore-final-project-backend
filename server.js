import express from "express";
import mongoose from "mongoose";
import router from "./router.js";
import cors from "cors";
import session from "express-session";
import * as config from "./config.js";
import * as model from "./model.js";
import cookieParser from "cookie-parser";
import Book from "./src/models/Book.js";
import User from "./src/models/User.js";
import Comment from "./src/models/Comment.js";
import bcrypt from "bcrypt";
import { registerNewUser } from "./controller.js";

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

//app.use(cors());
//app.use((req, res, next) => {
// res.setHeader("Access-Control-Allow-Origin", "http://localhost:5174");
// res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
// res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
// res.setHeader("Access-Control-Allow-Credentials", "true");
// next();
//});

app.use(cors({
  //https://bookstore-final-project-2bpg.vercel.app
  origin: ['https://bookstore-final-project-2bpg.vercel.app', 'https://elegant-rose-outerwear.cyclic.app','http://localhost:5174', 'https://bookstore-final-project-2bpg-mwtckoos7-galina-s.vercel.app'],// replace with your client's origin URL
  credentials: true
}))

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

// app.get("/", (req, res) => {
//   res.send(model.getApiInstructionsHtml());
// });


const startApp = async () => {
  try {
    // await mongoose.connect(config.MONGODB_CONNECTION)
    const conn = await mongoose.connect(process.env.MONGODB_CONNECTION);
    console.log(`MongoDB connected: ${conn.connection.host}`)

  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};


app.use("/", router);

app.get("/test", (req, res) => {
  res.json(model.getTest());
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



startApp().then (()=> {
  app.listen(process.env.PORT || 3005, () =>
  console.log(`Server started on Port ${process.env.PORT}`)
  );
})

//startApp();
