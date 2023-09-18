import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
import { StatusCodes } from 'http-status-codes';
import { QuizService } from '@app/services/quiz.service';

@Service()
export class QuizController {
    router: Router;

    constructor(private readonly quizService: QuizService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        /**
         * @swagger
         * tags:
         *   name: Quiz
         *   description: Quiz management
         */

        /**
         * @swagger
         * /api/quiz:
         *   get:
         *     summary: Get all quizzes
         *     tags: [Quiz]
         *     responses:
         *       200:
         *         description : A list of quizzes
         *       500 :
         *         description : Internal server error
         */
        this.router.get('/', async (req: Request, res: Response) => {
            try {
                res.status(StatusCodes.OK).json(await this.quizService.getAll());
            } catch (e) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e);
            }
        });

        this.router.get('/visible', async (req: Request, res: Response) => {
            try {
                res.status(StatusCodes.OK).json(await this.quizService.getAllVisible());
            } catch (e) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e);
            }
        });

        /**
         * @swagger
         * /api/quiz/{id}:
         *   get:
         *     summary: Get a quiz by ID
         *     tags: [Quiz]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *         description: ID of the quiz
         *     responses:
         *       200:
         *         description: The requested quiz
         *       500:
         *         description: Internal server error
         */
        this.router.get('/:id', async (req: Request, res: Response) => {
            try {
                res.status(StatusCodes.OK).json(await this.quizService.getById(req.params.id));
            } catch (e) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e);
            }
        });

        /**
         * @swagger
         * /api/quiz:
         *   post:
         *     summary: Create a new quiz
         *     tags: [Quiz]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *     responses:
         *       201:
         *         description: The newly created quiz
         *       500:
         *         description: Internal server error
         */
        this.router.post('/', async (req: Request, res: Response) => {
            const quiz = req.body;
            try {
                await this.quizService.add(quiz);
                res.status(StatusCodes.CREATED).json(quiz);
            } catch (e) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e);
            }
        });

        /**
         * @swagger
         * /api/quiz:
         *   put:
         *     summary: Update a quiz
         *     tags: [Quiz]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *     responses:
         *       200:
         *         description: Quiz updated successfully
         *       500:
         *         description: Internal server error
         */
        this.router.put('/', async (req: Request, res: Response) => {
            try {
                await this.quizService.update(req.body);
                res.status(StatusCodes.OK).json(req.body);
                console.log(res.status);
            } catch (e) {
                console.log(e);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e);
            }
        });

        /**
         * @swagger
         * /api/quiz/{id}:
         *   delete:
         *     summary: Delete a quiz by ID
         *     tags: [Quiz]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *         description: ID of the quiz to delete
         *     responses:
         *       200:
         *         description: Quiz deleted successfully
         *       500:
         *         description: Internal server error
         */
        this.router.delete('/:id', async (req: Request, res: Response) => {
            try {
                res.json(await this.quizService.delete(req.params.id));
            } catch (e) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e);
            }
        });
    }
}
