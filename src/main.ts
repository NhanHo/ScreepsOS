import * as Kernel from "./components/kernel/kernel";
import room_position = require("./prototypes/room-position");
import structure_prototype = require("./prototypes/structure");
declare var global: any;
import cli = require("./components/cli/wrapper");
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
