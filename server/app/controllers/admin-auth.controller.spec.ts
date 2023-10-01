import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { AdminAuthService } from '@app/services/admin-auth.service';
import { Application } from '@app/app';
import { Container } from 'typedi';
import * as supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';

describe('AdminAuthController', () => {
    let adminAuthService: SinonStubbedInstance<AdminAuthService>;
    let expressApp: Express.Application;

    beforeEach(async () => {
        adminAuthService = createStubInstance(AdminAuthService);
        const APP = Container.get(Application);
        Object.defineProperty(APP['adminAuthController'], 'adminAuthService', { value: adminAuthService, writable: true });
        expressApp = APP.app;
    });

    it('should handle post request with successful authentication with OK code', async () => {
        const MESSAGE = { title: 'Hello', body: 'World' };
        adminAuthService.authentificatePassword.returns(true);
        return supertest(expressApp).post('/api/auth/admin-password').send(MESSAGE).expect(StatusCodes.OK);
    });

    it('should handle post request with failed authentication by returning UNAUTHORIZED code', async () => {
        const MESSAGE = { title: 'Hello', body: 'World' };
        adminAuthService.authentificatePassword.returns(false);
        return supertest(expressApp).post('/api/auth/admin-password').send(MESSAGE).expect(StatusCodes.UNAUTHORIZED);
    });

    it('should handle post request with error', async () => {
        const MESSAGE = { title: 'Hello', body: 'World' };
        adminAuthService.authentificatePassword.throws(new Error('test error!'));
        return supertest(expressApp).post('/api/auth/admin-password').send(MESSAGE).expect(StatusCodes.INTERNAL_SERVER_ERROR);
    });
});
