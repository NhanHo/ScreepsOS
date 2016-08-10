import { getProcessById } from "../../kernel/kernel";
import StarterProcess = require("./starter");
import Process = require("../process");
class StarterCreepProcess extends Process {

    readonly classPath = "components.processes.room.starter-creep";

    public getIndex() {
        return this.memory.index;
    }
    private runCreep(creep: Creep) {
        let starterProcess = <StarterProcess>getProcessById(this.parentPID);
        if (!starterProcess) {
            creep.suicide();
            this.stop(0);
        }


        let memory = this.memory;
        var room = creep.room;
        let index = memory.index;
        var controller: Controller = room.controller;

        var targets: ConstructionSite[] = <ConstructionSite[]>room.find(FIND_CONSTRUCTION_SITES);
        if (controller.level == 0) {
            creep.moveTo(creep.room.controller);
            creep.claimController(creep.room.controller);
            return;
        }
        if (memory.currentAction == undefined) memory.currentAction = "Mine";

        if (memory.currentAction == "Mine") {
            if (creep.carry.energy == creep.carryCapacity) {
                memory.currentAction = "Build";
                return;
            }

            var source: Source = <Source>creep.room.find(FIND_SOURCES)[index];

            creep.moveTo(source);
            creep.harvest(source);

        } else {
            if (creep.carry.energy == 0) {
                memory.currentAction = "Mine";
                return;

            }


            if (creep.room.controller.ticksToDowngrade < 1000) {
                creep.moveTo(creep.room.controller);
                creep.upgradeController(creep.room.controller);
                return;
            }

            var storages: Structure[] = <Structure[]>creep.room.find(FIND_MY_STRUCTURES, {
                filter: function (s: Extension) {
                    return s.structureType == STRUCTURE_EXTENSION
                        && s.energy < s.energyCapacity;
                }
            });

            var spawnNeedEnergy = creep.room.find(FIND_MY_SPAWNS, { filter: function (spawn: Spawn) { return spawn.energy < spawn.energyCapacity; } });
            storages.push.apply(storages, spawnNeedEnergy);

            if (!storages.length) {
                if (targets.length) {
                    creep.moveTo(targets[0]);
                    creep.build(targets[0]);

                } else {
                    if (room.controller.level > 3 && room.storage) {
                        creep.moveTo(room.storage);
                        creep.transfer(room.storage, RESOURCE_ENERGY);
                    } else {
                        creep.moveTo(creep.room.controller);
                        creep.upgradeController(creep.room.controller);
                    }
                }
            } else {
                let target = _.min(storages, function (item) {
                    return creep.pos.getRangeTo(item);
                });
                creep.moveTo(target);
                creep.transfer(target, RESOURCE_ENERGY);

            }
        }

    }
    public run(): number {
        let creep = Game.creeps[this.memory.creepName];

        if (!creep) {
            let p = <StarterProcess>getProcessById(this.parentPID);
            p.creepDies(this.pid);
            return this.stop(0);
        } else {
            this.runCreep(creep);
            return 0;
        }
    }
}
export = StarterCreepProcess;
