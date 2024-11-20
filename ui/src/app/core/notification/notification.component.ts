import { Component, OnDestroy } from '@angular/core';
import { EventSourceService } from './event-source.service';
import { Subscription } from 'rxjs';

import { TickerComponent } from './ticker/ticker.component';
import { BulletinComponent } from './bulletin/bulletin.component';
import { API_PATH } from '../../env';
import { Store } from '@ngrx/store';
import { SSEActions } from './store/notification.actions';
import { EventType, NotificationState } from './store/notification.reducer';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [TickerComponent, BulletinComponent],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
})
export class NotificationComponent {
  private readonly eventSourceSubscription: Subscription;
  lastEvent: any;
  isBulletinUnfolded: boolean = false;

  constructor(
    private eventSourceService: EventSourceService,
    private store: Store<NotificationState>
  ) {
    const url = API_PATH.SUBSCRIBE_NOTIFICATION;
    const options = { withCredentials: false };
    const eventNames: string[] = [];

    this.eventSourceSubscription = this.eventSourceService
      .connectToServerSentEvents(url, options, eventNames)
      .subscribe({
        next: (event: EventType) => {
          this.store.dispatch(SSEActions.eventReceived({ event }));
        },
        error: (error) => {
          this.store.dispatch(SSEActions.errorAlarm({ error }));
        },
      });
  }

  ngOnDestroy(): void {
    this.eventSourceSubscription.unsubscribe();
    this.eventSourceService.close();
  }
}
