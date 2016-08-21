import CreepProcess = require("../creep");
import { CreepMemory } from "../memory/creep";
const WORKING = 1;
const GET_ENERGY = 2;

interface MaintainerMemory extends CreepMemory {
    roomName: string;
    targetId: string;
    current: number;
}
export = class MaintainerCreep extends CreepProcess {
    public memory: MaintainerMemory;
    public classPath = "components.processes.room.maintainer-creep";

    private acquireNewTarget(): RoomObject | null {
        let room = Game.rooms[this.memory.roomName];
        const constructions = <ConstructionSite[]>room.find(FIND_CONSTRUCTION_SITES);
        const construction = constructions.pop();
        if (construction) {
            this.memory.targetId = construction.id;
            return construction;
        }
        return null;
    }

    private getEnergy(creep: Creep) {
        let room = Game.rooms[this.memory.roomName];
        let storage = room.storage;
        if (room.storage) {
            creep.moveTo(storage);
            creep.withdraw(storage, RESOURCE_ENERGY);
        }
    }

    private working(creep: Creep, obj: RoomObject) {
        if (obj instanceof ConstructionSite) {
            if (!creep.pos.inRangeTo(obj.pos, 3))
                return creep.moveTo(obj);

            creep.build(obj);
        }
    }
    public runCreep(creep: Creep): number {
        let obj: RoomObject | null = <RoomObject | null>Game.getObjectById(this.memory.targetId);
        if (!obj)
            obj = this.acquireNewTarget();

        if (obj) {
            if (creep.carry.energy === 0)
                this.memory.current = GET_ENERGY;
            if (creep.carry.energy === creep.carryCapacity)
                this.memory.current = WORKING;

            if (this.memory.current === GET_ENERGY)
                this.getEnergy(creep);
            else
                this.working(creep, obj);
        }

        return 0;
    }
}
