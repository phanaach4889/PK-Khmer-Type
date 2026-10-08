/* ============================================================
   PK Khmer Type — Interactive First-Time User Tutorial Engine
   ============================================================
   Provides a step-by-step interactive onboarding experience
   that teaches new learners how to navigate lessons, type
   their first practice characters, and utilize the practice
   telemetry and quick guide.
   ============================================================ */

(function(global){
  'use strict';

  const LS_COMPLETED = 'khmerTutorialCompleted';
  const LS_SKIPPED = 'khmerTutorialSkipped';
  const LS_SAVED_STEP = 'khmerTutorialStep';

  const I18N = {
    en: {
      welcomeTitle: 'Welcome to PK Khmer Type',
      welcomeSubtitle: "Learn to type Khmer step by step. We'll guide you through your first lesson.",
      startLearning: 'Start Learning',
      skipTutorial: 'Skip Tutorial',
      step: 'Step',
      of: 'of',
      next: 'Next',
      back: 'Back',
      continue: 'Continue',
      close: 'Close',
      skip: 'Skip Tutorial',
      practiceMore: 'Practice More',
      continueTutorial: 'Continue Tutorial',
      startDrill: 'Start Practicing!',

      step1Title: 'Step 1 — Find your lessons',
      step1Desc: 'Your lessons are here. Start with the first unlocked lesson and work your way forward.',

      step2Title: 'Step 2 — Start with your first lesson',
      step2Desc: 'Choose this lesson to learn your first keys. Follow the practice instructions and type the characters shown on screen.',

      step3aTitle: 'Look at the target',
      step3aDesc: 'Type the characters shown here.',

      step3bTitle: 'Find the key',
      step3bDesc: 'Use the keyboard guide to help you find the correct key.',

      step3cTitle: 'Start typing',
      step3cDesc: 'Try typing the displayed characters. You can make mistakes while learning.',

      step3dTitle: 'Track your progress',
      step3dDesc: 'Your progress updates as you practice.',

      pillActive: 'Onboarding active: complete this lesson to continue',
      pillPause: 'Pause',

      firstDoneTitle: 'First lesson completed!',
      firstDoneDesc: "Nice work. You've learned how a lesson works. Let's see how you can use the practice guide and studio controls.",

      stepQuickTitle: 'Step 3 — Your practice guide',
      stepQuickDesc: 'This panel helps you understand your progress, find the right finger positions, and practice keys that need more attention.',

      radarTitle: 'Practice Radar',
      radarDesc: 'Shows your current practice activity, active lesson status, and session progress.',

      wpmTitle: 'WPM and Accuracy',
      wpmDesc: 'WPM measures typing speed, and Accuracy measures how correctly you type.',

      fingerTitle: 'Home Row & Finger Guide',
      fingerDesc: 'Shows which finger should press each key and where to rest your hands.',

      weakTitle: 'Weak Keys to Watch',
      weakDesc: 'Automatically spots keys you miss often so you can drill them with 1 click.',

      subscriptsTitle: 'Subscripts & Rules',
      subscriptsDesc: 'Consult this section when learning Khmer typing rules, Coeng subscripts, and punctuation.',

      stepCmdTitle: 'Step 4 — Studio Command Bar',
      stepCmdDesc: 'Your top-right command dock gives you instant access to Focus Mode, Guide, Shortcuts, Khmer Translation, Statistics, Settings, and Account Sync.',

      cmdFocusTitle: 'Focus Mode (Alt+F) & Quick Guide',
      cmdFocusDesc: 'Press Alt+F or click Focus to hide surrounding panels for distraction-free typing, or toggle the Quick Guide sidebar anytime.',

      cmdLangTitle: 'Shortcuts (?) & Translate to Khmer (Alt+L)',
      cmdLangDesc: 'Open the full keyboard shortcuts reference with ? or switch the entire studio interface between English and Khmer with Alt+L.',

      cmdStatsTitle: 'Statistics, Settings & Cloud Profile',
      cmdStatsDesc: 'Inspect your 60-day WPM & accuracy analytics, customize mechanical switch sounds, themes, and 4K wallpapers, or sign in to sync progress.',

      finishTitle: "You're ready to learn Khmer typing!",
      finishSubtitle: 'Here is your suggested learning path:',
      path1: 'Complete the next available lesson.',
      path2: 'Practice until you become comfortable with the keys.',
      path3: 'Check the Quick Guide when you need help.',
      path4: 'Use Adaptive Practice and Studio Controls to customize your training.',
      startNextLesson: 'Start Next Lesson',
      exploreAlone: 'Explore on My Own',
      guideFeature: 'Guide Feature'
    },
    km: {
      welcomeTitle: 'សូមស្វាគមន៍មកកាន់ PK Khmer Type',
      welcomeSubtitle: 'រៀនវាយអក្សរខ្មែរមួយជំហានម្តងៗ។ យើងខ្ញុំនឹងណែនាំអ្នកតាមរយៈមេរៀនដំបូង។',
      startLearning: 'ចាប់ផ្តើមរៀន',
      skipTutorial: 'រំលងការណែនាំ',
      step: 'ជំហាន',
      of: 'នៃ',
      next: 'បន្ទាប់',
      back: 'ថយក្រោយ',
      continue: 'បន្ត',
      close: 'បិទ',
      skip: 'រំលងការណែនាំ',
      practiceMore: 'ហ្វឹកហាត់បន្ថែម',
      continueTutorial: 'បន្តការណែនាំ',
      startDrill: 'ចាប់ផ្តើមហាត់!',

      step1Title: 'ជំហានទី ១ — ស្វែងរកមេរៀនរបស់អ្នក',
      step1Desc: 'មេរៀនរបស់អ្នកស្ថិតនៅទីនេះ។ ចាប់ផ្តើមពីមេរៀនដំបូងដែលបានដោះសោ ហើយបន្តដំណើរទៅមុខ។',

      step2Title: 'ជំហានទី ២ — ចាប់ផ្តើមមេរៀនដំបូង',
      step2Desc: 'ជ្រើសរើសមេរៀននេះដើម្បីរៀនគ្រាប់ចុចដំបូង។ ធ្វើតាមការណែនាំ ហើយវាយតួអក្សរដែលបង្ហាញនៅលើអេក្រង់។',

      step3aTitle: 'មើលតួអក្សរគោលដៅ',
      step3aDesc: 'វាយតួអក្សរដែលបានបង្ហាញនៅទីនេះ។',

      step3bTitle: 'ស្វែងរកគ្រាប់ចុច',
      step3bDesc: 'ប្រើមគ្គុទ្ទេសក៍ក្តារចុចដើម្បីជួយអ្នករកគ្រាប់ចុចដែលត្រូវចុច។',

      step3cTitle: 'ចាប់ផ្តើមវាយអក្សរ',
      step3cDesc: 'សាកល្បងវាយតួអក្សរដែលបានបង្ហាញ។ អ្នកអាចវាយខុសក្នុងពេលរៀនបានដោយមិនបារម្ភ។',

      step3dTitle: 'តាមដានវឌ្ឍនភាពរបស់អ្នក',
      step3dDesc: 'វឌ្ឍនភាពរបស់អ្នកនឹងកើនឡើងនៅពេលអ្នកវាយ។',

      pillActive: 'ការណែនាំកំពុងដំណើរការ៖ បញ្ចប់មេរៀននេះដើម្បីបន្ត',
      pillPause: 'ផ្អាក',

      firstDoneTitle: 'មេរៀនដំបូងត្រូវបានបញ្ចប់!',
      firstDoneDesc: 'ធ្វើបានល្អណាស់! អ្នកបានយល់ពីដំណើរការនៃមេរៀនហើយ។ តោះទៅមើលពីរបៀបប្រើប្រាស់មគ្គុទ្ទេសក៍ហ្វឹកហាត់ និងរបារបញ្ជាស្ទូឌីយោ។',

      stepQuickTitle: 'ជំហានទី ៣ — មគ្គុទ្ទេសក៍ហ្វឹកហាត់របស់អ្នក',
      stepQuickDesc: 'ផ្ទាំងនេះជួយអ្នកតាមដានវឌ្ឍនភាព រកទីតាំងម្រាមដៃត្រឹមត្រូវ និងហ្វឹកហាត់គ្រាប់ចុចដែលត្រូវការការយកចិត្តទុកដាក់។',

      radarTitle: 'រ៉ាដាហ្វឹកហាត់',
      radarDesc: 'បង្ហាញសកម្មភាពហ្វឹកហាត់បច្ចុប្បន្ន ស្ថានភាពមេរៀនសកម្ម និងវឌ្ឍនភាពនៃវគ្គ។',

      wpmTitle: 'ល្បឿន WPM & ភាពត្រឹមត្រូវ',
      wpmDesc: 'WPM វាស់ល្បឿននៃការវាយអក្សរ ហើយ Accuracy វាស់កម្រិតភាពត្រឹមត្រូវនៃគ្រាប់ចុច។',

      fingerTitle: 'ទីតាំងគ្រាប់ចុចដើម & ការណែនាំម្រាម',
      fingerDesc: 'បង្ហាញម្រាមដៃដែលត្រូវចុចលើគ្រាប់ចុចនីមួយៗ និងកន្លែងសម្រាកដៃ។',

      weakTitle: 'គ្រាប់ចុចដែលខ្សោយ',
      weakDesc: 'កត់សម្គាល់គ្រាប់ចុចដែលអ្នកឧស្សាហ៍វាយខុសដោយស្វ័យប្រវត្តិ ដើម្បីហាត់កែប្រែដោយចុចតែម្តង។',

      subscriptsTitle: 'ជើងអក្សរ & ក្បួនប្លង់',
      subscriptsDesc: 'ពិគ្រោះផ្នែកនេះនៅពេលរៀនក្បួនវាយជើងអក្សរខ្មែរ និងសញ្ញាផ្សេងៗ។',

      stepCmdTitle: 'ជំហានទី ៤ — របារបញ្ជាស្ទូឌីយោ',
      stepCmdDesc: 'របារបញ្ជានៅជ្រុងខាងលើស្តាំផ្តល់ឱ្យអ្នកនូវការចូលប្រើភ្លាមៗទៅកាន់ Focus Mode, Guide, Shortcuts, ការបកប្រែភាសាខ្មែរ, ស្ថិតិ, ការកំណត់ និងគណនី។',

      cmdFocusTitle: 'មុខងារផ្ដោតអារម្មណ៍ (Alt+F) & ណែនាំ',
      cmdFocusDesc: 'ចុច Alt+F ឬប៊ូតុង Focus ដើម្បីលាក់ផ្ទាំងជុំវិញសម្រាប់ការវាយអក្សរដោយគ្មានការរំខាន ឬបិទ/បើករបារ Quick Guide គ្រប់ពេល។',

      cmdLangTitle: 'ផ្លូវកាត់ (?) & បកប្រែជាភាសាខ្មែរ (Alt+L)',
      cmdLangDesc: 'បើកតារាងផ្លូវកាត់ក្តារចុចដោយចុច ? ឬប្តូរភាសាកម្មវិធីទាំងមូលរវាងភាសាអង់គ្លេស និងភាសាខ្មែរដោយចុច Alt+L។',

      cmdStatsTitle: 'ស្ថិតិ ការកំណត់ & គណនី',
      cmdStatsDesc: 'ពិនិត្យមើលស្ថិតិ WPM និងភាពត្រឹមត្រូវ ៦០ ថ្ងៃ កែសម្រួលសំឡេងគ្រាប់ចុច រចនាប័ទ្ម និងផ្ទាំងរូបភាព 4K ឬចូលគណនីដើម្បីរក្សាទុកទិន្នន័យ។',

      finishTitle: 'អ្នកបានត្រៀមខ្លួនរួចរាល់ដើម្បីរៀនវាយអក្សរខ្មែរហើយ!',
      finishSubtitle: 'នេះជាគន្លងសិក្សាដែលបានណែនាំសម្រាប់អ្នក៖',
      path1: 'បញ្ចប់មេរៀនបន្ទាប់ដែលអាចចូលរៀនបាន។',
      path2: 'ហាត់រហូតដល់អ្នកមានអារម្មណ៍ស្ទាត់ជាមួយគ្រាប់ចុច។',
      path3: 'ពិនិត្យមើល Quick Guide នៅពេលអ្នកត្រូវការជំនួយ។',
      path4: 'ប្រើ Adaptive Practice និងរបារបញ្ជាស្ទូឌីយោដើម្បីកែសម្រួលការហ្វឹកហាត់។',
      startNextLesson: 'ចាប់ផ្តើមមេរៀនបន្ទាប់',
      exploreAlone: 'ស្វែងយល់ដោយខ្លួនឯង',
      guideFeature: 'មុខងារមគ្គុទ្ទេសក៍'
    }
  };

  const TUT_ICONS = {
    lessons: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2.5"/><line x1="6" y1="8" x2="6.01" y2="8"/><line x1="10" y1="8" x2="10.01" y2="8"/><line x1="14" y1="8" x2="14.01" y2="8"/><line x1="18" y1="8" x2="18.01" y2="8"/><line x1="7" y1="16" x2="17" y2="16"/></svg>',
    typing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',
    progress: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    guide: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    radar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 12l4.5-4.5"/><circle cx="12" cy="12" r="3"/></svg>',
    wpm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    fingers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>',
    weak: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    rules: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    cmdbar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M6 9h3"/><path d="M11 9h3"/><path d="M16 9h2"/><path d="M6 15h12"/></svg>',
    focus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    stats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1.51-1V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
    crown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
  };

  class PKTutorialEngine {
    constructor(){
      this.active = false;
      this.currentStepKey = null;
      this.currentStepIdx = 0;
      this.highlightEl = null;
      this.isWaitingForLessonComplete = false;
      this.elementsCreated = false;
      this.currentModalMode = null;
      this.rafId = null;

      this.boundOnResize = this.onViewportChange.bind(this);
      this.boundOnKeyDown = this.onKeyDown.bind(this);
      this.boundOnLessonComplete = this.handleLessonCompleted.bind(this);
    }

    t(key){
      const isKm = document.documentElement.classList.contains('site-km-mode');
      const lang = isKm ? 'km' : 'en';
      return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || '';
    }

    isNewUser(){
      try {
        if(localStorage.getItem(LS_COMPLETED) === '1') return false;
        if(localStorage.getItem(LS_SKIPPED) === '1') return false;

        // Check if user already has saved lesson progress or stats
        if(typeof getLessonBest === 'function' && typeof LESSONS !== 'undefined' && Array.isArray(LESSONS)){
          const hasMastered = LESSONS.some(l => {
            const b = getLessonBest(l.id);
            return b && (b.attempts > 0 || b.mastered);
          });
          if(hasMastered) return false;
        }

        if(typeof savedLessonStats !== 'undefined' && savedLessonStats && savedLessonStats.keys > 30){
          return false;
        }

        return true;
      } catch(e){
        return false;
      }
    }

    init(){
      this.ensureDOM();
      window.addEventListener('pkLessonCompleted', this.boundOnLessonComplete);

      // Check if tutorial was in progress or is a new user
      const savedStep = localStorage.getItem(LS_SAVED_STEP);
      if(savedStep && localStorage.getItem(LS_COMPLETED) !== '1' && localStorage.getItem(LS_SKIPPED) !== '1'){
        setTimeout(() => this.resume(savedStep), 500);
      } else if(this.isNewUser()){
        setTimeout(() => this.showWelcome(), 600);
      }
    }

    ensureDOM(){
      if(this.elementsCreated) return;
      this.elementsCreated = true;

      // Create tutorial container
      const wrap = document.createElement('div');
      wrap.id = 'pkTutorialOverlay';
      wrap.className = 'pk-tutorial-overlay';
      wrap.hidden = true;

      wrap.innerHTML = `
        <svg class="pk-tutorial-mask-svg" width="100%" height="100%" aria-hidden="true">
          <defs>
            <mask id="pkTutorialMask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect id="pkSpotlightHole" x="0" y="0" width="0" height="0" rx="12" ry="12" fill="black" />
            </mask>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="rgba(6, 9, 18, 0.78)" mask="url(#pkTutorialMask)" />
        </svg>

        <div id="pkSpotlightFrame" class="pk-spotlight-frame hidden-frame" aria-hidden="true"></div>

        <div id="pkTutorialTooltip" class="pk-tutorial-tooltip" role="dialog" aria-modal="true" aria-labelledby="pkTutTitle">
          <div class="pk-tutorial-tooltip-header">
            <span class="pk-tutorial-step-badge" id="pkTutStepBadge">Step 1 of 4</span>
            <div class="pk-tut-tooltip-header-actions">
              <button type="button" class="pk-tut-tooltip-lang-btn" id="pkTutTooltipLangBtn" aria-label="Translate tutorial language" title="Translate English ⇄ Khmer (Alt+L)">
                <span class="pk-tut-tooltip-lang-capsule">
                  <span class="pk-tut-tlang-opt en active" id="pkTutTooltipLangEn">EN</span>
                  <span class="pk-tut-tlang-arrow" aria-hidden="true">
                    <svg class="pk-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>
                  </span>
                  <span class="pk-tut-tlang-opt km" id="pkTutTooltipLangKm">ខ្មែរ</span>
                </span>
              </button>
              <button type="button" class="pk-tutorial-close-btn" id="pkTutCloseBtn" aria-label="Close tutorial" title="Close tutorial">
                <svg class="pk-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
          <div class="pk-tutorial-title-row">
            <span class="pk-tutorial-icon-box" id="pkTutStepIcon" aria-hidden="true">${TUT_ICONS.lessons}</span>
            <h3 class="pk-tutorial-title" id="pkTutTitle">Step Title</h3>
          </div>
          <p class="pk-tutorial-body" id="pkTutBody">Step explanation text goes here.</p>
          <div id="pkTutExtraContent" class="pk-tut-extra-content" style="display:none;"></div>
          <div class="pk-tutorial-footer">
            <button type="button" class="pk-tutorial-skip-btn" id="pkTutSkipBtn">Skip Tutorial</button>
            <div class="pk-tutorial-btn-group">
              <button type="button" class="pk-tutorial-btn-sec" id="pkTutBackBtn" style="display:none;">Back</button>
              <button type="button" class="pk-tutorial-btn-pri" id="pkTutNextBtn">Next</button>
            </div>
          </div>
        </div>

        <!-- Welcome / Finish Modal -->
        <div id="pkTutorialModalCard" class="pk-tutorial-modal-card" style="display:none;" role="dialog" aria-modal="true">
          <div class="pk-tut-modal-header-row">
            <div class="pk-tut-crest-icon">
              <img src="logo.svg" alt="PK Logo">
            </div>
            <div class="pk-tut-lang-segmented" id="pkTutModalLangSeg" role="group" aria-label="Translate tutorial language">
              <button type="button" class="pk-tut-seg-btn active" id="pkTutModalLangEn" data-tut-lang="en">
                <span class="pk-tut-seg-tag en">EN</span> <span>English</span>
              </button>
              <button type="button" class="pk-tut-seg-btn" id="pkTutModalLangKm" data-tut-lang="km">
                <span class="pk-tut-seg-tag km">KM</span> <span>ភាសាខ្មែរ</span>
              </button>
            </div>
          </div>
          <h2 class="pk-tut-modal-title" id="pkTutModalTitle">Welcome to PK Khmer Type</h2>
          <p class="pk-tut-modal-subtitle" id="pkTutModalSubtitle">Learn to type Khmer step by step.</p>
          <div id="pkTutPathContainer" style="display:none;">
            <ul class="pk-tut-path-list">
              <li class="pk-tut-path-item"><span class="pk-tut-path-num">${TUT_ICONS.card}</span> <span id="pkTutPath1">Complete the next available lesson.</span></li>
              <li class="pk-tut-path-item"><span class="pk-tut-path-num">${TUT_ICONS.key}</span> <span id="pkTutPath2">Practice until you become comfortable with the keys.</span></li>
              <li class="pk-tut-path-item"><span class="pk-tut-path-num">${TUT_ICONS.guide}</span> <span id="pkTutPath3">Check the Quick Guide when you need help.</span></li>
              <li class="pk-tut-path-item"><span class="pk-tut-path-num">${TUT_ICONS.cmdbar}</span> <span id="pkTutPath4">Use Adaptive Practice and Studio Controls to customize your training.</span></li>
            </ul>
          </div>
          <div class="pk-tut-modal-actions">
            <button type="button" class="pk-tut-btn-primary" id="pkTutModalPriBtn">Start Learning</button>
            <button type="button" class="pk-tut-btn-secondary" id="pkTutModalSecBtn">Skip Tutorial</button>
          </div>
        </div>

        <!-- Floating Non-Intrusive Practice Pill -->
        <div id="pkTutorialPracticePill" class="pk-tutorial-practice-pill" style="display:none;" aria-live="polite">
          <span class="pk-tut-pill-dot" aria-hidden="true"></span>
          <span class="pk-tut-pill-icon" aria-hidden="true">${TUT_ICONS.radar}</span>
          <span id="pkTutPillText">Onboarding active: complete this lesson to continue</span>
          <button type="button" class="pk-tut-pill-btn" id="pkTutPillSkipBtn">Skip</button>
        </div>
      `;

      document.body.appendChild(wrap);

      // Wire basic buttons
      document.getElementById('pkTutCloseBtn').addEventListener('click', () => this.skip());
      document.getElementById('pkTutSkipBtn').addEventListener('click', () => this.skip());
      document.getElementById('pkTutPillSkipBtn').addEventListener('click', () => this.skip());

      // Wire language switchers
      const langEn = document.getElementById('pkTutModalLangEn');
      const langKm = document.getElementById('pkTutModalLangKm');
      const tipLang = document.getElementById('pkTutTooltipLangBtn');

      if(langEn){
        langEn.addEventListener('click', (e) => {
          e.stopPropagation();
          if(typeof window.applySiteLanguage === 'function'){
            window.applySiteLanguage('en');
          }
        });
      }
      if(langKm){
        langKm.addEventListener('click', (e) => {
          e.stopPropagation();
          if(typeof window.applySiteLanguage === 'function'){
            window.applySiteLanguage('km');
          }
        });
      }
      if(tipLang){
        tipLang.addEventListener('click', (e) => {
          e.stopPropagation();
          if(typeof window.toggleSiteLanguage === 'function'){
            window.toggleSiteLanguage();
          }
        });
      }

      this.refreshLangUI();
    }

    refreshLangUI(){
      if(!this.elementsCreated) return;
      const isKm = document.documentElement.classList.contains('site-km-mode');

      const modalEn = document.getElementById('pkTutModalLangEn');
      const modalKm = document.getElementById('pkTutModalLangKm');
      if(modalEn) modalEn.classList.toggle('active', !isKm);
      if(modalKm) modalKm.classList.toggle('active', isKm);

      const tipEn = document.getElementById('pkTutTooltipLangEn');
      const tipKm = document.getElementById('pkTutTooltipLangKm');
      if(tipEn) tipEn.classList.toggle('active', !isKm);
      if(tipKm) tipKm.classList.toggle('active', isKm);
    }

    refreshLang(){
      if(!this.elementsCreated) return;
      this.refreshLangUI();

      const skipBtn = document.getElementById('pkTutSkipBtn');
      if(skipBtn) skipBtn.textContent = this.t('skip');

      if(this.currentModalMode === 'welcome'){
        document.getElementById('pkTutModalTitle').textContent = this.t('welcomeTitle');
        document.getElementById('pkTutModalSubtitle').textContent = this.t('welcomeSubtitle');
        document.getElementById('pkTutModalPriBtn').textContent = this.t('startLearning');
        document.getElementById('pkTutModalSecBtn').textContent = this.t('skipTutorial');
      } else if(this.currentModalMode === 'firstDone'){
        document.getElementById('pkTutModalTitle').textContent = this.t('firstDoneTitle');
        document.getElementById('pkTutModalSubtitle').textContent = this.t('firstDoneDesc');
        document.getElementById('pkTutModalPriBtn').textContent = this.t('continueTutorial');
        document.getElementById('pkTutModalSecBtn').textContent = this.t('practiceMore');
      } else if(this.currentModalMode === 'finish'){
        document.getElementById('pkTutModalTitle').textContent = this.t('finishTitle');
        document.getElementById('pkTutModalSubtitle').textContent = this.t('finishSubtitle');
        document.getElementById('pkTutPath1').textContent = this.t('path1');
        document.getElementById('pkTutPath2').textContent = this.t('path2');
        document.getElementById('pkTutPath3').textContent = this.t('path3');
        document.getElementById('pkTutPath4').textContent = this.t('path4');
        document.getElementById('pkTutModalPriBtn').textContent = this.t('startNextLesson');
        document.getElementById('pkTutModalSecBtn').textContent = this.t('exploreAlone');
      } else if(this.active && this.currentStepKey){
        if(this.currentStepKey === 'waiting-practice'){
          const pillText = document.getElementById('pkTutPillText');
          const pillSkip = document.getElementById('pkTutPillSkipBtn');
          if(pillText) pillText.textContent = this.t('pillActive');
          if(pillSkip) pillSkip.textContent = this.t('skip');
        } else {
          this.goToStep(this.currentStepKey);
        }
      }
    }

    /* ---- Welcome Modal ---- */
    showWelcome(){
      this.ensureDOM();
      this.currentModalMode = 'welcome';
      this.refreshLangUI();

      const overlay = document.getElementById('pkTutorialOverlay');
      const modal = document.getElementById('pkTutorialModalCard');
      const tooltip = document.getElementById('pkTutorialTooltip');
      const maskSvg = overlay.querySelector('.pk-tutorial-mask-svg');
      const frame = document.getElementById('pkSpotlightFrame');
      const pathBox = document.getElementById('pkTutPathContainer');

      overlay.hidden = false;
      modal.style.display = 'block';
      tooltip.style.display = 'none';
      pathBox.style.display = 'none';
      frame.classList.add('hidden-frame');
      maskSvg.style.display = 'none';

      document.getElementById('pkTutModalTitle').textContent = this.t('welcomeTitle');
      document.getElementById('pkTutModalSubtitle').textContent = this.t('welcomeSubtitle');

      const priBtn = document.getElementById('pkTutModalPriBtn');
      const secBtn = document.getElementById('pkTutModalSecBtn');
      priBtn.textContent = this.t('startLearning');
      secBtn.textContent = this.t('skipTutorial');

      priBtn.onclick = () => {
        this.currentModalMode = null;
        modal.style.display = 'none';
        maskSvg.style.display = 'block';
        tooltip.style.display = 'block';
        this.goToStep('lessons-sidebar');
      };

      secBtn.onclick = () => {
        this.skip();
      };

      window.addEventListener('keydown', this.boundOnKeyDown);
    }

    /* ---- Step Orchestration ---- */
    goToStep(stepKey){
      this.ensureDOM();
      this.active = true;
      this.currentModalMode = null;
      this.refreshLangUI();
      this.currentStepKey = stepKey;
      localStorage.setItem(LS_SAVED_STEP, stepKey);

      const overlay = document.getElementById('pkTutorialOverlay');
      const modal = document.getElementById('pkTutorialModalCard');
      const tooltip = document.getElementById('pkTutorialTooltip');
      const maskSvg = overlay.querySelector('.pk-tutorial-mask-svg');
      const pill = document.getElementById('pkTutorialPracticePill');

      overlay.hidden = false;
      modal.style.display = 'none';
      maskSvg.style.display = 'block';
      tooltip.style.display = 'block';
      pill.style.display = 'none';

      window.addEventListener('resize', this.boundOnResize, { passive: true });
      window.addEventListener('scroll', this.boundOnResize, { passive: true });
      window.addEventListener('keydown', this.boundOnKeyDown);

      switch(stepKey){
        case 'lessons-sidebar':
          this.stepLessonsSidebar();
          break;
        case 'first-lesson':
          this.stepFirstLesson();
          break;
        case 'lesson-target-prompt':
          this.stepLessonTargetPrompt();
          break;
        case 'lesson-find-key':
          this.stepLessonFindKey();
          break;
        case 'lesson-start-typing':
          this.stepLessonStartTyping();
          break;
        case 'lesson-track-progress':
          this.stepLessonTrackProgress();
          break;
        case 'waiting-practice':
          this.stepWaitingPractice();
          break;
        case 'quick-guide-panel':
          this.stepQuickGuidePanel();
          break;
        case 'quick-guide-radar':
          this.stepQuickGuideRadar();
          break;
        case 'quick-guide-wpm':
          this.stepQuickGuideWpm();
          break;
        case 'quick-guide-fingers':
          this.stepQuickGuideFingers();
          break;
        case 'quick-guide-weak':
          this.stepQuickGuideWeak();
          break;
        case 'quick-guide-rules':
          this.stepQuickGuideRules();
          break;
        case 'top-command-bar':
          this.stepTopCommandBar();
          break;
        case 'top-cmd-focus':
          this.stepTopCmdFocus();
          break;
        case 'top-cmd-lang':
          this.stepTopCmdLang();
          break;
        case 'top-cmd-stats':
          this.stepTopCmdStats();
          break;
        default:
          this.showFinish();
          break;
      }
    }

    /* ---- Step 1: Guide to Lessons Sidebar ---- */
    stepLessonsSidebar(){
      // Open sidebar if hidden or minimized
      const strip = document.getElementById('lessonStrip');
      if(strip){
        strip.removeAttribute('hidden');
        strip.hidden = false;
        strip.classList.remove('minimized');
        // Expand first level if all are collapsed
        if(typeof collapsedLevels !== 'undefined' && typeof LEVELS !== 'undefined' && LEVELS && LEVELS[0]){
          collapsedLevels.delete(String(LEVELS[0].id));
          if(typeof renderLessonStrip === 'function') renderLessonStrip();
        }
      }

      const target = (strip && strip.querySelector('.lesson-strip-header')) || strip;
      this.spotlight(target, {
        stepText: `${this.t('step')} 1 ${this.t('of')} 4`,
        icon: TUT_ICONS.lessons,
        title: this.t('step1Title'),
        body: this.t('step1Desc'),
        nextText: this.t('next'),
        showBack: false,
        onNext: () => this.goToStep('first-lesson')
      });
    }

    /* ---- Step 2: Highlight the First Lesson ---- */
    stepFirstLesson(){
      const strip = document.getElementById('lessonStrip');
      if(strip){
        strip.removeAttribute('hidden');
        strip.hidden = false;
        strip.classList.remove('minimized');
      }

      // Find the first unlocked lesson card
      let firstCard = strip ? strip.querySelector('.lesson-card:not(.locked)') : null;
      if(!firstCard && strip){
        firstCard = strip.querySelector('.lesson-card');
      }

      if(firstCard){
        firstCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        const onCardClick = () => {
          firstCard.removeEventListener('click', onCardClick);
          setTimeout(() => this.goToStep('lesson-target-prompt'), 350);
        };
        firstCard.addEventListener('click', onCardClick, { once: true });
      }

      this.spotlight(firstCard || strip, {
        stepText: `${this.t('step')} 2 ${this.t('of')} 4`,
        icon: TUT_ICONS.card,
        title: this.t('step2Title'),
        body: this.t('step2Desc'),
        nextText: this.t('continue'),
        showBack: true,
        onBack: () => this.goToStep('lessons-sidebar'),
        onNext: () => {
          // Open the lesson
          if(firstCard && firstCard.dataset && firstCard.dataset.lesson){
            if(typeof window.startLesson === 'function'){
              window.startLesson(firstCard.dataset.lesson);
            } else {
              firstCard.click();
            }
          }
          setTimeout(() => this.goToStep('lesson-target-prompt'), 350);
        }
      });
    }

    /* ---- Step 3A: Look at the Target Prompt ---- */
    stepLessonTargetPrompt(){
      const prompt = document.getElementById('lessonCharRow') || document.getElementById('lessonPanel');
      if(prompt){
        prompt.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      this.spotlight(prompt, {
        stepText: `Lesson Guide (1/4)`,
        icon: TUT_ICONS.target,
        title: this.t('step3aTitle'),
        body: this.t('step3aDesc'),
        nextText: this.t('next'),
        showBack: false,
        onNext: () => this.goToStep('lesson-find-key')
      });
    }

    /* ---- Step 3B: Find the Key on Keyboard ---- */
    stepLessonFindKey(){
      const targetKey = document.querySelector('.key.lesson-target') || document.getElementById('boardWrap');
      if(targetKey){
        targetKey.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      this.spotlight(targetKey, {
        stepText: `Lesson Guide (2/4)`,
        icon: TUT_ICONS.key,
        title: this.t('step3bTitle'),
        body: this.t('step3bDesc'),
        nextText: this.t('next'),
        showBack: true,
        onBack: () => this.goToStep('lesson-target-prompt'),
        onNext: () => this.goToStep('lesson-start-typing')
      });
    }

    /* ---- Step 3C: Start Typing ---- */
    stepLessonStartTyping(){
      const typingArea = document.getElementById('lessonCharRow') || document.getElementById('boardWrap');
      
      const onUserTypes = (e) => {
        if(!e.ctrlKey && !e.altKey && !e.metaKey && e.key && e.key.length === 1 && this.currentStepKey === 'lesson-start-typing'){
          window.removeEventListener('keydown', onUserTypes);
          this.goToStep('waiting-practice');
        }
      };
      window.addEventListener('keydown', onUserTypes, { once: true });

      this.spotlight(typingArea, {
        stepText: `Lesson Guide (3/4)`,
        icon: TUT_ICONS.typing,
        title: this.t('step3cTitle'),
        body: this.t('step3cDesc'),
        nextText: this.t('next'),
        showBack: true,
        onBack: () => this.goToStep('lesson-find-key'),
        onNext: () => this.goToStep('lesson-track-progress')
      });
    }

    /* ---- Step 3D: Track Your Progress ---- */
    stepLessonTrackProgress(){
      const progressEl = document.querySelector('.lesson-progress-bar') || document.getElementById('lessonProgressFill') || document.getElementById('lessonPanel');
      this.spotlight(progressEl, {
        stepText: `Lesson Guide (4/4)`,
        icon: TUT_ICONS.progress,
        title: this.t('step3dTitle'),
        body: this.t('step3dDesc'),
        nextText: this.t('startDrill'),
        showBack: true,
        onBack: () => this.goToStep('lesson-start-typing'),
        onNext: () => this.goToStep('waiting-practice')
      });
    }

    /* ---- Real Practice Mode (Overlay Hidden) ---- */
    stepWaitingPractice(){
      this.isWaitingForLessonComplete = true;
      const overlay = document.getElementById('pkTutorialOverlay');
      const tooltip = document.getElementById('pkTutorialTooltip');
      const frame = document.getElementById('pkSpotlightFrame');
      const maskSvg = overlay.querySelector('.pk-tutorial-mask-svg');
      const pill = document.getElementById('pkTutorialPracticePill');

      // Hide dark mask so screen is completely clear for typing
      maskSvg.style.display = 'none';
      tooltip.style.display = 'none';
      frame.classList.add('hidden-frame');

      // Show bottom floating status pill
      pill.style.display = 'flex';
      document.getElementById('pkTutPillText').textContent = this.t('pillActive');
      document.getElementById('pkTutPillSkipBtn').textContent = this.t('skip');
    }

    /* ---- Lesson Completion Intercept ---- */
    handleLessonCompleted(ev){
      if(!this.isWaitingForLessonComplete && !this.active) return;
      this.isWaitingForLessonComplete = false;

      // Dismiss post-lesson overlay temporarily or show success card
      setTimeout(() => {
        document.querySelectorAll('.lesson-complete-overlay').forEach(el => el.remove());
        this.showFirstLessonCompleted();
      }, 350);
    }

    /* ---- Step 4: First Lesson Completed Modal ---- */
    showFirstLessonCompleted(){
      this.ensureDOM();
      this.currentModalMode = 'firstDone';
      this.refreshLangUI();

      const overlay = document.getElementById('pkTutorialOverlay');
      const modal = document.getElementById('pkTutorialModalCard');
      const tooltip = document.getElementById('pkTutorialTooltip');
      const maskSvg = overlay.querySelector('.pk-tutorial-mask-svg');
      const pill = document.getElementById('pkTutorialPracticePill');
      const pathBox = document.getElementById('pkTutPathContainer');

      overlay.hidden = false;
      modal.style.display = 'block';
      tooltip.style.display = 'none';
      pill.style.display = 'none';
      maskSvg.style.display = 'none';
      pathBox.style.display = 'none';

      document.getElementById('pkTutModalTitle').innerHTML = `<span class="pk-tut-inline-icon" aria-hidden="true">${TUT_ICONS.trophy}</span> <span>${this.t('firstDoneTitle')}</span>`;
      document.getElementById('pkTutModalSubtitle').textContent = this.t('firstDoneDesc');

      const priBtn = document.getElementById('pkTutModalPriBtn');
      const secBtn = document.getElementById('pkTutModalSecBtn');
      priBtn.textContent = this.t('continueTutorial');
      secBtn.textContent = this.t('practiceMore');

      priBtn.onclick = () => {
        this.currentModalMode = null;
        modal.style.display = 'none';
        maskSvg.style.display = 'block';
        tooltip.style.display = 'block';
        this.goToStep('quick-guide-panel');
      };

      secBtn.onclick = () => {
        this.finish(false);
      };
    }

    /* ---- Step 5: Quick Guide Panel ---- */
    stepQuickGuidePanel(){
      const dock = document.getElementById('guideDock');
      if(dock){
        dock.hidden = false;
        try { localStorage.setItem('pk_quick_guide_closed', 'false'); } catch(e){}
      }
      const toggleBtn = document.getElementById('guideToggleBtn');
      if(toggleBtn){
        toggleBtn.classList.add('active');
        toggleBtn.setAttribute('aria-pressed', 'true');
      }

      if(dock){
        dock.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      this.spotlight(dock, {
        stepText: `${this.t('step')} 3 ${this.t('of')} 4`,
        icon: TUT_ICONS.guide,
        title: this.t('stepQuickTitle'),
        body: this.t('stepQuickDesc'),
        nextText: this.t('next'),
        showBack: false,
        onNext: () => this.goToStep('quick-guide-radar')
      });
    }

    /* ---- 5A: Practice Radar ---- */
    stepQuickGuideRadar(){
      const radar = document.getElementById('guideSessionRadarSec') || document.getElementById('guideActiveCard');
      if(radar) radar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      this.spotlight(radar, {
        stepText: `${this.t('guideFeature')} (1/5)`,
        icon: TUT_ICONS.radar,
        title: this.t('radarTitle'),
        body: this.t('radarDesc'),
        nextText: this.t('next'),
        showBack: true,
        onBack: () => this.goToStep('quick-guide-panel'),
        onNext: () => this.goToStep('quick-guide-wpm')
      });
    }

    /* ---- 5B: WPM and Accuracy ---- */
    stepQuickGuideWpm(){
      const wpmGrid = document.querySelector('.guide-stats-grid') || document.getElementById('gStatWpm');
      if(wpmGrid) wpmGrid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      this.spotlight(wpmGrid, {
        stepText: `${this.t('guideFeature')} (2/5)`,
        icon: TUT_ICONS.wpm,
        title: this.t('wpmTitle'),
        body: this.t('wpmDesc'),
        nextText: this.t('next'),
        showBack: true,
        onBack: () => this.goToStep('quick-guide-radar'),
        onNext: () => this.goToStep('quick-guide-fingers')
      });
    }

    /* ---- 5C: Home Row & Finger Guide ---- */
    stepQuickGuideFingers(){
      const fingerSec = document.getElementById('guideFingerSec');
      if(fingerSec) fingerSec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      this.spotlight(fingerSec, {
        stepText: `${this.t('guideFeature')} (3/5)`,
        icon: TUT_ICONS.fingers,
        title: this.t('fingerTitle'),
        body: this.t('fingerDesc'),
        nextText: this.t('next'),
        showBack: true,
        onBack: () => this.goToStep('quick-guide-wpm'),
        onNext: () => this.goToStep('quick-guide-weak')
      });
    }

    /* ---- 5D: Weak Keys to Watch ---- */
    stepQuickGuideWeak(){
      const weakSec = document.getElementById('guideWeakSec');
      if(weakSec) weakSec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      this.spotlight(weakSec, {
        stepText: `${this.t('guideFeature')} (4/5)`,
        icon: TUT_ICONS.weak,
        title: this.t('weakTitle'),
        body: this.t('weakDesc'),
        nextText: this.t('next'),
        showBack: true,
        onBack: () => this.goToStep('quick-guide-fingers'),
        onNext: () => this.goToStep('quick-guide-rules')
      });
    }

    /* ---- 5E: Subscripts & Rules ---- */
    stepQuickGuideRules(){
      const rulesSec = document.getElementById('guideSubscriptsSec');
      if(rulesSec) rulesSec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      this.spotlight(rulesSec, {
        stepText: `${this.t('guideFeature')} (5/5)`,
        icon: TUT_ICONS.rules,
        title: this.t('subscriptsTitle'),
        body: this.t('subscriptsDesc'),
        nextText: this.t('next'),
        showBack: true,
        onBack: () => this.goToStep('quick-guide-weak'),
        onNext: () => this.goToStep('top-command-bar')
      });
    }

    /* ---- Step 6: Top Studio Command Bar (.top-actions) ---- */
    stepTopCommandBar(){
      const cmdBar = document.querySelector('.top-actions') || document.getElementById('focusModeBtn');
      if(cmdBar) window.scrollTo({ top: 0, behavior: 'smooth' });

      const isKm = document.documentElement.classList.contains('site-km-mode');
      const extraHtml = `
        <div class="pk-tut-cmd-grid">
          <div class="pk-tut-cmd-chip">${TUT_ICONS.focus}<span>${isKm ? 'ផ្ដោត' : 'Focus'} <kbd>Alt+F</kbd></span></div>
          <div class="pk-tut-cmd-chip">${TUT_ICONS.guide}<span>${isKm ? 'ណែនាំ' : 'Guide'}</span></div>
          <div class="pk-tut-cmd-chip">${TUT_ICONS.key}<span>${isKm ? 'ផ្លូវកាត់' : 'Shortcuts'}</span></div>
          <div class="pk-tut-cmd-chip">${TUT_ICONS.globe}<span>${isKm ? 'បកប្រែភាសា' : 'Translate'}</span></div>
          <div class="pk-tut-cmd-chip">${TUT_ICONS.stats}<span>${isKm ? 'ស្ថិតិ' : 'Statistics'}</span></div>
          <div class="pk-tut-cmd-chip">${TUT_ICONS.settings}<span>${isKm ? 'ការកំណត់' : 'Settings'}</span></div>
        </div>
      `;

      this.spotlight(cmdBar, {
        stepText: `${this.t('step')} 4 ${this.t('of')} 4`,
        icon: TUT_ICONS.cmdbar,
        title: this.t('stepCmdTitle'),
        body: this.t('stepCmdDesc'),
        extraHtml,
        nextText: this.t('next'),
        showBack: true,
        onBack: () => this.goToStep('quick-guide-rules'),
        onNext: () => this.goToStep('top-cmd-focus')
      });
    }

    /* ---- 6A: Focus Mode & Guide Toggle ---- */
    stepTopCmdFocus(){
      const focusBtn = document.getElementById('focusModeBtn') || document.querySelector('.top-actions');
      this.spotlight(focusBtn, {
        stepText: `Command Bar (1/3)`,
        icon: TUT_ICONS.focus,
        title: this.t('cmdFocusTitle'),
        body: this.t('cmdFocusDesc'),
        nextText: this.t('next'),
        showBack: true,
        onBack: () => this.goToStep('top-command-bar'),
        onNext: () => this.goToStep('top-cmd-lang')
      });
    }

    /* ---- 6B: Shortcuts & Translate to Khmer ---- */
    stepTopCmdLang(){
      const langBtn = document.getElementById('topLangToggleBtn') || document.getElementById('shortcutsOpenBtn') || document.querySelector('.top-actions');
      this.spotlight(langBtn, {
        stepText: `Command Bar (2/3)`,
        icon: TUT_ICONS.globe,
        title: this.t('cmdLangTitle'),
        body: this.t('cmdLangDesc'),
        nextText: this.t('next'),
        showBack: true,
        onBack: () => this.goToStep('top-cmd-focus'),
        onNext: () => this.goToStep('top-cmd-stats')
      });
    }

    /* ---- 6C: Statistics, Settings & Account ---- */
    stepTopCmdStats(){
      const settingsBtn = document.getElementById('settingsOpenBtn') || document.getElementById('statsOpenBtn') || document.querySelector('.top-actions');
      this.spotlight(settingsBtn, {
        stepText: `Command Bar (3/3)`,
        icon: TUT_ICONS.settings,
        title: this.t('cmdStatsTitle'),
        body: this.t('cmdStatsDesc'),
        nextText: this.t('next'),
        showBack: true,
        onBack: () => this.goToStep('top-cmd-lang'),
        onNext: () => this.showFinish()
      });
    }

    /* ---- Step 7: Finish Screen & Suggested Path ---- */
    showFinish(){
      this.ensureDOM();
      this.currentModalMode = 'finish';
      this.refreshLangUI();

      const overlay = document.getElementById('pkTutorialOverlay');
      const modal = document.getElementById('pkTutorialModalCard');
      const tooltip = document.getElementById('pkTutorialTooltip');
      const frame = document.getElementById('pkSpotlightFrame');
      const maskSvg = overlay.querySelector('.pk-tutorial-mask-svg');
      const pathBox = document.getElementById('pkTutPathContainer');
      const pill = document.getElementById('pkTutorialPracticePill');

      overlay.hidden = false;
      modal.style.display = 'block';
      tooltip.style.display = 'none';
      pill.style.display = 'none';
      frame.classList.add('hidden-frame');
      maskSvg.style.display = 'none';
      pathBox.style.display = 'block';

      document.getElementById('pkTutModalTitle').innerHTML = `<span class="pk-tut-inline-icon" aria-hidden="true">${TUT_ICONS.crown}</span> <span>${this.t('finishTitle')}</span>`;
      document.getElementById('pkTutModalSubtitle').textContent = this.t('finishSubtitle');
      document.getElementById('pkTutPath1').textContent = this.t('path1');
      document.getElementById('pkTutPath2').textContent = this.t('path2');
      document.getElementById('pkTutPath3').textContent = this.t('path3');
      document.getElementById('pkTutPath4').textContent = this.t('path4');

      const priBtn = document.getElementById('pkTutModalPriBtn');
      const secBtn = document.getElementById('pkTutModalSecBtn');
      priBtn.textContent = this.t('startNextLesson');
      secBtn.textContent = this.t('exploreAlone');

      priBtn.onclick = () => {
        this.currentModalMode = null;
        this.finish(true);
      };

      secBtn.onclick = () => {
        this.currentModalMode = null;
        this.finish(false);
      };
    }

    /* ---- Core Spotlight Renderer ---- */
    spotlight(element, options){
      if(!element) return;
      this.highlightEl = element;

      const overlay = document.getElementById('pkTutorialOverlay');
      const frame = document.getElementById('pkSpotlightFrame');
      const tooltip = document.getElementById('pkTutorialTooltip');
      const badge = document.getElementById('pkTutStepBadge');
      const iconBox = document.getElementById('pkTutStepIcon');
      const title = document.getElementById('pkTutTitle');
      const body = document.getElementById('pkTutBody');
      const extraBox = document.getElementById('pkTutExtraContent');
      const nextBtn = document.getElementById('pkTutNextBtn');
      const backBtn = document.getElementById('pkTutBackBtn');
      const skipBtn = document.getElementById('pkTutSkipBtn');

      badge.textContent = options.stepText || '';
      if(iconBox) iconBox.innerHTML = options.icon || TUT_ICONS.lessons;
      title.textContent = options.title || '';
      body.textContent = options.body || '';
      if(extraBox){
        if(options.extraHtml){
          extraBox.innerHTML = options.extraHtml;
          extraBox.style.display = 'block';
        } else {
          extraBox.innerHTML = '';
          extraBox.style.display = 'none';
        }
      }
      nextBtn.textContent = options.nextText || this.t('next');
      skipBtn.textContent = this.t('skip');

      if(options.showBack){
        backBtn.style.display = 'inline-block';
        backBtn.textContent = this.t('back');
        backBtn.onclick = options.onBack;
      } else {
        backBtn.style.display = 'none';
      }

      nextBtn.onclick = options.onNext;

      // Position update
      this.updatePosition();
    }

    updatePosition(){
      if(!this.highlightEl || !this.active) return;
      const r = this.highlightEl.getBoundingClientRect();
      const pad = 6;

      const hole = document.getElementById('pkSpotlightHole');
      const frame = document.getElementById('pkSpotlightFrame');
      const tooltip = document.getElementById('pkTutorialTooltip');

      const holeX = Math.max(0, r.left - pad);
      const holeY = Math.max(0, r.top - pad);
      const holeW = r.width + pad * 2;
      const holeH = r.height + pad * 2;

      // Update SVG Cutout Hole
      hole.setAttribute('x', holeX);
      hole.setAttribute('y', holeY);
      hole.setAttribute('width', holeW);
      hole.setAttribute('height', holeH);

      // Update Spotlight Frame
      frame.classList.remove('hidden-frame');
      frame.style.left = holeX + 'px';
      frame.style.top = holeY + 'px';
      frame.style.width = holeW + 'px';
      frame.style.height = holeH + 'px';

      // Position Tooltip
      const tw = tooltip.offsetWidth || 340;
      const th = tooltip.offsetHeight || 190;
      const margin = 14;

      let top = 0;
      let left = 0;

      // Determine best placement (Prefer below, then above, then side)
      if(r.bottom + margin + th < window.innerHeight - 10){
        // Place Below
        top = r.bottom + margin;
        left = r.left + (r.width / 2) - (tw / 2);
      } else if(r.top - margin - th > 10){
        // Place Above
        top = r.top - margin - th;
        left = r.left + (r.width / 2) - (tw / 2);
      } else if(r.right + margin + tw < window.innerWidth - 10){
        // Place Right
        top = Math.max(12, r.top);
        left = r.right + margin;
      } else {
        // Place Left or Center
        top = Math.max(12, r.top);
        left = Math.max(12, r.left - margin - tw);
      }

      // Viewport Clamping
      left = Math.max(12, Math.min(window.innerWidth - tw - 12, left));
      top = Math.max(12, Math.min(window.innerHeight - th - 12, top));

      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';
    }

    onViewportChange(){
      if(!this.active || !this.highlightEl) return;
      if(this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = requestAnimationFrame(() => {
        this.updatePosition();
      });
    }

    onKeyDown(e){
      if(!this.active) return;
      if(e.key === 'Escape'){
        this.skip();
      }
    }

    /* ---- Finish & Cleanup ---- */
    finish(startNext = false){
      this.cleanup();
      try {
        localStorage.setItem(LS_COMPLETED, '1');
        localStorage.removeItem(LS_SAVED_STEP);
      } catch(e){}

      if(startNext){
        // Start next unlocked lesson
        const strip = document.getElementById('lessonStrip');
        const nextCard = strip ? strip.querySelector('.lesson-card:not(.locked):not(.mastered)') || strip.querySelector('.lesson-card:not(.locked)') : null;
        if(nextCard && nextCard.dataset && nextCard.dataset.lesson && typeof window.startLesson === 'function'){
          window.startLesson(nextCard.dataset.lesson);
        }
      }
    }

    skip(){
      this.cleanup();
      try {
        localStorage.setItem(LS_SKIPPED, '1');
        localStorage.removeItem(LS_SAVED_STEP);
      } catch(e){}
    }

    cleanup(){
      this.active = false;
      this.isWaitingForLessonComplete = false;
      this.highlightEl = null;
      this.currentModalMode = null;

      const overlay = document.getElementById('pkTutorialOverlay');
      if(overlay) overlay.hidden = true;

      window.removeEventListener('resize', this.boundOnResize);
      window.removeEventListener('scroll', this.boundOnResize);
      window.removeEventListener('keydown', this.boundOnKeyDown);
    }

    /* ---- Restart / Resume ---- */
    start(force = false){
      if(force){
        try {
          localStorage.removeItem(LS_COMPLETED);
          localStorage.removeItem(LS_SKIPPED);
          localStorage.removeItem(LS_SAVED_STEP);
        } catch(e){}
      }
      this.showWelcome();
    }

    resume(stepKey){
      this.goToStep(stepKey);
    }
  }

  // Export singleton
  global.PK_TUTORIAL = new PKTutorialEngine();

  // Initialize once DOM is ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', () => global.PK_TUTORIAL.init());
  } else {
    global.PK_TUTORIAL.init();
  }

})(typeof window !== 'undefined' ? window : this);
