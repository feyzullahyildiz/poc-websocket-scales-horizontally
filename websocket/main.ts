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

redisSub.subscribe("group-A", "group-B", (err, count) => {
  if (err) {
    // Just like other commands, subscribe() can fail for some reasons,
    // ex network issues.
    console.error("Failed to subscribe: %s", err.message);
  } else {
    // `count` represents the number of channels this client are currently subscribed to.
    console.log(
      `Subscribed successfully! This client is currently subscribed to ${count} channels.`
    );
  }
});
Deno.serve({ port: 3000 }, (req) => {
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response(null, { status: 501 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.addEventListener("open", (event) => {
    console.log("A client just connected (v3)");
    const serverId = Deno.env.get("HOSTNAME") || "NO ENV";
    socket.send(JSON.stringify({ type: "server", data: serverId }));
  });

  socket.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);

    if (payload.type === "join") {
      socketGroup.join(socket, payload.name);
    }
    if (payload.type === "leave") {
      socketGroup.leave(socket, payload.name);
    }
    if (payload.type === "message") {
      console.log("payload.data", payload.data);
      redisPub.publish(payload.name, payload.data);
      // socketGroup.sendMessageToGroup(payload.name, payload.data);
      // socketGroup.leave(socket, payload.data);
    }
    // console.log();
  });
  socket.addEventListener("close", (event) => {
    console.log("A client just DisConnected");
    socketGroup.leaveAllGroups(socket);
  });
  return response;
});
