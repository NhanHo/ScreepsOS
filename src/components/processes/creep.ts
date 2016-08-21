import Process = require("./process");
import { CreepMemory } from "./memory/creep";
import { getProcessById } from "../kernel/kernel";
abstract class CreepProcess extends Process {
    public memory: CreepMemory;
    abstract runCreep(creep: Creep): number;
    public run(): number {
        let creep = Game.creeps[this.memory.creepName];

        if (!creep) {
            console.log("A creep has disappeared:" + this.memory.creepName);
            let p = getProcessById(this.parentPID);
            p["creepDies"](this.pid);
            return this.stop(0);
        } else {
            this.runCreep(creep);
            return 0;
        }
    }

}

export = CreepProcess;
