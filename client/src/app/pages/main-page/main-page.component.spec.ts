import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
// import { Router } from '@angular/router'; // Import the Router module
import { MainPageComponent } from '@app/pages/main-page/main-page.component';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    // let router: Router; // Declare a variable for the Router

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [MainPageComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        /// router = TestBed.inject(Router); // Inject the Router
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("should have as title 'OnlyQuiz'", () => {
        expect(component.title).toEqual('OnlyQuiz');
    });

    it('should contain the game logo', () => {
        const logo = fixture.nativeElement.querySelector('img[src="../../../assets/Logo.png"]');
        expect(logo).toBeTruthy();
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

    it('should contain buttons with specific routerLink attributes', () => {
        const createGameButton = fixture.nativeElement.querySelector('button[routerLink="/game-creation"]');
        const adminGamesButton = fixture.nativeElement.querySelector('button[routerLink="/game-admin"]');
        expect(createGameButton).toBeTruthy();
        expect(adminGamesButton).toBeTruthy();
    });
});
