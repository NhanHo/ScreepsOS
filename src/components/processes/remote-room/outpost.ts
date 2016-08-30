import OvermindProcess = require("../overmind");
import MiningProcess = require("../mining/mining");
import {addProcess, getProcessById, sleepProcess } from "../../kernel/kernel";
import {OvermindMemory} from "../memory/overmind";
import ReserveCreep = require("./reserve-creep");
interface OutpostMemory extends OvermindMemory{
    //colonyPid: number;
    miningPid: number[];
    reserveCreepPid?: number;
    roomName: string;
    
}

class OutpostProcess extends OvermindProcess {
    public classPath = "components.processes.remote-room.outpost";
    public memory: OutpostMemory;
    public creepDies(id: string, pid: number) {
	if (id === "reserve") {
	    if (pid !== this.memory.reserveCreepPid) {
		console.log ("Error: We got a different reserve pid for outpost:" +
			     this.memory.roomName)
		console.log ("Error: Spawning extra reserve?");
	    } else
		this.memory.reserveCreepPid = undefined;
	}
	    
    };

    public receiveCreep(id: string, creep: Creep) {
	if (id === "reserve") {
	    let p = new ReserveCreep(0, this.pid);
	    addProcess(p);
	    p.memory.id = "reserve";
	    p.memory.creepName = creep.name;
	    p.memory.roomName = this.memory.roomName;
	    this.memory.reserveCreepPid = p.pid;
	}
	    
    }
    public startMining() {
	this.memory.miningPid = this.memory.miningPid || [];
	if (this.memory.miningPid.length > 0)
	    return ;
	
	const roomName = this.memory.roomName;
	const room = Game.rooms[roomName];

	if (room) {
	    console.log ("Starting mining for room:" + this.memory.roomName);
	    let sources = room.find(FIND_SOURCES) as Source[];
	    
	    for (let source of sources) {
		let mining = new MiningProcess(0, this.pid);
		addProcess(mining);
		mining.setup(this.memory.spawningRoomName, source.id);
		this.memory.miningPid.push(mining.pid);
	    }
	    console.log ("Mining successfully started for room:" + roomName);
	}
    }
    
    public run(): number {
	const reserveCreepPid = this.memory.reserveCreepPid;
	if (!reserveCreepPid || !getProcessById(reserveCreepPid)) {
	    const room = Game.rooms[this.memory.roomName];
	    if (!room.controller.reservation || (room.controller.reservation.ticksToEnd < 4000))
		this.spawnCreep("reserve", {CLAIM: 2, MOVE: 2});
	    else
		this.spawnCreep("reserve", {CLAIM: 1, MOVE: 1});
	}

	if (this.memory.miningPid.length === 0)
	    this.startMining();
	this.invaderCheck();
        return 0;
    }

    private invaderCheck() {
        const room = Game.rooms[this.memory.roomName];
        if (!room)
            return;
        const invaderList = <Creep[]>room.find(FIND_HOSTILE_CREEPS,
            { filter: c => c.owner.username === "Invader" });
        const invader = invaderList.pop();
        if (invader) {
            sleepProcess(this, 1500);
	    for (let pid of this.memory.miningPid) {
		const p = getProcessById(pid);
		sleepProcess(p, 1500);
	    }
	    if (this.memory.reserveCreepPid)
		sleepProcess(getProcessById(this.memory.reserveCreepPid), 1500);
        }
    }
    
}

export = OutpostProcess;
