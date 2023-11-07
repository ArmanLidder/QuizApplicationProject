import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper/socket-client-service-test-helper';
import { GameInterfaceComponent } from '@app/components/game-interface/game-interface.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { GamePageComponent } from './game-page.component';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let socketService: SocketClientServiceTestHelper;

    const mockActivatedRoute = {
        snapshot: {
            url: [
                {
                    path: 'url-path',
                },
            ],
            paramMap: convertToParamMap({ key: 'value' }),
        },
    };

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterTestingModule, FormsModule, ReactiveFormsModule],
            declarations: [GamePageComponent, SidebarComponent, GameInterfaceComponent, PlayerListComponent],
            providers: [
                SocketClientService,
                { provide: SocketClientService, useClass: SocketClientServiceTestHelper },
                {
                    provide: ActivatedRoute,
                    useValue: mockActivatedRoute,
                },
            ],
        });
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        spyOn(socketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
