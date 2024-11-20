import { Component } from '@angular/core';
import { AsyncPipe, JsonPipe } from '@angular/common';

import { Store } from '@ngrx/store';
import { BulletinActions } from '../store/notification.actions';
import { selectLastEvent } from '../store/notification.selectors';
import { NotificationState, EventType } from '../store/notification.reducer';

@Component({
  selector: 'app-ticker',
  standalone: true,
  imports: [AsyncPipe, JsonPipe],
  templateUrl: './ticker.component.html',
  styleUrl: './ticker.component.css',
})
export class TickerComponent {
  public event$ = this.store.select(selectLastEvent);

  constructor(private store: Store<NotificationState>) {}

  onClick() {
    this.store.dispatch(BulletinActions.unfold());
  }
}
