import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WaitingRoomHostPageComponent } from './waiting-room-host-page.component';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AppMaterialModule } from '@app/modules/material.module';
import { QuitterButtonComponent } from '@app/components/quitter-bouton/quitter-bouton.component';
import { WaitingRoomComponent } from '@app/components/waiting-room/waiting-room.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('WaitingRoomHostPageComponent', () => {
    let component: WaitingRoomHostPageComponent;
    let fixture: ComponentFixture<WaitingRoomHostPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule, FormsModule, RouterTestingModule, AppMaterialModule],
            declarations: [WaitingRoomHostPageComponent, QuitterButtonComponent, WaitingRoomComponent],
            providers: [MatDialog, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }],
        });
        fixture = TestBed.createComponent(WaitingRoomHostPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
