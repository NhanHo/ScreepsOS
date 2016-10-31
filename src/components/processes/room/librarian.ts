import Process = require("../../kernel/kernel/process");
import { getProcessById } from "../../kernel/kernel/kernel";
import { getSpawnProcess } from "../../utils/spawn";
class LibrarianProcess extends Process {

    public classPath() {
        return "components.processes.room.librarian";
    }

    public receiveCreep(id: string, creep: Creep) {
        if (id === "small") {
            this.memory.smallCreepName = creep.name;
        }
        if (id === "big") {
            this.memory.creepName = creep.name;
        }
    }
    public runCreep(creepName: string): number {
        let creep = Game.creeps[creepName];

        const storage = creep.room.storage;
        let toSpawn = true;
        if (!storage) {
            toSpawn = false;
        }
        if (creep.carry.energy === 0) {
            if (storage) {
                if (!creep.pos.isNearTo(storage)) {
                    creep.moveTo(storage);
                } else {
                    creep.withdraw(storage, RESOURCE_ENERGY);
                }
            }
        } else {
            let storages: (Extension | Spawn)[] = <(Extension | Spawn)[]>creep.room.find(FIND_MY_STRUCTURES, {
                filter: function (s: any) {
                    return (s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_TOWER)
                        && s.needEnergy();
                },
            });
            let spawnInDestRoom = creep.room.find(FIND_MY_SPAWNS, { filter: function (spawn: Spawn) { return spawn.energy < spawn.energyCapacity; } });
            if (toSpawn)
                storages.push.apply(storages, spawnInDestRoom);

            if (storages.length) {
                let min = _.min(storages, function (item) {
                    return creep.pos.getRangeTo(item);
                });
                if (creep.pos.isNearTo(min)) {
                    creep.transfer(min, RESOURCE_ENERGY);
                    storages = _.filter(storages, x => x.id !== min.id);
                    min = _.min(storages, function (item) {
                        return creep.pos.getRangeTo(item);
                    });
                    creep.moveTo(min);

                } else {
                    creep.moveTo(min);
                }

            }
        }
        return 0;

    }

    public spawnSmallCreep(): number {
        let room = Game.rooms[this.memory.roomName];
        let availableEnergy = room.energyAvailable;
        let modifier = Math.floor(availableEnergy / 100);
        if (modifier > 25)
            modifier = 25;

        this.spawnCreep("small", { CARRY: modifier, MOVE: modifier }, 100);
        return 0;
    }

    public spawnNormalCreep(): number {
        let room = Game.rooms[this.memory.roomName];
        let availableEnergy = room.energyCapacityAvailable;
        let modifier = Math.floor(availableEnergy / 100);
        if (modifier > 25)
            modifier = 25;
        this.spawnCreep("big", { CARRY: modifier, MOVE: modifier }, 100);
        return 0;

    }

    public run(): number {
        let colonyProcess = getProcessById(this.parentPID);
        if (!colonyProcess)
            return this.stop(0);

        let memory = this.memory;
        let smallCreepName = memory.smallCreepName;
        let creepName = memory.creepName;

        if (smallCreepName && !Game.creeps[smallCreepName])
            smallCreepName = memory.smallCreepName = null;

        if (creepName && !Game.creeps[creepName])
            creepName = memory.creepName = null;

        if (!creepName) {
            if (!smallCreepName) {
                this.spawnSmallCreep();
            } else {
                this.spawnNormalCreep();
            }
        }

        if (smallCreepName)
            this.runCreep(smallCreepName);

        if (creepName)
            this.runCreep(creepName);
        return 0;
    }

    protected spawnCreep(creepID: string, bodyParts: bodyMap, priority?: number) {
        let spawnProcess = getSpawnProcess(this.memory.roomName);

        if (spawnProcess) {
            spawnProcess.spawn(creepID, bodyParts, this.pid, priority);
        }
    }
}

export = LibrarianProcess;
