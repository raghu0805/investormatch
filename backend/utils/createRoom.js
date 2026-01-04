export const generateRoomId = (userId1, userId2) => {
    // Sort IDs to ensure the room ID is always the same for the same two users
    return [userId1, userId2].sort().join("_");
};
