import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { AdminAuthenticatorService } from './admin-authenticator.service';

describe('AdminAuthenticatorService', () => {
    let service: AdminAuthenticatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
        });
        service = TestBed.inject(AdminAuthenticatorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
