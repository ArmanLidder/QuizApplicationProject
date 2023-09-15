import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
import { StatusCodes } from 'http-status-codes';
import { QuizService } from '@app/services/quiz.service';

@Service()
export class ChatroomController {
    router: Router;

    constructor(private readonly quizService: QuizService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        /**
         * @swagger
         *
         * /api/quiz/user/:
         *   get:
         *     description: get all the quizzes
         *     tags:
         *       - Quiz
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         schema:
         *           $ref: '#/definitions/Message'
         *
         */
        this.router.get('/', async (req: Request, res: Response) => {
            try {
                res.status(StatusCodes.OK).json(await this.quizService.getAll());
            } catch (e) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR);
            }
        });

        /**
         * @swagger
         *
         * /api/quiz/{id}:
         *   get:
         *     description: Return quiz by its id
         *     tags:
         *       - Quiz
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         schema:
         *           $ref: '#/definitions/Message'
         */
        this.router.get('/:id', async (req: Request, res: Response) => {
            try {
                res.status(StatusCodes.OK).json(await this.quizService.getById(req.params.id));
            } catch (e) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR);
            }
        });

        /**
         * @swagger
         *
         * /api/chatroom:
         *   post:
         *     description: add a quiz
         *     tags:
         *       - Quiz
         *     requestBody:
         *         description: quiz object
         *         required: true
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/definitions/Message'
         *             example:
         *               title: Mon Message
         *               body: Je suis envoyé à partir de la documentation!
         *     produces:
         *       - application/json
         *     responses:
         *       201:
         *         description: Created
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
         *
         * /api/quiz/
         *   patch:
         *     description: update the chatroom (create if not found)
         *     tags:
         *       - Chatroom
         *     produces:
         *      - application/json
         *     responses:
         *       200:
         *         description: messages
         *         schema:
         *           type: array
         *           items:
         *             $ref: '#/definitions/Message'
         */
        this.router.put('/', async (req: Request, res: Response) => {
            try {
                await this.quizService.update(req.body);
                res.json({});
            } catch (e) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR);
            }
        });

        /**
         * @swagger
         *
         * /api/quiz/{id}:
         *   delete:
         *     description: delete the quiz
         *     tags:
         *        - Quiz
         *     produces:
         *      - application/json
         *     responses:
         *       200:
         *         description: messages
         *         schema:
         *           type: array
         *           items:
         *             $ref: '#/definitions/Message'
         */
        this.router.delete('/:id', async (req: Request, res: Response) => {
            try {
                res.json(await this.quizService.delete(req.params.id));
            } catch (e) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
