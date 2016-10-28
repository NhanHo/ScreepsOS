import CreepProcess = require("../creep");
import { CreepMemory } from "../memory/creep";
interface ReserveCreepMemory extends CreepMemory {
    roomName: string;
}
class ReserveCreep extends CreepProcess {
    public classPath() {
        return "components.processes.remote-room.reserve-creep";
    }
    public memory: ReserveCreepMemory;
    public runCreep(creep: Creep): number {
        const roomName = this.memory.roomName;
        const room = Game.rooms[roomName];
        if (room) {
            if (!creep.pos.isNearTo(room.controller!.pos)) {
                creep.moveTo(room.controller!.pos);
            } else {
                creep.reserveController(room.controller!);
            }
        } else {
            const roomPos = new RoomPosition(25, 25, roomName);
            creep.moveTo(roomPos);
        }
        return 0;
    };
}

export = ReserveCreep;
