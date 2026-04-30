export const siteData = {
  gym: {
    name: 'Zone Interval Studio',
    tagline: 'Heart-Rate Training · Intervals · Performance',
    location: 'Austin, TX',
    address: '2205 S Lamar Blvd, Austin, TX 78704',
    phone: '(512) 555-0376',
    email: 'burn@zonestudio.com',
  },
  stats: [
    { value: '5', label: 'Heart-Rate Zones' },
    { value: '45', label: 'Min Per Class' },
    { value: '500+', label: 'Calories Burned' },
    { value: '36hr', label: 'Afterburn Effect' },
  ],
  zones: [
    { num: '1', name: 'Active Recovery', range: '50–60% MHR', color: '#4ECDC4', desc: 'Warm-up and cool-down. Steady breathing, minimal effort. Primes your cardiovascular system.' },
    { num: '2', name: 'Aerobic Base', range: '60–70% MHR', color: '#95E96A', desc: 'Building your engine. Fat-burning zone. You can hold a conversation — barely.' },
    { num: '3', name: 'Threshold', range: '70–80% MHR', color: '#FFD93D', desc: 'The sweet spot. Aerobic and anaerobic converge. Maximum sustainable effort.' },
    { num: '4', name: 'Lactate', range: '80–90% MHR', color: '#FF9A3C', desc: 'Pushing past comfortable. Lactic acid accumulates. Short bursts. Big results.' },
    { num: '5', name: 'Max Effort', range: '90–100% MHR', color: '#FF6B00', desc: 'Everything you have. 10–30 seconds. This is where transformation happens.' },
  ],
  classes: [
    { name: 'Zone 45', level: 'All Levels', duration: '45 min', desc: 'The signature class. HR monitor required. Guided through all 5 zones with treadmills and rowers.' },
    { name: 'Zone Express', level: 'All Levels', duration: '30 min', desc: 'A faster hit. High-intensity intervals with no zone 1 or 2. Perfect for lunch breaks or add-ons.' },
    { name: 'Strength Zone', level: 'Intermediate', duration: '45 min', desc: 'Interval training applied to resistance. Dumbbells, cables, TRX — all with HR tracking.' },
    { name: 'Zone Endurance', level: 'Advanced', duration: '60 min', desc: 'Long, sustained threshold work. Build your aerobic base while maintaining high output.' },
    { name: 'Zone Intro', level: 'Beginner', duration: '45 min', desc: 'Your first class. Coach-led orientation with HR monitor setup and personal zone calibration.' },
    { name: 'Zone Recovery', level: 'All Levels', duration: '30 min', desc: 'Active recovery in zone 1–2. Mobility, stretching, and slow cardio. The class you need the day after zone 5.' },
  ],
  pricing: [
    {
      name: 'Intro Pack',
      price: '$49',
      period: 'first 2 weeks',
      features: ['Unlimited classes', 'HR monitor rental', '1 coaching check-in', 'App access'],
      highlight: false,
    },
    {
      name: 'Unlimited',
      price: '$129',
      period: 'per month',
      features: ['All classes unlimited', 'Included HR monitor', 'Zone performance tracking', 'Monthly progress report', 'Guest pass (2/month)'],
      highlight: true,
    },
    {
      name: '8-Class Pack',
      price: '$119',
      period: 'use within 60 days',
      features: ['8 class credits', 'HR monitor rental included', 'Zone performance tracking', 'No expiry extensions'],
      highlight: false,
    },
  ],
};
