import Process = require("../process");
import { getSpawnProcess } from "../../kernel/kernel-utils";
import { sleepProcess, addProcess, getProcessById } from "../../kernel/kernel";
class UpgraderProcess extends Process {
    public static start(roomName: string, parentPID: number) {
        let p = new UpgraderProcess(0, parentPID);
        addProcess(p);
        p.memory.roomName = roomName;
        return p.pid;
    }

    public classPath = "components.processes.room.upgrader";
    public run(): number {
        let colonyProcess = getProcessById(this.parentPID);
        if (!colonyProcess)
            return this.stop(0);

	const room = Game.rooms[this.memory.roomName];
	if (room.storage.store.energy < 40000) {
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
        return 0;
    }

    public runCreep(creepName: string): number {
        let creep = Game.creeps[creepName];
        let storage = creep.room.storage;
        let controller = creep.room.controller;
        if (creep.pos.inRangeTo(creep.room.controller.pos, 3) &&
            creep.pos.isNearTo(creep.room.storage.pos)) {
            storage.transfer(creep, RESOURCE_ENERGY);
            creep.upgradeController(controller);
        } else {

            let pos = _.filter(storage.pos.adjacentPositions(), pos => pos.inRangeTo(controller.pos, 3));
            creep.moveTo(pos[0]);
        }
        return 0;
    }
    public receiveCreep(id: string, creep: Creep) {
        if (id === "upgrader")
            this.memory.name = creep.name;
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
}

export = UpgraderProcess;
