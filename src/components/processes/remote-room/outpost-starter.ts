import OvermindProcess = require("../overmind");
import { OvermindMemory } from "../memory/overmind";
import OutpostProcess = require("./outpost");
import { addProcess } from "../../kernel/kernel/kernel";

interface OutpostStarterMemory extends OvermindMemory {
    targetRoomName: string;
    scout: string;
}
class OutpostStarterProcess extends OvermindProcess {
    public classPath() {
        return "components.processes.remote-room.outpost-starter";
    }
    public memory: OutpostStarterMemory;

    public run(): number {
        let memory = this.memory;
        let room = Game.rooms[memory.targetRoomName];
        if (!room) {
            return this.scout();
        } else {
            const outpostProcess = new OutpostProcess(0, 0);
            addProcess(outpostProcess);
            outpostProcess.memory.roomName = memory.targetRoomName;
            outpostProcess.memory.spawningRoomName = memory.spawningRoomName;

            outpostProcess.startMining();

            console.log("Output process started, terminate OutpostStarter process");
            return this.stop(0);
        }
    }

    public creepDies() { return; };
    public receiveCreep(creepID: string, creep: Creep) {
        if (creepID === "scout") {
            this.memory.scout = creep.name;
        }
    }

    private scout(): number {
        let creep = Game.creeps[this.memory.scout];
        if (!creep) {
            this.spawnCreep("scout", { MOVE: 1 });
        } else {
            creep.moveTo(new RoomPosition(25, 25, this.memory.targetRoomName));
        }

        return 0;
    }
}

export = OutpostStarterProcess;
