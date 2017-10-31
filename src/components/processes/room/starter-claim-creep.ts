import { getProcessById } from "../../kernel/kernel/kernel";
import Process = require("../../kernel/kernel/process");
import ClaimProcess = require("./claim");
interface StarterClaimCreepMemory {
    index: number;
    targetRoomName: string;
    currentAction: string;
    creepName: string;
}
class StarterClaimCreepProcess extends Process {
    public classPath() {
        return "components.processes.room.starter-claim-creep";
    }

    public memory: StarterClaimCreepMemory;

    public getIndex() {
        return this.memory.index;
    }
    public run(): number {
        const creep = Game.creeps[this.memory.creepName];
        if (!creep) {
            console.log("A creep has disappeared:" + this.memory.creepName);
            const p = getProcessById(this.parentPID) as ClaimProcess;
            p.creepDies(this.pid);
            return this.stop(0);
        } else {
            this.runCreep(creep);
            return 0;
        }
    }

    private moveToAnotherRoom(creep: Creep): number {
        const room = Game.rooms[this.memory.targetRoomName];
        if (creep.room.name !== room.name) {
            creep.moveTo(room.controller!);
            return 0;
        }
        return -1;

    }
    private runCreep(creep: Creep) {
        const starterProcess = getProcessById(this.parentPID) as ClaimProcess;
        if (!starterProcess) {
            creep.suicide();
            this.stop(0);
        }

        if (this.moveToAnotherRoom(creep) === 0)
            return 0;

        const memory = this.memory;
        const room = creep.room;
        let index = memory.index;

        if (!index) {
            index = this.memory.index = starterProcess.getNeededIndex();
        }
        const targets: ConstructionSite[] = room.find(FIND_CONSTRUCTION_SITES) as ConstructionSite[];
        memory.currentAction = memory.currentAction || "Mine";

        if (memory.currentAction === "Mine") {
            if (creep.carry.energy === creep.carryCapacity) {
                memory.currentAction = "Build";
                return;
            }

            const source: Source = creep.room.find(FIND_SOURCES)[index] as Source;
            creep.moveTo(source);
            creep.harvest(source);
            if (creep.pos.inRangeTo(creep.room.controller!.pos, 3))
                creep.upgradeController(creep.room.controller!);

        } else {
            if (creep.carry.energy === 0) {
                memory.currentAction = "Mine";
                return;

            }
            if (creep.room.controller!.ticksToDowngrade < 1000) {
                creep.moveTo(creep.room.controller!);
                creep.upgradeController(creep.room.controller!);
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
                    if (room.controller!.level > 3 && room.storage) {
                        creep.moveTo(room.storage);
                        creep.transfer(room.storage, RESOURCE_ENERGY);
                    } else {
                        creep.moveTo(creep.room.controller!);
                        creep.upgradeController(creep.room.controller!);
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
export = StarterClaimCreepProcess;
