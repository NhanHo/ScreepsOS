import {
    addProcess, getProcessById, killProcess,
    processTable, sleepProcess, storeProcessTable,
} from "../../kernel/kernel/kernel";
import Process = require("../../kernel/kernel/process");
import MiningProcess = require("../mining/mining");
import DefenseProcess = require("./defense");
import LibrarianProcess = require("./librarian");
import LinkManagerProcess = require("./link-manager");
import MaintainerProcess = require("./maintainer");
import SpawnProcess = require("./spawn");
import StarterProcess = require("./starter");
import UpgraderProcess = require("./upgrader");
// import BuilderPlannerProcess = require("./building-planner");
class ColonyProcess extends Process {
    public static start(roomName: string) {
        const p = new ColonyProcess(0, 0);
        addProcess(p);
        storeProcessTable();

        p.memory.roomName = roomName;
        console.log("New room started:" + roomName);

    }

    public classPath() {
        return "components.processes.room.colony";
    }

    public getRoomName() {
        return this.memory.roomName;
    }

    public psInfo() {
        return ("ColonyProcess " + this.getRoomName());
    }

    public run(): number {
        const memory = this.memory;
        const room = Game.rooms[memory.roomName];

        const spawnPID = memory.spawnPID;
        if (!spawnPID || !getProcessById(spawnPID)) {
            memory.spawnPID = this.launchSpawnProcess(room.name);
        }
        if (room.controller!.level >= 4 && room.storage && room.storage.store.energy > 10000) {

            const upgraderPID = memory.upgraderPID;

            if (!upgraderPID || !getProcessById(upgraderPID)) {
                console.log("Starting upgrader process for Room:" + room.name);
                memory.upgraderPID = UpgraderProcess.start(memory.roomName, this.pid);
            }

            const defenderPID = memory.defenderPID;
            if (!defenderPID || !getProcessById(defenderPID)) {
                console.log("Starting defender process for Room:" + room.name);
                memory.defenderPID = DefenseProcess.start(memory.roomName, this.pid);
            }

            const maintainerPID = memory.maintainerPID;
            if (!maintainerPID || !getProcessById(maintainerPID)) {
                console.log("Starting maintainer process for room:" + room.name);
                memory.maintainerPID = MaintainerProcess.start(memory.roomName, this.pid);
            }

            const linkPID = memory.linkPID;
            if (!linkPID || !getProcessById(linkPID)) {
                console.log("Starting link process for room:" + room.name);
                memory.linkPID = LinkManagerProcess.start(memory.roomName, this.pid);
            }

            const librarianPID = memory.librarianPID;
            if (!librarianPID || !getProcessById(librarianPID)) {
                const p = new LibrarianProcess(0, this.pid);
                addProcess(p);
                p.memory.roomName = room.name;
                memory.librarianPID = p.pid;
            }

            let inRoomMiningPid: number[] = memory.miningPIDList || [];
            inRoomMiningPid = _.filter(inRoomMiningPid, (pid) => getProcessById(pid));
            if (inRoomMiningPid.length === 0) {
                const sources = room.find(FIND_SOURCES) as Source[];
                for (const source of sources) {
                    const sourceId = source.id;
                    const roomName = room.name;
                    const flag = Game.flags[sourceId];
                    if (!flag) {
                        source.pos.createFlag(sourceId, COLOR_YELLOW);
                    }

                    let p = new MiningProcess(0, this.pid);
                    p = addProcess(p);
                    p.memory.sourceId = sourceId;
                    p.memory.spawningRoomName = roomName;
                    p.memory.flagName = sourceId;
                    inRoomMiningPid.push(p.pid);
                }
                memory.miningPIDList = inRoomMiningPid;
                this.killStarterProcess(room.name);
            }
            sleepProcess(this, 100);
        }

        return 0;
    }

    private killStarterProcess(roomName: string) {
        for (const pid in processTable) {
            const p = processTable[pid];
            if (p instanceof StarterProcess && p.memory.roomName === roomName) {
                killProcess(p.pid);
                return;
            }
        }
    }

    private launchSpawnProcess(roomName: string) {
        console.log("Starting spawn process for room:" + roomName);
        const p = SpawnProcess.start(roomName, this.pid);
        p.parentPID = this.pid;
        return p.pid;
    }
}

export = ColonyProcess;
