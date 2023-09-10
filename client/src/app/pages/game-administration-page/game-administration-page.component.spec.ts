import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameAdministrationPageComponent } from './game-administration-page.component';

describe('GameAdministrationPageComponent', () => {
  let component: GameAdministrationPageComponent;
  let fixture: ComponentFixture<GameAdministrationPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GameAdministrationPageComponent]
    });
    fixture = TestBed.createComponent(GameAdministrationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
