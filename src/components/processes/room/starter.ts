import Process = require("../process");
import StarterCreepProcess = require("../room/starter-creep");
import { getProcessById, addProcess, storeProcessTable } from "../../kernel/kernel";
class StarterProcess extends Process {
    public static start(roomName: string) {
        let p = new StarterProcess(0, 0);
        addProcess(p);
        p.memory.roomName = roomName;
        storeProcessTable();
    }

    public readonly classPath = "components.processes.room.starter";

    public getNeededIndex(creepPIDList: number[]): number {
        let process = <StarterCreepProcess[]>_.map(creepPIDList, getProcessById);
        let odd = _.filter(process, (p => p.getIndex() === 1));
        let even = _.filter(process, (p => p.getIndex() === 0));
        if (odd.length < even.length)
            return 1;
        return 0;
    }
    public creepDies(childPid: number) {
        this.memory.creepPIDList = _.filter(this.memory.creepPIDList, pid => pid !== childPid);
    };
    public run(): number {
        let memory = this.memory;
        memory.creepPIDList = memory.creepPIDList || [];
        let creepList: string[] = memory.creepPIDList;
        let roomName = memory.roomName;
        let room = Game.rooms[roomName];
        let energyCapacity = room.energyCapacityAvailable;
        let multiplier = Math.floor(energyCapacity / 250);
        if (creepList.length < 12) {
            if (creepList.length === 0) {
                multiplier = Math.floor(energyCapacity / 250);
            }
            let result = this.spawnCreep({ WORK: 1 * multiplier, MOVE: 2 * multiplier, CARRY: 1 * multiplier });

            if (_.isString(result)) {
                let process = new StarterCreepProcess(0, this.pid);
                addProcess(process);
                process.memory.index = this.getNeededIndex(memory.creepPIDList);
                process.memory.creepName = result;
                memory.creepPIDList.push(process.pid);
            }
        }
        return 0;
    }

    private spawnCreep(bodyParts: bodyMap) {
        const makeBody = function (bodyMap: bodyMap): string[] {
            let partMap: { [s: string]: string } = {
                WORK: WORK,
                MOVE: MOVE,
                CARRY: CARRY,
                ATTACK: ATTACK,
            };
            let replicatePart = function (times: number, part: string) {
                return _.map(_.times(times, x => x),
                    () => partMap[part]);
            };
            return <string[]>_.chain(bodyMap).map(replicatePart).flatten().value();
        };

        return Game.spawns["Spawn2"].createCreep(makeBody(bodyParts), undefined);
    }
}

export = StarterProcess;
