"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = require("../config/db");
const User_1 = require("../models/User");
const Club_1 = require("../models/Club");
const Event_1 = require("../models/Event");
const Registration_1 = require("../models/Registration");
const Attendance_1 = require("../models/Attendance");
const Notification_1 = require("../models/Notification");
dotenv_1.default.config();
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const sampleAdmin = {
    universityId: 'UNI0001',
    name: { first: 'Priya', last: 'Kumar' },
    email: 'admin@unisphere.edu',
    phone: '9999999999',
    password: 'Admin123!@#',
    roles: ['admin'],
    status: 'active',
    profile: {
        department: 'Campus Operations',
        interests: ['university life', 'operations'],
    },
    settings: {
        notifyEmail: true,
        notifyPush: true,
        timezone: 'Asia/Kolkata',
    },
};
const sampleOrganizers = [
    {
        universityId: 'UNI1001',
        name: { first: 'Amit', last: 'Sharma' },
        email: 'amit.sharma@unisphere.edu',
        phone: '9110000001',
        password: 'Organizer123!',
        roles: ['organizer'],
        status: 'active',
        profile: { department: 'Arts & Culture', year: 4, interests: ['dance', 'performance'] },
        settings: { notifyEmail: true, notifyPush: true, timezone: 'Asia/Kolkata' },
    },
    {
        universityId: 'UNI1002',
        name: { first: 'Neha', last: 'Patel' },
        email: 'neha.patel@unisphere.edu',
        phone: '9110000002',
        password: 'Organizer123!',
        roles: ['organizer'],
        status: 'active',
        profile: { department: 'Technology', year: 3, interests: ['ai', 'web development'] },
        settings: { notifyEmail: true, notifyPush: true, timezone: 'Asia/Kolkata' },
    },
    {
        universityId: 'UNI1003',
        name: { first: 'Vikram', last: 'Mehta' },
        email: 'vikram.mehta@unisphere.edu',
        phone: '9110000003',
        password: 'Organizer123!',
        roles: ['organizer'],
        status: 'active',
        profile: { department: 'Science', year: 4, interests: ['research', 'science outreach'] },
        settings: { notifyEmail: true, notifyPush: true, timezone: 'Asia/Kolkata' },
    },
    {
        universityId: 'UNI1004',
        name: { first: 'Riya', last: 'Singh' },
        email: 'riya.singh@unisphere.edu',
        phone: '9110000004',
        password: 'Organizer123!',
        roles: ['organizer'],
        status: 'active',
        profile: { department: 'Business', year: 2, interests: ['entrepreneurship', 'marketing'] },
        settings: { notifyEmail: true, notifyPush: true, timezone: 'Asia/Kolkata' },
    },
];
const sampleStudents = [
    {
        universityId: 'UNI2001',
        name: { first: 'Ananya', last: 'Rao' },
        email: 'ananya.rao@unisphere.edu',
        phone: '9111000001',
        password: 'Student123!',
        roles: ['student'],
        status: 'active',
        profile: { department: 'Computer Science', year: 2, interests: ['coding', 'gaming'] },
        settings: { notifyEmail: true, notifyPush: true, timezone: 'Asia/Kolkata' },
    },
    {
        universityId: 'UNI2002',
        name: { first: 'Rahul', last: 'Verma' },
        email: 'rahul.verma@unisphere.edu',
        phone: '9111000002',
        password: 'Student123!',
        roles: ['student'],
        status: 'active',
        profile: { department: 'Mechanical Engineering', year: 3, interests: ['robotics', 'motorsports'] },
        settings: { notifyEmail: true, notifyPush: true, timezone: 'Asia/Kolkata' },
    },
    {
        universityId: 'UNI2003',
        name: { first: 'Sana', last: 'Khan' },
        email: 'sana.khan@unisphere.edu',
        phone: '9111000003',
        password: 'Student123!',
        roles: ['student'],
        status: 'active',
        profile: { department: 'Psychology', year: 1, interests: ['wellness', 'mindfulness'] },
        settings: { notifyEmail: true, notifyPush: true, timezone: 'Asia/Kolkata' },
    },
    {
        universityId: 'UNI2004',
        name: { first: 'Dev', last: 'Gupta' },
        email: 'dev.gupta@unisphere.edu',
        phone: '9111000004',
        password: 'Student123!',
        roles: ['student'],
        status: 'active',
        profile: { department: 'Economics', year: 3, interests: ['finance', 'policy'] },
        settings: { notifyEmail: true, notifyPush: true, timezone: 'Asia/Kolkata' },
    },
    {
        universityId: 'UNI2005',
        name: { first: 'Isha', last: 'Malhotra' },
        email: 'isha.malhotra@unisphere.edu',
        phone: '9111000005',
        password: 'Student123!',
        roles: ['student'],
        status: 'active',
        profile: { department: 'Design', year: 2, interests: ['painting', 'photography'] },
        settings: { notifyEmail: true, notifyPush: true, timezone: 'Asia/Kolkata' },
    },
    {
        universityId: 'UNI2006',
        name: { first: 'Karan', last: 'Joshi' },
        email: 'karan.joshi@unisphere.edu',
        phone: '9111000006',
        password: 'Student123!',
        roles: ['student'],
        status: 'active',
        profile: { department: 'Physics', year: 4, interests: ['astrophysics', 'research'] },
        settings: { notifyEmail: true, notifyPush: true, timezone: 'Asia/Kolkata' },
    },
    {
        universityId: 'UNI2007',
        name: { first: 'Priyanka', last: 'Nair' },
        email: 'priyanka.nair@unisphere.edu',
        phone: '9111000007',
        password: 'Student123!',
        roles: ['student'],
        status: 'active',
        profile: { department: 'Biotechnology', year: 3, interests: ['healthcare', 'bioinnovation'] },
        settings: { notifyEmail: true, notifyPush: true, timezone: 'Asia/Kolkata' },
    },
    {
        universityId: 'UNI2008',
        name: { first: 'Kabir', last: 'Agarwal' },
        email: 'kabir.agarwal@unisphere.edu',
        phone: '9111000008',
        password: 'Student123!',
        roles: ['student'],
        status: 'active',
        profile: { department: 'Mathematics', year: 1, interests: ['analytics', 'problem solving'] },
        settings: { notifyEmail: true, notifyPush: true, timezone: 'Asia/Kolkata' },
    },
    {
        universityId: 'UNI2009',
        name: { first: 'Meera', last: 'Iyer' },
        email: 'meera.iyer@unisphere.edu',
        phone: '9111000009',
        password: 'Student123!',
        roles: ['student'],
        status: 'active',
        profile: { department: 'Media Studies', year: 2, interests: ['journalism', 'storytelling'] },
        settings: { notifyEmail: true, notifyPush: true, timezone: 'Asia/Kolkata' },
    },
    {
        universityId: 'UNI2010',
        name: { first: 'Sanidhya', last: 'Bhatia' },
        email: 'sanidhya.bhatia@unisphere.edu',
        phone: '9111000010',
        password: 'Student123!',
        roles: ['student'],
        status: 'active',
        profile: { department: 'Computer Science', year: 4, interests: ['open source', 'cloud'] },
        settings: { notifyEmail: true, notifyPush: true, timezone: 'Asia/Kolkata' },
    },
    {
        universityId: 'UNI2011',
        name: { first: 'Tara', last: 'Desai' },
        email: 'tara.desai@unisphere.edu',
        phone: '9111000011',
        password: 'Student123!',
        roles: ['student'],
        status: 'active',
        profile: { department: 'Psychology', year: 2, interests: ['mental health', 'wellbeing'] },
        settings: { notifyEmail: true, notifyPush: true, timezone: 'Asia/Kolkata' },
    },
    {
        universityId: 'UNI2012',
        name: { first: 'Yash', last: 'Kapoor' },
        email: 'yash.kapoor@unisphere.edu',
        phone: '9111000012',
        password: 'Student123!',
        roles: ['student'],
        status: 'active',
        profile: { department: 'Business', year: 3, interests: ['startups', 'investing'] },
        settings: { notifyEmail: true, notifyPush: true, timezone: 'Asia/Kolkata' },
    },
];
const sampleClubs = [
    {
        name: 'CodeCrafters',
        slug: 'codecrafters',
        description: 'A club for developers, hackers, and tech enthusiasts to build real-world projects.',
        category: 'Technology',
        visibility: 'public',
        organizerEmail: 'neha.patel@unisphere.edu',
        memberEmails: ['ananya.rao@unisphere.edu', 'dev.gupta@unisphere.edu', 'sanidhya.bhatia@unisphere.edu'],
    },
    {
        name: 'ArtHouse',
        slug: 'arthouse',
        description: 'Creative community for painters, photographers, and design students.',
        category: 'Arts & Culture',
        visibility: 'public',
        organizerEmail: 'amit.sharma@unisphere.edu',
        memberEmails: ['isha.malhotra@unisphere.edu', 'meera.iyer@unisphere.edu', 'prianka.nair@unisphere.edu'],
    },
    {
        name: 'EcoLeaders',
        slug: 'ecoleaders',
        description: 'Students working together on sustainability, climate action, and green campus initiatives.',
        category: 'Community',
        visibility: 'public',
        organizerEmail: 'vikram.mehta@unisphere.edu',
        memberEmails: ['kabir.agarwal@unisphere.edu', 'sana.khan@unisphere.edu', 'rahul.verma@unisphere.edu'],
    },
    {
        name: 'BizConnect',
        slug: 'bizconnect',
        description: 'Business club focusing on entrepreneurship, case competitions, and leadership.',
        category: 'Business',
        visibility: 'university_only',
        organizerEmail: 'riya.singh@unisphere.edu',
        memberEmails: ['yash.kapoor@unisphere.edu', 'dev.gupta@unisphere.edu', 'meera.iyer@unisphere.edu'],
    },
    {
        name: 'ScienceFront',
        slug: 'sciencefront',
        description: 'A forum for science outreach, experiments, and research discussions.',
        category: 'Science',
        visibility: 'public',
        organizerEmail: 'vikram.mehta@unisphere.edu',
        memberEmails: ['karan.joshi@unisphere.edu', 'sanidhya.bhatia@unisphere.edu', 'sana.khan@unisphere.edu'],
    },
    {
        name: 'MediaPulse',
        slug: 'mediapulse',
        description: 'For storytellers, journalists, and content creators shaping campus narratives.',
        category: 'Media',
        visibility: 'public',
        organizerEmail: 'amit.sharma@unisphere.edu',
        memberEmails: ['meera.iyer@unisphere.edu', 'isha.malhotra@unisphere.edu', 'priyanka.nair@unisphere.edu'],
    },
    {
        name: 'DesignHive',
        slug: 'designhive',
        description: 'Design thinking, UX workshops, and product ideation sessions for creative minds.',
        category: 'Design',
        visibility: 'public',
        organizerEmail: 'neha.patel@unisphere.edu',
        memberEmails: ['isha.malhotra@unisphere.edu', 'kabir.agarwal@unisphere.edu', 'sana.khan@unisphere.edu'],
    },
    {
        name: 'SportsUnion',
        slug: 'sportsunion',
        description: 'All-sports club supporting athletes, coaches, and campus fitness programs.',
        category: 'Sports',
        visibility: 'public',
        organizerEmail: 'riya.singh@unisphere.edu',
        memberEmails: ['rahul.verma@unisphere.edu', 'kabir.agarwal@unisphere.edu', 'dhruv.patel@unisphere.edu'],
    },
    {
        name: 'HealthCircle',
        slug: 'healthcircle',
        description: 'Mental health, wellness sessions, and peer support events for students.',
        category: 'Wellness',
        visibility: 'public',
        organizerEmail: 'vikram.mehta@unisphere.edu',
        memberEmails: ['sana.khan@unisphere.edu', 'tara.desai@unisphere.edu', 'ananya.rao@unisphere.edu'],
    },
    {
        name: 'FutureLeaders',
        slug: 'futureleaders',
        description: 'Leadership training, panel discussions, and mentoring programs for emerging leaders.',
        category: 'Leadership',
        visibility: 'university_only',
        organizerEmail: 'riya.singh@unisphere.edu',
        memberEmails: ['yash.kapoor@unisphere.edu', 'dev.gupta@unisphere.edu', 'sana.khan@unisphere.edu'],
    },
];
const sampleEvents = [
    {
        title: 'Full Stack Hackathon',
        description: 'A weekend-long hackathon for students to build real applications with mentorship from industry experts.',
        tags: ['hackathon', 'technology', 'product'],
        clubSlug: 'codecrafters',
        organizerEmail: 'neha.patel@unisphere.edu',
        coOrganizerEmail: 'amit.sharma@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: 7,
        durationHours: 36,
        location: { mode: 'hybrid', venue: 'Innovation Lab', room: 'Auditorium A', meetingUrl: 'https://meet.unisphere.edu/hackathon' },
        capacityLimit: 120,
        waitlistEnabled: true,
        requiresApproval: false,
    },
    {
        title: 'Campus Photography Walk',
        description: 'Capture the best parts of campus life while learning photography techniques from our alumni photographers.',
        tags: ['photography', 'creative', 'campus'],
        clubSlug: 'arthouse',
        organizerEmail: 'amit.sharma@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: 5,
        durationHours: 3,
        location: { mode: 'offline', venue: 'Library Lawn', room: 'Outdoor', meetingUrl: '' },
        capacityLimit: 80,
        waitlistEnabled: true,
        requiresApproval: false,
    },
    {
        title: 'Sustainability Summit',
        description: 'Hear from campus leaders and environmental activists about creating greener communities and sustainable student life.',
        tags: ['environment', 'sustainability', 'leadership'],
        clubSlug: 'ecoleaders',
        organizerEmail: 'vikram.mehta@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: 14,
        durationHours: 4,
        location: { mode: 'offline', venue: 'Conference Center', room: 'Room 210', meetingUrl: '' },
        capacityLimit: 100,
        waitlistEnabled: false,
        requiresApproval: false,
    },
    {
        title: 'Start-up Pitch Night',
        description: 'Entrepreneurs pitch their ideas to a panel of judges and receive feedback from real investors.',
        tags: ['entrepreneurship', 'business', 'pitch'],
        clubSlug: 'bizconnect',
        organizerEmail: 'riya.singh@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: 10,
        durationHours: 2,
        location: { mode: 'offline', venue: 'Innovation Hub', room: 'Boardroom', meetingUrl: '' },
        capacityLimit: 70,
        waitlistEnabled: true,
        requiresApproval: false,
    },
    {
        title: 'AI Research Forum',
        description: 'Discuss recent advances in AI, machine learning, and ethics with guest researchers and faculty.',
        tags: ['ai', 'research', 'technology'],
        clubSlug: 'sciencefront',
        organizerEmail: 'vikram.mehta@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: 20,
        durationHours: 3,
        location: { mode: 'online', meetingUrl: 'https://meet.unisphere.edu/ai-forum' },
        capacityLimit: 200,
        waitlistEnabled: false,
        requiresApproval: false,
    },
    {
        title: 'Campus Film Festival',
        description: 'Screenings of student films and a discussion panel about filmmaking, storytelling, and editing.',
        tags: ['film', 'media', 'culture'],
        clubSlug: 'mediapulse',
        organizerEmail: 'amit.sharma@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: 12,
        durationHours: 5,
        location: { mode: 'offline', venue: 'Media Hall', room: 'Screen 2', meetingUrl: '' },
        capacityLimit: 90,
        waitlistEnabled: true,
        requiresApproval: false,
    },
    {
        title: 'UX Design Sprint',
        description: 'A hands-on design sprint for solving student experience challenges using human-centered design techniques.',
        tags: ['design', 'ux', 'product'],
        clubSlug: 'designhive',
        organizerEmail: 'neha.patel@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: 9,
        durationHours: 6,
        location: { mode: 'hybrid', venue: 'Design Studio', room: 'Lab 3', meetingUrl: 'https://meet.unisphere.edu/design-sprint' },
        capacityLimit: 60,
        waitlistEnabled: false,
        requiresApproval: false,
    },
    {
        title: 'Intercampus Cricket Tournament',
        description: 'Teams from across the university come together for a friendly cricket tournament with finals on the weekend.',
        tags: ['sports', 'cricket', 'team'],
        clubSlug: 'sportsunion',
        organizerEmail: 'riya.singh@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: 18,
        durationHours: 8,
        location: { mode: 'offline', venue: 'Sports Ground', room: 'Main Field', meetingUrl: '' },
        capacityLimit: 140,
        waitlistEnabled: true,
        requiresApproval: false,
    },
    {
        title: 'Mental Wellness Workshop',
        description: 'Practical sessions to build resilience, manage stress, and develop healthy routines during university life.',
        tags: ['wellness', 'mental health', 'workshop'],
        clubSlug: 'healthcircle',
        organizerEmail: 'vikram.mehta@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: 4,
        durationHours: 3,
        location: { mode: 'offline', venue: 'Wellness Center', room: 'Room 101', meetingUrl: '' },
        capacityLimit: 50,
        waitlistEnabled: false,
        requiresApproval: false,
    },
    {
        title: 'Leadership Breakfast',
        description: 'A networking breakfast for student leaders, club officers, and mentorship opportunities.',
        tags: ['leadership', 'networking', 'community'],
        clubSlug: 'futureleaders',
        organizerEmail: 'riya.singh@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: 3,
        durationHours: 2,
        location: { mode: 'offline', venue: 'Dining Hall', room: 'Conference Room', meetingUrl: '' },
        capacityLimit: 40,
        waitlistEnabled: false,
        requiresApproval: false,
    },
    {
        title: 'Women in Tech Panel',
        description: 'A conversation with women leaders in technology, career pathways, and building meaningful mentorship.',
        tags: ['women', 'technology', 'panel'],
        organizerEmail: 'neha.patel@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: 2,
        durationHours: 2,
        location: { mode: 'online', meetingUrl: 'https://meet.unisphere.edu/women-in-tech' },
        capacityLimit: 150,
        waitlistEnabled: false,
        requiresApproval: false,
    },
    {
        title: 'Campus Green Cleaning Drive',
        description: 'Join volunteers to refresh campus green spaces with sustainable materials and community engagement.',
        tags: ['community', 'sustainability', 'service'],
        clubSlug: 'ecoleaders',
        organizerEmail: 'vikram.mehta@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: 8,
        durationHours: 4,
        location: { mode: 'offline', venue: 'Campus Grounds', room: 'Open Area', meetingUrl: '' },
        capacityLimit: 80,
        waitlistEnabled: false,
        requiresApproval: false,
    },
    {
        title: 'Virtual Career Fair',
        description: 'Meet recruiters and alumni employers in a virtual fair covering internships, placements, and career paths.',
        tags: ['career', 'jobs', 'networking'],
        organizerEmail: 'riya.singh@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: 15,
        durationHours: 5,
        location: { mode: 'online', meetingUrl: 'https://meet.unisphere.edu/career-fair' },
        capacityLimit: 300,
        waitlistEnabled: false,
        requiresApproval: false,
    },
    {
        title: 'Campus Startup Expo',
        description: 'Showcase student startups and connect with mentors, investors, and fellow innovators.',
        tags: ['startup', 'expo', 'innovation'],
        clubSlug: 'bizconnect',
        organizerEmail: 'riya.singh@unisphere.edu',
        approvalStatus: 'pending',
        startOffsetDays: 21,
        durationHours: 6,
        location: { mode: 'offline', venue: 'Exhibition Hall', room: 'Hall B', meetingUrl: '' },
        capacityLimit: 120,
        waitlistEnabled: true,
        requiresApproval: true,
    },
    {
        title: 'Campus Coding Bootcamp',
        description: 'A beginner-friendly coding bootcamp teaching web development fundamentals and career-ready skills.',
        tags: ['coding', 'bootcamp', 'learning'],
        clubSlug: 'codecrafters',
        organizerEmail: 'neha.patel@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: -5,
        durationHours: 16,
        location: { mode: 'hybrid', venue: 'Computer Lab', room: 'Lab 201', meetingUrl: 'https://meet.unisphere.edu/coding-bootcamp' },
        capacityLimit: 100,
        waitlistEnabled: true,
        requiresApproval: false,
    },
    {
        title: 'Interclub Cultural Night',
        description: 'A celebration of music, dance, and art hosted by multiple student organizations on campus.',
        tags: ['culture', 'performance', 'community'],
        clubSlug: 'arthouse',
        organizerEmail: 'amit.sharma@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: -2,
        durationHours: 4,
        location: { mode: 'offline', venue: 'Main Auditorium', room: 'Hall 1', meetingUrl: '' },
        capacityLimit: 250,
        waitlistEnabled: true,
        requiresApproval: false,
    },
    {
        title: 'AI Ethics Roundtable',
        description: 'A moderated discussion about AI ethics, privacy, and responsible design in student projects.',
        tags: ['ai', 'ethics', 'discussion'],
        clubSlug: 'sciencefront',
        organizerEmail: 'vikram.mehta@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: -10,
        durationHours: 2,
        location: { mode: 'online', meetingUrl: 'https://meet.unisphere.edu/ai-ethics' },
        capacityLimit: 120,
        waitlistEnabled: false,
        requiresApproval: false,
    },
    {
        title: 'Design Thinking Challenge',
        description: 'A real-time design challenge where participants co-create product solutions and pitch them to judges.',
        tags: ['design', 'challenge', 'collaboration'],
        clubSlug: 'designhive',
        organizerEmail: 'neha.patel@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: -8,
        durationHours: 5,
        location: { mode: 'offline', venue: 'Design Lab', room: 'Studio 2', meetingUrl: '' },
        capacityLimit: 60,
        waitlistEnabled: true,
        requiresApproval: false,
    },
    {
        title: 'Yoga & Meditation Session',
        description: 'Wellness instructors lead a gentle yoga and guided meditation class to help students recharge.',
        tags: ['wellness', 'yoga', 'mindfulness'],
        clubSlug: 'healthcircle',
        organizerEmail: 'vikram.mehta@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: -3,
        durationHours: 2,
        location: { mode: 'offline', venue: 'Wellness Garden', room: 'Open Air', meetingUrl: '' },
        capacityLimit: 60,
        waitlistEnabled: false,
        requiresApproval: false,
    },
    {
        title: 'Guest Lecture on Digital Media',
        description: 'Media professionals share insights on digital storytelling, social channels, and content creation careers.',
        tags: ['media', 'lecture', 'careers'],
        clubSlug: 'mediapulse',
        organizerEmail: 'amit.sharma@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: -15,
        durationHours: 2,
        location: { mode: 'online', meetingUrl: 'https://meet.unisphere.edu/digital-media' },
        capacityLimit: 180,
        waitlistEnabled: false,
        requiresApproval: false,
    },
    {
        title: 'Networking Night for New Students',
        description: 'Freshers meet seniors, club leaders, and resource coordinators in a relaxed networking event.',
        tags: ['networking', 'orientation', 'community'],
        approvalStatus: 'approved',
        organizerEmail: 'riya.singh@unisphere.edu',
        startOffsetDays: 1,
        durationHours: 2,
        location: { mode: 'offline', venue: 'Student Center', room: 'Hall 3', meetingUrl: '' },
        capacityLimit: 120,
        waitlistEnabled: false,
        requiresApproval: false,
    },
    {
        title: 'Open Mic Night',
        description: 'Bring your poetry, music, or comedy to the stage and celebrate student voices.',
        tags: ['music', 'performance', 'community'],
        clubSlug: 'arthouse',
        organizerEmail: 'amit.sharma@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: 6,
        durationHours: 3,
        location: { mode: 'offline', venue: 'Moonlight Cafe', room: 'Stage', meetingUrl: '' },
        capacityLimit: 100,
        waitlistEnabled: true,
        requiresApproval: false,
    },
    {
        title: 'Innovation Lab Tour',
        description: 'Explore the campus innovation space, meet teams, and discover how to join ongoing research projects.',
        tags: ['innovation', 'tour', 'research'],
        clubSlug: 'sciencefront',
        organizerEmail: 'vikram.mehta@unisphere.edu',
        approvalStatus: 'pending',
        startOffsetDays: 11,
        durationHours: 2,
        location: { mode: 'offline', venue: 'Innovation Lab', room: 'Lobby', meetingUrl: '' },
        capacityLimit: 75,
        waitlistEnabled: false,
        requiresApproval: true,
    },
    {
        title: 'Public Speaking Crash Course',
        description: 'Improve confidence, speech structure, and stage presence in a practical public speaking workshop.',
        tags: ['communication', 'skills', 'confidence'],
        clubSlug: 'futureleaders',
        organizerEmail: 'riya.singh@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: -1,
        durationHours: 3,
        location: { mode: 'offline', venue: 'Lecture Hall', room: 'C1', meetingUrl: '' },
        capacityLimit: 80,
        waitlistEnabled: false,
        requiresApproval: false,
    },
    {
        title: 'Alumni Mentorship Meetup',
        description: 'Connect with alumni mentors and learn how to leverage career advice, internships, and project opportunities.',
        tags: ['mentorship', 'alumni', 'careers'],
        organizerEmail: 'riya.singh@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: 13,
        durationHours: 2,
        location: { mode: 'offline', venue: 'Alumni Center', room: 'Room 2', meetingUrl: '' },
        capacityLimit: 100,
        waitlistEnabled: true,
        requiresApproval: false,
    },
    {
        title: 'Robotics Demo Day',
        description: 'Watch student-built robots compete in challenges and hear from robotics club leaders about next season.',
        tags: ['robotics', 'engineering', 'demo'],
        clubSlug: 'codecrafters',
        organizerEmail: 'neha.patel@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: 16,
        durationHours: 3,
        location: { mode: 'offline', venue: 'Engineering Block', room: 'Mezzanine', meetingUrl: '' },
        capacityLimit: 90,
        waitlistEnabled: true,
        requiresApproval: false,
    },
    {
        title: 'Campus Health Fair',
        description: 'Get wellness screenings, counseling information, and meet the campus health services team.',
        tags: ['health', 'wellness', 'community'],
        clubSlug: 'healthcircle',
        organizerEmail: 'vikram.mehta@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: 19,
        durationHours: 4,
        location: { mode: 'offline', venue: 'Health Pavilion', room: 'Hall A', meetingUrl: '' },
        capacityLimit: 120,
        waitlistEnabled: false,
        requiresApproval: false,
    },
    {
        title: 'Campus Journal Launch',
        description: 'Celebrate the first edition of the campus journal with a launch event and editorial panel.',
        tags: ['journalism', 'media', 'launch'],
        clubSlug: 'mediapulse',
        organizerEmail: 'amit.sharma@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: -6,
        durationHours: 3,
        location: { mode: 'offline', venue: 'Media Center', room: 'Room 5', meetingUrl: '' },
        capacityLimit: 70,
        waitlistEnabled: false,
        requiresApproval: false,
    },
    {
        title: 'Business Case Competition',
        description: 'Teams solve real business problems while building presentation skills and business strategy.',
        tags: ['business', 'competition', 'strategy'],
        clubSlug: 'bizconnect',
        organizerEmail: 'riya.singh@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: -12,
        durationHours: 6,
        location: { mode: 'offline', venue: 'Business Center', room: 'Room 7', meetingUrl: '' },
        capacityLimit: 100,
        waitlistEnabled: true,
        requiresApproval: false,
    },
    {
        title: 'Campus Debate Tournament',
        description: 'Debate teams compete in structured rounds to discuss campus and global issues.',
        tags: ['debate', 'public speaking', 'competition'],
        organizerEmail: 'riya.singh@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: 17,
        durationHours: 8,
        location: { mode: 'offline', venue: 'Debate Hall', room: 'Room 1', meetingUrl: '' },
        capacityLimit: 120,
        waitlistEnabled: true,
        requiresApproval: false,
    },
    {
        title: 'Student Wellness Talk',
        description: 'Health professionals discuss nutrition, sleep, and study-life balance for thriving students.',
        tags: ['wellness', 'nutrition', 'mental health'],
        clubSlug: 'healthcircle',
        organizerEmail: 'vikram.mehta@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: 22,
        durationHours: 2,
        location: { mode: 'offline', venue: 'Wellness Hall', room: 'Room 12', meetingUrl: '' },
        capacityLimit: 80,
        waitlistEnabled: false,
        requiresApproval: false,
    },
    {
        title: 'Campus Entrepreneurship Workshop',
        description: 'Learn how to launch, pitch, and bootstrap an idea with practical exercises and mentor feedback.',
        tags: ['entrepreneurship', 'startup', 'workshop'],
        organizerEmail: 'riya.singh@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: 25,
        durationHours: 4,
        location: { mode: 'online', meetingUrl: 'https://meet.unisphere.edu/entrepreneurship' },
        capacityLimit: 160,
        waitlistEnabled: false,
        requiresApproval: false,
    },
    {
        title: 'Campus Volunteer Fair',
        description: 'Discover volunteer projects, social impact clubs, and community engagement opportunities.',
        tags: ['volunteer', 'community', 'fair'],
        clubSlug: 'ecoleaders',
        organizerEmail: 'vikram.mehta@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: 13,
        durationHours: 3,
        location: { mode: 'offline', venue: 'Student Plaza', room: 'Open Area', meetingUrl: '' },
        capacityLimit: 120,
        waitlistEnabled: true,
        requiresApproval: false,
    },
    {
        title: 'Campus Blockchain Seminar',
        description: 'An intro to blockchain, web3, and decentralized applications for curious students.',
        tags: ['blockchain', 'technology', 'seminar'],
        organizerEmail: 'neha.patel@unisphere.edu',
        approvalStatus: 'pending',
        startOffsetDays: 28,
        durationHours: 3,
        location: { mode: 'online', meetingUrl: 'https://meet.unisphere.edu/blockchain' },
        capacityLimit: 120,
        waitlistEnabled: false,
        requiresApproval: true,
    },
    {
        title: 'Campus Career Panel',
        description: 'Professionals from finance, tech, health, and media speak about career opportunities and interview prep.',
        tags: ['career', 'panel', 'professionals'],
        organizerEmail: 'riya.singh@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: -4,
        durationHours: 3,
        location: { mode: 'offline', venue: 'Lecture Hall', room: 'Auditorium', meetingUrl: '' },
        capacityLimit: 150,
        waitlistEnabled: false,
        requiresApproval: false,
    },
    {
        title: 'Interactive Data Science Workshop',
        description: 'Explore data visualization, analytics tools, and hands-on exercises for beginner data scientists.',
        tags: ['data science', 'workshop', 'analytics'],
        clubSlug: 'codecrafters',
        organizerEmail: 'neha.patel@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: 23,
        durationHours: 4,
        location: { mode: 'hybrid', venue: 'Computer Lab', room: 'Lab 107', meetingUrl: 'https://meet.unisphere.edu/data-science' },
        capacityLimit: 90,
        waitlistEnabled: true,
        requiresApproval: false,
    },
    {
        title: 'Campus Film Discussion',
        description: 'A film appreciation event exploring storytelling techniques, cinematography, and critique.',
        tags: ['film', 'discussion', 'media'],
        clubSlug: 'mediapulse',
        organizerEmail: 'amit.sharma@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: 27,
        durationHours: 2,
        location: { mode: 'offline', venue: 'Media Lab', room: 'Room 9', meetingUrl: '' },
        capacityLimit: 80,
        waitlistEnabled: false,
        requiresApproval: false,
    },
    {
        title: 'Campus Alumni Reunion',
        description: 'Reconnect with alumni, share career stories, and celebrate the university community.',
        tags: ['alumni', 'community', 'reunion'],
        organizerEmail: 'riya.singh@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: 30,
        durationHours: 4,
        location: { mode: 'offline', venue: 'Alumni Patio', room: 'Garden', meetingUrl: '' },
        capacityLimit: 180,
        waitlistEnabled: true,
        requiresApproval: false,
    },
    {
        title: 'Campus Chess Championship',
        description: 'A competitive chess tournament with prizes for top performers and support for beginner players.',
        tags: ['chess', 'competition', 'strategy'],
        clubSlug: 'sportsunion',
        organizerEmail: 'riya.singh@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: -11,
        durationHours: 6,
        location: { mode: 'offline', venue: 'Games Room', room: 'Room 6', meetingUrl: '' },
        capacityLimit: 60,
        waitlistEnabled: true,
        requiresApproval: false,
    },
    {
        title: 'Campus Theatre Workshop',
        description: 'Performing arts students workshop acting, staging, and collaborative storytelling techniques.',
        tags: ['theatre', 'performance', 'arts'],
        clubSlug: 'arthouse',
        organizerEmail: 'amit.sharma@unisphere.edu',
        approvalStatus: 'approved',
        startOffsetDays: 26,
        durationHours: 4,
        location: { mode: 'offline', venue: 'Theatre Hall', room: 'Studio B', meetingUrl: '' },
        capacityLimit: 70,
        waitlistEnabled: false,
        requiresApproval: false,
    },
    {
        title: 'Campus Photography Showcase',
        description: 'Exhibition of student photography projects with feedback from professionals and prizes for standout work.',
        tags: ['photography', 'showcase', 'creative'],
        clubSlug: 'arthouse',
        organizerEmail: 'amit.sharma@unisphere.edu',
        approvalStatus: 'pending',
        startOffsetDays: 24,
        durationHours: 3,
        location: { mode: 'offline', venue: 'Gallery Space', room: 'Hall C', meetingUrl: '' },
        capacityLimit: 80,
        waitlistEnabled: true,
        requiresApproval: true,
    },
];
const notificationTemplates = [
    {
        type: 'event_reminder',
        channel: 'in_app',
        title: 'Event Reminder: Full Stack Hackathon starts soon',
        message: 'Your registered event Full Stack Hackathon is starting soon. Check in with your QR code.',
    },
    {
        type: 'event_reminder',
        channel: 'email',
        title: 'Reminder: Sustainability Summit tomorrow',
        message: 'Don’t forget the Sustainability Summit taking place tomorrow in Conference Center, Room 210.',
    },
    {
        type: 'event_update',
        channel: 'in_app',
        title: 'Event Update: Start time changed for AI Research Forum',
        message: 'AI Research Forum now begins 30 minutes earlier. Please review the new schedule.',
    },
    {
        type: 'event_update',
        channel: 'email',
        title: 'Schedule Updated for Campus Film Festival',
        message: 'The Campus Film Festival screening hall has been updated to Media Hall Screen 2.',
    },
    {
        type: 'club_announcement',
        channel: 'in_app',
        title: 'New meetup posted by CodeCrafters',
        message: 'CodeCrafters has posted a new workshop event for web development enthusiasts.',
    },
    {
        type: 'club_announcement',
        channel: 'email',
        title: 'BizConnect has a new speaker session',
        message: 'Join BizConnect for an entrepreneurship speaker session next week.',
    },
    {
        type: 'system',
        channel: 'in_app',
        title: 'Profile update reminder',
        message: 'Keep your profile interests updated so we can recommend the best campus events for you.',
    },
    {
        type: 'system',
        channel: 'email',
        title: 'University app maintenance scheduled',
        message: 'The UniSphere platform will undergo maintenance on Sunday from 02:00 AM to 04:00 AM.',
    },
];
const ensureUser = async (sample) => {
    const passwordHash = await bcryptjs_1.default.hash(sample.password, 10);
    const existing = await User_1.User.findOne({ email: sample.email }).exec();
    if (existing) {
        return existing;
    }
    return User_1.User.create({
        universityId: sample.universityId,
        name: sample.name,
        email: sample.email,
        phone: sample.phone,
        passwordHash,
        roles: sample.roles,
        status: sample.status,
        profile: sample.profile,
        settings: sample.settings,
    });
};
const seedUsers = async () => {
    console.log('[seed] Seeding users...');
    const results = [];
    const existingAdmin = await User_1.User.findOne({ roles: 'admin', status: 'active' }).exec();
    if (existingAdmin) {
        results.push(existingAdmin);
    }
    else {
        results.push(await ensureUser(sampleAdmin));
    }
    const organizerDocs = await Promise.all(sampleOrganizers.map((organizer) => ensureUser(organizer)));
    results.push(...organizerDocs);
    const studentDocs = await Promise.all(sampleStudents.map((student) => ensureUser(student)));
    results.push(...studentDocs);
    return {
        admin: results.find((user) => user.roles.includes('admin')),
        organizers: organizerDocs,
        students: studentDocs,
    };
};
const seedClubs = async (allUsers) => {
    console.log('[seed] Seeding clubs...');
    const clubPromises = sampleClubs.map(async (club) => {
        const organizer = allUsers.find((user) => user.email === club.organizerEmail);
        if (!organizer) {
            throw new Error(`Missing organizer user for club ${club.name}`);
        }
        const members = club.memberEmails
            .map((email) => allUsers.find((user) => user.email === email))
            .filter((user) => Boolean(user))
            .map((user) => ({
            userId: user._id,
            role: 'member',
            joinedAt: new Date(),
            status: 'active',
        }));
        const existingClub = await Club_1.Club.findOne({ slug: club.slug }).exec();
        if (existingClub) {
            return existingClub;
        }
        return Club_1.Club.create({
            name: club.name,
            slug: club.slug,
            description: club.description,
            category: club.category,
            visibility: club.visibility,
            createdBy: organizer._id,
            members,
        });
    });
    return Promise.all(clubPromises);
};
const buildEventDate = (offsetDays) => {
    const date = new Date();
    date.setHours(10, 0, 0, 0);
    date.setTime(date.getTime() + offsetDays * MS_PER_DAY);
    return date;
};
const seedEvents = async (organizers, clubs) => {
    console.log('[seed] Seeding events...');
    const clubMap = new Map(clubs.map((club) => [club.slug, club]));
    const eventDocs = [];
    for (const event of sampleEvents) {
        const organizer = organizers.find((user) => user.email === event.organizerEmail);
        const coOrganizer = event.coOrganizerEmail
            ? organizers.find((user) => user.email === event.coOrganizerEmail)
            : undefined;
        const eventClub = event.clubSlug ? clubMap.get(event.clubSlug) : undefined;
        const titleFilter = { title: event.title };
        const startAt = buildEventDate(event.startOffsetDays);
        const endAt = new Date(startAt.getTime() + event.durationHours * 60 * 60 * 1000);
        const openAt = new Date(startAt.getTime() - 12 * MS_PER_DAY);
        const closeAt = new Date(startAt.getTime() - 1 * MS_PER_DAY);
        const existingEvent = await Event_1.Event.findOne(titleFilter).exec();
        if (existingEvent) {
            eventDocs.push(existingEvent);
            continue;
        }
        if (!organizer) {
            throw new Error(`Missing organizer user for event ${event.title}`);
        }
        const newEvent = await Event_1.Event.create({
            title: event.title,
            description: event.description,
            tags: event.tags,
            clubId: eventClub?._id,
            createdBy: organizer._id,
            organizers: [organizer._id, ...(coOrganizer ? [coOrganizer._id] : [])],
            approval: {
                status: event.approvalStatus,
            },
            schedule: {
                startAt,
                endAt,
                timezone: 'Asia/Kolkata',
            },
            location: event.location,
            capacity: {
                limit: event.capacityLimit,
                waitlistEnabled: event.waitlistEnabled,
            },
            registration: {
                openAt,
                closeAt,
                requiresApproval: event.requiresApproval,
            },
            qr: {
                checkInEnabled: true,
                secretVersion: 1,
            },
            analytics: {
                registeredCount: 0,
                checkedInCount: 0,
            },
        });
        eventDocs.push(newEvent);
    }
    return eventDocs;
};
const seedRegistrations = async (students, events) => {
    console.log('[seed] Seeding registrations...');
    const registrations = [];
    const registeredSet = new Set();
    const availableStudents = students;
    const availableEvents = events.filter((event) => event.approval.status === 'approved');
    if (availableEvents.length === 0) {
        throw new Error('No approved events found to register users.');
    }
    while (registrations.length < 50) {
        const student = availableStudents[registrations.length % availableStudents.length];
        const event = availableEvents[registrations.length % availableEvents.length];
        const key = `${event._id.toString()}_${student._id.toString()}`;
        if (registeredSet.has(key)) {
            continue;
        }
        registeredSet.add(key);
        const existingRegistration = await Registration_1.Registration.findOne({ eventId: event._id, userId: student._id }).exec();
        if (existingRegistration) {
            registrations.push(existingRegistration);
            continue;
        }
        const ticketHash = `qr-${event._id.toString().slice(-6)}-${student._id.toString().slice(-6)}`;
        const registration = await Registration_1.Registration.create({
            eventId: event._id,
            userId: student._id,
            status: 'registered',
            registeredAt: new Date(),
            ticket: {
                qrTokenHash: ticketHash,
                issuedAt: new Date(),
            },
            meta: {
                source: 'app',
            },
        });
        registrations.push(registration);
    }
    return registrations;
};
const seedAttendance = async (registrations) => {
    console.log('[seed] Seeding attendance records...');
    const attendanceRecords = [];
    const checkedInCount = Math.min(40, registrations.length);
    for (let index = 0; index < checkedInCount; index += 1) {
        const registration = registrations[index];
        const event = await Event_1.Event.findById(registration.eventId).exec();
        if (!event) {
            continue;
        }
        const existingAttendance = await Attendance_1.Attendance.findOne({ eventId: event._id, userId: registration.userId }).exec();
        if (existingAttendance) {
            attendanceRecords.push(existingAttendance);
            continue;
        }
        const checkedInAt = new Date(event.schedule.startAt.getTime() + (index % 5) * 5 * 60 * 1000);
        const attendance = await Attendance_1.Attendance.create({
            eventId: event._id,
            userId: registration.userId,
            registrationId: registration._id,
            checkIn: {
                status: index % 10 === 0 ? 'absent' : 'checked_in',
                checkedInAt,
                method: index % 8 === 0 ? 'manual' : 'qr',
            },
        });
        attendanceRecords.push(attendance);
    }
    return attendanceRecords;
};
const seedNotifications = async (users, events, clubs) => {
    console.log('[seed] Seeding notifications...');
    const notifications = [];
    const eventMap = new Map(events.map((event) => [event.title, event]));
    const clubMap = new Map(clubs.map((club) => [club.slug, club]));
    const userList = users;
    const now = new Date();
    for (let index = 0; notifications.length < 50; index += 1) {
        const template = notificationTemplates[index % notificationTemplates.length];
        const user = userList[index % userList.length];
        const scheduledFor = new Date(now.getTime() + (index % 7) * MS_PER_DAY);
        const title = `${template.title} - ${index + 1}`;
        const message = `${template.message}`;
        let data = undefined;
        if (template.type === 'event_reminder') {
            const event = eventMap.get('Full Stack Hackathon');
            if (event) {
                data = { eventId: event._id, eventTitle: event.title };
            }
        }
        else if (template.type === 'event_update') {
            const event = eventMap.get('Campus Film Festival');
            if (event) {
                data = { eventId: event._id, eventTitle: event.title };
            }
        }
        else if (template.type === 'club_announcement') {
            const club = clubMap.get('codecrafters');
            if (club) {
                data = { clubId: club._id };
            }
        }
        const filter = {
            userId: user._id,
            type: template.type,
            channel: template.channel,
            title,
        };
        const existingNotification = await Notification_1.Notification.findOne(filter).exec();
        if (existingNotification) {
            notifications.push(existingNotification);
            continue;
        }
        const notification = await Notification_1.Notification.create({
            userId: user._id,
            type: template.type,
            channel: template.channel,
            title,
            message,
            data,
            status: index % 5 === 0 ? 'read' : 'sent',
            scheduledFor,
        });
        notifications.push(notification);
    }
    return notifications;
};
const refreshEventAnalytics = async () => {
    console.log('[seed] Refreshing event analytics...');
    const registrationCounts = await Registration_1.Registration.aggregate([
        { $match: { status: 'registered' } },
        { $group: { _id: '$eventId', count: { $sum: 1 } } },
    ]).exec();
    for (const { _id, count } of registrationCounts) {
        await Event_1.Event.findByIdAndUpdate(_id, { 'analytics.registeredCount': count }).exec();
    }
    const attendanceCounts = await Attendance_1.Attendance.aggregate([
        { $group: { _id: '$eventId', count: { $sum: 1 } } },
    ]).exec();
    for (const { _id, count } of attendanceCounts) {
        await Event_1.Event.findByIdAndUpdate(_id, { 'analytics.checkedInCount': count }).exec();
    }
};
const seedDatabase = async () => {
    try {
        await (0, db_1.connectDB)();
        const { admin, organizers, students } = await seedUsers();
        const allUsers = [admin, ...organizers, ...students];
        const clubs = await seedClubs(allUsers);
        const events = await seedEvents(organizers, clubs);
        const registrations = await seedRegistrations(students, events);
        await seedAttendance(registrations);
        await seedNotifications(allUsers, events, clubs);
        await refreshEventAnalytics();
        console.log('[seed] Completed seeding database successfully.');
    }
    catch (error) {
        console.error('[seed] Error seeding database:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
};
seedDatabase();
