import { useEffect, useRef, useState, useMemo } from "preact/hooks";

import { getSeededColor } from "../helper/index.ts";

interface Props {
  id: number;
  groupName: string;
  websocketUrl: string;
}
export default function WebSocketCard({ id, websocketUrl, groupName }: Props) {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0); // Yeniden bağlanma sayacı
  const [lastMessage, setLastMessage] = useState("");
  const [serverName, setServerName] = useState("");
  const [styleObj, setStyleObj] = useState({
    backgroundColor: "#000",
    color: "#fff",
  });

  const reconnectInterval = 1000; // Başlangıç bekleme süresi (ms)
  const maxReconnectInterval = 30000; // Maksimum bekleme süresi (ms)

  const afterSocketClosed = () => {
    setServerName("");
    setStyleObj({
      backgroundColor: "#000",
      color: "#fff",
    });
  };

  const closeSocket = () => {
    const socket = socketRef.current;
    if (!socket) {
      return;
    }
    socket.close(3000, "MANUEL");
  };
  const connectWebSocket = () => {
    const socket = new WebSocket(websocketUrl);
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      console.log("WebSocket connected.");
      reconnectAttempts.current = 0; // Başarılı bağlantıda sıfırla
      socket.send(JSON.stringify({ type: "join", name: groupName }));
    });

    socket.addEventListener("message", (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === "server") {
        const newObject = getSeededColor(payload.data);
        setServerName(payload.data);
        setStyleObj(newObject);
        return;
      }
      if (payload.type === "message") {
        setLastMessage(payload.data);
      }
    });

    socket.addEventListener("close", (event) => {
      // console.log("event", event);
      console.log("WebSocket closed.");
      afterSocketClosed();
      if (event.reason === "MANUEL") {
        return;
      }
      scheduleReconnect(); // Bağlantı koparsa yeniden bağlanmayı planla
    });

    socket.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
      socket.close(); // Hata durumunda bağlantıyı kapat
    });
  };

  const scheduleReconnect = () => {
    const delay = Math.min(
      reconnectInterval * (reconnectAttempts.current + 1),
      maxReconnectInterval
    );
    reconnectAttempts.current++;
    console.log(
      `Tring to reconnect. Attempt: ${reconnectAttempts.current}, waiting for: ${delay} ms`
    );
    setTimeout(() => {
      if (
        socketRef.current === null ||
        socketRef.current.readyState === WebSocket.CLOSED
      ) {
        connectWebSocket(); // Yeni bağlantı oluştur
      }
    }, delay);
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      afterSocketClosed();
    };
  }, [groupName]);

  const sendMessage = () => {
    const socket = socketRef.current;
    if (!socket) {
      return;
    }
    if (socket.readyState !== socket.OPEN) {
      console.log("socket closed");
      return;
    }
    socket.send(
      JSON.stringify({
        type: "message",
        name: groupName,
        data: `${groupName} ID: ${id}`,
      })
    );
  };

  const reversedStyle = useMemo(
    () => ({
      color: styleObj.backgroundColor,
      backgroundColor: styleObj.color,
    }),
    [styleObj]
  );
  return (
    <div className="flex min-h-24 min-w-48 flex-col justify-center border-2 border-red-950">
      <div className="flex flex-col gap-4" style={getSeededColor(groupName)}>
        <div className="flex justify-between p-4" onClick={closeSocket}>
          <span className="font-bold">{groupName}</span>
          <span>ID: {id}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1 p-4" style={styleObj}>
        <div className="flex min-h-10 justify-center">{lastMessage}</div>

        <button
          onClick={sendMessage}
          className="w-full border-2 px-2 py-1 hover:bg-slate-400/50 active:bg-slate-400/80"
          style={{ borderColor: styleObj.color }}
        >
          Sent Message
        </button>
        <div className="flex gap-2 text-sm    justify-between">
          <span className="opacity-90 px-1" style={reversedStyle}>
            Server
          </span>
          {serverName && (
            <span
              className="italic underline underline-offset-2 px-1 opacity-90"
              style={reversedStyle}
            >
              {serverName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
