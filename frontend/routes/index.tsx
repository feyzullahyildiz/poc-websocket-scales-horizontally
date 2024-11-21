import WebSocketCard from "../islands/WebSocketCard.tsx";

const arr = new Array(6).fill(0).map((_, i) => i + 1);
export default function Home() {
  const wsUrl = Deno.env.get("WEBSOCKET_URL") || "ws://localhost:3000";
  console.log("wsUrl", wsUrl);
  return (
    <div class="h-full min-h-screen bg-stone-800 text-yellow-100">
      <div class="m-auto p-4">
        <div class="flex flex-wrap justify-center gap-4">
          {arr.map((id) => (
            <WebSocketCard
              id={id}
              key={id}
              websocketUrl={wsUrl}
              groupName="GROUP_A"
            />
          ))}
          {arr.map((id) => (
            <WebSocketCard
              id={id}
              key={id}
              websocketUrl={wsUrl}
              groupName="GROUP_B"
            />
          ))}
          {arr.map((id) => (
            <WebSocketCard
              id={id}
              key={id}
              websocketUrl={wsUrl}
              groupName="GROUP_C"
            />
          ))}
          {arr.map((id) => (
            <WebSocketCard
              id={id}
              key={id}
              websocketUrl={wsUrl}
              groupName="Another Group"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
