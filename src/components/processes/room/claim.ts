import { addProcess, getProcessById } from "../../kernel/kernel/kernel";
import Process = require("../../kernel/kernel/process");
import { getSpawnProcess } from "../../utils/spawn";
import StarterClaimCreepProcess = require("./starter-claim-creep");
interface ClaimMemory {
    spawningRoomName: string;
    targetRoomName: string;
    claimerCreep: string;
    starterCreepPid: number[];
}
class ClaimProcess extends Process {
    public memory: ClaimMemory;
    public classPath() {
        return "components.processes.room.claim";
    }

    public creepDies(pid: number) {
        this.memory.starterCreepPid = _.filter(this.memory.starterCreepPid, (p) => p !== pid);
    }

    public getNeededIndex(): number {
        const creepPIDList = this.memory.starterCreepPid;
        const process = _.filter(_.map(creepPIDList, getProcessById),
            (p: Process) => p instanceof StarterClaimCreepProcess) as StarterClaimCreepProcess[];
        const odd = _.filter(process, ((p) => p.getIndex() === 1));
        const even = _.filter(process, ((p) => p.getIndex() === 0));
        if (odd.length < even.length)
            return 1;
        return 0;
    }

    public receiveCreep(id: string, creep: Creep): number {
        if (id === "starter") {
            const p = new StarterClaimCreepProcess(0, this.pid);
            addProcess(p);
            p.memory.creepName = creep.name;
            p.memory.targetRoomName = this.memory.targetRoomName;
            p.memory.index = this.getNeededIndex();
            this.memory.starterCreepPid.push(p.pid);
        }
        if (id === "claimer") {
            this.memory.claimerCreep = creep.name;
        }

        return 0;
    }

    public run(): number {
        const targetRoom = Game.rooms[this.memory.targetRoomName];
        if (!targetRoom || !targetRoom.controller!.my) {
            this.runClaimer();
        } else {
            this.memory.starterCreepPid = this.memory.starterCreepPid || [];
            const starterPid = this.memory.starterCreepPid;
            if (starterPid.length < 6) {
                const spawningRoom = Game.rooms[this.memory.spawningRoomName];
                const energyCapacity = spawningRoom.energyCapacityAvailable;
                const multiplier = Math.floor(energyCapacity / 250);
                this.spawnCreep("starter",
                    { WORK: 1 * multiplier, MOVE: 2 * multiplier, CARRY: 1 * multiplier }, 5);
            }
        }
        return 0;
    }

    protected spawnCreep(creepID: string, bodyParts: bodyMap, priority?: number) {
        // TODO: Check and throw error when there is no roomName
        const spawnProcess = getSpawnProcess(this.memory.spawningRoomName);

        if (spawnProcess) {
            spawnProcess.spawn(creepID, bodyParts, this.pid, priority);
        }
    }

    private runClaimer() {
        const claimer = Game.creeps[this.memory.claimerCreep];
        if (!claimer) {
            this.spawnCreep("claimer", { MOVE: 1, CLAIM: 1 }, 5);
        } else {
            const targetRoom = Game.rooms[this.memory.targetRoomName];
            if (targetRoom) {
                claimer.moveTo(targetRoom.controller!);
                claimer.claimController(targetRoom.controller!);
                if (targetRoom.controller!.my)
                    claimer.suicide();
            } else {
                claimer.moveTo(new RoomPosition(25, 25, this.memory.targetRoomName));
            }
        }

    }
}

export = ClaimProcess;
