import Process = require("../../kernel/kernel/process");
import CraneProcess = require("./crane");

interface LinkManagerMemory {
    roomName: string;
    senderLinks: string[];
    receiverLinks: string[];
}
/** This is a comment */
class LinkManagerProcess extends Process {
    public memory: LinkManagerMemory;
    /**
     * This is a test docs
     */
    public classPath() {
        return "components.processes.room.link-manager";
    }

    /**
     * Loop through each sender links, send to the first receiver link that can use energy
     * TODO We can have a process for each link: that way the link can track if it's inactive
     * for too long and request crane/ figure out what is happening
     */
    public run(): number {
        const neededEnergy = _.chain(this.memory.receiverLinks)
            .map(Game.getObjectById)
            .filter((s: Link) => s && s.energy < (s.energyCapacity / 4)).value() as Link[];

        for (const id of this.memory.senderLinks) {
            const obj = Game.getObjectById(id) as Link;
            if (!obj || (obj.cooldown > 0)) {
                continue;
            }
            if (obj.energy >= (obj.energyCapacity * 0.9)) {
                const target = neededEnergy.pop();
                if (target)
                    obj.transferEnergy(target);
            }
        }
        return 0;
    }

    /**
     * Setup our links network. Right now, we're using a few heuristics to
     * determine which link is sending energy, and which one is receiving it.
     *
     * We have two types of links: sender and receiver.
     *
     * Receiver link: links next to storage, or close to a controller (within
     * 4 square of a controller -- such that another creep and withdraw energy
     * from it and is still within range of the controller).
     *
     * Sender link: For now, miners or couriers will deposit their energy to
     * the link, and sender link are any link not a receiver link.
     */
    private setUp(roomName: string) {
        this.memory.roomName = roomName;
        const senderLinks: string[] = [];
        const receiverLinks: string[] = [];
        const room = Game.rooms[roomName];
        const links = room.find(FIND_MY_STRUCTURES,
            { filter: (s: Structure) => s.structureType === STRUCTURE_LINK }) as Link[];
        for (const link of links) {
            if (link.pos.inRangeTo(room.controller!.pos, 4) ||
                link.pos.inRangeTo(room.storage!.pos, 2)) {
                receiverLinks.push(link.id);
            } else
                senderLinks.push(link.id);
        }
        this.memory.senderLinks = senderLinks;
        this.memory.receiverLinks = receiverLinks;

        // Check and setup the crane process if necessary
        this.setupCrane(receiverLinks);
    }

    private setupCrane(linkIDs: string[]) {
        const links = _.map(linkIDs, Game.getObjectById) as Link[];
        for (const link of links) {
            const storage = link.room.storage!;
            const hasNoStructure = function (p: RoomPosition): boolean {
                return !_.some(p.lookFor(LOOK_STRUCTURES), (s: Structure) => (s.structureType != STRUCTURE_ROAD));
            }
            const nextToStorage = (pos: RoomPosition) => pos.isNearTo(storage.pos);
            if (link.pos.inRangeTo(link.room.storage!.pos, 2)) {
                const pos = _.filter(link.pos.adjacentPositions(),
                    (p: RoomPosition) =>
                        Game.map.getTerrainAt(p) !== "wall" &&
                        hasNoStructure(p) && nextToStorage(p));
                CraneProcess.start(this.memory.roomName,
                    { x: pos[0].x, y: pos[0].y },
                    link.id,
                    storage.id,
                    this.pid);
            }
        }
    }

    public static start(roomName: string, colonyPID: number) {
        const p = new LinkManagerProcess(0, colonyPID);
        p.kernel.addProcess(p);
        p.setUp(roomName);

        return p.pid;
    }
}

export = LinkManagerProcess;
