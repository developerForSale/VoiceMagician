import { Component } from '@angular/core';
import { NgFor, AsyncPipe} from '@angular/common';
import { EventBubbleComponent } from '../event-bubble/event-bubble.component';

import { Store } from '@ngrx/store';
import { selectEvents } from '../store/notification.selectors';
import { NotificationState } from '../store/notification.reducer';

@Component({
  selector: 'app-bulletin',
  standalone: true,
  imports: [EventBubbleComponent, NgFor, AsyncPipe],
  templateUrl: './bulletin.component.html',
  styleUrl: './bulletin.component.css',
})
export class BulletinComponent {
  public events$ = this.store.select(selectEvents);

  constructor(private store: Store<NotificationState>) {}
}
