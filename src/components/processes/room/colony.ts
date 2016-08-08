import Process = require("../process");
import { getProcessById } from "../../kernel/kernel";

class ColonyProcess extends Process {
    private launchSpawnProcess() {
	return 0;
    }
    public run(): number {
	let memory = this.memory;
	let spawnPID = memory.spawnPID;
	
	if (!spawnPID || !getProcessById(spawnPID)) {
	    memory.spawnPID = this.launchSpawnProcess();
	} else {
	    
	}
	return 0;
    }
}

export = ColonyProcess;
