import IORedis from "ioredis";
const Redis = IORedis.default;
import { SocketGroup } from "./Group.ts";

const socketGroup = new SocketGroup();

const redisSub = new Redis(6379, Deno.env.get("REDIS_HOST") || "127.0.0.1");
const redisPub = new Redis(6379, Deno.env.get("REDIS_HOST") || "127.0.0.1");

redisSub.on("message", (channel: string, message: string) => {
  console.log(`Received ${message} from ${channel}`);
  socketGroup.sendMessageToGroup(channel, message);
});

// redisSub.subscribe()
// redisSub.subscribe(["group-A", "group-B"]);
Deno.serve({ port: 4000 }, (req) => {
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response(null, { status: 501 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.addEventListener("open", (event) => {
    // console.log("A client just connected (v3)");
    const serverId = Deno.env.get("HOSTNAME") || "NO ENV";
    socket.send(JSON.stringify({ type: "server", data: serverId }));
  });

  socket.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);

    if (payload.type === "join") {
      const groupName = payload.name;
      if (socketGroup.isGroupEmpty(groupName)) {
        console.log("redisSub.subscribe", groupName);
        redisSub.subscribe(groupName);
      }
      socketGroup.join(socket, groupName);
    }
    // TODO not tested
    if (payload.type === "leave") {
      socketGroup.leave(socket, payload.name);
      const groupName = payload.name;
      if (socketGroup.isGroupEmpty(groupName)) {
        // console.log("redisSub.unsubscribe", groupName);
        redisSub.unsubscribe(groupName);
      }
    }
    if (payload.type === "message") {
      redisPub.publish(payload.name, payload.data);
    }
  });
  socket.addEventListener("close", () => {
    // console.log("A client just DisConnected");
    const groupNames = socketGroup.getAllGroups(socket);
    socketGroup.leaveAllGroups(socket);
    // console.log("groupNames", groupNames);
    for (const groupName of groupNames) {
      const isGroupEmpty = socketGroup.isGroupEmpty(groupName);
      // console.log("isGroupEmpty", groupName, isGroupEmpty);
      if (isGroupEmpty) {
        redisSub.unsubscribe(groupName);
        console.log("redisSub.unsubscribe", groupName);
      }
    }
  });
  return response;
});
