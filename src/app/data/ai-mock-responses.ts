// Scripted first-aid guidance used by the AI assistant (no API key required).
// Each guide is matched by keywords in the user's message.

export type Severity = 'critical' | 'urgent' | 'moderate';

export type StepIcon =
  | 'shield' | 'phone' | 'eye' | 'wind' | 'heart' | 'hand' | 'bandage'
  | 'bed' | 'clock' | 'droplet' | 'snowflake' | 'thermometer' | 'car' | 'brain';

export interface GuideStep {
  icon: StepIcon;
  title: string;
  detail: string;
}

export interface AIGuide {
  id: string;
  keywords: string[];
  title: string;
  summary: string;
  severity: Severity;
  call?: { number: string; label: string };
  steps: GuideStep[];
  avoid: string[];
  firstAidId?: string;
}

const CALL_108 = { number: '108', label: 'Call 108 — Ambulance' };

export const AI_GUIDES: AIGuide[] = [
  {
    id: 'not-breathing',
    keywords: ['not breathing', 'no breath', 'cpr', 'no pulse', 'cardiac arrest', 'stopped breathing', 'drown'],
    title: 'Not Breathing — Start CPR',
    summary: 'Every minute without CPR lowers survival by ~10%. Act now.',
    severity: 'critical',
    call: CALL_108,
    steps: [
      { icon: 'phone', title: 'Call 108 on speaker', detail: 'Keep the phone on speaker so the dispatcher can coach you.' },
      { icon: 'bed', title: 'Lay them flat on their back', detail: 'Firm, flat surface. Kneel beside their chest.' },
      { icon: 'heart', title: '30 hard, fast compressions', detail: 'Centre of chest, 5–6 cm deep, 100–120 per minute — to the beat of "Stayin\' Alive".' },
      { icon: 'wind', title: '2 rescue breaths, repeat', detail: 'Tilt head, lift chin, seal mouth. If untrained, do compressions only — don\'t stop.' },
    ],
    avoid: ['Don\'t stop compressions until help arrives or they breathe', 'Don\'t waste time checking pulse repeatedly'],
    firstAidId: 'not-breathing-cpr',
  },
  {
    id: 'unconscious',
    keywords: ['unconscious', 'not responding', 'unresponsive', 'fainted', 'passed out', 'collapsed'],
    title: 'Unconscious Person',
    summary: 'Protect the airway — it\'s the #1 risk for an unconscious victim.',
    severity: 'critical',
    call: CALL_108,
    steps: [
      { icon: 'shield', title: 'Make the scene safe', detail: 'Switch on hazard lights, watch for traffic before approaching.' },
      { icon: 'eye', title: 'Check response & breathing', detail: 'Tap shoulders, shout. Look for chest movement for 10 seconds.' },
      { icon: 'bed', title: 'Recovery position if breathing', detail: 'Roll onto their side, top knee bent, head tilted back to keep airway open.' },
      { icon: 'clock', title: 'Monitor until help arrives', detail: 'If breathing stops, start CPR immediately.' },
    ],
    avoid: ['Don\'t give food or water', 'Don\'t move them if a spine injury is likely — unless in danger'],
    firstAidId: 'unconscious-person',
  },
  {
    id: 'bleeding',
    keywords: ['bleed', 'blood', 'cut', 'wound', 'gash', 'laceration'],
    title: 'Heavy Bleeding',
    summary: 'Firm, direct pressure stops most bleeding within 10 minutes.',
    severity: 'critical',
    call: CALL_108,
    steps: [
      { icon: 'hand', title: 'Press hard on the wound', detail: 'Use a clean cloth, dupatta or shirt. Use your palm, push firmly.' },
      { icon: 'clock', title: 'Hold for 10 full minutes', detail: 'Don\'t lift to check. If blood soaks through, add more cloth on top.' },
      { icon: 'bandage', title: 'Bandage tightly', detail: 'Wrap firmly over the pad — tight, but fingers/toes should stay pink.' },
      { icon: 'bed', title: 'Lay them down, raise legs', detail: 'Helps prevent shock. Keep them warm and talking.' },
    ],
    avoid: ['Don\'t remove objects stuck in the wound', 'Don\'t remove soaked cloth — layer on top'],
    firstAidId: 'heavy-bleeding',
  },
  {
    id: 'fracture',
    keywords: ['broken', 'fracture', 'bone', 'sprain', 'dislocat', 'twisted'],
    title: 'Broken Bones',
    summary: 'Keep the injured part still — movement causes more damage.',
    severity: 'urgent',
    call: CALL_108,
    steps: [
      { icon: 'hand', title: 'Don\'t move the injured limb', detail: 'Support it in the position you found it.' },
      { icon: 'bandage', title: 'Splint with what you have', detail: 'Rolled newspaper, stick or cardboard — tie above and below the break.' },
      { icon: 'snowflake', title: 'Cold pack for swelling', detail: 'Ice wrapped in cloth, 20 minutes on, 20 off. Never ice directly on skin.' },
      { icon: 'eye', title: 'Watch for shock', detail: 'Pale, sweaty, fast breathing? Lay them down and keep them warm.' },
    ],
    avoid: ['Don\'t try to straighten the bone', 'Don\'t let them walk on a suspected leg fracture'],
    firstAidId: 'broken-bones',
  },
  {
    id: 'chest-pain',
    keywords: ['chest pain', 'heart attack', 'chest', 'left arm', 'heart'],
    title: 'Chest Pain',
    summary: 'Treat chest pain as a possible heart attack until proven otherwise.',
    severity: 'critical',
    call: CALL_108,
    steps: [
      { icon: 'phone', title: 'Call 108 immediately', detail: 'Say "possible heart attack" — it gets priority dispatch.' },
      { icon: 'bed', title: 'Sit them down, half-upright', detail: 'Lean against a wall or car, knees bent. Loosen tight clothing.' },
      { icon: 'heart', title: 'Aspirin if available', detail: '300 mg chewed slowly — only if not allergic and conscious.' },
      { icon: 'clock', title: 'Stay with them', detail: 'If they collapse and stop breathing, start CPR.' },
    ],
    avoid: ['Don\'t let them walk or exert themselves', 'Don\'t give anything else by mouth'],
  },
  {
    id: 'head-injury',
    keywords: ['head', 'concussion', 'skull', 'helmet', 'dizzy', 'vomit'],
    title: 'Head Injury',
    summary: 'Assume a neck injury too — keep the head and neck still.',
    severity: 'urgent',
    call: CALL_108,
    steps: [
      { icon: 'brain', title: 'Keep head & neck still', detail: 'Hold the head in line with the body. Don\'t remove a helmet unless they can\'t breathe.' },
      { icon: 'hand', title: 'Control any bleeding', detail: 'Gentle pressure with a cloth — not hard if the skull may be broken.' },
      { icon: 'eye', title: 'Watch for danger signs', detail: 'Vomiting, confusion, unequal pupils, drowsiness, fluid from ears/nose.' },
      { icon: 'clock', title: 'Keep them awake & talking', detail: 'Note the time of injury and any changes for the paramedics.' },
    ],
    avoid: ['Don\'t remove the helmet unnecessarily', 'Don\'t give painkillers or let them sleep unobserved'],
    firstAidId: 'head-injury',
  },
  {
    id: 'burns',
    keywords: ['burn', 'fire', 'scald', 'hot', 'flame', 'acid'],
    title: 'Burns',
    summary: 'Cool running water for 20 minutes is the most effective first aid.',
    severity: 'urgent',
    call: CALL_108,
    steps: [
      { icon: 'droplet', title: 'Cool with running water', detail: 'Cool (not ice-cold) water for 20 minutes.' },
      { icon: 'hand', title: 'Remove rings & tight items', detail: 'Before swelling starts — but not clothing stuck to the burn.' },
      { icon: 'bandage', title: 'Cover loosely', detail: 'Cling film or a clean, non-fluffy cloth.' },
      { icon: 'thermometer', title: 'Keep the person warm', detail: 'Cool the burn, not the person — prevent hypothermia.' },
    ],
    avoid: ['Don\'t apply ice, toothpaste, butter or oil', 'Don\'t burst blisters'],
    firstAidId: 'burns',
  },
];

