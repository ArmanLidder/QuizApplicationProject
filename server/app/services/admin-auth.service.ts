import * as dotenv from 'dotenv';
dotenv.config();

export class AdminAuthentificationService() : Promise<boolean> {
    const password : string | undefined = process.env.PASSWORD;
    
}