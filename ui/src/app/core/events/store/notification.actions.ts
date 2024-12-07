import {
  createAction,
  createActionGroup,
  emptyProps,
  props,
} from '@ngrx/store';
import { EventType } from './notification.reducer';

export const SSEActions = createActionGroup({
  source: 'SSE',
  events: {
    'Event Received': props<{ event: EventType }>(),
    'Error Alarm': props<{ error: EventType }>(),
    'Stop Alarm': props<{ errorId: string }>(),
  },
});

export const BulletinActions = createActionGroup({
  source: 'Bulletin',
  events: {
    'Expand Event Group': props<{ groupId: string }>(),
    'Close Event Group Tab': props<{ groupId: string }>(),
  },
});