import Process = require("../process");
import { storeProcessTable, getProcessById } from "../../kernel/kernel";
import SpawnProcess = require("./spawn");
import { addProcess } from "../../kernel/kernel";
import LibrarianProcess = require("./librarian");
import UpgraderProcess = require("./upgrader");
import DefenseProcess = require("./defense");
import MaintainerProcess = require("./maintainer");
// import BuilderPlannerProcess = require("./building-planner");
class ColonyProcess extends Process {
    public static start(roomName: string) {
        let p = new ColonyProcess(0, 0);
        addProcess(p);
        storeProcessTable();

        p.memory.roomName = roomName;
        console.log("New room started:" + roomName);
    }

    public classPath = "components.processes.room.colony";

    public getRoomName() {
        return this.memory.roomName;
    }

    public run(): number {
        let memory = this.memory;
        let room = Game.rooms[memory.roomName];

        let spawnPID = memory.spawnPID;
        if (!spawnPID || !getProcessById(spawnPID)) {
            memory.spawnPID = this.launchSpawnProcess(room.name);
        }

        if (room.controller.level >= 4 && room.storage && room.storage.store.energy > 10000) {

            let upgraderPID = memory.upgraderPID;

            if (!upgraderPID || !getProcessById(upgraderPID)) {
                console.log("Starting upgrader process for Room:" + room.name);
                memory.upgraderPID = UpgraderProcess.start(memory.roomName, this.pid);
            }

            let defenderPID = memory.defenderPID;
            if (!defenderPID || !getProcessById(defenderPID)) {
                console.log("Starting defender process for Room:" + room.name);
                memory.defenderPID = DefenseProcess.start(memory.roomName, this.pid);
            }

            let maintainerPID = memory.maintainerPID;
            if (!maintainerPID || !getProcessById(maintainerPID)) {
                console.log("Starting maintainer process for room:" + room.name);
                memory.maintainerPID = MaintainerProcess.start(memory.roomName, this.pid);
            }

            let librarianPID = memory.librarianPID;
            if (!librarianPID || !getProcessById(librarianPID)) {
                const p = new LibrarianProcess(0, this.pid);
                addProcess(p);
                p.memory.roomName = room.name;
                memory.librarianPID = p.pid;
            }
        }
        return 0;
    }

    private launchSpawnProcess(roomName: string) {
        console.log("Starting spawn process for room:" + roomName);
        let p = SpawnProcess.start(roomName, this.pid);
        p.parentPID = this.pid;
        return p.pid;
    }
}

export = ColonyProcess;
