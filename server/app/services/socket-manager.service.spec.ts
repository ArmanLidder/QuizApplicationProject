import { Server } from 'app/server';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { SocketManager } from '@app/services/socket-manager.service';

describe('SocketManager service tests', () => {
    let service: SocketManager;
    let server: Server;
    let clientSocket: Socket;
    const urlString = 'http://localhost:3000';

    beforeEach(async () => {
        server = Container.get(Server);
        await server.init();
        service = server['socketManager'];
        clientSocket = ioClient(urlString);
    });

    afterEach(() => {
        clientSocket.disconnect();
        clientSocket.close();
        service['sio'].close();
        sinon.restore();
    });

    it('should set up event handlers when calling handleSockets', (done) => {
        clientSocket.on('hello', (args) => {
            assert.equal(args, 'Hello World!');
            done();
        });
    });

    it('should broadcast to all sockets when emiting time', () => {
        const spy = sinon.spy(service['sio'].sockets, 'emit');
        service['emitTime']();
        assert(spy.called);
    });
});
