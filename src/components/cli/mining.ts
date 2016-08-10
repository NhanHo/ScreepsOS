import MiningProcess = require("../processes/mining/mining");
import { addProcess, storeProcessTable } from "../kernel/kernel";
import Process = require("../processes/process");
let addProcessAndSave = function (p: Process) {
    addProcess(p);
    storeProcessTable();
}

export let startRoomMining = function (roomName: string) {
    let room = Game.rooms[roomName];
    let sources = room.find(FIND_SOURCES) as Source[];

    for (let source of sources) {
        let mining = new MiningProcess(0, 0);
        addProcessAndSave(mining);
        mining.setup(roomName, source.id);
    }

}
    ;
