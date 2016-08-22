import * as Kernel from "./components/kernel/kernel";
import P = require("./components/processes/room/starter");
import colony = require("./components/processes/room/colony");
import room_position = require("./prototypes/room-position");
import structure_prototype = require("./prototypes/structure");
declare var global: any;
import cli = require("./components/cli/wrapper");
global.start = P.start;
global.startRoom = colony.start;
room_position();
structure_prototype();

export function loop() {
    // This is executed every tick
    global.__ = cli;
    Kernel.loadProcessTable();
    Kernel.garbageCollection();
    Kernel.run();
    Kernel.storeProcessTable();

    // We reload the process table, to make sure it's updated for our command line
    Kernel.loadProcessTable();
}
