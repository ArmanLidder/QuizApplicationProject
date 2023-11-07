import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GamesListComponent } from '@app/components/games-list/games-list.component';
import { GameAdministrationPageComponent } from './game-administration-page.component';
import { HttpClientModule } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AppMaterialModule } from '@app/modules/material.module';

describe('GameAdministrationPageComponent', () => {
    let component: GameAdministrationPageComponent;
    let fixture: ComponentFixture<GameAdministrationPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GameAdministrationPageComponent, GamesListComponent],
            imports: [HttpClientModule, AppMaterialModule],
            providers: [MatDialog],
        });
        fixture = TestBed.createComponent(GameAdministrationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
