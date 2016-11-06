import Process = require("../../kernel/kernel/process");
import MinerCreep = require("./miner-creep");
import MinerWithLinkCreep = require("./miner-with-link-creep");
import CourierCreep = require("./courier");
import { addProcess, getProcessById } from "../../kernel/kernel/kernel";
import { getSpawnProcess } from "../../utils/spawn";
import { OvermindMemory } from "../memory/overmind";
interface MiningMemory extends OvermindMemory {
    minerPid: number | null;
    courierPidList: number[];
    sourceId: string;
    courierCount: number;
    miningSpot: any;
    lastCourierCountChange: number;
    flagName: string;
    lastLowContainerUsage: number;
    lowContainerUsageStreak: number;
}

class MiningProcess extends Process {
    /* Memory has:
     * roomName
     * miner pid
     * courier pid
     * source ID: sourceId
     */
    public memory: MiningMemory;
    public classPath() {
        return "components.processes.mining.mining";
    }

    public minerDies(_: number) {
        this.memory.minerPid = null;
    }

    public setup(roomName: string, sourceId: string) {
        this.memory.spawningRoomName = roomName;
        this.memory.sourceId = sourceId;
        this.memory.courierCount = this.memory.courierCount || 1;
        this.memory.courierPidList = this.memory.courierPidList || [];
    }
    public courierDies(courierPid: number) {
        let memory = this.memory;
        memory.courierPidList = _.filter(memory.courierPidList, pid => pid !== courierPid);
    }

    public receiveCreep(id: string, creep: Creep): number {
        let creepName = creep.name;
        if (id === "miner") {

            const [x, y, roomName] = this.memory.miningSpot;
            const pos = new RoomPosition(x, y, roomName);
            const hasStorageOrLink = function (pos: RoomPosition) {
                return _.some(pos.lookFor(LOOK_STRUCTURES),
                    (s: Structure) =>
                        s.structureType === STRUCTURE_STORAGE ||
                        s.structureType === STRUCTURE_LINK);
            }

            // If there is a link or storage to deposit the energy, we don't have to spawn
            // courier and instead just deposit any mined energy to it directly

            if (_.some(pos.adjacentPositions(), hasStorageOrLink)) {
                const posWithDeposit = _.find(pos.adjacentPositions(), hasStorageOrLink);
                const link = _.find(posWithDeposit.lookFor(LOOK_STRUCTURES),
                    (s: Structure) => s.structureType === STRUCTURE_STORAGE ||
                        s.structureType === STRUCTURE_LINK) as Structure;
                let p = new MinerWithLinkCreep(0, this.pid);
                p = addProcess(p);
                p.setUp(creepName, this.memory.sourceId, link.id, this.memory.miningSpot);
                this.memory.minerPid = p.pid;
            } else {
                let p = new MinerCreep(0, this.pid);
                p = addProcess(p);
                p.setUp(creepName, this.memory.sourceId);
                this.memory.minerPid = p.pid;
                p.memory.miningSpot = this.getMiningSpot();
            }
        }

        if (id === "courier") {
            let p = new CourierCreep(0, this.pid);
            p = addProcess(p);
            // TODO: allows different receiver object here
            const storage = Game.rooms[this.memory.spawningRoomName].storage
            if (storage)
                p.setUp(creepName, storage.id);
            else
                console.log(`Creep ${creepName} does not have a target for deposit`);
            p.parentPID = this.pid;
            this.memory.courierPidList.push(p.pid);
        }

        return 0;
    }

    public getMinerCreep() {
        if (this.memory.minerPid) {
            let p = getProcessById(this.memory.minerPid) as MinerCreep;
            if (!p || p instanceof MinerWithLinkCreep)
                return null;
            return p.getMinerCreep();
        }
        return null;
    }

