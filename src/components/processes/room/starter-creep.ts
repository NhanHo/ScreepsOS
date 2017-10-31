import { getProcessById } from "../../kernel/kernel/kernel";
import Process = require("../../kernel/kernel/process");
import StarterProcess = require("./starter");
class StarterCreepProcess extends Process {
    public classPath() {
        return "components.processes.room.starter-creep";
    }

    public getIndex() {
        return this.memory.index;
    }
    public run(): number {
        const creep = Game.creeps[this.memory.creepName];

        if (!creep) {
            console.log("A creep has disappeared:" + this.memory.creepName);
            const p = getProcessById(this.parentPID) as StarterProcess;
            p.creepDies(this.pid);
            return this.stop(0);
        } else {
            this.runCreep(creep);
            return 0;
        }
    }

    private runCreep(creep: Creep) {
        const starterProcess = getProcessById(this.parentPID) as StarterProcess;
        if (!starterProcess) {
            creep.suicide();
            this.stop(0);
        }

        const memory = this.memory;
        const room = creep.room;
        const index = memory.index;
        const controller = room.controller!;

        const targets: ConstructionSite[] = room.find(FIND_CONSTRUCTION_SITES) as ConstructionSite[];
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

            const source: Source = creep.room.find(FIND_SOURCES)[index] as Source;

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

            const storages: Structure[] = creep.room.find(FIND_MY_STRUCTURES, {
                filter(s: Extension) {
                    return s.structureType === STRUCTURE_EXTENSION
                        && s.energy < s.energyCapacity;
                },
            }) as Structure[];

            const spawnNeedEnergy = creep.room.find(FIND_MY_SPAWNS, { filter(spawn: Spawn) { return spawn.energy < spawn.energyCapacity; } });
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
                const target = _.min(storages, function(item) {
                    return creep.pos.getRangeTo(item);
                });
                creep.moveTo(target);
                creep.transfer(target, RESOURCE_ENERGY);

            }
        }

    }
}
export = StarterCreepProcess;
