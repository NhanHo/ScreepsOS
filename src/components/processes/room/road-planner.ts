import Process = require("../../kernel/kernel/process");
import { sleepProcess, getProcessById } from "../../kernel/kernel/kernel"
import ColonyProcess = require("./colony");

class RoadPlannerProcess extends Process {
    public classPath() {
        return "components.processes.room.road-planner";
    }
    public run(): number {
        const colonyProcess: ColonyProcess = getProcessById(this.parentPID) as ColonyProcess;
        if (!colonyProcess || !(colonyProcess instanceof ColonyProcess)) {
            this.stop(0);
        }
        const room = Game.rooms[colonyProcess.memory.roomName];
        const controller = room.controller!;
        const sources = room.find(FIND_SOURCES) as Source[];
        for (let source of sources) {
            const path = PathFinder.search(source.pos, controller.pos);
            for (let pos of path.path) {
                if (Game.map.getTerrainAt(pos) === "swamp") {
                    const constructionSites = pos.lookFor(LOOK_CONSTRUCTION_SITES) as ConstructionSite[];
                    if (constructionSites.length === 0) {
                        pos.createConstructionSite(STRUCTURE_ROAD);
                    }
                }
            }
        }
        sleepProcess(this, 1500);
        return 0;
    };
}

export = RoadPlannerProcess;
