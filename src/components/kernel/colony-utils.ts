import { processTable } from "./kernel";

import ColonyProcess = require("../processes/room/colony");
export let getColonyProcess = function (roomName: string): ColonyProcess | null {
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
