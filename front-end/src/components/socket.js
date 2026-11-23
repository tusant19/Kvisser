import { io as createSocketClient } from "https://cdn.socket.io/4.8.3/socket.io.esm.min.js";
import apiBaseUrl from "./apiAdress.js";

const rejoinEvents = ["joinRoom", "joinRoomAsHost"];
const channels = new Set();
let connection = null;

export function getSocket(url = apiBaseUrl) {
    if (connection === null) {
        connection = createSocketClient(url);
        connection.disconnect = function () {};
        connection.close = function () {};
        let connectedBefore = false;
        connection.on("connect", function () {
            if (connectedBefore) {
                for (const channel of channels) {
                    if (channel.lastJoin) {
                        connection.emit(...channel.lastJoin);
                    }
                }
            }
            connectedBefore = true;
        });
    }
    return connection;
}

function createChannel(socket) {
    const handlers = [];

    const channel = {
        lastJoin: null,
        get id() {
            return socket.id;
        },
        get connected() {
            return socket.connected;
        },
        emit(...args) {
            if (rejoinEvents.includes(args[0])) {
                channel.lastJoin = args;
            }
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
            channel.lastJoin = null;
            channels.delete(channel);
            return this;
        },
        connect() {
            socket.connect();
            return this;
        }
    };

    channels.add(channel);
    return channel;
}

export function io(url = apiBaseUrl) {
    return createChannel(getSocket(url));
}
