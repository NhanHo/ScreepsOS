import ReservationOutpostProcess = require("../processes/remote-room/reservation-outpost");
import { processTable, addProcess, storeProcessTable } from "../kernel/kernel";
import ColonyProcess = require("../processes/room/colony");
let getColonyProcess = function (roomName: string): ColonyProcess | null {
    for (let pid in processTable) {
        let process = processTable[pid];
        if (process instanceof ColonyProcess) {
            let colonyProcess = <ColonyProcess>process;
            if (colonyProcess.getRoomName() === roomName) {
                return colonyProcess;
            }
        }
    }
    return null;
};

export = function (argv: any[]) {
    let colonyRoomName = argv[0];
    let outpostRoomName = argv[1];
    let colonyProcess = getColonyProcess(colonyRoomName);
    if (colonyProcess) {
        let p = new ReservationOutpostProcess(0, colonyProcess.pid);
        addProcess(p);
        p.memory.roomName = outpostRoomName;
        storeProcessTable();
    } else {
        console.log("Failed to start reservation process: Can't find the colony process " +
            "of room " + colonyRoomName);
    }
}
