export type CallbackSignature = (params: unknown) => object;

export class SocketClientServiceTestHelper {
    isSocketAlive() {
        return;
    }

    connect() {
        return;
    }

    disconnect() {
        return;
    }

    on<T>(event: string, action: (data: T) => void): { event: string; action: (data: T) => void } {
        return { event, action };
    }

    send<T, A>(
        event: string,
        data?: T,
        callback?: (data: A) => void,
    ): {
        event: string;
        data?: T;
        callback?: (data: A) => void;
    } {
        return { event, data, callback };
    }
}
