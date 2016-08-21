import { killProcess, storeProcessTable } from "../kernel/kernel";
export = function (argv: string[]) {
    let pid = parseInt(argv[0]);
    killProcess(pid);
    storeProcessTable();
}
