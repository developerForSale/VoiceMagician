import { createSelector, createFeatureSelector } from '@ngrx/store';
import { NotificationState } from './notification.reducer';

const selectNotificationState = createFeatureSelector<NotificationState>('notification');
export const selectLastEvent = createSelector(selectNotificationState, (state) => state.events[state.events.length - 1]);
