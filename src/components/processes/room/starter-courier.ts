import CreepProcess = require("../creep");
import { CreepMemory } from "../memory/creep";

enum CreepState {
    GETTING_ENERGY = 1,
    DELIVERING
}

interface StarterCourierMemory extends CreepMemory {
    targetCreep: string | undefined;
    state: CreepState;
}

class StarterCourier extends CreepProcess {
    public memory: StarterCourierMemory;
    public classPath() {
        return "components.processes.room.starter-courier";
    }

    public runCreep(creep: Creep): number {
        this.memory.state = this.memory.state || CreepState.GETTING_ENERGY;
        if (this.memory.state === CreepState.GETTING_ENERGY) {
            this.getEnergy(creep);
        } else {
            this.deliverEnergy(creep);
        }
        return 0;
    }

    private findEnergySource(creep: Creep) {
        creep;
    }

    private getEnergy(creep: Creep) {
        let targetCreep: Creep = Game.getObjectById(this.memory.targetCreep!) as Creep;
        if (!targetCreep) {
            this.findEnergySource(creep);
        }
    }

    private deliverEnergy(creep: Creep) {
        creep;
    }
}

export = StarterCourier;
