let games = require("./games.json");
import fs from "fs";

class manageGame {
  init() {}
  addNewGamers(ioMagicNumber, name, kindOfGame, socket) {
    if (fs.existsSync("./games.json")) {
      let gamers = games[kindOfGame][0].players.filter(function(gamer) {
        return gamer.name == name;
      });
      if (gamers.length === 0) {
        let addNewGamers = games;
        addNewGamers[kindOfGame][0].players.push({
          name,
          points: 0
        });
        // if the first connect put a new date
        // addNewGamers[kindOfGame][0].beg = new Date();
        fs.writeFileSync(
          "./games.json",
          JSON.stringify(addNewGamers),
          "utf8",
          function(err) {
            if (err) return console.log(err);
            console.log("gamer was saved!");
            // let nbrGamers = `COUNT_${kindOfGame
            //   .replace(/(\w+)(\w)/g, "$1 $2")
            //   .toUpperCase()}_NUMBER`;
            // console.log(nbrGamers);
            // this.counter[nbrGamers]++;
          }
        );

        socket.name = name;
      }
    } else {
      throw "the file gamers.json doesn't exist";
    }
  }

  deleteGamer(name, kindOfGame) {
    // get data from file
    let addNewGamers = games;
    // remove user from data
    const filteredItems = addNewGamers[kindOfGame][0].players
      .filter(gamer => gamer !== name)
      .push({
        name,
        points: 0
      });
    // update file
    fs.writeFile("./games.json", JSON.stringify(addNewGamers), "utf8", function(
      err
    ) {
      if (err) return console.log(err);
      console.log("gamer was removed!");
    });
  }
  addPointsForUser(name, kindOfGame) {
    let addNewGamers = games;
    let gamer = games[kindOfGame][0].players.filter(function(gamer) {
      return gamer.name == name;
    });
    console.log(gamer);
    addNewGamers[kindOfGame][0].players.push({
      name,
      points: 0
    });
    fs.writeFileSync(
      "./games.json",
      JSON.stringify(addNewGamers),
      "utf8",
      function(err) {
        if (err) return console.log(err);
        console.log("gamer was saved!");
        // let nbrGamers = `COUNT_${kindOfGame
        //   .replace(/(\w+)(\w)/g, "$1 $2")
        //   .toUpperCase()}_NUMBER`;
        // console.log(nbrGamers);
        // this.counter[nbrGamers]++;
      }
    );
  }
}
let instanceManageGame = new manageGame();
export default instanceManageGame;
