import { Types } from 'mongoose';
import { Club, IClub } from '../models/Club';

interface ClubFilter {
  category?: string;
  visibility?: 'public' | 'university_only' | 'private';
  createdBy?: string;
  slug?: string;
  search?: string;
}

export const isValidObjectId = (id: string): boolean => {
  return Types.ObjectId.isValid(id);
};

const normalizeSlug = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const ensureUniqueSlug = async (slugBase: string): Promise<string> => {
  let slug = normalizeSlug(slugBase);
  let suffix = 0;

  while (await Club.exists({ slug })) {
    suffix += 1;
    slug = `${normalizeSlug(slugBase)}-${suffix}`;
  }

  return slug;
};

export const createClub = async (data: Partial<IClub>, createdBy: string): Promise<IClub> => {
  const slug = data.slug ? normalizeSlug(data.slug) : await ensureUniqueSlug(data.name || 'club');
  const club = new Club({
    name: data.name,
    slug,
    description: data.description,
    category: data.category,
    visibility: data.visibility || 'public',
    facultyAdvisorId: data.facultyAdvisorId,
    members: data.members || [],
    createdBy,
  });
  return club.save();
};

export const getClubById = async (clubId: string): Promise<IClub | null> => {
  if (!isValidObjectId(clubId)) return null;
  return Club.findById(clubId).exec();
};

export const getClubBySlug = async (slug: string): Promise<IClub | null> => {
  return Club.findOne({ slug }).exec();
};

export const getClubs = async (filters: ClubFilter, page = 1, limit = 20): Promise<{ items: IClub[]; total: number }> => {
  const query: any = {};

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.visibility) {
    query.visibility = filters.visibility;
  }

  if (filters.createdBy && isValidObjectId(filters.createdBy)) {
    query.createdBy = filters.createdBy;
  }

  if (filters.slug) {
    query.slug = filters.slug;
  }

  if (filters.search) {
    const searchRegex = new RegExp(filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { category: searchRegex },
    ];
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Club.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    Club.countDocuments(query).exec(),
  ]);

  return { items, total };
};

export const updateClub = async (clubId: string, data: Partial<IClub>): Promise<IClub | null> => {
  const updatePayload: any = {};

  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.description !== undefined) updatePayload.description = data.description;
  if (data.category !== undefined) updatePayload.category = data.category;
  if (data.visibility !== undefined) updatePayload.visibility = data.visibility;
  if (data.facultyAdvisorId !== undefined) updatePayload.facultyAdvisorId = data.facultyAdvisorId;
  if (data.members !== undefined) updatePayload.members = data.members;

  if (data.slug !== undefined) {
    updatePayload.slug = normalizeSlug(data.slug);
  }

  return Club.findByIdAndUpdate(clubId, updatePayload, { new: true, runValidators: true }).exec();
};

export const deleteClub = async (clubId: string): Promise<IClub | null> => {
  return Club.findByIdAndDelete(clubId).exec();
};