    public needMoreCourier(): number {
        let lastCourierIncrease = this.memory.lastCourierCountChange = this.memory.lastCourierCountChange || (Game.time - 1501);

        if (lastCourierIncrease > (Game.time - 1501))
            return -1;
        if (this.memory.courierCount === 3) {
            let source = <Source>Game.getObjectById(this.memory.sourceId);
            console.log("Mining at source " + this.memory.sourceId +
                " is requiring too many couriers. Room:" + source.pos.roomName);
            return -1;
        }
        this.memory.courierCount += 1;
        this.memory.lastCourierCountChange = Game.time;
        return 0;
    }

    public lowContainerUsage(): number {
        let lastTick = this.memory.lastLowContainerUsage = this.memory.lastLowContainerUsage || Game.time;
        this.memory.lowContainerUsageStreak = this.memory.lowContainerUsageStreak || 0;
        if (lastTick === (Game.time - 1)) {
            this.memory.lowContainerUsageStreak += 1;
        } else
            this.memory.lowContainerUsageStreak = 0;

        if ((this.memory.lowContainerUsageStreak > 500) && (this.memory.courierCount > 1)) {

            this.memory.lastCourierCountChange = this.memory.lastCourierCountChange || (Game.time - 1501);
            if (this.memory.lastCourierCountChange > (Game.time - 1501))
                return -1;
            this.memory.lastCourierCountChange = Game.time;
            this.memory.courierCount -= 1;

        }

        this.memory.lastLowContainerUsage = Game.time;

        return 0;
    }

    public run(): number {
        this.memory.courierCount = this.memory.courierCount || 1;
        this.memory.courierPidList = this.memory.courierPidList || [];
        let memory = this.memory;

        if (!memory.flagName) {
            let source = <Source>Game.getObjectById(memory.sourceId);
            if (!source) {
                console.log("PID: " + this.pid +
                    " Error: no vision of source and no flag for source: " + memory.sourceId);
                return 0;
            }
            let result = source.pos.createFlag(source.id, COLOR_YELLOW);
            if (_.isString(result)) {
                memory.flagName = result;
            } else {
                if (result !== ERR_NAME_EXISTS) {
                    console.log("Some how we can't create flag:" + source.id);
                    return 0;
                } else
                    memory.flagName = source.id;
            }
        }
        if (!memory.miningSpot) {
            memory.miningSpot = this.getMiningSpot();

        }
        const [x, y, roomName] = this.memory.miningSpot;
        const miningPos = new RoomPosition(x, y, roomName);
        let storage = Game.rooms[this.memory.spawningRoomName].storage;

        if (storage && miningPos.isNearTo(storage.pos)) {
            this.memory.courierCount = 0;
        }

        if (!memory.minerPid) {
            this.spawnCreep("miner", { WORK: 6, MOVE: 6, CARRY: 1 }, 90);
        } else if (memory.courierPidList.length < memory.courierCount) {
            this.spawnCreep("courier", { MOVE: 10, CARRY: 10 });
        }

        //this.invaderCheck();
        return 0;
    }

    public psInfo() {
        return ("Mining Process " + this.memory.spawningRoomName + " " + this.memory.flagName);
    }

    protected spawnCreep(creepID: string, bodyParts: bodyMap, priority?: number) {
        // TODO: Check and throw error when there is no roomName
        let spawnProcess = getSpawnProcess(this.memory.spawningRoomName);

        if (spawnProcess) {
            spawnProcess.spawn(creepID, bodyParts, this.pid, priority);
        }
    }

    private getMiningSpot(): any {
        if (!this.memory.miningSpot) {
            let source = <RoomObject>Game.getObjectById(this.memory.sourceId);
            if (!source) {
                source = Game.flags[this.memory.flagName];
            }
            let storage = Game.rooms[this.memory.spawningRoomName].storage;
            if (!storage) {
                return;
            }
            let pathResult = PathFinder.search(storage.pos, { pos: source.pos, range: 1 });
            let path = pathResult.path;
            let pos = path[path.length - 1];
            this.memory.miningSpot = [pos.x, pos.y, pos.roomName];
        }
        return this.memory.miningSpot;
    }

}

export = MiningProcess;
