import Process = require("../process");
import { getProcessById } from "../../kernel/kernel";
import SpawnProcess = require("./spawn");
import { addProcess} from "../../kernel/kernel";
class ColonyProcess extends Process {

    public start(roomName: string) {
	let p = new ColonyProcess(0, 0);
	p = addProcess(p);
	p.memory.roomName = roomName;
    }
    public getRoomName() {
	return this.memory.roomName;
    }
    
    private launchSpawnProcess() {
	let p = SpawnProcess.start(this.pid);
	return p.pid;
    }
    public run(): number {
	let memory = this.memory;
	let spawnPID = memory.spawnPID;
	
	if (!spawnPID || !getProcessById(spawnPID)) {
	    memory.spawnPID = this.launchSpawnProcess();
	}

	return 0;
    }
}

export = ColonyProcess;
