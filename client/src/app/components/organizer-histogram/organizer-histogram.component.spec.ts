import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrganizerHistogramComponent } from './organizer-histogram.component';
import { NgChartsModule } from 'ng2-charts';

describe('OrganizerHistogramComponent', () => {
  let component: OrganizerHistogramComponent;
  let fixture: ComponentFixture<OrganizerHistogramComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrganizerHistogramComponent],
      imports: [NgChartsModule],
    }).compileComponents();
    fixture = TestBed.createComponent(OrganizerHistogramComponent);
    component = fixture.componentInstance;

    component.finalResponses = new Map<string, number>([
      ['Paris', 15],
      ['Dollar', 5],
      ['Pound', 8],
      ['52', 4],
      ['50', 11],
      ['Oxygen', 12],
      ['Mars', 14],
    ]);

    component.changingResponses = new Map<string, number>([
      ['Paris', 15],
      ['Dollar', 5],
      ['Pound', 8],
      ['52', 4],
      ['50', 11],
      ['Oxygen', 12],
      ['Mars', 14],
    ]);
    component.valueOfResponses = new Map<string, boolean>([
      ['Paris', true],
      ['Dollar', false],
      ['Pound', true],
      ['52', false],
      ['50', true],
      ['Oxygen', true],
      ['Mars', true],
    ]);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change barChartData on change', () => {
    fixture.detectChanges();
    component.finalResponses = new Map([
      ['Paris', 20],
      ['Dollar', 30],
      ['Trick 1', 14],
      ['52', 13],
      ['50', 12],
      ['Oxygen', 45],
      ['Mars', 29],
    ]);
    component.changingResponses = new Map<string, number>([
      ['Paris', 15],
      ['Dollar', 5],
      ['Pound', 8],
      ['52', 4],
      ['50', 11],
      ['Trick 2', 12],
      ['Mars', 14],
    ]);
    component.ngOnChanges();
    expect(component.barChartData.labels).toEqual(['Paris', 'Dollar', 'Pound', '52', '50', 'Oxygen', 'Mars']);
    expect(component.barChartData.datasets[0].data).toEqual([20, 30, 14, 13, 12, 45, 29]);
  });
});
