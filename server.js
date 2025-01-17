import express, { urlencoded } from 'express';
import colors from 'colors';
import morgan from 'morgan';
// import dotenv from 'dotenv';
import "dotenv/config"
import cors from 'cors';

import studentAuthRoute from "./routes/studentAuthRoute.js";

const app = express();
//middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'));

//route handling
app.use("/api/v1/erp/student", studentAuthRoute);
//for testing purpose
app.use("/test", studentAuthRoute)

app.get('/about', (req, res) => {
    res.send("<h1>Hello welcome in spm application</h1>")
    console.log("home page");

})

const PORT = 5000
app.listen(PORT, () => {
    console.log(`server is listen on port number ${PORT}`.bgCyan.white);
})