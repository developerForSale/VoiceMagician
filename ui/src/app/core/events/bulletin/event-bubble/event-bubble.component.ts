import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { EventRecord } from '../../store/notification.reducer';

@Component({
  selector: 'app-event-bubble',
  imports: [MatIconModule],
  templateUrl: './event-bubble.component.html',
  styleUrl: './event-bubble.component.css',
})
export class EventBubbleComponent {
  @Input() event: EventRecord | null = null;
  @Input() index: number | null = null;
  @Output() expandGroupEvent = new EventEmitter<string>();
  private readonly _levelToString: Record<string, string> = {
    '50': 'CRITICAL',
    '40': 'ERROR',
    '30': 'WARNING',
    '20': 'INFO',
    '10': 'DEBUG',
    '0': 'NOT SET',
  };
  private readonly _attentionNeededLevels = ['CRITICAL', 'ERROR', 'WARNING'];

  get level(): string {
    if (this.event === null) {
      return this._levelToString['0'];
    }
    const eventType = this.event.level as keyof typeof this._levelToString;
    return this._levelToString[eventType];
  }

  get isTagged(): boolean {
    if (this._attentionNeededLevels.includes(this.level)) {
      return true;
    } else {
      return false;
    }
  }

  get isExpanded(): boolean {
    if (this.event?.event.hasOwnProperty('group')) {
      return true;
    } else {
      return false;
    }
  }

  get isRSVeEvent(): boolean {
    if (this.event?.event.hasOwnProperty('RSVePhase')) {
      return true;
    } else {
      return false;
    }
  }

  onExpandRequired() {
    if ( this.isExpanded ) {
      this.expandGroupEvent.emit(JSON.stringify({
        info: this.event?.event.info,
        group: this.event?.event.group,
        index: this.index,
      }) as string);
    }
  }
}
