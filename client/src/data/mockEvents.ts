export interface DiscoverEvent {
  id: string;
  title: string;
  summary: string;
  date: string;
  location: string;
  category: string;
  capacity: number;
  imageUrl: string;
}

export const mockEvents: DiscoverEvent[] = [
  {
    id: 'event-1',
    title: 'Campus Innovation Summit',
    summary: 'A day of bold ideas, student-led panels, and startup showcases dedicated to campus innovation and entrepreneurship.',
    date: 'Oct 24 · 7:00 PM',
    location: 'Innovation Hall',
    category: 'Academic',
    capacity: 150,
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'event-2',
    title: 'Design Thinking Workshop',
    summary: 'Hands-on workshop that helps students build better projects through rapid prototyping and creative collaboration.',
    date: 'Oct 26 · 2:00 PM',
    location: 'Design Lab B',
    category: 'Workshop',
    capacity: 60,
    imageUrl: 'https://images.unsplash.com/photo-1557430525-2848d4c4a5de?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'event-3',
    title: 'Inter-Club Social Mixer',
    summary: 'Meet new friends across campus, join club conversations, and discover the student groups shaping campus culture.',
    date: 'Oct 28 · 6:30 PM',
    location: 'Student Union Lawn',
    category: 'Social',
    capacity: 200,
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'event-4',
    title: 'Championship Sports Night',
    summary: 'Cheer on the campus teams as they compete in a high-energy evening of finals, halftime activations, and team spirit.',
    date: 'Oct 30 · 5:30 PM',
    location: 'Main Sports Arena',
    category: 'Sports',
    capacity: 300,
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'event-5',
    title: 'AI Ethics Symposium',
    summary: 'A thoughtful panel discussion on AI in higher education, ethics in development, and the future of intelligent campus systems.',
    date: 'Nov 02 · 4:00 PM',
    location: 'Conference Hall 3',
    category: 'Academic',
    capacity: 120,
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
  },
];
