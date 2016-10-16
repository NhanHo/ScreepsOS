import OvermindProcess = require("../overmind");
import { OvermindMemory } from "../memory/overmind";
interface ReservationOutpostMemory extends OvermindMemory {
    colonyPid: number;
    roomName: string;
    reservationCreep: string;
}

class ReservationOutpostProcess extends OvermindProcess {
    public classPath = "components.processes.remote-room.reservation-outpost";
    public memory: ReservationOutpostMemory;
    public receiveCreep(__: string, creep: Creep) {
        this.memory.reservationCreep = creep.name;
    }

    public creepDies(__: string, ___: number) { };
    public run(): number {
        let creep = Game.creeps[this.memory.reservationCreep];
        if (!creep) {
            this.spawnCreep("reserver", { MOVE: 2, CLAIM: 2 });
        } else {
            let room = Game.rooms[this.memory.roomName];
            if (!room) {
                creep.moveTo(new RoomPosition(25, 25, this.memory.roomName));
                return 0;
            }
            if (!room.controller) {
                console.log(`Pid ${this.pid} is trying to reserve a room without controller`);
                return 0;
            }
            if (creep.pos.isNearTo(room.controller))
                creep.reserveController(room.controller);
            else
                creep.moveTo(room.controller);
        }
        return 0;
    }


}
export = ReservationOutpostProcess;
