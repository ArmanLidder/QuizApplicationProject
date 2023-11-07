import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper/socket-client-service-test-helper';
import { GameService } from '@app/services/game.service/game.service';
import { HttpClientModule } from '@angular/common/http';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule],
            declarations: [MainPageComponent],
            providers: [SocketClientService, { provide: SocketClientService, useClass: SocketClientServiceTestHelper }, GameService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("should have as title 'OnlyQuiz'", () => {
        expect(component.title).toEqual('OnlyQuiz');
    });

    it('should contain the team number in the footer', () => {
        const teamName = fixture.nativeElement.querySelector('.team-name');
        expect(teamName.textContent).toContain('Équipe #103');
    });

    it('should contain 6 names in the footer', () => {
        const teamMembers = fixture.nativeElement.querySelectorAll('.footer-item p span');
        const expectedTeamMembers = 6;
        expect(teamMembers.length).toBe(expectedTeamMembers);
    });

    it('should contain two buttons with routerLink attributes', () => {
        const buttonsWithRouterLink = fixture.nativeElement.querySelectorAll('button[routerLink]');
        expect(buttonsWithRouterLink.length).toBe(3);
    });

    it('should call handleDisconnect when component is destroyed', () => {
        spyOn(component['socketClientService'], 'isSocketAlive').and.returnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleDisconnectSpy = spyOn(component, 'handleDisconnect' as any);
        component.ngOnInit();
        expect(handleDisconnectSpy).toHaveBeenCalled();
    });

    it('should correctly handle disconnect if host disconnects', () => {
        spyOn(component['socketClientService'], 'isSocketAlive').and.returnValue(true);
        component['gameService'].gameRealService.username = 'Organisateur';
        component['gameService'].gameRealService.roomId = 1234;
        component['handleDisconnect']();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleDisconnectSpy = spyOn(component, 'handleDisconnect' as any);
        component.ngOnInit();
        expect(handleDisconnectSpy).toHaveBeenCalled();
    });

    it('should correctly handle disconnect if player disconnects', () => {
        spyOn(component['socketClientService'], 'isSocketAlive').and.returnValue(true);
        component['gameService'].gameRealService.username = 'Joueur';
        component['gameService'].gameRealService.roomId = 1234;

        component['handleDisconnect']();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleDisconnectSpy = spyOn(component, 'handleDisconnect' as any);
        component.ngOnInit();
        expect(handleDisconnectSpy).toHaveBeenCalled();
    });
});
