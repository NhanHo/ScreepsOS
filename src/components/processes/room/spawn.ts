import { addProcess, getProcessById } from "../../kernel/kernel/kernel";
import Process = require("../../kernel/kernel/process");
import { ProcessPriority } from "../constants";
interface CreepRequest {
    pid: number;
    creepID: string;
    bodyParts: bodyMap;
    priority: number;
}
class SpawnProcess extends Process {
    public static start(roomName: string, parentPID: number) {
        let p = new SpawnProcess(0, parentPID);
        p = addProcess(p, ProcessPriority.TiclyLast);
        p.memory.roomName = roomName;
        return p;
    }

    public classPath() {
        return "components.processes.room.spawn";
    }
    public getRoomName() {
        return this.memory.roomName;
    }
    public spawn(id: string, bodyMap: bodyMap, pid: number, priority = 10): number {
        const memory = this.memory;
        const existing = _.find(memory.requestList as CreepRequest[], (r) => (r.creepID === id) && (r.pid === pid));
        if (existing) {
            return -1;
        } else {
            const creepRequest = { pid, creepID: id, bodyParts: bodyMap, priority };
            memory.requestList.push(creepRequest);
            return 0;
        }

    }
    public run(): number {
        const colonyProcess = getProcessById(this.parentPID);
        if (!colonyProcess)
            return this.stop(0);

        const roomName = this.memory.roomName;
        if (!roomName)
            return this.stop(0);
        const makeBody = function(bodyMap: bodyMap): string[] {
            // TODO : Fix the part map, this need to include all part type somehow
            const partMap: { [s: string]: string } = {
                WORK,
                MOVE,
                CARRY,
                ATTACK,
                CLAIM,
            };
            const replicatePart = function(times: number, part: string) {
                return _.map(_.times(times, (x) => x),
                    () => partMap[part]);
            };
            return _.chain(bodyMap).map(replicatePart).flatten().value() as string[];
        };

        const memory = this.memory;
        memory.requestList = memory.requestList || [];
        memory.requestList = _.sortBy(memory.requestList as CreepRequest[], (i) => i.priority);
        const request: CreepRequest = memory.requestList.pop();
        const spawn = this.findFreeSpawn(this.memory.roomName);
        if (request) {
            if (spawn) {
                const body = makeBody(request.bodyParts);
                const canSpawn = spawn.canCreateCreep(body);
                if (canSpawn === OK) {
                    const process: any = getProcessById(request.pid);
                    const creepName = spawn.createCreep(body);
                    process.receiveCreep(request.creepID, Game.creeps[creepName]);
                }
            }
        }
        return 0;

    }

    private findFreeSpawn(roomName: string) {
        const spawns = _.filter(Game.spawns,
            function(spawn) {
                return spawn.room.name === roomName &&
                    spawn.spawning == null &&
                    spawn.canCreateCreep([MOVE]) === OK &&
                    spawn.isActive();
            });
        if (spawns.length > 0)
            return spawns[0];
        return null;
    };
}

export = SpawnProcess;
