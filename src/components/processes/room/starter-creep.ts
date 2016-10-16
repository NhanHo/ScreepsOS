import { getProcessById } from "../../kernel/kernel";
import StarterProcess = require("./starter");
import Process = require("../process");
class StarterCreepProcess extends Process {
    public readonly classPath = "components.processes.room.starter-creep";

    public getIndex() {
        return this.memory.index;
    }
    public run(): number {
        const creep = Game.creeps[this.memory.creepName];

        if (!creep) {
            console.log("A creep has disappeared:" + this.memory.creepName);
            const p = <StarterProcess>getProcessById(this.parentPID);
            p.creepDies(this.pid);
            return this.stop(0);
        } else {
            this.runCreep(creep);
            return 0;
        }
    }

    private runCreep(creep: Creep) {
        const starterProcess = <StarterProcess>getProcessById(this.parentPID);
        if (!starterProcess) {
            creep.suicide();
            this.stop(0);
        }

        const memory = this.memory;
        const room = creep.room;
        const index = memory.index;
        const controller = room.controller!;

        const targets: ConstructionSite[] = <ConstructionSite[]>room.find(FIND_CONSTRUCTION_SITES);
        if (controller.level === 0) {
            creep.moveTo(controller);
            creep.claimController(controller);
            return;
        }
        if (memory.currentAction === undefined) memory.currentAction = "Mine";

        if (memory.currentAction === "Mine") {
            if (creep.carry.energy === creep.carryCapacity) {
                memory.currentAction = "Build";
                return;
            }

            const source: Source = <Source>creep.room.find(FIND_SOURCES)[index];

            creep.moveTo(source);
            creep.harvest(source);

        } else {
            if (creep.carry.energy === 0) {
                memory.currentAction = "Mine";
                return;

            }
            if (controller.ticksToDowngrade < 1000) {
                creep.moveTo(controller);
                creep.upgradeController(controller);
                return;
            }

            const storages: Structure[] = <Structure[]>creep.room.find(FIND_MY_STRUCTURES, {
                filter: function (s: Extension) {
                    return s.structureType === STRUCTURE_EXTENSION
                        && s.energy < s.energyCapacity;
                },
            });

            const spawnNeedEnergy = creep.room.find(FIND_MY_SPAWNS, { filter: function (spawn: Spawn) { return spawn.energy < spawn.energyCapacity; } });
            storages.push.apply(storages, spawnNeedEnergy);

            if (!storages.length) {
                if (targets.length) {
                    creep.moveTo(targets[0]);
                    creep.build(targets[0]);

                } else {
                    if (controller.level > 3 && room.storage) {
                        creep.moveTo(room.storage);
                        creep.transfer(room.storage, RESOURCE_ENERGY);
                    } else {
                        creep.moveTo(controller);
                        creep.upgradeController(controller);
                    }
                }
            } else {
                const target = _.min(storages, function (item) {
                    return creep.pos.getRangeTo(item);
                });
                creep.moveTo(target);
                creep.transfer(target, RESOURCE_ENERGY);

            }
        }

    }
}
export = StarterCreepProcess;
