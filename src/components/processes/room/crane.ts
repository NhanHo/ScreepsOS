import OvermindProcess = require("../overmind");

interface Coord {
    x: number;
    y: number;
}
interface CraneMemory {
    creepName: string;
    spawningRoomName: string;
    pos: Coord;
    fromID: string;
    toID: string;
}

class CraneProcess extends OvermindProcess {
    public memory: CraneMemory;
    public classPath() {
        return "components.processes.room.crane";
    }

    public creepDies(_id: string, _pid: number) {

    }

    public receiveCreep(_id: string, creep: Creep) {
        this.memory.creepName = creep.name;
    }

    public run(): number {
        const creep = Game.creeps[this.memory.creepName];
        const room = Game.rooms[this.memory.spawningRoomName];
        const energyAvailable = room.energyCapacityAvailable;
        if (!creep) {
            let multiplier = Math.floor((energyAvailable - 50) / 50);
            if (multiplier > 4)
                multiplier = 4;
            this.spawnCreep("crane", { MOVE: 1, CARRY: multiplier });
        } else {
            const pos = this.memory.pos;
            if (!creep.pos.isEqualTo(pos.x, pos.y))
                creep.moveTo(pos.x, pos.y);
            else {
                const fromObj = Game.getObjectById(this.memory.fromID) as Link;
                const toObj = Game.getObjectById(this.memory.toID) as Storage;
                if (fromObj) {
                    creep.withdraw(fromObj, RESOURCE_ENERGY);
                }
                if (creep.carry.energy && creep.carry.energy > 0)
                    creep.transfer(toObj, RESOURCE_ENERGY);

            }
        }
        return 0;
    }

    // When starting, we need to make sure that no one is already doing a similar task
    public static start(roomName: string, pos: Coord, fromID: string, toID: string, parentPID: number = 0) {
        const p = new CraneProcess(0, parentPID);
        const processTable = p.kernel.processTable
        for (const i in processTable) {
            const p = processTable[i];
            if (p instanceof CraneProcess) {
                if ((p.memory.spawningRoomName === roomName) &&
                    (p.memory.fromID === fromID) &&
                    (p.memory.toID === toID)) {
                    return p.pid;
                }
            }
        }
        p.kernel.addProcess(p);
        p.memory.spawningRoomName = roomName;
        p.memory.pos = pos;
        p.memory.fromID = fromID;
        p.memory.toID = toID;
        return p.pid;
    }
}

export = CraneProcess;
