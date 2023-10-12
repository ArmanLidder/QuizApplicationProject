import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WaitingRoomComponent } from './waiting-room.component';
import { SocketClientService } from '@app/services/socket-client.service';
import { ActivatedRoute } from '@angular/router';

describe('WaitingRoomComponent', () => {
    let component: WaitingRoomComponent;
    let fixture: ComponentFixture<WaitingRoomComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [WaitingRoomComponent],
            providers: [
                SocketClientService,
                {
                    provide: ActivatedRoute,
                    useValue: () => {
                        return '1';
                    },
                },
            ],
        });
        fixture = TestBed.createComponent(WaitingRoomComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
