import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameHistoryListComponent } from './game-history-list.component';
import { GameHistoryService } from '@app/services/game-history.service/game-history.service';
import { of } from 'rxjs';
import { GameInfo } from '@common/interfaces/game-info.interface';

describe('GameHistoryListComponent', () => {
  let component: GameHistoryListComponent;
  let fixture: ComponentFixture<GameHistoryListComponent>;
  let gameHistoryService: jasmine.SpyObj<GameHistoryService>;
  const MOCK_GAMES: GameInfo[] = [
    {
        gameName: 'Quiz 1',
        startTime: '2023-11-13 15:30:00',
        playersCount: 4,
        bestScore: 30,
    },
    {
        gameName: 'Quiz 2',
        startTime: '2023-11-14 10:45:00',
        playersCount: 2,
        bestScore: 25,
    },
    {
        gameName: 'Quiz 3',
        startTime: '2023-11-15 20:00:00',
        playersCount: 3,
        bestScore: 40,
    },
];
  beforeEach(async () => {
    const gameHistoryServiceSpy = jasmine.createSpyObj('GameHistoryService', ['getAll', 'deleteAll']);
    gameHistoryServiceSpy.getAll.and.returnValue(of([]));
    gameHistoryServiceSpy.deleteAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [GameHistoryListComponent],
      providers: [
        { provide: GameHistoryService, useValue: gameHistoryServiceSpy }
      ]
    }).compileComponents();

    gameHistoryService = TestBed.inject(GameHistoryService) as jasmine.SpyObj<GameHistoryService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameHistoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should get the games correctly', () => {
    gameHistoryService.getAll.and.returnValue(of(MOCK_GAMES));
    component.getAllGames();
    expect(gameHistoryService.getAll).toHaveBeenCalled();
});

  it('should delete the games correctly', () => {
    component.games = MOCK_GAMES;
    component.deleteAllGames();
    expect(gameHistoryService.deleteAll).toHaveBeenCalled();
    expect(component.games).toEqual([]);
  });

 });
