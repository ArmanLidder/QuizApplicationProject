import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [MainPageComponent],
            providers: [SocketClientService, { provide: SocketClientService, useClass: SocketClientServiceTestHelper }],
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

    it('should disconnect socket when component is destroyed', () => {
        spyOn(component['socketClientService'], 'isSocketAlive').and.returnValue(true);
        const disconnectSpy = spyOn(component['socketClientService'], 'disconnect');
        component.ngOnInit();
        expect(disconnectSpy).toHaveBeenCalled();
    });
});
