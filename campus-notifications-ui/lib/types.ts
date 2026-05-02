export interface Notification {
  ID: string;
  Type: string;
  Message: string;
  Timestamp: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
}
