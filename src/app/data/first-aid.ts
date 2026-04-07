export type SeverityLevel = 'critical' | 'serious' | 'moderate';

export interface InjuryStep {
  number: number;
  instruction: string;
  warning?: string;
}

export interface Injury {
  id: string;
  name: string;
  icon: string;
  severity: SeverityLevel;
  traumaLevel?: string;
  immediateSteps: InjuryStep[];
  dos: string[];
  donts: string[];
}

export const injuries: Injury[] = [
  // CRITICAL
  {
    id: 'head-injury',
    name: 'Head Injury',
    icon: 'brain',
    severity: 'critical',
    traumaLevel: 'Trauma Level 1 Required',
    immediateSteps: [
      {
        number: 1,
        instruction: 'Do not move the person unless there is immediate danger',
        warning: 'Moving may worsen spinal injuries'
      },
      {
        number: 2,
        instruction: 'Keep the person still and calm. Talk to them if conscious'
      },
      {
        number: 3,
        instruction: 'If bleeding, apply gentle pressure with a clean cloth. Do not remove it',
        warning: 'Do not press directly on skull fractures'
      },
      {
        number: 4,
        instruction: 'Keep airway clear — tilt head back slightly if unconscious and breathing'
      },
      {
        number: 5,
        instruction: 'Monitor breathing every 30 seconds until ambulance arrives'
      }
    ],
    dos: [
      'Keep person still',
      'Support head and neck',
      'Monitor breathing',
      'Stay with the person'
    ],
    donts: [
      'Move the person',
      'Give food or water',
      'Remove helmet',
      'Leave them alone'
    ]
  },
  {
    id: 'heavy-bleeding',
    name: 'Heavy Bleeding',
    icon: 'droplet',
    severity: 'critical',
    traumaLevel: 'Immediate Care Required',
    immediateSteps: [
      {
        number: 1,
        instruction: 'Apply direct pressure on the wound with a clean cloth or bandage',
        warning: 'Do not remove cloth even if soaked — add more on top'
      },
      {
        number: 2,
        instruction: 'Keep the injured area elevated above heart level if possible'
      },
      {
        number: 3,
        instruction: 'Keep applying firm, steady pressure for at least 10 minutes'
      },
      {
        number: 4,
        instruction: 'If bleeding continues, apply pressure to the artery above the wound'
      },
      {
        number: 5,
        instruction: 'Keep the person warm and lying down to prevent shock'
      }
    ],
    dos: [
      'Apply direct pressure',
      'Elevate the wound',
      'Keep person lying down',
      'Add more bandages on top'
    ],
    donts: [
      'Remove the first cloth',
      'Use a tourniquet unless trained',
      'Give anything to drink',
      'Peek at the wound'
    ]
  },
  {
    id: 'unconscious-person',
    name: 'Unconscious Person',
    icon: 'user-x',
    severity: 'critical',
    traumaLevel: 'Critical Emergency',
    immediateSteps: [
      {
        number: 1,
        instruction: 'Check if the person is breathing and has a pulse'
      },
      {
        number: 2,
        instruction: 'If not breathing, begin CPR immediately — 30 chest compressions, 2 breaths',
        warning: 'Push hard and fast in center of chest, 100-120 compressions per minute'
      },
      {
        number: 3,
        instruction: 'If breathing, place in recovery position (on their side) to keep airway open'
      },
      {
        number: 4,
        instruction: 'Loosen any tight clothing around neck and chest'
      },
      {
        number: 5,
        instruction: 'Do not leave them alone — monitor breathing constantly'
      }
    ],
    dos: [
      'Check breathing first',
      'Start CPR if needed',
      'Recovery position if breathing',
      'Monitor continuously'
    ],
    donts: [
      'Give food or water',
      'Slap or shake them',
      'Leave them on their back',
      'Put anything in their mouth'
    ]
  },
  {
    id: 'not-breathing-cpr',
    name: 'Not Breathing / CPR',
    icon: 'heart-pulse',
    severity: 'critical',
    traumaLevel: 'Cardiac Arrest Protocol',
    immediateSteps: [
      {
        number: 1,
        instruction: 'Place person on firm, flat surface. Tilt head back to open airway'
      },
      {
        number: 2,
        instruction: 'Give 30 chest compressions — push hard and fast in center of chest',
        warning: 'Push at least 2 inches deep, 100-120 compressions per minute'
      },
      {
        number: 3,
        instruction: 'Give 2 rescue breaths — pinch nose, seal mouth, blow until chest rises'
      },
      {
        number: 4,
        instruction: 'Continue cycle: 30 compressions, 2 breaths. Do not stop'
      },
      {
        number: 5,
        instruction: 'If available, use AED (automated external defibrillator) and follow voice prompts'
      }
    ],
    dos: [
      'Push hard and fast',
      'Continue until help arrives',
      'Use AED if available',
      'Keep compressions going'
    ],
    donts: [
      'Stop compressions',
      'Give up too early',
      'Worry about breaking ribs',
      'Delay starting CPR'
    ]
  },
  
  // SERIOUS
  {
    id: 'broken-bones',
    name: 'Broken Bones',
    icon: 'bone',
    severity: 'serious',
    traumaLevel: 'Orthopedic Emergency',
    immediateSteps: [
      {
        number: 1,
        instruction: 'Do not move the injured limb or person unless absolutely necessary'
      },
      {
        number: 2,
        instruction: 'Immobilize the broken bone using a splint or padding',
        warning: 'Splint it as it lies — do not try to straighten it'
      },
      {
        number: 3,
        instruction: 'Apply ice wrapped in cloth to reduce swelling (not directly on skin)'
      },
      {
        number: 4,
        instruction: 'If bone pierces skin, cover with sterile bandage without pushing it back'
      },
      {
        number: 5,
        instruction: 'Treat for shock — keep person warm and lying down'
      }
    ],
    dos: [
      'Immobilize the area',
      'Apply ice (wrapped)',
      'Keep person still',
      'Elevate if possible'
    ],
    donts: [
      'Try to straighten bone',
      'Move broken area',
      'Apply ice directly',
      'Push bone back in'
    ]
  },
  {
    id: 'spinal-injury',
    name: 'Spinal Injury',
    icon: 'accessibility',
    severity: 'serious',
    traumaLevel: 'Trauma Level 1 Required',
    immediateSteps: [
      {
        number: 1,
        instruction: 'Do not move the person at all unless there is immediate life-threatening danger',
        warning: 'Any movement can cause permanent paralysis'
      },
      {
        number: 2,
        instruction: 'Keep the head and neck completely still and in line with the body'
      },
      {
        number: 3,
        instruction: 'Place rolled towels or clothing on both sides of head to prevent movement'
      },
      {
        number: 4,
        instruction: 'If person must be moved, keep head, neck and back aligned as one unit'
      },
      {
        number: 5,
        instruction: 'Monitor breathing — be ready to perform CPR if needed'
      }
    ],
    dos: [
      'Keep person absolutely still',
      'Support head and neck',
      'Call 108 immediately',
      'Monitor breathing'
    ],
    donts: [
      'Move the person',
      'Twist the body',
      'Remove helmet/gear',
      'Let head move'
    ]
  },
  {
    id: 'burns',
    name: 'Burns',
    icon: 'flame',
    severity: 'serious',
    traumaLevel: 'Burn Unit Recommended',
    immediateSteps: [
      {
        number: 1,
        instruction: 'Remove person from heat source. Stop, drop, and roll if clothing is on fire'
      },
      {
        number: 2,
        instruction: 'Cool the burn with cool (not ice cold) running water for 10-20 minutes',
        warning: 'Do not use ice — it can cause more damage'
      },
      {
        number: 3,
        instruction: 'Remove jewelry and tight clothing before swelling starts'
      },
      {
        number: 4,
        instruction: 'Cover burn with sterile, non-stick bandage or clean cloth'
      },
      {
        number: 5,
        instruction: 'Do not break blisters. Keep person warm to prevent shock'
      }
    ],
    dos: [
      'Cool with running water',
      'Cover with clean cloth',
      'Remove jewelry early',
      'Seek medical help'
    ],
    donts: [
      'Use ice',
      'Apply butter/oil/creams',
      'Break blisters',
      'Use cotton directly'
    ]
  },
  {
    id: 'chest-pain',
    name: 'Chest Pain',
    icon: 'heart',
    severity: 'serious',
    traumaLevel: 'Cardiac Care Required',
    immediateSteps: [
      {
        number: 1,
        instruction: 'Help person sit down and rest in a comfortable position',
        warning: 'This could be a heart attack — every second counts'
      },
      {
        number: 2,
        instruction: 'Loosen tight clothing around neck and chest'
      },
      {
        number: 3,
        instruction: 'If person has prescribed nitroglycerin, help them take it'
      },
      {
        number: 4,
        instruction: 'Give aspirin if person is not allergic and conscious (helps thin blood)'
      },
      {
        number: 5,
        instruction: 'Monitor breathing. Be ready to perform CPR if they become unconscious'
      }
    ],
    dos: [
      'Help them rest',
      'Loosen clothing',
      'Give aspirin if safe',
      'Keep them calm'
    ],
    donts: [
      'Let them walk around',
      'Give food or water',
      'Leave them alone',
      'Delay calling 108'
    ]
  },
  
  // MODERATE
  {
    id: 'deep-cuts-wounds',
    name: 'Deep Cuts & Wounds',
    icon: 'bandage',
    severity: 'moderate',
    immediateSteps: [
      {
        number: 1,
        instruction: 'Wash your hands before treating the wound'
      },
      {
        number: 2,
        instruction: 'Apply direct pressure with clean cloth for 5-10 minutes to stop bleeding'
      },
      {
        number: 3,
        instruction: 'Clean wound gently with clean water (avoid hydrogen peroxide on deep cuts)'
      },
      {
        number: 4,
        instruction: 'Apply antibiotic ointment if available, then cover with sterile bandage'
      },
      {
        number: 5,
        instruction: 'Change bandage daily and watch for signs of infection (redness, pus, swelling)'
      }
    ],
    dos: [
      'Wash hands first',
      'Apply firm pressure',
      'Keep wound clean',
      'Change bandages daily'
    ],
    donts: [
      'Touch wound with dirty hands',
      'Remove embedded objects',
      'Use alcohol on deep cuts',
      'Ignore signs of infection'
    ]
  },
  {
    id: 'eye-injury',
    name: 'Eye Injury',
    icon: 'eye',
    severity: 'moderate',
    immediateSteps: [
      {
        number: 1,
        instruction: 'Do not rub or press on the injured eye',
        warning: 'Rubbing can cause permanent damage'
      },
      {
        number: 2,
        instruction: 'If chemicals in eye, flush with clean water for 15 minutes continuously'
      },
      {
        number: 3,
        instruction: 'If object in eye, do not try to remove it — cover both eyes with cloth'
      },
      {
        number: 4,
        instruction: 'For small particles, pull upper eyelid over lower lid to help flush it out'
      },
      {
        number: 5,
        instruction: 'Seek medical attention immediately for any serious eye injury'
      }
    ],
    dos: [
      'Flush with clean water',
      'Cover both eyes gently',
      'Blink naturally',
      'Seek medical help'
    ],
    donts: [
      'Rub the eye',
      'Remove embedded objects',
      'Use tweezers near eye',
      'Apply medication'
    ]
  },
  {
    id: 'shock',
    name: 'Shock',
    icon: 'activity',
    severity: 'moderate',
    immediateSteps: [
      {
        number: 1,
        instruction: 'Help person lie down with legs elevated about 12 inches (unless head/spine injury)'
      },
      {
        number: 2,
        instruction: 'Keep person warm with blanket or coat, but not overheated'
      },
      {
        number: 3,
        instruction: 'Do not give anything to eat or drink'
      },
      {
        number: 4,
        instruction: 'Turn head to side if vomiting to prevent choking'
      },
      {
        number: 5,
        instruction: 'Monitor breathing and pulse. Stay with person until help arrives'
      }
    ],
    dos: [
      'Lay person down',
      'Elevate legs',
      'Keep them warm',
      'Monitor vital signs'
    ],
    donts: [
      'Give food or water',
      'Move unnecessarily',
      'Leave them alone',
      'Let them get cold'
    ]
  },
  {
    id: 'choking',
    name: 'Choking',
    icon: 'wind',
    severity: 'moderate',
    immediateSteps: [
      {
        number: 1,
        instruction: 'Ask "Are you choking?" If they can speak or cough, encourage them to cough it out'
      },
      {
        number: 2,
        instruction: 'If they cannot breathe, stand behind them and give 5 back blows between shoulder blades',
        warning: 'Use heel of your hand with firm, sharp strikes'
      },
      {
        number: 3,
        instruction: 'Give 5 abdominal thrusts (Heimlich) — fist above navel, pull inward and upward'
      },
      {
        number: 4,
        instruction: 'Alternate between 5 back blows and 5 abdominal thrusts until object comes out'
      },
      {
        number: 5,
        instruction: 'If person becomes unconscious, lower to ground and begin CPR'
      }
    ],
    dos: [
      'Encourage coughing first',
      'Give back blows',
      'Perform Heimlich',
      'Start CPR if unconscious'
    ],
    donts: [
      'Slap their back gently',
      'Reach into mouth blindly',
      'Give water',
      'Stop if they pass out'
    ]
  }
];

export const getSeverityColor = (severity: SeverityLevel) => {
  switch (severity) {
    case 'critical':
      return '#D62828';
    case 'serious':
      return '#FFB703';
    case 'moderate':
      return '#06D6A0';
  }
};

export const getSeverityLabel = (severity: SeverityLevel) => {
  return severity.toUpperCase();
};

export const getInjuriesBySeverity = (severity: SeverityLevel) => {
  return injuries.filter(injury => injury.severity === severity);
};
