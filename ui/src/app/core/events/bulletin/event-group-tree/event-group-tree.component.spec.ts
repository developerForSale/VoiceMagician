import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventGroupTreeComponent } from './event-group-tree.component';

describe('EventGroupTreeComponent', () => {
  let component: EventGroupTreeComponent;
  let fixture: ComponentFixture<EventGroupTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventGroupTreeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventGroupTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
