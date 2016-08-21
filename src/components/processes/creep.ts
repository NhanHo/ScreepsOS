import Process = require("./process");
import { CreepMemory } from "./memory/creep";
import { getProcessById } from "../kernel/kernel";
import OvermindProcess = require("./overmind");
abstract class CreepProcess extends Process {
    public memory: CreepMemory;
    public run(): number {
        let creep = Game.creeps[this.memory.creepName];

        if (!creep) {
            console.log("A creep has disappeared:" + this.memory.creepName);
            if (this.parentPID !== 0) {
                let p = <OvermindProcess>getProcessById(this.parentPID);
                p.creepDies("", this.pid);
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
