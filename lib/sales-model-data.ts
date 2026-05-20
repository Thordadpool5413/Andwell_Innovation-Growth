export type DcgcPhase = 'Discovery' | 'Connecting' | 'Guiding' | 'Commitment';

export type PhaseData = {
  key: DcgcPhase;
  icon: string;
  promise: string;
  purpose: string;
  fieldProof: string;
  skills: string[];
  fieldQuestions: string[];
  avoid: string[];
};

export const phases: PhaseData[] = [
  {
    key: 'Discovery',
    icon: 'search',
    promise: 'Understand before you guide.',
    purpose: 'Learn the referral source\'s workflow, patient patterns, referral pressure, family concerns, and decision barriers before offering support.',
    fieldProof: 'You can name the top need, current barrier, and a real patient or pattern using the referral source\'s own words.',
    skills: ['Ask open ended questions', 'Slow down and go deeper', 'Clarify patient pattern', 'Summarize before moving on'],
    fieldQuestions: [
      'What does a good hospice transition look like for your team?',
      'When does hospice usually come up here?',
      'Walk me through the last patient or family situation that felt difficult.',
      'What part of the hospice process creates the most friction?',
      'Which patient or family are you still thinking about after you leave for the day?',
      'What would make hospice feel more helpful and less disruptive?'
    ],
    avoid: ['Pitching before learning', 'Accepting vague answers', 'Leaving without a patient example', 'Asking five shallow questions instead of one deeper question']
  },
  {
    key: 'Connecting',
    icon: 'message',
    promise: 'Reflect before you redirect.',
    purpose: 'Build trust by naming the burden, reflecting what you heard, and showing that you understand the referral source\'s operational and emotional reality.',
    fieldProof: 'The referral source gives you more detail, clarifies the barrier, or begins telling you what support would actually help.',
    skills: ['Reflect with specificity', 'Name the burden without blame', 'Use plain language', 'Earn permission to guide'],
    fieldQuestions: [
      'What I am hearing is that timing and family readiness are the hard parts. Did I get that right?',
      'That makes sense. What part has been most frustrating for your team?',
      'It sounds like you are trying to protect the family while also making sure the patient has support.',
      'If hospice could solve one issue in cases like this, what would you want that to be?',
      'What would feel like the right kind of support instead of another handoff?',
      'Before I suggest anything, what would be most helpful for me to understand?'
    ],
    avoid: ['Over validating without detail', 'Jumping to a service list', 'Pretending to understand too quickly', 'Using sales language when the person needs empathy']
  },
  {
    key: 'Guiding',
    icon: 'target',
    promise: 'Match support to the stated need.',
    purpose: 'Recommend one or two hospice supports that directly solve the need shared, then confirm whether it fits the account workflow.',
    fieldProof: 'Your recommendation is narrow, relevant, operational, and the referral source confirms, corrects, or improves the plan.',
    skills: ['Use because you said language', 'Keep the solution narrow', 'Translate support into workflow value', 'Confirm fit'],
    fieldQuestions: [
      'Because you said families panic after discharge, hospice can help build a crisis plan before the transition. How would that fit your process?',
      'Because you said timing is the issue, would an information visit help the family understand options earlier?',
      'What would need to be true for that support to actually help your team?',
      'Where would hospice need to plug into your workflow so this feels smooth?',
      'What part of that recommendation would need to change to fit how your team works?',
      'What would success look like after hospice gets involved?'
    ],
    avoid: ['Listing every service', 'Assuming the solution fits', 'Talking longer than necessary', 'Guiding without tying back to Discovery']
  },
  {
    key: 'Commitment',
    icon: 'checkCircle',
    promise: 'Create clarity without pressure.',
    purpose: 'Move the conversation into a specific next step tied to a patient, family, decision maker, referral path, information visit, or follow up.',
    fieldProof: 'You leave with who, what, when, and how clearly defined, even if the next step is not an admission today.',
    skills: ['Ask open ended next step questions', 'Clarify owner and timing', 'Identify decision maker path', 'Confirm update plan'],
    fieldQuestions: [
      'What is the best way to start an information visit for this patient today?',
      'Who needs to be involved on your side to move this forward?',
      'When is the best time to meet or call the decision maker?',
      'What information should I have now so we can act quickly and correctly?',
      'How do you want updates after the visit so you have clarity?',
      'What is the next right step from your workflow?'
    ],
    avoid: ['Do you want hospice?', 'Can I call you next week?', 'Leaving with maybe', 'Ending without an owner, time, or next step']
  }
];

