import React, { useEffect, useRef, useState } from "react";
import { getSeededColor } from "../helper";

export const WebSocketCard = ({ id, groupName }) => {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0); // Yeniden bağlanma sayacı
  const [lastMessage, setLastMessage] = useState("");
  const [styleObj, setStyleObj] = useState({
    backgroundColor: "#000",
    color: "#fff",
  });

  const reconnectInterval = 1000; // Başlangıç bekleme süresi (ms)
  const maxReconnectInterval = 30000; // Maksimum bekleme süresi (ms)

  const close = () => {
    setStyleObj({
      backgroundColor: "#000",
      color: "#fff",
    });
  };

  const connectWebSocket = () => {
    console.log("process.env", (process as any).env);
    console.log("import.meta", import.meta);
    const { env } = (import.meta as any) || {};
    const url = env?.VITE_WEBSOCKET_HOST || "ws://localhost:3000";
    // const url = "ws://localhost:8080";
    console.log("WebSocket bağlanıyor...");
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      console.log("WebSocket bağlantısı kuruldu.");
      reconnectAttempts.current = 0; // Başarılı bağlantıda sıfırla
      socket.send(JSON.stringify({ type: "join", name: groupName }));
    });

    socket.addEventListener("message", (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === "server") {
        const newObject = getSeededColor(payload.data);
        setStyleObj(newObject);
        return;
      }
      if (payload.type === "message") {
        setLastMessage(payload.data);
      }
    });

    socket.addEventListener("close", () => {
      console.log("WebSocket bağlantısı kapandı.");
      close();
      scheduleReconnect(); // Bağlantı koparsa yeniden bağlanmayı planla
    });

    socket.addEventListener("error", (error) => {
      console.error("WebSocket hatası:", error);
      socket.close(); // Hata durumunda bağlantıyı kapat
    });
  };

  const scheduleReconnect = () => {
    const delay = Math.min(
      reconnectInterval * (reconnectAttempts.current + 1),
      maxReconnectInterval,
    );
    reconnectAttempts.current++;
    console.log(
      `Yeniden bağlanma denemesi ${reconnectAttempts.current}, bekleme süresi: ${delay} ms`,
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
      close();
    };
  }, [groupName]);

  const sendMessage = () => {
    const socket = socketRef.current;
    if (!socket) {
      return;
    }
    if (socket.readyState !== socket.OPEN) {
      console.log("SOCKET KAPALI");
      return;
    }
    console.log("Mesaj gönderiliyor...");
    socket.send(
      JSON.stringify({
        type: "message",
        name: groupName,
        data: `Client Index: ${id}`,
      }),
    );
  };

  return (
    <div
      className="flex min-h-24 min-w-36 flex-col justify-center border-2 border-red-950"
      style={styleObj}
    >
      <div className="flex flex-col gap-4 p-4">
        <div className="text-center">WebSocket ({groupName})</div>
        <button
          onClick={sendMessage}
          className="border-2 px-2"
          style={{ borderColor: styleObj.color }}
        >
          Gönder
        </button>
      </div>
      <div className="flex-1"></div>
      <div className="min-h-[40px] p-2" style={getSeededColor(groupName)}>
        {lastMessage}
      </div>
    </div>
  );
};
