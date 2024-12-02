import { Component, Input } from '@angular/core';
import { EventRecord } from '../store/notification.reducer';

@Component({
    selector: 'app-event-bubble',
    imports: [],
    templateUrl: './event-bubble.component.html',
    styleUrl: './event-bubble.component.css'
})
export class EventBubbleComponent {
  @Input() event: EventRecord | null = null;
  @Input() userInteractive: boolean = false;
  private readonly _levelToString : Record<string, string> = {
    '50': 'CRITICAL',
    '40': 'ERROR',
    '30': 'WARNING',
    '20': 'INFO',
    '10': 'DEBUG',
    '0': 'NOT_SET',
  }

  get level(): string {
    if (this.event === null) {
      return this._levelToString['0'];
    }
    const eventType = this.event.level as keyof typeof this._levelToString;
    return this._levelToString[eventType];
  }
  
}
