import { Service } from 'typedi';
import * as dotenv from 'dotenv';
dotenv.config();

@Service()
export class AdminAuthService {
    get adminPassword(): string {
        return process.env.PASSWORD;
    }

    authentificatePassword(submittedPassword: string): boolean {
        try {
            return submittedPassword === this.adminPassword;
        } catch (error) {
            throw new Error('Error while comparing passwords');
        }
    }
}
