import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventBubbleComponent } from './event-bubble.component';

describe('EventBubbleComponent', () => {
  let component: EventBubbleComponent;
  let fixture: ComponentFixture<EventBubbleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventBubbleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventBubbleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
