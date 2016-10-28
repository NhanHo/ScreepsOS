import * as Kernel from "../kernel/kernel/kernel";
import OutpostStarter = require("../processes/remote-room/outpost-starter");
export = function (argv: string[]) {
    const colonyRoomName = argv[0];
    const outpostRoomName = argv[1];
    let p = new OutpostStarter(0, 0);
    Kernel.addProcess(p);
    p.memory.spawningRoomName = colonyRoomName;
    p.memory.targetRoomName = outpostRoomName;
    Kernel.storeProcessTable();
}
