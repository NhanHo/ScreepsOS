import OvermindProcess = require("../overmind");
import { OvermindMemory } from "../memory/overmind";
import MiningProcess = require("./mining");
interface RemoteMiningStarterMemory extends OvermindMemory {
    targetRoomName: string;
    scout: string;
}
class RemoteMiningStarter extends OvermindProcess {
    public classPath = "components.processes.mining.remote-mining-starter";
    public memory: RemoteMiningStarterMemory;

    public run(): number {
        let memory = this.memory;
        let room = Game.rooms[memory.targetRoomName];
        if (!room) {
            return this.scout();
        } else {

            let sources = room.find(FIND_SOURCES) as Source[];
            for (let source of sources) {
                let result = source.pos.createFlag(source.id, COLOR_YELLOW);
                if (_.isString(result)) {
                    let mining = new MiningProcess(0, 0);
                    RemoteMiningStarter.addProcess(mining);
                    mining.memory.sourceId = source.id;
                    mining.memory.flagName = result;
                    mining.memory.spawningRoomName = this.memory.spawningRoomName;
                }
            }
            console.log("Mining process started, terminate RemoteMiningStarter process");
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

export = RemoteMiningStarter;
