export class SocketGroup {
  private groups: Map<string, Set<WebSocket>> = new Map();

  // Bir socket'i belirli bir gruba ekler
  public join(socket: WebSocket, groupName: string): void {
    if (!this.groups.has(groupName)) {
      this.groups.set(groupName, new Set());
    }

    const group = this.groups.get(groupName)!; // '!' burada grup kesinlikle mevcut demek

    // Eğer socket zaten grupta değilse, gruba ekleriz
    if (!group.has(socket)) {
      group.add(socket);
    }

    console.log(`Socket added to group: ${groupName}`);
  }

  // Bir socket'i belirli bir gruptan çıkarır
  public leave(socket: WebSocket, groupName: string): void {
    const group = this.groups.get(groupName);

    if (!group) {
      return;
    }
    group.delete(socket);
    console.log(`Socket removed from group: ${groupName}`);
    // group.size;
  }
  // Belirli bir gruptaki tüm üyelere mesaj gönderir
  public sendMessageToGroup(groupName: string, message: string): void {
    const group = this.groups.get(groupName);

    if (group) {
      group.forEach((socket) => {
        socket.send(
          JSON.stringify({ type: "message", group: groupName, data: message })
        );
      });
    }
  }

  // Tüm grupları temizler
  public clearGroup(groupName: string): void {
    if (this.groups.has(groupName)) {
      this.groups.delete(groupName);
      console.log(`Group ${groupName} cleared.`);
    }
  }
  // Bir socket'i tüm gruplardan çıkarır
  public leaveAllGroups(socket: WebSocket): void {
    this.groups.forEach((group, groupName) => {
      if (group.has(socket)) {
        group.delete(socket);
        console.log(`Socket removed from all groups: ${groupName}`);
      }
    });
  }
}
