import { processTable } from "../kernel/kernel/kernel";

import SpawnProcess = require("../processes/room/spawn");
export let getSpawnProcess = function (roomName: string): SpawnProcess | null {
    for (let pid in processTable) {
        let process = processTable[pid];
        if (process instanceof SpawnProcess) {
            let spawnProcess = <SpawnProcess>process;
            if (spawnProcess.getRoomName() === roomName) {
                return spawnProcess;
            }
        }
    }
    return null;
};
