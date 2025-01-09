const express = require('express');
const cors = require('cors');
const fs = require('fs')
const jsonServer = require("json-server");
const path = require('path')
const paymentRoutes = require('./../src/routes/paymentRoutes');
const dbJson = './../db/db.json';

const server = express();
const apiRouter = express.Router();
const db = JSON.parse(fs.readFileSync(path.join(__dirname, dbJson)))
const routerDB = jsonServer.router(db);
const middlewares = jsonServer.defaults();

apiRouter.use('/payment', paymentRoutes);

server.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

server.use(middlewares);
server.use("/db", routerDB);
server.use("/api", apiRouter);

server.listen(3000, () => {
  console.log("JSON Server is running");
});

module.exports = server;
