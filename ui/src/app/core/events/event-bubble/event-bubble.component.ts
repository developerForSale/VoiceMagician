import { Component, Input } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { EventType } from '../store/notification.reducer';

@Component({
  selector: 'app-event-bubble',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './event-bubble.component.html',
  styleUrl: './event-bubble.component.css'
})
export class EventBubbleComponent {
  @Input() event!: EventType | null;
}
