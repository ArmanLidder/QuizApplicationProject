import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WaitingRoomPlayerPageComponent } from './waiting-room-player-page.component';
import {AppMaterialModule} from "@app/modules/material.module";
import { MatDialog} from "@angular/material/dialog";
import {QuitterButtonComponent} from "@app/components/quitter-bouton/quitter-bouton.component";
import {WaitingRoomComponent} from "@app/components/waiting-room/waiting-room.component";
import {RoomCodePromptComponent} from "@app/components/room-code-prompt/room-code-prompt.component";
import {HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {RouterTestingModule} from "@angular/router/testing";

describe('WaitingRoomPlayerPageComponent', () => {
    let component: WaitingRoomPlayerPageComponent;
    let fixture: ComponentFixture<WaitingRoomPlayerPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [WaitingRoomPlayerPageComponent, QuitterButtonComponent, WaitingRoomComponent, RoomCodePromptComponent],
            imports: [HttpClientModule, FormsModule, RouterTestingModule, AppMaterialModule],
            providers: [MatDialog],
        });
        fixture = TestBed.createComponent(WaitingRoomPlayerPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should receive room id', () => {
        component.receiveRoomId(0);
        expect(component.roomId).toEqual(0);
    });

    it('should set validation state', () => {
        component.receiveValidation(true);
        expect(component.isValidation).toBeTruthy();
    });
});
