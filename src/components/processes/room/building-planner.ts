import Process = require("../process");
import { addProcess } from "../../kernel/kernel";
class BuildingPlannerProcess extends Process {
    public run(): number {
        return 0;
    }

    public static start(roomName: string, colonyPid: number): BuildingPlannerProcess {
        let p = new BuildingPlannerProcess(0, colonyPid);
        addProcess(p);
        p.memory.roomName = roomName;
        return p;
    }
}

export = BuildingPlannerProcess;
