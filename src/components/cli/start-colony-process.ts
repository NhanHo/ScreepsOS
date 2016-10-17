import ColonyProcess = require("../processes/room/colony");
export = function (argv: string[]) {
    ColonyProcess.start(argv[0]);
}
