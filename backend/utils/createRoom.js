export function generateRoomId(userA, userB) {
  const pair = [userA, userB].sort(); 
  return `${pair[0]}_${pair[1]}`;
}
