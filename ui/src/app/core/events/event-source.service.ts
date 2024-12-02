import { Injectable, NgZone } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { v4 as uuid4 } from 'uuid';
import { errorLevel, EventType } from './store/notification.reducer';

/**
 * Server-Sent Events service
 * Thanks to https://medium.com/@andrewkoliaka/implementing-server-sent-events-in-angular-a5e40617cb78
 */
@Injectable({
  providedIn: 'root',
})
export class EventSourceService {
  private eventSource: EventSource | null = null;

  /**
   * constructor
   * @param zone - we need to use zone while working with server-sent events
   * because it's an asynchronous operations which are run outside of change detection scope
   * and we need to notify Angular about changes related to SSE events
   */
  constructor(private zone: NgZone) {}

  /**
   * Method for creation of the EventSource instance
   * @param url - SSE server api path
   * @param options - configuration object for SSE
   */
  getEventSource(url: string, options: EventSourceInit): EventSource {
    return new EventSource(url, options);
  }

  /**
   * Method for establishing connection and subscribing to events from SSE
   * @param url - SSE server api path
   * @param options - configuration object for SSE
   * @param eventTypes - all event types except error (listens by default) you want to listen to
   */
  connectToServerSentEvents(
    url: string,
    options: EventSourceInit,
    eventTypes: string[] = []
  ): Observable<EventType> {
    this.eventSource = this.getEventSource(url, options);

    return new Observable((subscriber: Subscriber<EventType>) => {
      if (this.eventSource) {
        this.eventSource.onerror = (error: Event) => {
          console.error(error);
          var errorMessage: string = 'Unknown error.';
          if (this.eventSource?.readyState === EventSource.CONNECTING) {
            errorMessage = 'SSE connection failed: still connecting. (readyState: CONNECTING)'
          } else if (this.eventSource?.readyState === EventSource.CLOSED) {
            errorMessage = 'SSE connection failed: closed. (readyState: CLOSED)'
          }
          const errorEvent: EventType = {
            event: errorMessage,
            level: errorLevel,
            id: uuid4(),
          }
          this.zone.run(() => subscriber.error(errorEvent));
        };

        if (!eventTypes.length) {
          this.eventSource.onmessage = (event: MessageEvent) => {
            const newEvent: EventType = JSON.parse(event.data);
            this.zone.run(() => subscriber.next(newEvent));
          };
        } else {
          eventTypes.forEach((type: string) => {
            this.eventSource?.addEventListener(type, (event: MessageEvent) => {
              const newEvent: EventType = JSON.parse(event.data);
              this.zone.run(() => subscriber.next(newEvent));
            });
          });
        }
      }
    });
  }

  /**
   * Method for closing the connection
   */
  close(): void {
    if (!this.eventSource) {
      return;
    }

    this.eventSource.close();
    this.eventSource = null;
  }
}
