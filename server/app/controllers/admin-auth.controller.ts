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

        this.router.post('/', (req: Request, res: Response) => {
            try {
                const result: boolean = this.adminAuthService.authentificatePassword(req.body.password);
                if (result) {
                    res.status(StatusCodes.OK).json({ message: 'Authentication successful' });
                } else {
                    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid password. Please try again!' });
                }
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
            }
        });
    }
}
