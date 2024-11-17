import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VmStatusComponent } from './vm-status.component';

describe('VmStatusComponent', () => {
  let component: VmStatusComponent;
  let fixture: ComponentFixture<VmStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VmStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VmStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
