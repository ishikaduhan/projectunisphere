import { Types } from 'mongoose';
import { Notification, INotification } from '../models/Notification';
import { User, IUser } from '../models/User';
import { Event, IEvent } from '../models/Event';
import { sendEmail } from '../utils/mail';

export type NotificationChannel = 'email' | 'push' | 'in_app';

interface QueueNotificationInput {
  userId: string;
  type: INotification['type'];
  channel: NotificationChannel;
  title: string;
  message: string;
  data?: INotification['data'];
  scheduledFor?: Date;
}

export const queueNotification = async (input: QueueNotificationInput): Promise<INotification> => {
  const notification = new Notification({
    userId: new Types.ObjectId(input.userId),
    type: input.type,
    channel: input.channel,
    title: input.title,
    message: input.message,
    data: input.data,
    scheduledFor: input.scheduledFor || new Date(),
  });

  return notification.save();
};

export const getUserNotifications = async (
  userId: string,
  page = 1,
  limit = 20
): Promise<{ items: INotification[]; total: number }> => {
  const skip = (page - 1) * limit;
  const query = { userId: new Types.ObjectId(userId) };

  const [items, total] = await Promise.all([
    Notification.find(query)
      .sort({ scheduledFor: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    Notification.countDocuments(query).exec(),
  ]);

  return { items, total };
};

export const markNotificationRead = async (notificationId: string, userId: string): Promise<INotification | null> => {
  return Notification.findOneAndUpdate(
    { _id: new Types.ObjectId(notificationId), userId: new Types.ObjectId(userId) },
    { status: 'read' },
    { new: true }
  ).exec();
};

export const processQueuedNotifications = async (): Promise<{ processed: number; failed: number }> => {
  const now = new Date();
  const notifications = await Notification.find({ status: 'queued', scheduledFor: { $lte: now } })
    .limit(200)
    .exec();

  let processed = 0;
  let failed = 0;

  for (const notification of notifications) {
    try {
      const user = await User.findById(notification.userId).exec();
      if (!user) {
        notification.status = 'failed';
        await notification.save();
        failed += 1;
        continue;
      }

      switch (notification.channel) {
        case 'email': {
          if (!user.settings.notifyEmail) {
            notification.status = 'failed';
            notification.message += ' (user email notifications disabled)';
            await notification.save();
            failed += 1;
            break;
          }

          await sendEmail(
            user.email,
            notification.title,
            notification.message,
            `<p>${notification.message}</p>`
          );
          notification.status = 'sent';
          await notification.save();
          processed += 1;
          break;
        }
        case 'in_app': {
          notification.status = 'sent';
          await notification.save();
          processed += 1;
          break;
        }
        case 'push': {
          if (!user.settings.notifyPush) {
            notification.status = 'failed';
            notification.message += ' (user push notifications disabled)';
            await notification.save();
            failed += 1;
            break;
          }
          console.info(`[PushNotification] userId=${user._id} title=${notification.title}`);
          notification.status = 'sent';
          await notification.save();
          processed += 1;
          break;
        }
      }
    } catch (error) {
      notification.status = 'failed';
      await notification.save();
      failed += 1;
    }
  }

  return { processed, failed };
};

export const queueRegistrationConfirmation = async (
  registrationId: string,
  event: IEvent,
  user: IUser,
  qrToken?: string
): Promise<void> => {
  const title = `Registered for ${event.title}`;
  const message = `You are ${qrToken ? 'successfully registered' : 'waitlisted'} for ${event.title} on ${new Date(
    event.schedule.startAt
  ).toLocaleString()}.`;

  await queueNotification({
    userId: user._id.toString(),
    type: 'event_update',
    channel: 'in_app',
    title,
    message,
    data: {
      eventId: event._id,
      eventTitle: event.title,
    },
  });

  if (user.settings.notifyEmail) {
    await queueNotification({
      userId: user._id.toString(),
      type: 'event_update',
      channel: 'email',
      title,
      message: `${message}${qrToken ? ` Your QR token is: ${qrToken}` : ''}`,
      data: {
        eventId: event._id,
        eventTitle: event.title,
      },
    });
  }

  const reminderDate = new Date(event.schedule.startAt.getTime() - 60 * 60 * 1000);
  if (reminderDate > new Date()) {
    await queueNotification({
      userId: user._id.toString(),
      type: 'event_reminder',
      channel: 'in_app',
      title: `Reminder: ${event.title}`,
      message: `Your event ${event.title} starts at ${new Date(event.schedule.startAt).toLocaleString()}.`,
      data: {
        eventId: event._id,
        eventTitle: event.title,
      },
      scheduledFor: reminderDate,
    });

    if (user.settings.notifyEmail) {
      await queueNotification({
        userId: user._id.toString(),
        type: 'event_reminder',
        channel: 'email',
        title: `Reminder: ${event.title}`,
        message: `Your event ${event.title} starts at ${new Date(event.schedule.startAt).toLocaleString()}.`,
        data: {
          eventId: event._id,
          eventTitle: event.title,
        },
        scheduledFor: reminderDate,
      });
    }
  }
};

export const queueEventApprovalNotification = async (
  event: IEvent,
  user: IUser,
  approved: boolean
): Promise<void> => {
  const title = approved ? `Event approved: ${event.title}` : `Event rejected: ${event.title}`;
  const message = approved
    ? `Your event ${event.title} has been approved and is now visible to attendees.`
    : `Your event ${event.title} was rejected. Please review the details and resubmit.`;

  await queueNotification({
    userId: user._id.toString(),
    type: 'event_update',
    channel: 'in_app',
    title,
    message,
    data: {
      eventId: event._id,
      eventTitle: event.title,
    },
  });

  if (user.settings.notifyEmail) {
    await queueNotification({
      userId: user._id.toString(),
      type: 'event_update',
      channel: 'email',
      title,
      message,
      data: {
        eventId: event._id,
        eventTitle: event.title,
      },
    });
  }
};
