import Process = require("../kernel/kernel/process");
import { CreepMemory } from "./memory/creep";
import { getProcessById } from "../kernel/kernel/kernel";
import OvermindProcess = require("./overmind");
abstract class CreepProcess extends Process {
    public memory: CreepMemory;
    public run(): number {
        let creep = Game.creeps[this.memory.creepName];

        if (!creep) {
            if (this.parentPID !== 0) {
                let p = <OvermindProcess>getProcessById(this.parentPID);
                p.creepDies(this.memory.id, this.pid);
            }
            return this.stop(0);
        } else {
            this.runCreep(creep);
            return 0;
        }
    }

    protected abstract runCreep(creep: Creep): number;
}

export = CreepProcess;
