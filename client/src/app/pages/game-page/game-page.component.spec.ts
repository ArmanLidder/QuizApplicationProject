import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { SocketClientService } from '@app/services/socket-client.service';
import { GamePageComponent } from './game-page.component';


const DIGIT_CONSTANT = 1;
describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let socketService: SocketClientServiceTestHelper;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterTestingModule, FormsModule, ReactiveFormsModule],
            declarations: [GamePageComponent, SidebarComponent, PlayAreaComponent],
            providers: [
                SocketClientService,
                { provide: SocketClientService, useClass: SocketClientServiceTestHelper },
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not send abandonment event on component destruction if game is starting', () => {
        const sendSpy = spyOn(socketService, 'send');
        component['gameService'].roomId = DIGIT_CONSTANT;
        component.ngOnDestroy();
        expect(sendSpy).toHaveBeenCalledWith('host abandonment', DIGIT_CONSTANT);
    });
});
