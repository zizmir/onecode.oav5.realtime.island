import express from "express";
import socketIo from "socket.io";
import path from "path";
import { createServer } from "http";
import { argv, mlog } from "./libs/utils";
import { constMN } from "./constants/constGames";
import manageGame from "./manageGame";

let games = require("./games.json");
let counter = { COUNT_GAMERS_MAGIC_NUMBER: 0 };

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
    // GESTION GAMERS
    io.on("connection", socket => {
      mlog("client connected", "yellow");

      socket.on("disconnect", () => {
        mlog("client disconnected", "yellow");
      });
      // connect to platform
      socket.on("join", name => {
        // check if file exists

        console.log(`${name} has joined the channel`);
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
      socket.on("join", name => {
        manageGame.addNewGamers(ioMagicNumber, name, "magicNumber", socket);
        // increment number of user connected
        // saved the name of gamer
        counter.COUNT_GAMERS_MAGIC_NUMBER++;
        socket.emit(
          "boot",
          `[BOOT] Welcome ${name}  ! In the game : Magic Number`
        );
        socket.broadcast.emit(
          "boot",
          `[BOOT] ${socket.name} has joined the game! `
        );
      });

      socket.on("try", value => {
        // change the number 1 by const ""< MIN_USER_AUTHORIZED_IN_ROOM" if your are not alone
        if (counter.COUNT_GAMERS_MAGIC_NUMBER >= 1) {
          // if number is higher of min user connect send a message for user connect and the other
          console.log(counter.COUNT_GAMERS_MAGIC_NUMBER);

          console.log(socket.name);

          socket.broadcast.emit("response", "The game started !");
          ioMagicNumber.emit(
            "boot",
            `the magic number is ${magicNumber} ${value}`
          );

          if (magicNumber == value) {
            ioMagicNumber.emit("response", "😎 You win !!");
            manageGame.addPointsForUser(socket.name, "magicNumber");
            socket.broadcast.emit(
              "boot",
              `😠 Damn! the gamers ${socket.name} find the number `
            );
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
        counter.COUNT_GAMERS_MAGIC_NUMBER--;

        manageGame.deleteGamer(socket.name, "magicNumber");
        socket.broadcast.emit(
          "boot",
          `[BOOT]! the gamers ${socket.name} leave the game `
        );
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
