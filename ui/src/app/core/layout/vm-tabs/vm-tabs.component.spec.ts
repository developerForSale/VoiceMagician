import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VmTabsComponent } from './vm-tabs.component';

describe('VmTabsComponent', () => {
  let component: VmTabsComponent;
  let fixture: ComponentFixture<VmTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VmTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VmTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
