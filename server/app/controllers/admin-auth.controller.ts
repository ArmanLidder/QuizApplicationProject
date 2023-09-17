import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
import { StatusCodes } from 'http-status-codes';
import { AdminAuthService } from '@app/services/admin-auth.service';

@Service()
export class AdminAuthController {
    router: Router;

    constructor(private readonly adminAuthService: AdminAuthService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/admin/auth-password', (req: Request, res: Response) => {
            try {
                res.status(StatusCodes.OK).json(this.adminAuthService.authentificatePassword(req.body.password));
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
            }
        });
    }
}
