import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostInterfaceComponent } from './host-interface.component';

describe('HostInterfaceComponent', () => {
  let component: HostInterfaceComponent;
  let fixture: ComponentFixture<HostInterfaceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HostInterfaceComponent]
    });
    fixture = TestBed.createComponent(HostInterfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
