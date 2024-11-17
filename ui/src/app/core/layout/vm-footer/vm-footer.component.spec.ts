import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VmFooterComponent } from './vm-footer.component';

describe('VmFooterComponent', () => {
  let component: VmFooterComponent;
  let fixture: ComponentFixture<VmFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VmFooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VmFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
