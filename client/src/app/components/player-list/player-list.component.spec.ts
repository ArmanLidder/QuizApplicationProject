import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerListComponent } from './player-list.component';
import { Player } from '@app/services/game-real.service';
import { Score } from '@common/interfaces/score.interface';
import { SocketClientService } from '@app/services/socket-client.service';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper';

describe('PlayerListComponent', () => {
    let component: PlayerListComponent;
    let fixture: ComponentFixture<PlayerListComponent>;
    let socketService: SocketClientServiceTestHelper;
    let sendSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PlayerListComponent],
            providers: [SocketClientService, { provide: SocketClientService, useClass: SocketClientServiceTestHelper }],
        });
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        fixture = TestBed.createComponent(PlayerListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.players = [
            ['karim', 0, 0],
            ['player1', 0, 0],
        ];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get and define properly the players data', () => {
        const mockScore: Score = {
            points: 1,
            bonusCount: 1,
            isBonus: true,
        };
        const mockPlayers = ['un'];
        sendSpy = spyOn(socketService, 'send').and.callThrough();
        component.getPlayersList();
        const [sendGatherPlayers, sendGatherObject, sendGatherCallback] = sendSpy.calls.allArgs()[0];
        expect(sendGatherPlayers).toEqual('gather players username');
        expect(sendGatherObject).toEqual(component.roomId);
        expect(sendGatherCallback).toBeDefined();
        sendGatherCallback(mockPlayers);
        const [sendGetScore, sendGetScoreObject, sendGetScoreCallback] = sendSpy.calls.allArgs()[1];
        expect(sendGetScore).toEqual('get score');
        expect(sendGetScoreObject).toBeDefined();
        expect(sendGetScoreCallback).toBeDefined();
        sendGetScoreCallback(mockScore);
    });

    it('should compare Players', () => {
        const player1: Player = ['player1', 0, 0];
        const player2: Player = ['karim', 1, 1];
        const scoreSubtract = component['comparePlayers'](player1, player2);
        expect(scoreSubtract).toEqual(player2[1] - player1[1]);
    });

    it('should compare Players', () => {
        const player1: Player = ['player1', 0, 0];
        const player2: Player = ['karim', 0, 0];
        const scoreSubtract = component['comparePlayers'](player1, player2);
        expect(scoreSubtract).toEqual(player1[0].localeCompare(player2[0]));
    });
});
