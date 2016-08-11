import Process = require("../process");
import { getProcessById } from "../../kernel/kernel";
import { getSpawnProcess } from "../../kernel/kernel-utils";
class LibrarianProcess extends Process {

    public classPath = "components.processes.room.librarian";
    protected spawnCreep(creepID: string, bodyParts: bodyMap, priority?: number) {
        let spawnProcess = getSpawnProcess(this.memory.roomName);

        if (spawnProcess) {
            spawnProcess.spawn(creepID, bodyParts, this.pid, priority);
        }
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

        var storage = creep.room.storage;
        var toSpawn = true;
        if (!storage) {
            toSpawn = false;
        }
        if (creep.carry.energy == 0) {
            if (storage) {
                if (!creep.pos.isNearTo(storage))
                    creep.moveTo(storage);
                else {
                    storage.transfer(creep, RESOURCE_ENERGY);
                }
            }
        } else {
            var storages: (Extension | Spawn)[] = <(Extension | Spawn)[]>creep.room.find(FIND_MY_STRUCTURES, {
                filter: function (s: any) {
                    return (s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_TOWER)
                        && s.needEnergy();
                }
            });
            var spawnInDestRoom = creep.room.find(FIND_MY_SPAWNS, { filter: function (spawn: Spawn) { return spawn.energy < spawn.energyCapacity; } });
            if (toSpawn)
                storages.push.apply(storages, spawnInDestRoom);

            if (storages.length) {
                var min = _.min(storages, function (item) {
                    return creep.pos.getRangeTo(item);
                });


                if (creep.pos.isNearTo(min)) {
                    creep.transfer(min, RESOURCE_ENERGY);
                    storages = _.filter(storages, x => x.id != min.id);
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
        this.spawnCreep("small", { CARRY: modifier, MOVE: modifier }, 100);
        return 0;
    }

    public spawnNormalCreep(): number {
        let room = Game.rooms[this.memory.roomName];
        let availableEnergy = room.energyCapacityAvailable;
        let modifier = Math.floor(availableEnergy / 100);
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
            if (!smallCreepName)
                this.spawnSmallCreep();
            else
                this.spawnNormalCreep();
        }


        if (smallCreepName)
            this.runCreep(smallCreepName);

        if (creepName)
            this.runCreep(creepName);
        return 0;
    }
}

export = LibrarianProcess;
