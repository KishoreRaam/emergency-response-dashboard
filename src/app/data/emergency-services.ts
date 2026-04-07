export type ServiceType = 'hospital' | 'police' | 'ambulance' | 'towing' | 'puncture';

export interface EmergencyService {
  id: string;
  name: string;
  type: ServiceType;
  location: {
    lat: number;
    lng: number;
  };
  /** Computed dynamically at runtime via haversineDistance — do not set statically. */
  distance: number;
  address: string;
  phone: string;
  traumaLevel?: 1 | 2 | 3;
  verified: boolean;
  available24x7: boolean;
  beds?: number;
}

// NOTE: userLocation has been removed — real GPS is obtained in home.tsx via
// navigator.geolocation.getCurrentPosition with a 5-second Chennai fallback.

export const emergencyServices: EmergencyService[] = [
  // ── Hospitals ──────────────────────────────────────────────────────────────
  {
    id: 'h1',
    name: 'Government Stanley Hospital',
    type: 'hospital',
    location: { lat: 13.0878, lng: 80.2785 },
    distance: 0, // computed at runtime
    address: 'Old Jail Rd, Royapuram, Chennai',
    phone: '+914425281351',
    traumaLevel: 1,
    verified: true,
    available24x7: true,
    beds: 850,
  },
  {
    id: 'h2',
    name: 'Apollo Hospitals',
    type: 'hospital',
    location: { lat: 13.0358, lng: 80.2464 },
    distance: 0,
    address: 'Greams Road, Chennai',
    phone: '+914428293333',
    traumaLevel: 1,
    verified: true,
    available24x7: true,
    beds: 500,
  },
  {
    id: 'h3',
    name: 'Fortis Malar Hospital',
    type: 'hospital',
    location: { lat: 13.0609, lng: 80.2497 },
    distance: 0,
    address: 'Adyar, Chennai',
    phone: '+914442892222',
    traumaLevel: 2,
    verified: true,
    available24x7: true,
    beds: 180,
  },
  {
    id: 'h4',
    name: 'Rajiv Gandhi Government General Hospital',
    type: 'hospital',
    location: { lat: 13.0933, lng: 80.2619 },
    distance: 0,
    address: 'Park Town, Chennai',
    phone: '+914425305000',
    traumaLevel: 1,
    verified: true,
    available24x7: true,
    beds: 2200,
  },
  {
    id: 'h5',
    name: 'Sri Ramachandra Medical Centre',
    type: 'hospital',
    location: { lat: 13.0270, lng: 80.1951 },
    distance: 0,
    address: 'Porur, Chennai',
    phone: '+914445928000',
    traumaLevel: 2,
    verified: true,
    available24x7: true,
    beds: 1250,
  },

  // ── Police Stations ────────────────────────────────────────────────────────
  {
    id: 'p1',
    name: 'Anna Nagar Police Station',
    type: 'police',
    location: { lat: 13.0850, lng: 80.2101 },
    distance: 0,
    address: 'Anna Nagar West, Chennai',
    phone: '+914426162000',
    verified: true,
    available24x7: true,
  },
  {
    id: 'p2',
    name: 'Kilpauk Police Station',
    type: 'police',
    location: { lat: 13.0758, lng: 80.2383 },
    distance: 0,
    address: 'Kilpauk, Chennai',
    phone: '+914426441000',
    verified: true,
    available24x7: true,
  },
  {
    id: 'p3',
    name: 'Aminjikarai Police Station',
    type: 'police',
    location: { lat: 13.0693, lng: 80.2181 },
    distance: 0,
    address: 'Aminjikarai, Chennai',
    phone: '+914423742200',
    verified: true,
    available24x7: true,
  },

  // ── Ambulance Services ─────────────────────────────────────────────────────
  {
    id: 'a1',
    name: '108 Emergency Ambulance',
    type: 'ambulance',
    location: { lat: 13.0820, lng: 80.2150 },
    distance: 0,
    address: 'Anna Nagar, Chennai',
    phone: '108',
    verified: true,
    available24x7: true,
  },
  {
    id: 'a2',
    name: 'Ziqitza Health Care (ZHL)',
    type: 'ambulance',
    location: { lat: 13.0765, lng: 80.2290 },
    distance: 0,
    address: 'Chetpet, Chennai',
    phone: '+914445454545',
    verified: true,
    available24x7: true,
  },
  {
    id: 'a3',
    name: 'MedCab Ambulance',
    type: 'ambulance',
    location: { lat: 13.0512, lng: 80.2421 },
    distance: 0,
    address: 'T. Nagar, Chennai',
    phone: '+914428341234',
    verified: true,
    available24x7: true,
  },

  // ── Towing Services ────────────────────────────────────────────────────────
  {
    id: 't1',
    name: 'Chennai Towing Service',
    type: 'towing',
    location: { lat: 13.0890, lng: 80.2180 },
    distance: 0,
    address: 'Anna Nagar East, Chennai',
    phone: '+914426262626',
    verified: true,
    available24x7: true,
  },
  {
    id: 't2',
    name: 'Quick Tow Chennai',
    type: 'towing',
    location: { lat: 13.0655, lng: 80.2095 },
    distance: 0,
    address: 'Shenoy Nagar, Chennai',
    phone: '+914428282828',
    verified: true,
    available24x7: true,
  },

  // ── Puncture / Mechanic Services ───────────────────────────────────────────
  {
    id: 'pt1',
    name: 'Apollo Tyres Puncture Service',
    type: 'puncture',
    location: { lat: 13.0825, lng: 80.2050 },
    distance: 0,
    address: 'Anna Nagar West, Chennai',
    phone: '+914428193001',
    verified: true,
    available24x7: true,
  },
  {
    id: 'pt2',
    name: 'Sri Murugan Puncture Shop',
    type: 'puncture',
    location: { lat: 13.0780, lng: 80.2135 },
    distance: 0,
    address: 'Thirumangalam, Chennai',
    phone: '+914424747474',
    verified: true,
    available24x7: true,
  },
];

export const emergencyNumbers = [
  { name: 'Emergency', number: '112', description: 'All emergencies' },
  { name: 'Police', number: '100', description: 'Police control room' },
  { name: 'Fire', number: '101', description: 'Fire & rescue' },
  { name: 'Ambulance', number: '108', description: 'Medical emergency' },
];

export const quickPrompts = [
  'Unconscious person',
  'Heavy bleeding',
  'Broken bones',
  'Not breathing',
  'Chest pain',
  'Head injury',
];
