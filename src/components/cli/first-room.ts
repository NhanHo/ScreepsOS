import first_room_process = require("../processes/room/starter");

export = function (argv: string[]) {
    first_room_process.start(argv[0])
}
