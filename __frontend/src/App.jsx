import { useMemo } from "react";
import { WebSocketCard } from "./component/WebSocketCard";
function App() {
  const arr = useMemo(() => {
    return new Array(10).fill(1).map((_, i) => i + 1);
  });
  return (
    <div className="h-full min-h-screen bg-stone-950 text-yellow-100">
      <div className="m-auto p-4">
        <div className="flex flex-wrap justify-center gap-4">
          {arr.map((id) => (
            <WebSocketCard key={id} id={id} groupName="group-A" />
          ))}
          {arr.map((id) => (
            <WebSocketCard key={id} id={id} groupName="group-B" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
