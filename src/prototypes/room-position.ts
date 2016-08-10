let loadRoomPrototype = function () {
    RoomPosition.prototype.adjacentPositions = function () {
        let dx = [0, 1, 1, 1, 0, -1, -1, -1];
        let dy = [-1, -1, 0, 1, 1, 1, 0, -1];
        let result: RoomPosition[] = [];
        for (let i = 0; i < 8; i = i + 1) {
            let x = this.x + dx[i];
            let y = this.y + dy[i];
            if (x >= 0 && x <= 49 && y >= 0 && y <= 49)
                result.push(new RoomPosition(x, y, this.roomName));

        }
        return result;
    }
};

export = loadRoomPrototype;
