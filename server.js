import express from "express";
import socketIo from "socket.io";
import path from "path";
import { createServer } from "http";
import fs from "fs";
import { argv, mlog } from "./libs/utils";
import { constMN } from "./constants/constGames";

// Instantiate express application
const app = express();

let countUserInGames = {
  COUNT_GAMERS_MAGIC_NUMBER: 0
};
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

    io.on("connection", socket => {
      mlog("client connected", "yellow");

      socket.on("disconnect", () => {
        mlog("client disconnected", "yellow");
      });

      socket.on("join", nickname => {
        console.log(`${nickname} has joined the channel`);
        io.emit("hello", "Welcome to the jungle!");
      });

      socket.on("message", content => {
        socket.broadcast.emit("newMessage", content);
      });
    });

    // GAME MAGIC NUMBER
    let ioMagicNumber = io.of("/magicNumber");
    // OPEN GAME
    ioMagicNumber.on("connection", socket => {
      //user join the game
      socket.on("join", nickname => {
        console.log(nickname);
        // increment number of user connected
        countUserInGames.COUNT_GAMERS_MAGIC_NUMBER++;
        // saved the name of user
        socket.nickname = nickname;

        socket.emit(
          "boot",
          `[BOOT] Welcome ${nickname}  ! In the game : Magic Number`
        );
        socket.broadcast.emit(
          "boot",
          `[BOOT] ${socket.nickname} has joined the game! `
        );
      });

      socket.on("try", value => {
        console.log(countUserInGames.COUNT_GAMERS_MAGIC_NUMBER);
        // change the number 1 by const ""< MIN_USER_AUTHORIZED_IN_ROOM" if your are not alone
        if (countUserInGames.COUNT_GAMERS_MAGIC_NUMBER >= 1) {
          // if number is higher of min user connect send a message for user connect and the other
          console.log(countUserInGames.COUNT_GAMERS_MAGIC_NUMBER);
          console.log(socket.nickname);

          socket.broadcast.emit("response", "The game started !");
          ioMagicNumber.emit(
            "boot",
            `the magic number is ${magicNumber} ${value}`
          );

          if (magicNumber == value) {
            ioMagicNumber.emit("response", "😎 You win !!");
            socket.broadcast.emit(
              "boot",
              `😠 Damn! the gamers ${socket.nickname} find the number `
            );
            if (fs.existsSync("./games.json")) {
              ioMagicNumber.emit("exist", true);
            } else {
              ioMagicNumber.emit("exist", false);
            }
          }
          if (magicNumber < value) {
            ioMagicNumber.emit("boot", "😱 To upper");
          }
          if (magicNumber > value) {
            ioMagicNumber.emit("boot", "😰 To lower");
          }
        } else {
          console.log("waiting challenger");
          ioMagicNumber.emit("boot", "Waiting challenger ....");
        }
      });

      socket.on("disconnect", () => {
        countUserInGames.COUNT_GAMERS_MAGIC_NUMBER--;

        mlog("client disconnected", "yellow");
      });
    });
  } catch (err) {
    mlog(err, "red");
    process.exit(42);
  }
};

// Let's Rock!
start();
