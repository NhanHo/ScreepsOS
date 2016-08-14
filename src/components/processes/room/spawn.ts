import Process = require("../process");
import { ProcessPriority } from "../constants";
import { addProcess, getProcessById } from "../../kernel/kernel";
interface CreepRequest {
    pid: number;
    creepID: string;
    bodyParts: bodyMap;
    priority: number;
}
class SpawnProcess extends Process {
    public classPath = "components.processes.room.spawn";
    public getRoomName() {
        return this.memory.roomName;
    }
    private findFreeSpawn(roomName: string) {
        let spawns = _.filter(Game.spawns,
            function (spawn) {
                return spawn.room.name == roomName &&
                    spawn.spawning == null &&
                    spawn.canCreateCreep([MOVE]) === OK &&
                    spawn.isActive();
            });
        if (spawns.length > 0)
            return spawns[0];
        return null;
    };


    public spawn(id: string, bodyMap: bodyMap, pid: number, priority = 10): number {
        let memory = this.memory;
        let existing = _.find(<CreepRequest[]>memory.requestList, r => (r.creepID === id) && (r.pid === pid));
        if (existing) {
            return -1;
        } else {
            let creepRequest = { pid: pid, creepID: id, bodyParts: bodyMap, priority: priority };
            memory.requestList.push(creepRequest);
            return 0;
        }

    }
    public run(): number {
        let colonyProcess = getProcessById(this.parentPID);
        if (!colonyProcess)
            return this.stop(0);

        var makeBody = function (bodyMap: bodyMap): string[] {
            //TODO : Fix the part map, this need to include all part type somehow
            let partMap: { [s: string]: string } = {
                WORK: WORK,
                MOVE: MOVE,
                CARRY: CARRY,
                ATTACK: ATTACK,
                CLAIM: CLAIM
            };
            let replicatePart = function (times: number, part: string) {
                return _.map(_.times(times, x => x),
                    () => partMap[part]);
            };
            return <string[]>_.chain(bodyMap).map(replicatePart).flatten().value();
        };

        let memory = this.memory;
        memory.requestList = memory.requestList || [];
        memory.requestList = _.sortBy(<CreepRequest[]>memory.requestList, i => i.priority).reverse();
        let request: CreepRequest = memory.requestList.pop();
        let spawn = this.findFreeSpawn(this.memory.roomName);
        if (request) {
            if (spawn && spawn.canCreateCreep(makeBody(request.bodyParts)) === OK) {
                let process: any = getProcessById(request.pid);
                let creepName = spawn.createCreep(makeBody(request.bodyParts));
                process.receiveCreep(request.creepID, Game.creeps[creepName]);
            }
        }
        return 0;

    }

    public static start(parentPID: number) {
        let p = new SpawnProcess(0, parentPID);
        p = addProcess(p, ProcessPriority.TiclyLast);
        return p;
    }
}

export = SpawnProcess;
