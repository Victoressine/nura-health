// ==============================
// Types
// ==============================

export type EmergencyCheckResult = {
  isEmergency: boolean;
  category?: EmergencyCategory;
  response?: string;
};

type EmergencyCategory =
  | "breathing"
  | "chest_pain"
  | "stroke"
  | "unconsciousness"
  | "bleeding"
  | "allergic_reaction"
  | "seizure"
  | "self_harm";

// ==============================
// Emergency Patterns
//
// IMPORTANT:
// This is a conservative V1 safety
// layer. It is not a diagnostic or
// clinical triage engine.
// ==============================

const EMERGENCY_PATTERNS: Array<{
  category: EmergencyCategory;
  patterns: RegExp[];
}> = [
  // ==============================
  // Severe breathing problems
  // ==============================

  {
    category: "breathing",
    patterns: [
      /\b(can'?t|cannot|unable to)\s+breathe\b/i,
      /\b(severe|extreme)\s+(difficulty|trouble)\s+breathing\b/i,
      /\bstruggling to breathe\b/i,
      /\bgasping for (air|breath)\b/i,
      /\bchoking\b/i,
    ],
  },

  // ==============================
  // Severe chest pain
  // ==============================

  {
    category: "chest_pain",
    patterns: [
      /\b(severe|crushing|intense|heavy)\s+chest\s+pain\b/i,
      /\bchest\s+pain\s+(and|with)\s+(shortness of breath|difficulty breathing)\b/i,
      /\bpressure in (my|the) chest\b/i,
      /\bchest feels (crushed|heavy|tight)\b/i,
    ],
  },

  // ==============================
  // Possible stroke symptoms
  // ==============================

  {
    category: "stroke",
    patterns: [
      /\bface\s+(drooping|droop)\b/i,
      /\bsudden\s+(weakness|numbness)\s+on\s+(one|1)\s+side\b/i,
      /\b(one|1)\s+side\s+of\s+(my|the)\s+body\s+(is\s+)?(weak|numb)\b/i,
      /\bsudden\s+difficulty\s+speaking\b/i,
      /\bsudden\s+slurred\s+speech\b/i,
      /\b(can'?t|cannot)\s+speak\b/i,
    ],
  },

  // ==============================
  // Loss of consciousness
  // ==============================

  {
    category: "unconsciousness",
    patterns: [
      /\bunconscious\b/i,
      /\bnot\s+responding\b/i,
      /\bunresponsive\b/i,
      /\bwon'?t\s+wake\s+up\b/i,
      /\bnot\s+waking\s+up\b/i,
      /\bpassed\s+out\s+and\s+(won'?t|will not)\s+wake\b/i,
    ],
  },

  // ==============================
  // Severe bleeding
  // ==============================

  {
    category: "bleeding",
    patterns: [
      /\bheavy\s+bleeding\b/i,
      /\bsevere\s+bleeding\b/i,
      /\buncontrolled\s+bleeding\b/i,
      /\bbleeding\s+(won'?t|will not)\s+stop\b/i,
      /\blosing\s+a\s+lot\s+of\s+blood\b/i,
      /\bvomiting\s+blood\b/i,
      /\bcoughing\s+up\s+blood\b/i,
    ],
  },

  // ==============================
  // Severe allergic reaction
  // ==============================

  {
    category: "allergic_reaction",
    patterns: [
      /\b(throat|tongue|face|lips?)\s+(is\s+)?swelling\b/i,
      /\bswollen\s+(tongue|throat)\b/i,
      /\ballergic\s+reaction\s+(and|with)\s+(can'?t breathe|difficulty breathing|trouble breathing)\b/i,
      /\banaphylaxis\b/i,
      /\banaphylactic\s+(reaction|shock)\b/i,
    ],
  },

  // ==============================
  // Seizure
  // ==============================

  {
    category: "seizure",
    patterns: [
      /\bseizure\s+(won'?t|will not)\s+stop\b/i,
      /\bseizure\s+lasting\s+(more than|over)\b/i,
      /\brepeated\s+seizures\b/i,
      /\bmultiple\s+seizures\b/i,
    ],
  },

  // ==============================
  // Self-harm / suicide emergency
  // ==============================

  {
    category: "self_harm",
    patterns: [
      /\bi\s+want\s+to\s+kill\s+myself\b/i,
      /\bi'?m\s+going\s+to\s+kill\s+myself\b/i,
      /\bi\s+am\s+going\s+to\s+kill\s+myself\b/i,
      /\bi\s+want\s+to\s+end\s+my\s+life\b/i,
      /\bi\s+plan\s+to\s+kill\s+myself\b/i,
      /\bi\s+am\s+about\s+to\s+hurt\s+myself\b/i,
      /\bi'?m\s+about\s+to\s+hurt\s+myself\b/i,
    ],
  },
];

// ==============================
// Emergency Responses
// ==============================

const EMERGENCY_RESPONSES:
  Record<EmergencyCategory, string> = {
  breathing:
    "This could require urgent medical attention. Severe difficulty breathing can be an emergency. Please seek emergency medical care immediately or contact your local emergency service. If someone is with you, ask them to help you get urgent medical attention. Do not rely on Nura AI for this situation.",

  chest_pain:
    "Severe or crushing chest pain, especially with breathing difficulty, can require urgent medical attention. Please seek emergency medical care immediately or contact your local emergency service. Do not wait for an AI assessment.",

  stroke:
    "Sudden weakness or numbness on one side, facial drooping, or sudden difficulty speaking can require urgent emergency assessment. Please seek emergency medical care immediately or contact your local emergency service.",

  unconsciousness:
    "An unconscious or unresponsive person needs urgent medical attention. Please contact your local emergency service immediately and get help from someone nearby if possible.",

  bleeding:
    "Severe or uncontrolled bleeding can become life-threatening. Please seek emergency medical care immediately or contact your local emergency service. Do not rely on Nura AI for this situation.",

  allergic_reaction:
    "Difficulty breathing together with swelling of the throat, tongue, lips, or face may indicate a severe allergic reaction and needs urgent medical attention. Please contact your local emergency service immediately.",

  seizure:
    "A prolonged or repeated seizure can require emergency medical attention. Please contact your local emergency service immediately and get help from someone nearby.",

  self_harm:
    "I’m concerned that you may be in immediate danger. Please move away from anything you could use to hurt yourself and contact emergency medical services or a trusted person who can stay with you now. Nura AI should not be your only source of support in an immediate crisis.",
};

// ==============================
// Check Message for Emergency
// ==============================

export function checkForEmergency(
  message: string
): EmergencyCheckResult {
  const cleanMessage =
    message.trim();

  if (!cleanMessage) {
    return {
      isEmergency: false,
    };
  }

  for (
    const emergencyGroup
    of EMERGENCY_PATTERNS
  ) {
    const matched =
      emergencyGroup.patterns.some(
        (pattern) =>
          pattern.test(
            cleanMessage
          )
      );

    if (matched) {
      return {
        isEmergency: true,

        category:
          emergencyGroup.category,

        response:
          EMERGENCY_RESPONSES[
            emergencyGroup.category
          ],
      };
    }
  }

  return {
    isEmergency: false,
  };
}