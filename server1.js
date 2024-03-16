// const express = require("express");
import express from "express";

const app = express();

// Middleware for logging incoming requests
app.use((req, res, next) => {
  console.log("Received request from " + req.ip);
  next();
});

// Route handling
app.get("/", (req, res) => {
  console.log("inside");
  //   for (let i = 0; i < 10000000000; i++) {}
  res.status(200).send("Hello From Backend Server 3000");
});

app.listen(3000, () => {
  console.log("Backend server running on port 3000");
});
