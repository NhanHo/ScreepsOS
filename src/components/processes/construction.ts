import Process = require("./process");

export = class ConstructionProcess extends Process {
    public classPath = "components.processes.construction";
    public run(): number {
        return 0;
    }

    public requestBuilding() {
        return null;
    }
}
