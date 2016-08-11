/**
 * Application bootstrap.
 * BEFORE CHANGING THIS FILE, make sure you read this:
 * http://support.screeps.com/hc/en-us/articles/204825672-New-main-loop-architecture
 */

// Screeps" system expects this "loop" method in main.js to run the application.
// If we have this line, we can make sure that globals bootstrap and game loop work.
// http://support.screeps.com/hc/en-us/articles/204825672-New-main-loop-architecture

import { loadProcessTable, run, storeProcessTable, garbageCollection } from "./components/kernel/kernel";
import P = require("./components/processes/room/starter");
import colony = require("./components/processes/room/colony");
import room_position = require("./prototypes/room-position");
import { startRoomMining } from "./components/cli/mining";
import structure_prototype = require("./prototypes/structure");
declare var global: any;
import cli = require("./components/cli/wrapper");
global.start = P.start;
global.startRoom = colony.start;
global.startRoomMining = startRoomMining;

export function loop() {
    // This is executed every tick
    global.__ = cli;
    room_position();
    structure_prototype();
    loadProcessTable();
    garbageCollection();
    run();
    storeProcessTable();

    // We reload the process table, to make sure it's updated for our command line
    loadProcessTable();
}
