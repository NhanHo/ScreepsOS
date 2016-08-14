import Process = require("../process");
import MinerCreep = require("./miner-creep");
import CourierCreep = require("./courier");
import { addProcess, getProcessById } from "../../kernel/kernel";
import { getSpawnProcess } from "../../kernel/kernel-utils";

class MiningProcess extends Process {
    /* Memory has:
     * roomName
     * miner pid
     * courier pid
     * source ID: sourceId
     */
    public classPath = "components.processes.mining.mining";

    public minerDies(minerPID: number) {
        minerPID;
        this.memory.minerPid = null;
    }

    public setup(roomName: string, sourceId: string) {
        this.memory.roomName = roomName;
        this.memory.sourceId = sourceId;
        this.memory.courierCount = this.memory.courierCount || 1;
        this.memory.courierPidList = this.memory.courierPidList || [];
    }
    public courierDies(courierPid: number) {
        let memory = this.memory;
        memory.courierPidList = _.filter(memory.courierPidList, pid => pid != courierPid);
    }

    private getMiningSpot(): any {
        if (!this.memory.miningSpot) {
            let source = <Source>Game.getObjectById(this.memory.sourceId);
            let storage = Game.rooms[this.memory.roomName].storage;
            let pathResult = PathFinder.search(storage.pos, { pos: source.pos, range: 1 });
            let path = pathResult.path;
            let pos = path[path.length - 1];
            this.memory.miningSpot = [pos.x, pos.y, pos.roomName];
        }
        return this.memory.miningSpot;
    }
    public receiveCreep(id: string, creep: Creep): number {
        let creepName = creep.name;
        if (id === "miner") {
            let p = new MinerCreep(0, this.pid);
            p = addProcess(p);
            p.setUp(creepName, this.memory.sourceId);
            p.parentPID = this.pid;
            this.memory.minerPid = p.pid;
            p.memory.miningSpot = this.getMiningSpot();
        }

        if (id === "courier") {
            let p = new CourierCreep(0, this.pid);
            p = addProcess(p);
            //TODO: allows different receiver object here
            p.setUp(creepName, Game.rooms[this.memory.roomName].storage.id);
            p.parentPID = this.pid;
            this.memory.courierPidList.push(p.pid);
        }

        return 0;
    }

    public getMinerCreep() {
        if (this.memory.minerPid) {
            let p = getProcessById(this.memory.minerPid) as MinerCreep;
            return p.getMinerCreep();
        }
        return null;
    }

    protected spawnCreep(creepID: string, bodyParts: bodyMap, priority?: number) {
        //TODO: Check and throw error when there is no roomName
        let spawnProcess = getSpawnProcess(this.memory.roomName);

        if (spawnProcess) {
            spawnProcess.spawn(creepID, bodyParts, this.pid, priority);
        }
    }


    public needMoreCourier(): number {
        let lastCourierIncrease = this.memory.lastCourierIncrease = this.memory.lastCourierIncrease || (Game.time - 1501);

        if (lastCourierIncrease > (Game.time - 1501))
            return -1;
        if (this.memory.courierCount == 3) {
            console.log("Mining at source " + this.memory.sourceId +
                " is requiring too many couriers");
            return -1;
        }
        this.memory.courierCount += 1;
        this.memory.lastCourierIncrease = Game.time;
        return 0;
    }
    public run(): number {
        this.memory.courierCount = this.memory.courierCount || 1;
        this.memory.courierPidList = this.memory.courierPidList || [];
        let memory = this.memory;
        if (!memory.minerPid)
            this.spawnCreep("miner", { WORK: 6, MOVE: 6, CARRY: 1 }, 90);
        else if (memory.courierPidList.length < memory.courierCount) {
            this.spawnCreep("courier", { MOVE: 10, CARRY: 10 });
        }
        return 0;
    }


}

export = MiningProcess;
