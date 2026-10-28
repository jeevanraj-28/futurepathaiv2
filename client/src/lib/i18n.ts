import { useSyncExternalStore } from 'react';

/**
 * Small English/Hindi layer for the screens families read together (report,
 * student home, parent portal). Headings, buttons and labels only; data from
 * the API stays in the language it was written in.
 */
export type Lang = 'en' | 'hi';

const KEY = 'futurepath_lang';

const STRINGS = {
  en: {
    language: 'Language',
    share_whatsapp: 'Share on WhatsApp',
    my_plan: 'My plan',
    full_report: 'Full report →',
    try_again: 'Try again',
    strong_fit: 'Strong fit',
    good_fit: 'Good fit',
    worth_exploring: 'Worth exploring',
    score: 'score {n}/100',

    report_stream: 'Recommended stream',
    report_also: 'Also worth considering',
    report_compare: 'Compare all streams →',
    report_how: 'How to read this',
    report_how_body: 'Fit bands compare you with yourself, not with other students. They’re a guide for discussion — never a guarantee.',
    report_how_link: 'How the test works →',
    report_feel: 'This doesn’t feel right?',
    report_strengths: 'What you’re naturally good at',
    report_strengths_body: 'Your three biggest strengths, in plain words. Everyone has a different mix — there’s no good or bad result.',
    report_useful: 'Useful for',
    report_growing: 'Still growing',
    report_growing_body: 'Very normal at your age. Small, regular practice makes a real difference — Dhruv can suggest how.',
    report_see_all: 'See all {n} areas',
    report_hide_all: 'Hide the full breakdown',
    report_careers: 'Careers that fit you',
    report_matches: '{n} matches',
    report_why: 'Why',
    report_work_on: 'To work on',
    report_salary: 'Typical salary',
    report_view: 'View career →',
    report_next: 'Your next steps',
    report_step: 'Step {n}',
    report_create_plan: 'Create my plan',
    report_ask: 'Ask Dhruv about my report',

    greet_morning: 'Good morning',
    greet_afternoon: 'Good afternoon',
    greet_evening: 'Good evening',
    dash_first_step: 'Your first step',
    dash_take_test: 'Take the 25-minute discovery test',
    dash_test_body: 'Your report shows the stream and careers that fit you, with the reasons for each.',
    dash_start_test: 'Start the test',
    dash_resume: 'Resume test',
    dash_continue: 'Continue your plan',
    dash_open_plan: 'Open my plan',
    dash_build_plan: 'Turn your report into a plan',
    dash_build_body: 'Pick one of your matches and get a 30-day, 90-day and 1-year plan.',
    dash_right_now: 'Right now',
    dash_tap: 'Tap a task to mark it done',
    dash_matches: 'Your top matches',
    dash_ask: 'Ask Dhruv',
    dash_saved_careers: 'Saved careers',
    dash_saved_colleges: 'Saved colleges',
    dash_profile: 'Profile strength',
    tasks_done: '{done} of {total} tasks done',
    dash_sub_plan: 'You’re {pct}% through your {career} plan.',
    dash_sub_report: 'Your report is ready. Next: turn it into a plan.',
    dash_sub_start: 'Let’s start with the discovery test.',
    dash_answered: 'You’ve answered {n} of 40 — keep going',
    dash_no_matches: 'No matches yet',
    dash_no_matches_body: 'Your career matches appear here after the discovery test.',

    parent_progress: '{name}’s progress',
    parent_plain: 'In plain words',
    parent_best_stream: '{name}’s best-fit stream is {stream}.',
    parent_strongest: 'Strongest areas',
    parent_questions: 'Good questions to ask {name}',
    parent_q1: 'Which subject do you lose track of time in?',
    parent_q2_career: 'Does the day-to-day work of {career} sound fun to you?',
    parent_q2: 'What kind of work sounds fun to you?',
    parent_q3: 'How do you feel about two years of entrance exam preparation?',
    parent_test: 'Discovery test',
    parent_plan: 'Plan',
    parent_profile: 'Profile',
    completed: 'Completed',
    not_yet: 'Not yet',
    not_started: 'Not started',
    profile_complete: '{n}% complete',
    parent_cost: 'Higher-education cost planner',
    parent_cost_sub: 'Estimates for the full degree. Change the options to compare.',
    parent_total: 'Total estimate',
    parent_counsellor: 'Talk to a counsellor',
    parent_privacy: 'Access and privacy',
    add_child: 'Add a child',
  },
  hi: {
    language: 'भाषा',
    share_whatsapp: 'WhatsApp पर भेजें',
    my_plan: 'मेरा प्लान',
    full_report: 'पूरी रिपोर्ट →',
    try_again: 'फिर से कोशिश करें',
    strong_fit: 'बहुत उपयुक्त',
    good_fit: 'उपयुक्त',
    worth_exploring: 'विचार करने योग्य',
    score: 'स्कोर {n}/100',

    report_stream: 'सुझाई गई स्ट्रीम',
    report_also: 'इन पर भी विचार करें',
    report_compare: 'सभी स्ट्रीम की तुलना करें →',
    report_how: 'इसे कैसे समझें',
    report_how_body: 'ये आकलन आपकी तुलना आपसे ही करते हैं, दूसरे छात्रों से नहीं। ये चर्चा के लिए मार्गदर्शन हैं — कोई गारंटी नहीं।',
    report_how_link: 'टेस्ट कैसे काम करता है →',
    report_feel: 'यह सही नहीं लग रहा?',
    report_strengths: 'आप किन चीज़ों में स्वाभाविक रूप से अच्छे हैं',
    report_strengths_body: 'आसान शब्दों में आपकी तीन सबसे बड़ी खूबियाँ। हर किसी का मेल अलग होता है — कोई नतीजा अच्छा या बुरा नहीं होता।',
    report_useful: 'इनमें काम आता है',
    report_growing: 'अभी विकसित हो रहा है',
    report_growing_body: 'आपकी उम्र में यह बिल्कुल सामान्य है। थोड़ा-थोड़ा नियमित अभ्यास बड़ा फ़र्क लाता है — ध्रुव इसमें मदद कर सकता है।',
    report_see_all: 'सभी {n} क्षेत्र देखें',
    report_hide_all: 'पूरा विवरण छिपाएँ',
    report_careers: 'आपके लिए उपयुक्त करियर',
    report_matches: '{n} करियर',
    report_why: 'क्यों',
    report_work_on: 'किस पर काम करें',
    report_salary: 'सामान्य वेतन',
    report_view: 'करियर देखें →',
    report_next: 'आपके अगले कदम',
    report_step: 'कदम {n}',
    report_create_plan: 'मेरा प्लान बनाएँ',
    report_ask: 'अपनी रिपोर्ट के बारे में ध्रुव से पूछें',

    greet_morning: 'सुप्रभात',
    greet_afternoon: 'नमस्ते',
    greet_evening: 'शुभ संध्या',
    dash_first_step: 'आपका पहला कदम',
    dash_take_test: '25 मिनट का डिस्कवरी टेस्ट दें',
    dash_test_body: 'आपकी रिपोर्ट बताएगी कि कौन-सी स्ट्रीम और करियर आपके लिए सही हैं, और क्यों।',
    dash_start_test: 'टेस्ट शुरू करें',
    dash_resume: 'टेस्ट जारी रखें',
    dash_continue: 'अपना प्लान जारी रखें',
    dash_open_plan: 'मेरा प्लान खोलें',
    dash_build_plan: 'अपनी रिपोर्ट को प्लान में बदलें',
    dash_build_body: 'अपने किसी उपयुक्त करियर को चुनें और 30 दिन, 90 दिन और 1 साल का प्लान पाएँ।',
    dash_right_now: 'अभी',
    dash_tap: 'काम पूरा होने पर उस पर टैप करें',
    dash_matches: 'आपके सबसे उपयुक्त करियर',
    dash_ask: 'ध्रुव से पूछें',
    dash_saved_careers: 'सहेजे गए करियर',
    dash_saved_colleges: 'सहेजे गए कॉलेज',
    dash_profile: 'प्रोफ़ाइल की मज़बूती',
    tasks_done: '{total} में से {done} काम पूरे',
    dash_sub_plan: 'आप अपने {career} प्लान का {pct}% पूरा कर चुके हैं।',
    dash_sub_report: 'आपकी रिपोर्ट तैयार है। अगला कदम: इसे प्लान में बदलें।',
    dash_sub_start: 'चलिए डिस्कवरी टेस्ट से शुरू करते हैं।',
    dash_answered: 'आपने 40 में से {n} सवालों के जवाब दे दिए हैं — जारी रखें',
    dash_no_matches: 'अभी कोई करियर नहीं',
    dash_no_matches_body: 'डिस्कवरी टेस्ट के बाद आपके उपयुक्त करियर यहाँ दिखेंगे।',

    parent_progress: '{name} की प्रगति',
    parent_plain: 'आसान शब्दों में',
    parent_best_stream: '{name} के लिए सबसे उपयुक्त स्ट्रीम {stream} है।',
    parent_strongest: 'सबसे मज़बूत क्षेत्र',
    parent_questions: '{name} से पूछने लायक अच्छे सवाल',
    parent_q1: 'किस विषय को पढ़ते समय तुम्हें समय का पता ही नहीं चलता?',
    parent_q2_career: '{career} का रोज़ का काम क्या तुम्हें मज़ेदार लगता है?',
    parent_q2: 'किस तरह का काम तुम्हें मज़ेदार लगता है?',
    parent_q3: 'दो साल की प्रवेश परीक्षा की तैयारी के बारे में तुम्हें कैसा लगता है?',
    parent_test: 'डिस्कवरी टेस्ट',
    parent_plan: 'प्लान',
    parent_profile: 'प्रोफ़ाइल',
    completed: 'पूरा हुआ',
    not_yet: 'अभी नहीं',
    not_started: 'शुरू नहीं हुआ',
    profile_complete: '{n}% पूरी',
    parent_cost: 'उच्च शिक्षा खर्च योजनाकार',
    parent_cost_sub: 'पूरी डिग्री का अनुमानित खर्च। तुलना के लिए विकल्प बदलें।',
    parent_total: 'कुल अनुमान',
    parent_counsellor: 'काउंसलर से बात करें',
    parent_privacy: 'पहुँच और गोपनीयता',
    add_child: 'बच्चा जोड़ें',
  },
} as const;

export type MessageKey = keyof typeof STRINGS.en;

const listeners = new Set<() => void>();

const readLang = (): Lang => {
  try {
    return localStorage.getItem(KEY) === 'hi' ? 'hi' : 'en';
  } catch {
    return 'en';
  }
};

export const setLang = (lang: Lang) => {
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    /* private mode: language still changes for this visit */
  }
  document.documentElement.lang = lang;
  listeners.forEach((l) => l());
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const translate = (lang: Lang, key: MessageKey, vars?: Record<string, string | number>) => {
  const text: string = STRINGS[lang][key] ?? STRINGS.en[key];
  return vars ? text.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? '')) : text;
};

/** Current language plus a translator; every component using it re-renders when the language changes. */
export const useT = () => {
  const lang = useSyncExternalStore(subscribe, readLang, () => 'en' as Lang);
  return {
    lang,
    setLang,
    t: (key: MessageKey, vars?: Record<string, string | number>) => translate(lang, key, vars),
  };
};

/** Translation key for a fit band label produced by `fitBand()`. */
export const bandKey = (label: string): MessageKey =>
  label === 'Strong fit' ? 'strong_fit' : label === 'Good fit' ? 'good_fit' : 'worth_exploring';
