/**
 * Notification Entity
 * In-app notification domain model
 */

export type NotificationType =
  | "transaction:confirmed"
  | "transaction:failed"
  | "transaction:status_changed"
  | "account:created"
  | "balance:updated"
  | "stake:unlocked"
  | "rewards:available"
  | "purchase:completed"
  | "system:announcement";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  transactionAlerts: boolean;
  rewardAlerts: boolean;
  stakeUnlockReminders: boolean;
  systemAnnouncements: boolean;
}

/**
 * Get notification icon name based on type
 */
export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    "transaction:confirmed": "check-circle",
    "transaction:failed": "x-circle",
    "transaction:status_changed": "clock",
    "account:created": "wallet",
    "balance:updated": "refresh-cw",
    "stake:unlocked": "unlock",
    "rewards:available": "gift",
    "purchase:completed": "shopping-bag",
    "system:announcement": "bell",
  };
  return icons[type] || "bell";
}

/**
 * Get notification color based on type
 */
export function getNotificationColor(type: NotificationType): string {
  if (type.includes("confirmed") || type.includes("created") || type.includes("completed")) {
    return "#009d69"; // success
  }
  if (type.includes("failed")) {
    return "#ee5261"; // error
  }
  if (type.includes("unlocked") || type.includes("available")) {
    return "#7c3aed"; // primary
  }
  return "#64748b"; // neutral
}
