import { addProcess, getProcessById } from "../../kernel/kernel/kernel";
import Process = require("../../kernel/kernel/process");
class DefenseProcess extends Process {
    public static start(roomName: string, parentPID: number) {
        let p = new DefenseProcess(0, parentPID);
        p = addProcess(p);
        p.memory.roomName = roomName;
        return p.pid;
    }

    public classPath() {
        return "components.processes.room.defense";
    }
    public run(): number {
        const colonyProcess = getProcessById(this.parentPID);
        if (!colonyProcess)
            return this.stop(0);

        const roomName = this.memory.roomName;
        const room = Game.rooms[roomName];
        const hostileCreepList = room.find(FIND_HOSTILE_CREEPS) as Creep[];
        if (hostileCreepList.length) {
            const towerList = room.find(FIND_MY_STRUCTURES,
                { filter: { structureType: STRUCTURE_TOWER } }) as Tower[];
            for (const tower of towerList) {
                tower.attack(hostileCreepList[0]);
            }

        }
        return 0;
    }

}

export = DefenseProcess;
