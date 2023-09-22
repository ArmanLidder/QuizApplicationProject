import { Injectable } from '@angular/core';
import { MouseButton } from '@app/interfaces/mouse-button';

@Injectable({
    providedIn: 'root',
})
export class MouseService {
    mouseButton: MouseButton = {
        left: 0,
        middle: 1,
        right: 2,
        back: 3,
        forward: 4,
    };

    mouseHitDetect(event: MouseEvent) {
        if (event.button === this.mouseButton.left) {
            return true;
        } else {
            return false;
        }
    }
}
