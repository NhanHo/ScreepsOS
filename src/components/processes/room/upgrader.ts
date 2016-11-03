import Process = require("../../kernel/kernel/process");
import { getSpawnProcess } from "../../utils/spawn";
import { sleepProcess, addProcess, getProcessById } from "../../kernel/kernel/kernel";
interface UpgraderMemory {
    name: string | undefined;
    hasCourier: boolean;
    roomName: string;
    courierName: string | undefined;
    containerID: string | undefined;
    isFixingContainer: boolean;
}
class UpgraderProcess extends Process {
    public memory: UpgraderMemory;
    public static start(roomName: string, parentPID: number) {
        let p = new UpgraderProcess(0, parentPID);
        addProcess(p);
        p.memory.roomName = roomName;
        return p.pid;
    }

    public classPath() {
        return "components.processes.room.upgrader";
    }
    public run(): number {
        let colonyProcess = getProcessById(this.parentPID);
        if (!colonyProcess)
            return this.stop(0);

        const room = Game.rooms[this.memory.roomName];
        if (!room.storage || room.storage.store.energy < 40000) {
            sleepProcess(this, 1500);
            return 0;
        }
        let memory = this.memory;
        let upgraderName = memory.name;
        if (upgraderName && Game.creeps[upgraderName]) {
            this.runCreep(upgraderName);
        } else {
            this.spawnCreep();
        }


        if (this.memory.hasCourier) {
            const courierName = this.memory.courierName;
            if (courierName && Game.creeps[courierName])
                this.runCourier(courierName);
            else
                this.spawnCourier();
        }
        return 0;
    }

    public runCreep(creepName: string): number {
        let creep = Game.creeps[creepName];
        let storage: StructureStorage | StructureContainer | null = Game.getObjectById(this.memory.containerID!) as StructureStorage | StructureContainer;
        let controller = creep.room.controller!;
        if (!storage)
            storage = this.getEnergySource();
        if (!storage) {
            sleepProcess(this, 1000);
            console.log("Missing energy source for upgrader in room " + this.memory.roomName);
            return 0;
        } else {
            this.memory.containerID = storage.id;
        }

        if (creep.pos.inRangeTo(controller.pos, 3) &&
            creep.pos.isNearTo(storage.pos)) {
            creep.withdraw(storage, RESOURCE_ENERGY);
            this.work(creep);
        } else {
            let pos = _.filter(storage.pos.adjacentPositions(), pos => pos.inRangeTo(controller.pos, 3));
            if (pos.length > 0)
                creep.moveTo(pos[0]);
            else {
                console.log(`Upgrader in room ${this.memory.roomName} can't find a spot to upgrade`);
            }
        }
        if (!(storage instanceof StructureStorage))
            this.memory.hasCourier = true;
        return 0;
    }

    private runCourier(creepName: string): number {
        const creep = Game.creeps[creepName];
        let storage: StructureStorage | StructureContainer | null = Game.getObjectById(this.memory.containerID!) as StructureStorage | StructureContainer;
        if (!storage) {
            return 0;
        }

        const room = Game.rooms[this.memory.roomName];
        if (creep.carry.energy === 0) {
            creep.moveTo(room.storage!);
            creep.withdraw(room.storage!, RESOURCE_ENERGY);
        } else {
            creep.moveTo(storage);
            creep.transfer(storage, RESOURCE_ENERGY);
        }
        return 0;


    }
    public receiveCreep(id: string, creep: Creep) {
        if (id === "upgrader")
            this.memory.name = creep.name;
        if (id === "courier")
            this.memory.courierName = creep.name;
    }

    private getEnergySource(): StructureContainer | StructureStorage | null {
        const room = Game.rooms[this.memory.roomName];
        const storage = room.storage!;
        const controller = room.controller!;
        if (!storage)
            return null;
        let pos = _.filter(storage.pos.adjacentPositions(), pos => pos.inRangeTo(controller.pos, 3));
        if (pos.length === 0) {
            const allContainers = room.find(FIND_STRUCTURES, { filter: (s: Structure) => s.structureType === STRUCTURE_CONTAINER && s.pos.inRangeTo(controller.pos, 3) }) as StructureContainer[];
            if (allContainers.length > 0) {
                return allContainers[0];
            } else
                return null;

        } else {
            return storage;
        }

    }

    private work(creep: Creep) {
        const container = Game.getObjectById(this.memory.containerID!) as Structure;
        if (!this.memory.isFixingContainer) {
            if (container.hits < (container.hitsMax / 2))
                this.memory.isFixingContainer = true;
        } else {
            if (container.hits === container.hitsMax)
                this.memory.isFixingContainer = false;
        }
        if (this.memory.isFixingContainer)
            creep.repair(container);
        else
            creep.upgradeController(creep.room.controller!);
    }
    private spawnCreep() {
        let roomName = this.memory.roomName;
        let spawnProcess = getSpawnProcess(this.memory.roomName);
        let energy = Game.rooms[roomName].energyCapacityAvailable;
        energy = energy - 50;
        let multiplier = Math.floor(energy / 250);
        if (spawnProcess) {
            spawnProcess.spawn("upgrader", { CARRY: 1, WORK: 2 * multiplier, MOVE: multiplier },
                this.pid);
        }
    }

    private spawnCourier() {
        let roomName = this.memory.roomName;
        let spawnProcess = getSpawnProcess(this.memory.roomName);
        let energy = Game.rooms[roomName].energyCapacityAvailable;
        let multiplier = Math.floor(energy / 100);
        if (spawnProcess) {
            spawnProcess.spawn("courier", { CARRY: multiplier, MOVE: multiplier },
                this.pid);
        }

    }
}

export = UpgraderProcess;
