import Process = require("../process");
import { storeProcessTable, getProcessById } from "../../kernel/kernel";
import SpawnProcess = require("./spawn");
import { addProcess } from "../../kernel/kernel";
import LibrarianProcess = require("./librarian");
import UpgraderProcess = require("./upgrader");
import DefenseProcess = require("./defense");
import MaintainerProcess = require("./maintainer");
//import BuilderPlannerProcess = require("./building-planner");
class ColonyProcess extends Process {
    public classPath = "components.processes.room.colony";
    public static start(roomName: string) {
        console.log("Starting room:" + roomName);
        let p = new ColonyProcess(0, 0);
        addProcess(p);
        p.memory.roomName = roomName;
        p.memory.spawnPID = p.launchSpawnProcess(roomName);

        storeProcessTable();

        console.log("New room started:" + roomName);
    }
    public getRoomName() {
        return this.memory.roomName;
    }

    private launchSpawnProcess(roomName: string) {
        let p = SpawnProcess.start(roomName, this.pid);
        return p.pid;
    }
    public run(): number {
        let memory = this.memory;
        let room = Game.rooms[memory.roomName];

        //let buildingPlannerPID = memory.buildingPlannerPID;
        //if (!buildingPlannerPID || !getProcessById(buildingPlannerPID))
        //    memory.buildingPlannerPID = BuilderPlannerProcess.start(room.name).pid;
        let spawnPID = memory.spawnPID;
        if (!spawnPID || !getProcessById(spawnPID)) {
            memory.spawnPID = this.launchSpawnProcess(room.name);
        }

        if (room.controller.level >= 4 && room.storage && room.storage.store.energy > 40000) {

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

}

export = ColonyProcess;
