import Process = require("../process");
import { storeProcessTable, getProcessById } from "../../kernel/kernel";
import SpawnProcess = require("./spawn");
import { addProcess } from "../../kernel/kernel";
import LibrarianProcess = require("./librarian");
import UpgraderProcess = require("./upgrader");
import DefenseProcess = require("./defense");
class ColonyProcess extends Process {
    public classPath = "components.processes.room.colony";
    public static start(roomName: string) {
        let p: Process = new ColonyProcess(0, 0);
        p = addProcess(p);
        p.memory.roomName = roomName;

        let spawnProcess = new SpawnProcess(0, 0);
        addProcess(spawnProcess);
        spawnProcess.memory.roomName = roomName;
        p.memory.spawnPID = spawnProcess.pid;

        p = new LibrarianProcess(0, 0);
        p = addProcess(p);
        p.memory.roomName = roomName;
        storeProcessTable();


    }
    public getRoomName() {
        return this.memory.roomName;
    }

    private launchSpawnProcess() {
        let p = SpawnProcess.start(this.pid);
        return p.pid;
    }
    public run(): number {
        let memory = this.memory;
        let spawnPID = memory.spawnPID;

        if (!spawnPID || !getProcessById(spawnPID)) {
            memory.spawnPID = this.launchSpawnProcess();
        }

        let upgraderPID = memory.upgraderPID;

        if (!upgraderPID || !getProcessById(upgraderPID)) {
            memory.upgraderPID = UpgraderProcess.start(memory.roomName, this.pid);
        }

        let defenderPID = memory.defenderPID;
        if (!defenderPID || !getProcessById(defenderPID)) {
            memory.defenderPID = DefenseProcess.start(memory.roomName, this.pid);
        }
        return 0;
    }

}

export = ColonyProcess;
