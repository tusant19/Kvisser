import { io as createSocketClient } from "https://cdn.socket.io/4.8.3/socket.io.esm.min.js";
import apiBaseUrl from "./apiAdress.js";

let connection = null;

export function getSocket(url = apiBaseUrl) {
    if (connection === null) {
        connection = createSocketClient(url);
        connection.disconnect = function () {};
        connection.close = function () {};
    }
    return connection;
}

function createChannel(socket) {
    const handlers = [];

    return {
        get id() {
            return socket.id;
        },
        get connected() {
            return socket.connected;
        },
        emit(...args) {
            socket.emit(...args);
            return this;
        },
        on(event, handler) {
            socket.on(event, handler);
            handlers.push({ event, handler });
            return this;
        },
        off(event, handler) {
            socket.off(event, handler);
            for (let i = handlers.length - 1; i >= 0; i--) {
                if (handlers[i].event === event && (!handler || handlers[i].handler === handler)) {
                    handlers.splice(i, 1);
                }
            }
            return this;
        },
        disconnect() {
            for (const entry of handlers) {
                socket.off(entry.event, entry.handler);
            }
            handlers.length = 0;
            return this;
        },
        connect() {
            socket.connect();
            return this;
        }
    };
}

export function io(url = apiBaseUrl) {
    return createChannel(getSocket(url));
}