export const GENERAL_GUIDE: AIGuide = {
  id: 'road-accident',
  keywords: [],
  title: 'Road Accident — First Response',
  summary: 'Follow these steps, then tell me more about the injuries for specific guidance.',
  severity: 'urgent',
  call: CALL_108,
  steps: [
    { icon: 'car', title: 'Secure the scene', detail: 'Hazard lights on, warning triangle 50 m behind. Switch off the engine.' },
    { icon: 'phone', title: 'Call 108 & share location', detail: 'Mention number of victims, landmarks and visible injuries.' },
    { icon: 'eye', title: 'Check every victim', detail: 'Responsive? Breathing? Bleeding? Help the quietest one first.' },
    { icon: 'shield', title: 'Don\'t move the injured', detail: 'Unless there\'s fire or traffic danger — spine injuries are common.' },
  ],
  avoid: ['Don\'t crowd the victim', 'Don\'t pull people out of vehicles unless in danger'],
};

export function matchGuide(text: string): AIGuide {
  const lower = text.toLowerCase();
  return AI_GUIDES.find(g => g.keywords.some(k => lower.includes(k))) ?? GENERAL_GUIDE;
}

// Short "thinking" phases shown while the response is prepared
export const THINKING_PHASES = ['Assessing situation', 'Checking severity', 'Preparing first-aid steps'];
