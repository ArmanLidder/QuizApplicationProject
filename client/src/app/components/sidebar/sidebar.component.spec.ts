import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';

fdescribe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SidebarComponent],
            imports: [FormsModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize messages array as empty', () => {
        expect(component.messages).toEqual([]);
    });

    it('should initialize newMessage as an empty string', () => {
        expect(component.newMessage).toEqual('');
    });

    it('should add a new message when Enter key is pressed', () => {
        component.newMessage = 'Hello, world';
        const enterEvent = new KeyboardEvent('keyup', {
            key: 'Enter',
        });
        const inputElement = fixture.nativeElement.querySelector('input');
        inputElement.dispatchEvent(enterEvent);
        expect(component.messages).toContain('Hello, world');
        expect(component.newMessage).toBe('');
    });

    it('should add a new <p> element with the same string when Enter key is pressed', () => {
        const inputElement = fixture.nativeElement.querySelector('input');
        const messageContainers = fixture.nativeElement.querySelectorAll('.message-container');

        expect(messageContainers.length).toBe(0);

        inputElement.value = 'Test message';
        inputElement.dispatchEvent(new Event('input'));

        const enterEvent = new KeyboardEvent('keyup', {
            key: 'Enter',
        });

        inputElement.dispatchEvent(enterEvent);
        fixture.detectChanges();

        const updatedMessageContainers = fixture.nativeElement.querySelectorAll('.message-container');
        expect(updatedMessageContainers.length).toBe(1);

        const newMessageContainer = updatedMessageContainers[0];
        const newMessageParagraph = newMessageContainer.querySelector('p');
        expect(newMessageParagraph).toBeTruthy();
        expect(newMessageParagraph.textContent).toBe('Test message');
    });

    it('should not add a new <p> element when Enter key is pressed with an empty message', () => {
        const inputElement = fixture.nativeElement.querySelector('input');
        const messageContainers = fixture.nativeElement.querySelectorAll('.message-container');

        expect(messageContainers.length).toBe(0);

        inputElement.value = '';
        inputElement.dispatchEvent(new Event('input'));

        const enterEvent = new KeyboardEvent('keyup', {
            key: 'Enter',
        });

        inputElement.dispatchEvent(enterEvent);
        fixture.detectChanges();

        const updatedMessageContainers = fixture.nativeElement.querySelectorAll('.message-container');
        expect(updatedMessageContainers.length).toBe(0);
    });
});
