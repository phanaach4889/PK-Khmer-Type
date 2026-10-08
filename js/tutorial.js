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

      pillActive: 'Onboarding active: complete this lesson to continue ✨',
      pillPause: 'Pause',

      firstDoneTitle: 'First lesson completed! 🎉',
      firstDoneDesc: "Nice work. You've learned how a lesson works. Let's see how you can use the practice guide.",

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

      finishTitle: "You're ready to learn Khmer typing! 🚀",
      finishSubtitle: 'Here is your suggested learning path:',
      path1: 'Complete the next available lesson.',
      path2: 'Practice until you become comfortable with the keys.',
      path3: 'Check the Quick Guide when you need help.',
      path4: 'Use Adaptive Practice to focus on keys that need more practice.',
      startNextLesson: 'Start Next Lesson',
      exploreAlone: 'Explore on My Own'
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

      pillActive: 'ការណែនាំកំពុងដំណើរការ៖ បញ្ចប់មេរៀននេះដើម្បីបន្ត ✨',
      pillPause: 'ផ្អាក',

      firstDoneTitle: 'មេរៀនដំបូងត្រូវបានបញ្ចប់! 🎉',
      firstDoneDesc: 'ធ្វើបានល្អណាស់! អ្នកបានយល់ពីដំណើរការនៃមេរៀនហើយ។ តោះទៅមើលពីរបៀបប្រើប្រាស់មគ្គុទ្ទេសក៍ហ្វឹកហាត់។',

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

      finishTitle: 'អ្នកបានត្រៀមខ្លួនរួចរាល់ដើម្បីរៀនវាយអក្សរខ្មែរហើយ! 🚀',
      finishSubtitle: 'នេះជាគន្លងសិក្សាដែលបានណែនាំសម្រាប់អ្នក៖',
      path1: 'បញ្ចប់មេរៀនបន្ទាប់ដែលអាចចូលរៀនបាន។',
      path2: 'ហាត់រហូតដល់អ្នកមានអារម្មណ៍ស្ទាត់ជាមួយគ្រាប់ចុច។',
      path3: 'ពិនិត្យមើល Quick Guide នៅពេលអ្នកត្រូវការជំនួយ។',
      path4: 'ប្រើ Adaptive Practice ដើម្បីផ្តោតលើគ្រាប់ចុចដែលត្រូវការហាត់បន្ថែម។',
      startNextLesson: 'ចាប់ផ្តើមមេរៀនបន្ទាប់',
      exploreAlone: 'ស្វែងយល់ដោយខ្លួនឯង'
    }
  };

  class PKTutorialEngine {
    constructor(){
      this.active = false;
      this.currentStepKey = null;
      this.currentStepIdx = 0;
      this.highlightEl = null;
      this.isWaitingForLessonComplete = false;
      this.elementsCreated = false;
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
            <span class="pk-tutorial-step-badge" id="pkTutStepBadge">Step 1 of 5</span>
            <button type="button" class="pk-tutorial-close-btn" id="pkTutCloseBtn" aria-label="Close tutorial" title="Close tutorial">
              <svg class="pk-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <h3 class="pk-tutorial-title" id="pkTutTitle">Step Title</h3>
          <p class="pk-tutorial-body" id="pkTutBody">Step explanation text goes here.</p>
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
          <div class="pk-tut-crest-icon">
            <img src="logo.svg" alt="PK Logo">
          </div>
          <h2 class="pk-tut-modal-title" id="pkTutModalTitle">Welcome to PK Khmer Type</h2>
          <p class="pk-tut-modal-subtitle" id="pkTutModalSubtitle">Learn to type Khmer step by step.</p>
          <div id="pkTutPathContainer" style="display:none;">
            <ul class="pk-tut-path-list">
              <li class="pk-tut-path-item"><span class="pk-tut-path-num">1</span> <span id="pkTutPath1">Complete the next available lesson.</span></li>
              <li class="pk-tut-path-item"><span class="pk-tut-path-num">2</span> <span id="pkTutPath2">Practice until you become comfortable with the keys.</span></li>
              <li class="pk-tut-path-item"><span class="pk-tut-path-num">3</span> <span id="pkTutPath3">Check the Quick Guide when you need help.</span></li>
              <li class="pk-tut-path-item"><span class="pk-tut-path-num">4</span> <span id="pkTutPath4">Use Adaptive Practice to focus on keys that need more practice.</span></li>
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
          <span id="pkTutPillText">Onboarding active: complete this lesson to continue ✨</span>
          <button type="button" class="pk-tut-pill-btn" id="pkTutPillSkipBtn">Skip</button>
        </div>
      `;

      document.body.appendChild(wrap);

      // Wire basic buttons
      document.getElementById('pkTutCloseBtn').addEventListener('click', () => this.skip());
      document.getElementById('pkTutSkipBtn').addEventListener('click', () => this.skip());
      document.getElementById('pkTutPillSkipBtn').addEventListener('click', () => this.skip());
    }

    /* ---- Welcome Modal ---- */
    showWelcome(){
      this.ensureDOM();
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
        stepText: `${this.t('step')} 1 ${this.t('of')} 3`,
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
        stepText: `${this.t('step')} 2 ${this.t('of')} 3`,
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

      document.getElementById('pkTutModalTitle').textContent = this.t('firstDoneTitle');
      document.getElementById('pkTutModalSubtitle').textContent = this.t('firstDoneDesc');

      const priBtn = document.getElementById('pkTutModalPriBtn');
      const secBtn = document.getElementById('pkTutModalSecBtn');
      priBtn.textContent = this.t('continueTutorial');
      secBtn.textContent = this.t('practiceMore');

      priBtn.onclick = () => {
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
        stepText: `${this.t('step')} 3 ${this.t('of')} 3`,
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
        stepText: `Guide Feature (1/5)`,
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
        stepText: `Guide Feature (2/5)`,
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
        stepText: `Guide Feature (3/5)`,
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
        stepText: `Guide Feature (4/5)`,
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
        stepText: `Guide Feature (5/5)`,
        title: this.t('subscriptsTitle'),
        body: this.t('subscriptsDesc'),
        nextText: this.t('next'),
        showBack: true,
        onBack: () => this.goToStep('quick-guide-weak'),
        onNext: () => this.showFinish()
      });
    }

    /* ---- Step 6: Finish Screen & Suggested Path ---- */
    showFinish(){
      this.ensureDOM();
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

      document.getElementById('pkTutModalTitle').textContent = this.t('finishTitle');
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
        this.finish(true);
      };

      secBtn.onclick = () => {
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
      const title = document.getElementById('pkTutTitle');
      const body = document.getElementById('pkTutBody');
      const nextBtn = document.getElementById('pkTutNextBtn');
      const backBtn = document.getElementById('pkTutBackBtn');
      const skipBtn = document.getElementById('pkTutSkipBtn');

      badge.textContent = options.stepText || '';
      title.textContent = options.title || '';
      body.textContent = options.body || '';
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
