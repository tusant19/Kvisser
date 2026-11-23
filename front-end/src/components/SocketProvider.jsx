import { useEffect } from "react";
import { getSocket } from "./socket.js";

function SocketProvider() {
    useEffect(() => {
        getSocket();
    }, []);

    return null;
}

export default SocketProvider;
