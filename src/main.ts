/**
 * Application bootstrap.
 * BEFORE CHANGING THIS FILE, make sure you read this:
 * http://support.screeps.com/hc/en-us/articles/204825672-New-main-loop-architecture
 */



// Screeps" system expects this "loop" method in main.js to run the application.
// If we have this line, we can make sure that globals bootstrap and game loop work.
// http://support.screeps.com/hc/en-us/articles/204825672-New-main-loop-architecture
import { loadProcessTable, run, storeProcessTable } from "./components/kernel/kernel";
import P = require("./components/processes/room/starter");
declare var global: any;
export function loop() {
    // This is executed every tick
    loadProcessTable();
    global.start = P.start;
    run();
    storeProcessTable();
}
