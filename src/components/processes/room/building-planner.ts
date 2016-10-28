import Process = require("../../kernel/kernel/process");
import { addProcess } from "../../kernel/kernel/kernel";
class BuildingPlannerProcess extends Process {
    public classPath() {
        return "components.processes.room.building-planner";
    }
    public static start(roomName: string, colonyPid: number): BuildingPlannerProcess {
        let p = new BuildingPlannerProcess(0, colonyPid);
        addProcess(p);
        p.memory.roomName = roomName;
        return p;
    }

    public run(): number {
        return 0;
    }
}

export = BuildingPlannerProcess;
