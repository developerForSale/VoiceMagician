import { createReducer, on } from '@ngrx/store';
import { BulletinActions, SSEActions } from './notification.actions';

export interface EventType {
  event: string;
  type: string;
  id: string;
}

export interface NotificationState {
  isSubscribed: boolean;
  isBulletinUnfolded: boolean;
  alarmIds: string[];
  events: EventType[];
}

export const initialState: NotificationState = {
  isSubscribed: false,
  isBulletinUnfolded: false,
  alarmIds: [],
  events: [],
};

export const notificationReducer = createReducer(
  initialState,
  on(BulletinActions.unfold, (state) => ({
    ...state,
    isBulletinUnfolded: true,
  })),
  on(BulletinActions.fold, (state) => ({
    ...state,
    isBulletinUnfolded: false,
  })),
  on(SSEActions.eventReceived, (state, { event }) => ({
    ...state,
    events: [...state.events, event],
  })),
  on(SSEActions.errorAlarm, (state, { error }) => ({
    ...state,
    events: [...state.events, error],
    alarmIds: [...state.alarmIds, error.id],
  })),
  on(SSEActions.stopAlarm, (state, { errorId }) => ({
    ...state,
    alarmIds: state.alarmIds.filter((id) => id !== errorId),
  }))
);
