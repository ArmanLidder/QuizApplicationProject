import { TestBed } from '@angular/core/testing';

import { AdminAuthenticatorService } from './admin-authenticator.service';

describe('AdminAuthenticatorService', () => {
    let service: AdminAuthenticatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AdminAuthenticatorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
