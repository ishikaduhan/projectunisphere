import { Types } from 'mongoose';
import { Event, IEvent } from '../models/Event';

export const isValidObjectId = (id: string): boolean => {
  return Types.ObjectId.isValid(id);
};

export interface EventFilters {
  clubId?: string;
  status?: 'draft' | 'pending' | 'approved' | 'rejected';
  startDate?: string;
  endDate?: string;
  tags?: string[];
  locationMode?: 'offline' | 'online' | 'hybrid';
  search?: string;
}

export const createEvent = async (data: Partial<IEvent>, createdBy: string): Promise<IEvent> => {
  const event = new Event({
    title: data.title,
    description: data.description,
    tags: data.tags || [],
    clubId: data.clubId,
    createdBy,
    organizers: data.organizers || [createdBy],
    approval: {
      status: 'draft',
    },
    schedule: data.schedule,
    location: data.location,
    capacity: data.capacity || { waitlistEnabled: true },
    registration: data.registration || { requiresApproval: false },
    qr: data.qr || { checkInEnabled: true },
    analytics: {
      registeredCount: 0,
      checkedInCount: 0,
    },
  });
  return event.save();
};

export const getEventById = async (eventId: string): Promise<IEvent | null> => {
  if (!isValidObjectId(eventId)) return null;
  return Event.findById(eventId).exec();
};

export const getEvents = async (filters: EventFilters, page = 1, limit = 20): Promise<{ items: IEvent[]; total: number }> => {
  const query: any = {};

  if (filters.clubId && isValidObjectId(filters.clubId)) {
    query.clubId = filters.clubId;
  }

  if (filters.status) {
    query['approval.status'] = filters.status;
  }

  if (filters.tags && filters.tags.length) {
    query.tags = { $all: filters.tags };
  }

  if (filters.locationMode) {
    query['location.mode'] = filters.locationMode;
  }

  if (filters.startDate || filters.endDate) {
    query['schedule.startAt'] = {};
    if (filters.startDate) {
      query['schedule.startAt'].$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query['schedule.startAt'].$lte = new Date(filters.endDate);
    }
  }

  if (filters.search) {
    const searchRegex = new RegExp(filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { tags: searchRegex },
    ];
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Event.find(query)
      .sort({ 'schedule.startAt': 1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    Event.countDocuments(query).exec(),
  ]);

  return { items, total };
};

export const updateEvent = async (eventId: string, data: Partial<IEvent>): Promise<IEvent | null> => {
  const updatePayload: any = {};

  if (data.title !== undefined) updatePayload.title = data.title;
  if (data.description !== undefined) updatePayload.description = data.description;
  if (data.tags !== undefined) updatePayload.tags = data.tags;
  if (data.clubId !== undefined) updatePayload.clubId = data.clubId;
  if (data.organizers !== undefined) updatePayload.organizers = data.organizers;
  if (data.schedule !== undefined) updatePayload.schedule = data.schedule;
  if (data.location !== undefined) updatePayload.location = data.location;
  if (data.capacity !== undefined) updatePayload.capacity = data.capacity;
  if (data.registration !== undefined) updatePayload.registration = data.registration;
  if (data.qr !== undefined) updatePayload.qr = data.qr;
  if (data.approval !== undefined) {
    updatePayload.approval = {
      ...data.approval,
    };
  }

  return Event.findByIdAndUpdate(eventId, updatePayload, { new: true, runValidators: true }).exec();
};

export const deleteEvent = async (eventId: string): Promise<IEvent | null> => {
  return Event.findByIdAndDelete(eventId).exec();
};

export const submitEventForApproval = async (eventId: string): Promise<IEvent | null> => {
  return Event.findByIdAndUpdate(
    eventId,
    {
      'approval.status': 'pending',
      'approval.reviewedBy': undefined,
      'approval.reviewedAt': undefined,
      'approval.feedback': undefined,
    },
    { new: true, runValidators: true }
  ).exec();
};

export const approveEvent = async (eventId: string, reviewerId: string, status: 'approved' | 'rejected', feedback?: string): Promise<IEvent | null> => {
  return Event.findByIdAndUpdate(
    eventId,
    {
      approval: {
        status,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        feedback,
      },
    },
    { new: true, runValidators: true }
  ).exec();
};

export const getEventAnalytics = async (filters: EventFilters): Promise<{ totalEvents: number; upcomingEvents: number; approvedEvents: number; averageRegistrations: number; averageAttendance: number; topTags: { tag: string; count: number }[] }> => {
  const match: any = {};

  if (filters.clubId && isValidObjectId(filters.clubId)) {
    match.clubId = new Types.ObjectId(filters.clubId);
  }
  if (filters.status) {
    match['approval.status'] = filters.status;
  }
  if (filters.locationMode) {
    match['location.mode'] = filters.locationMode;
  }
  if (filters.startDate || filters.endDate) {
    match['schedule.startAt'] = {};
    if (filters.startDate) match['schedule.startAt'].$gte = new Date(filters.startDate);
    if (filters.endDate) match['schedule.startAt'].$lte = new Date(filters.endDate);
  }

  const aggregation = await Event.aggregate([
    { $match: match },
    {
      $facet: {
        stats: [
          {
            $group: {
              _id: null,
              totalEvents: { $sum: 1 },
              approvedEvents: {
                $sum: {
                  $cond: [{ $eq: ['$approval.status', 'approved'] }, 1, 0],
                },
              },
              upcomingEvents: {
                $sum: {
                  $cond: [{ $gt: ['$schedule.startAt', new Date()] }, 1, 0],
                },
              },
              totalRegistered: { $sum: '$analytics.registeredCount' },
              totalCheckedIn: { $sum: '$analytics.checkedInCount' },
            },
          },
        ],
        topTags: [
          { $unwind: '$tags' },
          { $group: { _id: '$tags', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          { $project: { tag: '$_id', count: 1, _id: 0 } },
        ],
      },
    },
  ]).exec();

  const stats = (aggregation[0]?.stats?.[0]) || {
    totalEvents: 0,
    approvedEvents: 0,
    upcomingEvents: 0,
    totalRegistered: 0,
    totalCheckedIn: 0,
  };

  const averageRegistrations = stats.totalEvents > 0 ? stats.totalRegistered / stats.totalEvents : 0;
  const averageAttendance = stats.totalEvents > 0 ? stats.totalCheckedIn / stats.totalEvents : 0;

  return {
    totalEvents: stats.totalEvents,
    upcomingEvents: stats.upcomingEvents,
    approvedEvents: stats.approvedEvents,
    averageRegistrations,
    averageAttendance,
    topTags: aggregation[0]?.topTags || [],
  };
};
