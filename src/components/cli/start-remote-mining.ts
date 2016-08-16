import RemoteMiningStarter = require("../processes/mining/remote-mining-starter");
import { addProcess, storeProcessTable } from "../kernel/kernel";
export = function (argv: any) {
    let spawningRoomName = argv[0];
    let targetRoomName = argv[1];
    let p = new RemoteMiningStarter(0, 0);
    addProcess(p);
    p.memory.spawningRoomName = spawningRoomName;
    p.memory.targetRoomName = targetRoomName;
    storeProcessTable();

}
