import express from "express";
import socketIo from "socket.io";
import path from "path";
import { createServer } from "http";
import fs from "fs";
import { argv, mlog } from "./libs/utils";

// Instantiate express application
const app = express();

// Setting the application port depending to environment
const port = parseInt(argv[0], 10) || process.env.PORT;

// magicNumber
let magicNumber = Math.floor(Math.random() * 1337);

// Entry point function
const start = async () => {
  try {
    // app is a request handler function that we must pass to http server instance
    const server = createServer(app);

    // socket.io take a server and not an express application
    const io = socketIo(server);

    // ... and finally server listening not the app
    server.listen(port, err => {
      if (err) throw err;

      mlog(`Server is running on port ${port}`);
    });
    let countUserConnect = 0;

    io.on("connection", socket => {
      countUserConnect++;
      mlog("client connected", "yellow");

      socket.on("disconnect", () => {
        countUserConnect--;

        mlog("client disconnected", "yellow");
      });

      socket.on("join", nickname => {
        console.log(`${nickname} has joined the channel`);

        io.emit("hello", "Welcome to the jungle!");
      });

      socket.on("message", content => {
        socket.broadcast.emit("newMessage", content);
      });
      app.get("/magicNumber", (req, res) => {
        socket.on("try", value => {
          if (magicNumber == value) {
            io.emit("response", "You win !!");
            socket.broadcast.emit("response", " You looooooose !");
            if (!fs.existsSync("./games.json")) {
            }
          } else if (magicNumber < value) {
            io.emit("response", "to upper");
          } else if (magicNumber > value) {
            io.emit("response", "to lower");
          }
        });
      });
    });
  } catch (err) {
    mlog(err, "red");
    process.exit(42);
  }
};

// Let's Rock!
start();
