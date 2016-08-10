import Process =require("../process");
import { getSpawnProcess} from "../../kernel/kernel-utils";
class LibrarianProcess extends Process {

    protected spawnCreep(creepID: string, bodyParts: bodyMap, priority?: number) {
        let spawnProcess = getSpawnProcess(this.memory.roomName);
	
        if (spawnProcess) {
            spawnProcess.spawn(creepID, bodyParts, this.pid, priority);
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
                    let x = storage.transfer(creep, RESOURCE_ENERGY);
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
        let availableEnergy = this.room.energyAvailable;
        let modifier = Math.floor(availableEnergy / 100);
        this.spawnCreep("small", { CARRY: modifier, MOVE: modifier }, 100);
        return 0;
    }

    public spawnNormalCreep(): number {
        let availableEnergy = this.room.energyCapacityAvailable;
        let modifier = Math.floor(availableEnergy / 100);
        this.spawnCreep("big", { CARRY: modifier, MOVE: modifier }, 100);
        return 0;

    }
    
    public run(): number {
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

	
	return 0;
    }
}

export = LibrarianProcess;
