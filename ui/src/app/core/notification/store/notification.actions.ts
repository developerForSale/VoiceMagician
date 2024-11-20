import {
  createAction,
  createActionGroup,
  emptyProps,
  props,
} from '@ngrx/store';
import { EventType } from './notification.reducer';

export const BulletinActions = createActionGroup({
  source: 'Bulletin',
  events: {
    Unfold: emptyProps(),
    Fold: emptyProps(),
  },
});

export const SSEActions = createActionGroup({
  source: 'SSE',
  events: {
    'Event Received': props<{ event: EventType }>(),
    'Error Alarm': props<{ error: EventType }>(),
    'Stop Alarm': props<{ errorId: string }>(),
  },
});
