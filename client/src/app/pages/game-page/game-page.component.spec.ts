import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { SocketClientService } from '@app/services/socket-client.service';
import { GamePageComponent } from './game-page.component';
import { GameInterfaceComponent } from '@app/components/game-interface/game-interface.component';

const DIGIT_CONSTANT = 1;
describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let socketService: SocketClientServiceTestHelper;
    let sendSpy: jasmine.Spy;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterTestingModule, FormsModule, ReactiveFormsModule],
            declarations: [GamePageComponent, SidebarComponent, GameInterfaceComponent],
            providers: [SocketClientService, { provide: SocketClientService, useClass: SocketClientServiceTestHelper }],
        });
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        spyOn(socketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should send host abandonment event on component destruction if game is starting', () => {
        sendSpy = spyOn(socketService, 'send');
        component['gameService'].username = 'Organisateur';
        component['gameService'].roomId = DIGIT_CONSTANT;
        component.ngOnDestroy();
        expect(sendSpy).toHaveBeenCalledWith('host abandonment', DIGIT_CONSTANT);
    });
});
