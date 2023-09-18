import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthGuard } from './auth.guard';
import { HttpClientModule } from '@angular/common/http';

describe('AuthGuard', () => {
    let guard: AuthGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule],
            providers: [AuthGuard],
        });

        guard = TestBed.inject(AuthGuard);
    });

    it('should be created', () => {
        expect(guard).toBeTruthy();
    });
});
