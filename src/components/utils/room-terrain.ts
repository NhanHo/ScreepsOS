class RoomTerrain {
    constructor (public roomName: string) {
        const roomTerrain = Memory['roomTerrain'] = Memory['roomTerrain'] || {};
        const roomTerrain[roomName] = roomTerrain[roomName] || {};
    }
}