export type ObjectionEntry = {
  objection: string;
  meaning: string;
  response: string;
  returnQuestion: string;
};

export const objectionLibrary: ObjectionEntry[] = [
  { objection: 'Hospice feels too early.', meaning: 'Timing, readiness, understanding, or clinical trajectory may be unclear.', response: 'That makes sense. Tell me more about what makes it feel early right now.', returnQuestion: 'What would make it the right time to introduce support?' },
  { objection: 'The family is not ready.', meaning: 'The family may need education, emotional space, or a goals conversation.', response: 'I understand. Families often need time and clarity before making a decision like this.', returnQuestion: 'What has the family said they understand about what is happening?' },
  { objection: 'The physician will not agree.', meaning: 'Physician comfort, prognosis communication, or prior experience may be the barrier.', response: 'That is important to respect. It sounds like physician comfort is the key piece.', returnQuestion: 'What would the physician need to hear or see for this to feel appropriate?' },
  { objection: 'We already have a hospice provider.', meaning: 'The current relationship may be fine, but unmet needs may still exist.', response: 'I am not here to disrupt what is working.', returnQuestion: 'When hospice support works well here, what does that look like?' },
  { objection: 'The patient wants treatment.', meaning: 'Goals, tradeoffs, and understanding need more exploration.', response: 'I hear that, and it is important to respect what the patient wants.', returnQuestion: 'What has the patient said matters most right now?' },
  { objection: 'I do not want the family to think we are giving up.', meaning: 'Language and framing are the issue.', response: 'That concern makes sense. No one wants the family to feel abandoned.', returnQuestion: 'What language has worked best with this family?' },
  { objection: 'We are not there yet.', meaning: 'The trigger for hospice has not been defined.', response: 'That is helpful to know. I do not want to move faster than the situation calls for.', returnQuestion: 'What would tell you the patient or family is getting closer to needing more support?' },
  { objection: 'The family had a bad hospice experience before.', meaning: 'Trust must be rebuilt before any recommendation lands.', response: 'I would want to understand that before suggesting anything.', returnQuestion: 'What happened, and what would need to feel different this time?' }
];

export type ClinicalSignal = {
  id: string;
  label: string;
  help: string;
};

export const clinicalChecklist: ClinicalSignal[] = [
  { id: 'diagnosis', label: 'Primary diagnosis and trajectory', help: 'What changed recently? What decline is documented?' },
  { id: 'utilization', label: 'Recent hospitalizations or ER use', help: 'How often are they going to the hospital or needing urgent support?' },
  { id: 'decline', label: 'Functional decline', help: 'Intake, weight loss, falls, infections, wounds, ADLs, mobility.' },
  { id: 'symptoms', label: 'Current symptoms', help: 'Pain, dyspnea, agitation, weakness, anxiety, caregiver strain.' },
  { id: 'decision', label: 'Decision maker and goals', help: 'Who decides, what matters most, and what they are not willing to give up.' }
];

export function phaseForScore(score: number): DcgcPhase {
  if (score >= 80) return 'Commitment';
  if (score >= 60) return 'Guiding';
  if (score >= 40) return 'Connecting';
  return 'Discovery';
}

export function generateDiscoveryQuestions(competitorName: string): string[] {
  return [
    `What is your current experience with ${competitorName}?`,
    `When ${competitorName} comes up with a patient, what does the conversation usually look like?`,
    `How does ${competitorName} handle the transition process compared to what your team needs?`,
    `What part of the referral workflow creates the most friction with ${competitorName}?`
  ];
}
