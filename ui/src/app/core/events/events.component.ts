import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { Subscription } from 'rxjs';

import { EventSourceService } from './event-source.service';
import { BulletinComponent } from './bulletin/bulletin.component';
import { EventBubbleComponent } from './event-bubble/event-bubble.component';
import { API_PATH } from '../../env';
import { Store } from '@ngrx/store';
import { SSEActions } from './store/notification.actions';
import { EventType, NotificationState } from './store/notification.reducer';
import { selectLastEvent } from './store/notification.selectors';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [ OverlayModule, BulletinComponent, EventBubbleComponent, AsyncPipe ],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css',
})
export class EventsComponent {
  private readonly eventSourceSubscription: Subscription;
  public isBulletinShown = false;
  public theLatestEvent$ = this.store.select(selectLastEvent);

  constructor(
    private eventSourceService: EventSourceService,
    private store: Store<NotificationState>
  ) {
    /**
     * Subscribe to server-sent events
     * and pass events to store
     */
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
