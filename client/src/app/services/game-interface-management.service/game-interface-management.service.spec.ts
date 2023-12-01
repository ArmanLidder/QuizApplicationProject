import { TestBed } from '@angular/core/testing';

import { GameInterfaceManagementService } from './game-interface-management.service';

describe('GameInterfaceManagementService', () => {
  let service: GameInterfaceManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameInterfaceManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
