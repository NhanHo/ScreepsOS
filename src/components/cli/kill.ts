import { killProcess, storeProcessTable } from "../kernel/kernel/kernel";
export = function (argv: string[]) {
    let pid = parseInt(argv[0], 10);
    killProcess(pid);
    storeProcessTable();
};
