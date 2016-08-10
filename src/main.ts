/**
 * Application bootstrap.
 * BEFORE CHANGING THIS FILE, make sure you read this:
 * http://support.screeps.com/hc/en-us/articles/204825672-New-main-loop-architecture
 */

// Screeps" system expects this "loop" method in main.js to run the application.
// If we have this line, we can make sure that globals bootstrap and game loop work.
// http://support.screeps.com/hc/en-us/articles/204825672-New-main-loop-architecture
Structure.prototype.needEnergy = function () {
    if (this.structureType !== STRUCTURE_EXTENSION && this.structureType != STRUCTURE_TOWER) {
        return false;
    }
    else if (this.structureType === STRUCTURE_TOWER) {
        return this.energy < 100;// && this.room.name!="E22N15";
    }
    return this.energy < this.energyCapacity;
};

import { loadProcessTable, run, storeProcessTable } from "./components/kernel/kernel";
import P = require("./components/processes/room/starter");
import colony = require("./components/processes/room/colony");
import room_position = require("./prototypes/room-position");
import { startRoomMining } from "./components/cli/mining";
declare var global: any;
export function loop() {
    // This is executed every tick
    room_position();
    loadProcessTable();
    global.start = P.start;
    global.startRoom = colony.start;
    global.startRoomMining = startRoomMining;
    run();
    storeProcessTable();
}
