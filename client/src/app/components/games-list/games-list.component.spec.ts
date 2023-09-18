import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { GamesListComponent } from './games-list.component';

describe('GamesListComponent', () => {
    let component: GamesListComponent;
    let fixture: ComponentFixture<GamesListComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GamesListComponent],
            imports: [HttpClientModule],
        });
        fixture = TestBed.createComponent(GamesListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
