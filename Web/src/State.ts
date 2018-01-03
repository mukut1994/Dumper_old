export class State {
    connected: boolean;
    client: WebSocket;

    data: { key: string, data: Data }[] = [];
}

export class Data {
    data: string;
}

export default State;