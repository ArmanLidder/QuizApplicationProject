import { DatabaseService } from '@app/services/database.service/database.service';
import * as process from 'process';
import { Service } from 'typedi';
import { GameInfo } from '@common/interfaces/game-info.interface';

@Service()
export class HistoryService {
    constructor(private readonly dbService: DatabaseService) {}

    get collection() {
        return this.dbService.database.collection(process.env.DATABASE_COLLECTION_GAMES);
    }

    async add(gameInfo: GameInfo) {
        await this.collection.insertOne(gameInfo);
    }

    async deleteAll() {
        await this.collection.deleteMany({});
    }
}
