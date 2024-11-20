import { createSelector, createFeatureSelector } from '@ngrx/store';
import { EventType, NotificationState } from './notification.reducer';

const selectNotificationState =
  createFeatureSelector<NotificationState>('notification');
export const selectLastEvent = createSelector(
  selectNotificationState,
  (state) => {
    if (state.events.length === 0) return null;
    else return state.events[state.events.length - 1];
  }
);
