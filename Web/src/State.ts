export class State {
    connected: boolean;
    client: WebSocket;

    data: Data[] = [];
}

export class Data {
    data: string;
}

export default State;