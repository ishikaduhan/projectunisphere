export interface UserProfile {
  id: string;
  name: {
    first: string;
    last: string;
  };
  email: string;
  roles: string[];
  profile: {
    department: string;
    year?: number;
    interests: string[];
  };
  settings: {
    notifyEmail: boolean;
    notifyPush: boolean;
    timezone: string;
  };
}

export interface EventItem {
  _id: string;
  title: string;
  description: string;
  tags?: string[];
  schedule: {
    startAt: string;
    endAt: string;
    timezone?: string;
  };
  location: {
    mode: string;
    venue?: string;
    room?: string;
    meetingUrl?: string;
  };
  capacity?: {
    limit?: number;
    waitlistEnabled?: boolean;
  };
  registration?: {
    openAt?: string;
    closeAt?: string;
    requiresApproval?: boolean;
  };
  qr?: {
    checkInEnabled?: boolean;
    secretVersion?: number;
  };
  analytics?: {
    registeredCount?: number;
    checkedInCount?: number;
  };
}

export interface ClubItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  visibility: string;
  members?: Array<{
    userId: string;
    role: string;
    status: string;
  }>;
}

export interface RegistrationItem {
  _id: string;
  eventId: string;
  status: string;
  registeredAt: string;
}

export interface NotificationItem {
  _id: string;
  type: string;
  channel: string;
  title: string;
  message: string;
  data?: {
    eventId?: string;
    eventTitle?: string;
    clubId?: string;
  };
  status: string;
  scheduledFor: string;
  createdAt: string;
}
