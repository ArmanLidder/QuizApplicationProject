import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizerHistogramComponent } from './organizer-histogram.component';

describe('OrganizerHistogramComponent', () => {
  let component: OrganizerHistogramComponent;
  let fixture: ComponentFixture<OrganizerHistogramComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrganizerHistogramComponent]
    });
    fixture = TestBed.createComponent(OrganizerHistogramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
