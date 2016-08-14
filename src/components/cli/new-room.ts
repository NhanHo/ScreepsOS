import ClaimProcess = require("../processes/room/claim");
import { addProcess, storeProcessTable } from "../kernel/kernel";
export = function (argv: string[]) {
    let p = new ClaimProcess(0, 0);
    addProcess(p);
    p.memory.spawningRoomName = argv[0];
    p.memory.targetRoomName = argv[1];
    storeProcessTable();
}
