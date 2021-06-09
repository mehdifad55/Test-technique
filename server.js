const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
var cors = require("cors");
dotenv.config();

//connect to DB 
mongoose.connect(process.env.DB_CONNECT,{ useNewUrlParser: true,useUnifiedTopology: true },
    () => console.log('connected to DB')
);

app.use(cors());
//middlewares

app.use(express.json());

// import routes
const authRoutes = require("./routes/auth");
const csvRoutes = require("./routes/csv");
const verifyToken = require("./routes/validate-token");

// middlewares
app.use(express.json()); // for body parser

// route middlewares
app.use("/api/user", authRoutes);
app.use("/api/csv", csvRoutes);

app.listen(3000, () => console.log("server is running..."));