import { addProcess, getProcessById, storeProcessTable } from "../../kernel/kernel/kernel";
import Process = require("../../kernel/kernel/process");
import StarterCreepProcess = require("../room/starter-creep");
class StarterProcess extends Process {
    public static start(roomName: string) {
        const p = new StarterProcess(0, 0);
        addProcess(p);
        p.memory.roomName = roomName;
        storeProcessTable();
    }

    public classPath() {
        return "components.processes.room.starter";
    }

    public getNeededIndex(creepPIDList: number[]): number {
        const process = _.map(creepPIDList, getProcessById) as StarterCreepProcess[];
        const odd = _.filter(process, ((p) => p.getIndex() === 1));
        const even = _.filter(process, ((p) => p.getIndex() === 0));
        if (odd.length < even.length)
            return 1;
        return 0;
    }
    public creepDies(childPid: number) {
        this.memory.creepPIDList = _.filter(this.memory.creepPIDList, (pid) => pid !== childPid);
    };
    public run(): number {
        const memory = this.memory;
        memory.creepPIDList = memory.creepPIDList || [];
        const creepList: string[] = memory.creepPIDList;
        const roomName = memory.roomName;
        const room = Game.rooms[roomName];
        const energyCapacity = room.energyCapacityAvailable;
        let multiplier = Math.floor(energyCapacity / 250);
        if (creepList.length < 6) {
            if (creepList.length === 0) {
                multiplier = Math.floor(room.energyAvailable / 250);
            }
            const result = this.spawnCreep({ WORK: 1 * multiplier, MOVE: 2 * multiplier, CARRY: 1 * multiplier });

            if (_.isString(result)) {
                const process = new StarterCreepProcess(0, this.pid);
                addProcess(process);
                process.memory.index = this.getNeededIndex(memory.creepPIDList);
                process.memory.creepName = result;
                memory.creepPIDList.push(process.pid);
            }
        }
        return 0;
    }

    private spawnCreep(bodyParts: bodyMap) {
        const makeBody = function(bodyMap: bodyMap): string[] {
            const partMap: { [s: string]: string } = {
                WORK,
                MOVE,
                CARRY,
                ATTACK,
            };
            const replicatePart = function(times: number, part: string) {
                return _.map(_.times(times, (x) => x),
                    () => partMap[part]);
            };
            return _.chain(bodyMap).map(replicatePart).flatten().value() as string[];
        };
        const room = Game.rooms[this.memory.roomName];
        const spawns = room.find(FIND_STRUCTURES, { filter: (s: Spawn) => s.structureType === STRUCTURE_SPAWN }) as Spawn[];
        if (spawns.length) {
            return spawns[0].createCreep(makeBody(bodyParts), undefined);
        }
    }
}

export = StarterProcess;
