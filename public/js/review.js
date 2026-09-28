/* ============================================================
   PK Khmer Type — Phase 8 Adaptive Review Engine
   ============================================================
   Data-driven, privacy-first adaptive review generator that
   transforms persistent learner metrics from PK_PROGRESS and
   PK_TRACKER into targeted, curriculum-safe practice drills.

   Features:
   - Multi-factor weakness detection (keys, characters, fingers,
     declining performance, confusion pairs, and stale skills)
   - Explainable priority scoring with evidence guardrails
   - 100% curriculum safety (never introduces unlearned keys)
   - Multi-codepoint Khmer logical typing unit preservation
   - Deterministic drill generation (seeded PRNG)
   - In-session real-time micro-adaptation
   - Before/after measurement feeding into PK_PROGRESS
   - Strict course isolation (English, NiDA, Standard)
   - 100% offline, privacy-first, zero telemetry.
   ============================================================ */

(function(global){
  'use strict';

  const STORAGE_KEY = 'khmerReviewData_v1';
  const VALID_LAYOUTS = ['standard', 'nida', 'english'];
  const VALID_FINGERS = ['lp', 'lr', 'lm', 'li', 'lt', 'rt', 'ri', 'rm', 'rr', 'rp', 'unknown'];

  // Default review rules & thresholds
  const DEFAULT_REVIEW_RULES = {
    version: "1.0.0",
    minEvidenceAttempts: 3,         // Must have >= 3 attempts before flagging weakness
    minEvidenceErrors: 2,           // Must have >= 2 errors before flagging weakness
    lowAccuracyThreshold: 85,       // Below 85% triggers weakness
    staleDaysThreshold: 7,          // > 7 days since last practice triggers refresher
    slowKeyRatioThreshold: 1.8,     // > 1.8x layout average triggers slow key drill
    confusionMinCount: 3,           // >= 3 mixups triggers confusion pair drill
    targetDrillLength: 28,          // Standard drill length: 28 units (15-25 seconds)
    maxDrillLength: 36,
    minDrillLength: 20
  };

  // Pre-bundled character metadata catalogs for zero-latency offline operation
  const KHMER_CATALOG = [{"char":"ក","unicode":"U+1780","codepoint":6016,"name":"Ka","nameKm":"កា","type":"consonant","series":"a-series","group":"velar","keyId":"k","layer":"base","finger":"rm","hand":"R","frequency":"very-high","pairedChar":"គ","pairedKeyId":"k","pairedLayer":"shift"},{"char":"ខ","unicode":"U+1781","codepoint":6017,"name":"Kha","nameKm":"ខា","type":"consonant","series":"a-series","group":"velar","keyId":"x","layer":"base","finger":"lr","hand":"L","frequency":"medium","pairedChar":"ឃ","pairedKeyId":"x","pairedLayer":"shift"},{"char":"គ","unicode":"U+1782","codepoint":6018,"name":"Ko","nameKm":"គោ","type":"consonant","series":"o-series","group":"velar","keyId":"k","layer":"shift","finger":"rm","hand":"R","frequency":"high","pairedChar":"ក","pairedKeyId":"k","pairedLayer":"base"},{"char":"ឃ","unicode":"U+1783","codepoint":6019,"name":"Kho","nameKm":"ឃោ","type":"consonant","series":"o-series","group":"velar","keyId":"x","layer":"shift","finger":"lr","hand":"L","frequency":"low","pairedChar":"ខ","pairedKeyId":"x","pairedLayer":"base"},{"char":"ង","unicode":"U+1784","codepoint":6020,"name":"Ngo","nameKm":"ង៉ោ","type":"consonant","series":"o-series","group":"velar","keyId":"g","layer":"base","finger":"li","hand":"L","frequency":"high","pairedChar":"អ","pairedKeyId":"g","pairedLayer":"shift"},{"char":"ច","unicode":"U+1785","codepoint":6021,"name":"Ca","nameKm":"ចា","type":"consonant","series":"a-series","group":"palatal","keyId":"c","layer":"base","finger":"lm","hand":"L","frequency":"medium","pairedChar":"ជ","pairedKeyId":"c","pairedLayer":"shift"},{"char":"ឆ","unicode":"U+1786","codepoint":6022,"name":"Cha","nameKm":"ឆា","type":"consonant","series":"a-series","group":"palatal","keyId":"q","layer":"base","finger":"lp","hand":"L","frequency":"low","pairedChar":"ឈ","pairedKeyId":"q","pairedLayer":"shift"},{"char":"ជ","unicode":"U+1787","codepoint":6023,"name":"Co","nameKm":"ជោ","type":"consonant","series":"o-series","group":"palatal","keyId":"c","layer":"shift","finger":"lm","hand":"L","frequency":"medium","pairedChar":"ច","pairedKeyId":"c","pairedLayer":"base"},{"char":"ឈ","unicode":"U+1788","codepoint":6024,"name":"Cho","nameKm":"ឈោ","type":"consonant","series":"o-series","group":"palatal","keyId":"q","layer":"shift","finger":"lp","hand":"L","frequency":"low","pairedChar":"ឆ","pairedKeyId":"q","pairedLayer":"base"},{"char":"ញ","unicode":"U+1789","codepoint":6025,"name":"Nyo","nameKm":"ញោ","type":"consonant","series":"o-series","group":"palatal","keyId":"j","layer":"base","finger":"ri","hand":"R","frequency":"high"},{"char":"ដ","unicode":"U+178A","codepoint":6026,"name":"Da","nameKm":"ដា","type":"consonant","series":"a-series","group":"retroflex","keyId":"d","layer":"base","finger":"lm","hand":"L","frequency":"high","pairedChar":"ឌ","pairedKeyId":"d","pairedLayer":"shift"},{"char":"ឋ","unicode":"U+178B","codepoint":6027,"name":"Tha","nameKm":"ឋា","type":"consonant","series":"a-series","group":"retroflex","keyId":"z","layer":"base","finger":"lp","hand":"L","frequency":"low","pairedChar":"ឍ","pairedKeyId":"z","pairedLayer":"shift"},{"char":"ឌ","unicode":"U+178C","codepoint":6028,"name":"Do","nameKm":"ឌោ","type":"consonant","series":"o-series","group":"retroflex","keyId":"d","layer":"shift","finger":"lm","hand":"L","frequency":"low","pairedChar":"ដ","pairedKeyId":"d","pairedLayer":"base"},{"char":"ឍ","unicode":"U+178D","codepoint":6029,"name":"Tho","nameKm":"ឍោ","type":"consonant","series":"o-series","group":"retroflex","keyId":"z","layer":"shift","finger":"lp","hand":"L","frequency":"low","pairedChar":"ឋ","pairedKeyId":"z","pairedLayer":"base"},{"char":"ណ","unicode":"U+178E","codepoint":6030,"name":"Na","nameKm":"ណា","type":"consonant","series":"o-series","group":"retroflex","keyId":"n","layer":"shift","finger":"ri","hand":"R","frequency":"medium","pairedChar":"ន","pairedKeyId":"n","pairedLayer":"base"},{"char":"ត","unicode":"U+178F","codepoint":6031,"name":"Ta","nameKm":"តា","type":"consonant","series":"a-series","group":"dental","keyId":"t","layer":"base","finger":"li","hand":"L","frequency":"very-high","pairedChar":"ទ","pairedKeyId":"t","pairedLayer":"shift"},{"char":"ថ","unicode":"U+1790","codepoint":6032,"name":"Tha","nameKm":"ថា","type":"consonant","series":"a-series","group":"dental","keyId":"f","layer":"base","finger":"li","hand":"L","frequency":"medium","pairedChar":"ធ","pairedKeyId":"f","pairedLayer":"shift"},{"char":"ទ","unicode":"U+1791","codepoint":6033,"name":"To","nameKm":"ទោ","type":"consonant","series":"o-series","group":"dental","keyId":"t","layer":"shift","finger":"li","hand":"L","frequency":"high","pairedChar":"ត","pairedKeyId":"t","pairedLayer":"base"},{"char":"ធ","unicode":"U+1792","codepoint":6034,"name":"Tho","nameKm":"ធោ","type":"consonant","series":"o-series","group":"dental","keyId":"f","layer":"shift","finger":"li","hand":"L","frequency":"medium","pairedChar":"ថ","pairedKeyId":"f","pairedLayer":"base"},{"char":"ន","unicode":"U+1793","codepoint":6035,"name":"No","nameKm":"នោ","type":"consonant","series":"o-series","group":"dental","keyId":"n","layer":"base","finger":"ri","hand":"R","frequency":"very-high","pairedChar":"ណ","pairedKeyId":"n","pairedLayer":"shift"},{"char":"ប","unicode":"U+1794","codepoint":6036,"name":"Ba","nameKm":"បា","type":"consonant","series":"a-series","group":"labial","keyId":"b","layer":"base","finger":"li","hand":"L","frequency":"very-high","pairedChar":"ព","pairedKeyId":"b","pairedLayer":"shift"},{"char":"ផ","unicode":"U+1795","codepoint":6037,"name":"Pha","nameKm":"ផា","type":"consonant","series":"a-series","group":"labial","keyId":"p","layer":"base","finger":"rp","hand":"R","frequency":"medium","pairedChar":"ភ","pairedKeyId":"p","pairedLayer":"shift"},{"char":"ព","unicode":"U+1796","codepoint":6038,"name":"Po","nameKm":"ពោ","type":"consonant","series":"o-series","group":"labial","keyId":"b","layer":"shift","finger":"li","hand":"L","frequency":"high","pairedChar":"ប","pairedKeyId":"b","pairedLayer":"base"},{"char":"ភ","unicode":"U+1797","codepoint":6039,"name":"Pho","nameKm":"ភោ","type":"consonant","series":"o-series","group":"labial","keyId":"p","layer":"shift","finger":"rp","hand":"R","frequency":"medium","pairedChar":"ផ","pairedKeyId":"p","pairedLayer":"base"},{"char":"ម","unicode":"U+1798","codepoint":6040,"name":"Mo","nameKm":"មោ","type":"consonant","series":"o-series","group":"labial","keyId":"m","layer":"base","finger":"ri","hand":"R","frequency":"very-high"},{"char":"យ","unicode":"U+1799","codepoint":6041,"name":"Yo","nameKm":"យោ","type":"consonant","series":"o-series","group":"other","keyId":"y","layer":"base","finger":"ri","hand":"R","frequency":"very-high"},{"char":"រ","unicode":"U+179A","codepoint":6042,"name":"Ro","nameKm":"រោ","type":"consonant","series":"o-series","group":"other","keyId":"r","layer":"base","finger":"li","hand":"L","frequency":"very-high"},{"char":"ល","unicode":"U+179B","codepoint":6043,"name":"Lo","nameKm":"លោ","type":"consonant","series":"o-series","group":"other","keyId":"l","layer":"base","finger":"rr","hand":"R","frequency":"very-high","pairedChar":"ឡ","pairedKeyId":"l","pairedLayer":"shift"},{"char":"វ","unicode":"U+179C","codepoint":6044,"name":"Vo","nameKm":"វោ","type":"consonant","series":"o-series","group":"other","keyId":"v","layer":"base","finger":"li","hand":"L","frequency":"high"},{"char":"ស","unicode":"U+179F","codepoint":6047,"name":"Sa","nameKm":"សា","type":"consonant","series":"a-series","group":"other","keyId":"s","layer":"base","finger":"lr","hand":"L","frequency":"very-high"},{"char":"ហ","unicode":"U+17A0","codepoint":6048,"name":"Ha","nameKm":"ហា","type":"consonant","series":"a-series","group":"other","keyId":"h","layer":"base","finger":"ri","hand":"R","frequency":"high"},{"char":"ឡ","unicode":"U+17A1","codepoint":6049,"name":"La","nameKm":"ឡា","type":"consonant","series":"a-series","group":"other","keyId":"l","layer":"shift","finger":"rr","hand":"R","frequency":"low","pairedChar":"ល","pairedKeyId":"l","pairedLayer":"base"},{"char":"អ","unicode":"U+17A2","codepoint":6050,"name":"Qa","nameKm":"អា","type":"consonant","series":"a-series","group":"other","keyId":"g","layer":"shift","finger":"li","hand":"L","frequency":"very-high","pairedChar":"ង","pairedKeyId":"g","pairedLayer":"base"},{"char":"ា","unicode":"U+17B6","codepoint":6070,"type":"dependent-vowel","keyId":"a","layer":"base","finger":"lp","hand":"L","frequency":"very-high"},{"char":"ិ","unicode":"U+17B7","codepoint":6071,"type":"dependent-vowel","keyId":"i","layer":"base","finger":"rm","hand":"R","frequency":"very-high"},{"char":"ី","unicode":"U+17B8","codepoint":6072,"type":"dependent-vowel","keyId":"i","layer":"shift","finger":"rm","hand":"R","frequency":"high"},{"char":"ុ","unicode":"U+17BB","codepoint":6075,"type":"dependent-vowel","keyId":"u","layer":"base","finger":"ri","hand":"R","frequency":"very-high"},{"char":"ូ","unicode":"U+17BC","codepoint":6076,"type":"dependent-vowel","keyId":"u","layer":"shift","finger":"ri","hand":"R","frequency":"high"},{"char":"ួ","unicode":"U+17BD","codepoint":6077,"type":"dependent-vowel","keyId":"y","layer":"shift","finger":"ri","hand":"R","frequency":"high"},{"char":"ើ","unicode":"U+17BE","codepoint":6078,"type":"dependent-vowel","keyId":"semicolon","layer":"base","finger":"rp","hand":"R","frequency":"high"},{"char":"ឿ","unicode":"U+17BF","codepoint":6079,"type":"dependent-vowel","keyId":"bracketL","layer":"shift","finger":"rp","hand":"R","frequency":"low"},{"char":"ៀ","unicode":"U+17C0","codepoint":6080,"type":"dependent-vowel","keyId":"bracketL","layer":"base","finger":"rp","hand":"R","frequency":"high"},{"char":"េ","unicode":"U+17C1","codepoint":6081,"type":"dependent-vowel","keyId":"e","layer":"base","finger":"lm","hand":"L","frequency":"very-high"},{"char":"ែ","unicode":"U+17C2","codepoint":6082,"type":"dependent-vowel","keyId":"e","layer":"shift","finger":"lm","hand":"L","frequency":"high"},{"char":"ៃ","unicode":"U+17C3","codepoint":6083,"type":"dependent-vowel","keyId":"s","layer":"shift","finger":"lr","hand":"L","frequency":"medium"},{"char":"ោ","unicode":"U+17C4","codepoint":6084,"type":"dependent-vowel","keyId":"o","layer":"base","finger":"rr","hand":"R","frequency":"very-high"},{"char":"ៅ","unicode":"U+17C5","codepoint":6085,"type":"dependent-vowel","keyId":"o","layer":"shift","finger":"rr","hand":"R","frequency":"medium"},{"char":"ឹ","unicode":"U+17B9","codepoint":6073,"type":"dependent-vowel","keyId":"w","layer":"base","finger":"lr","hand":"L","frequency":"medium"},{"char":"ឺ","unicode":"U+17BA","codepoint":6074,"type":"dependent-vowel","keyId":"w","layer":"shift","finger":"lr","hand":"L","frequency":"low"},{"char":"ុំ","unicode":"U+17BB+U+17C6","codepoint":[6075,6086],"type":"compound-vowel","keyId":"comma","layer":"base","finger":"rm","hand":"R","frequency":"low"},{"char":"ុះ","unicode":"U+17BB+U+17C7","codepoint":[6075,6087],"type":"compound-vowel","keyId":"comma","layer":"shift","finger":"rm","hand":"R","frequency":"low"},{"char":"ាំ","unicode":"U+17B6+U+17C6","codepoint":[6070,6086],"type":"compound-vowel","keyId":"a","layer":"shift","finger":"lp","hand":"L","frequency":"low"},{"char":"េះ","unicode":"U+17C1+U+17C7","codepoint":[6081,6087],"type":"compound-vowel","keyId":"v","layer":"shift","finger":"li","hand":"L","frequency":"low"},{"char":"ោះ","unicode":"U+17C4+U+17C7","codepoint":[6084,6087],"type":"compound-vowel","keyId":"semicolon","layer":"shift","finger":"rp","hand":"R","frequency":"low"},{"char":"ះ","unicode":"U+17C7","codepoint":6087,"type":"compound-vowel","keyId":"h","layer":"shift","finger":"ri","hand":"R","frequency":"medium"},{"char":"ំ","unicode":"U+17C6","codepoint":6086,"type":"compound-vowel","keyId":"m","layer":"shift","finger":"ri","hand":"R","frequency":"medium"},{"char":"្","unicode":"U+17D2","codepoint":6098,"type":"coeng","keyId":"j","layer":"shift","finger":"ri","hand":"R","frequency":"high"},{"char":"់","unicode":"U+17CB","codepoint":6091,"type":"diacritic","keyId":"quote","layer":"base","finger":"rp","hand":"R","frequency":"high"},{"char":"៉","unicode":"U+17C9","codepoint":6089,"type":"diacritic","keyId":"quote","layer":"shift","finger":"rp","hand":"R","frequency":"rare"},{"char":"៊","unicode":"U+17CA","codepoint":6090,"type":"diacritic","keyId":"slash","layer":"base","finger":"rp","hand":"R","frequency":"rare"},{"char":"៍","unicode":"U+17CD","codepoint":6093,"type":"diacritic","keyId":"k6","layer":"shift","finger":"ri","hand":"R","frequency":"rare"},{"char":"៏","unicode":"U+17CF","codepoint":6095,"type":"diacritic","keyId":"k8","layer":"shift","finger":"rm","hand":"R","frequency":"rare"},{"char":"័","unicode":"U+17D0","codepoint":6096,"type":"diacritic","keyId":"k7","layer":"shift","finger":"ri","hand":"R","frequency":"rare"},{"char":"៌","unicode":"U+17CC","codepoint":6092,"type":"diacritic","keyId":"minus","layer":"shift","finger":"rp","hand":"R","frequency":"rare"},{"char":"ៗ","unicode":"U+17D7","codepoint":6103,"type":"special-mark","keyId":"k2","layer":"shift","finger":"lr","hand":"L","frequency":"rare"},{"char":"៛","unicode":"U+17DB","codepoint":6107,"type":"special-mark","keyId":"k4","layer":"shift","finger":"li","hand":"L","frequency":"rare"},{"char":"។","unicode":"U+17D4","codepoint":6100,"type":"special-mark","keyId":"period","layer":"base","finger":"rr","hand":"R","frequency":"very-high"},{"char":"៕","unicode":"U+17D5","codepoint":6101,"type":"special-mark","keyId":"period","layer":"shift","finger":"rr","hand":"R","frequency":"rare"},{"char":"៖","unicode":"U+17D6","codepoint":6102,"type":"special-mark","keyId":"semicolon","layer":"altgr","finger":"rp","hand":"R","frequency":"rare"},{"char":"ៈ","unicode":"U+17C8","codepoint":6088,"type":"special-mark","keyId":"quote","layer":"altgr","finger":"rp","hand":"R","frequency":"rare"},{"char":"«","unicode":"U+00AB","codepoint":171,"type":"special-mark","keyId":"grave","layer":"base","finger":"lp","hand":"L","frequency":"rare"},{"char":"»","unicode":"U+00BB","codepoint":187,"type":"special-mark","keyId":"grave","layer":"shift","finger":"lp","hand":"L","frequency":"rare"},{"char":"ឥ","unicode":"U+17A5","codepoint":6053,"type":"independent-vowel","keyId":"minus","layer":"base","finger":"rp","hand":"R","frequency":"rare"},{"char":"ឦ","unicode":"U+17A6","codepoint":6054,"type":"independent-vowel","keyId":"i","layer":"altgr","finger":"rm","hand":"R","frequency":"rare"},{"char":"ឧ","unicode":"U+17A7","codepoint":6055,"type":"independent-vowel","keyId":"bracketR","layer":"shift","finger":"rp","hand":"R","frequency":"rare"},{"char":"ឩ","unicode":"U+17A9","codepoint":6057,"type":"independent-vowel","keyId":"bracketL","layer":"altgr","finger":"rp","hand":"R","frequency":"rare"},{"char":"ឪ","unicode":"U+17AA","codepoint":6058,"type":"independent-vowel","keyId":"bracketR","layer":"base","finger":"rp","hand":"R","frequency":"rare"},{"char":"ឫ","unicode":"U+17AB","codepoint":6059,"type":"independent-vowel","keyId":"r","layer":"altgr","finger":"li","hand":"L","frequency":"rare"},{"char":"ឬ","unicode":"U+17AC","codepoint":6060,"type":"independent-vowel","keyId":"r","layer":"shift","finger":"li","hand":"L","frequency":"rare"},{"char":"ឭ","unicode":"U+17AD","codepoint":6061,"type":"independent-vowel","keyId":"backslash","layer":"shift","finger":"rp","hand":"R","frequency":"rare"},{"char":"ឮ","unicode":"U+17AE","codepoint":6062,"type":"independent-vowel","keyId":"backslash","layer":"base","finger":"rp","hand":"R","frequency":"rare"},{"char":"ឯ","unicode":"U+17AF","codepoint":6063,"type":"independent-vowel","keyId":"e","layer":"altgr","finger":"lm","hand":"L","frequency":"rare"},{"char":"ឰ","unicode":"U+17B0","codepoint":6064,"type":"independent-vowel","keyId":"p","layer":"altgr","finger":"rp","hand":"R","frequency":"rare"},{"char":"ឱ","unicode":"U+17B1","codepoint":6065,"type":"independent-vowel","keyId":"o","layer":"altgr","finger":"rr","hand":"R","frequency":"rare"},{"char":"ឲ","unicode":"U+17B2","codepoint":6066,"type":"independent-vowel","keyId":"equal","layer":"base","finger":"rp","hand":"R","frequency":"rare"},{"char":"ឳ","unicode":"U+17B3","codepoint":6067,"type":"independent-vowel","keyId":"bracketR","layer":"altgr","finger":"rp","hand":"R","frequency":"rare"},{"char":"០","unicode":"U+17E0","codepoint":6112,"type":"digit","keyId":"k0","layer":"base","finger":"rp","hand":"R","frequency":"rare"},{"char":"១","unicode":"U+17E1","codepoint":6113,"type":"digit","keyId":"k1","layer":"base","finger":"lp","hand":"L","frequency":"rare"},{"char":"២","unicode":"U+17E2","codepoint":6114,"type":"digit","keyId":"k2","layer":"base","finger":"lr","hand":"L","frequency":"rare"},{"char":"៣","unicode":"U+17E3","codepoint":6115,"type":"digit","keyId":"k3","layer":"base","finger":"lm","hand":"L","frequency":"rare"},{"char":"៤","unicode":"U+17E4","codepoint":6116,"type":"digit","keyId":"k4","layer":"base","finger":"li","hand":"L","frequency":"rare"},{"char":"៥","unicode":"U+17E5","codepoint":6117,"type":"digit","keyId":"k5","layer":"base","finger":"li","hand":"L","frequency":"rare"},{"char":"៦","unicode":"U+17E6","codepoint":6118,"type":"digit","keyId":"k6","layer":"base","finger":"ri","hand":"R","frequency":"rare"},{"char":"៧","unicode":"U+17E7","codepoint":6119,"type":"digit","keyId":"k7","layer":"base","finger":"ri","hand":"R","frequency":"rare"},{"char":"៨","unicode":"U+17E8","codepoint":6120,"type":"digit","keyId":"k8","layer":"base","finger":"rm","hand":"R","frequency":"rare"},{"char":"៩","unicode":"U+17E9","codepoint":6121,"type":"digit","keyId":"k9","layer":"base","finger":"rr","hand":"R","frequency":"rare"}];
  const ENGLISH_CATALOG = [{"char":"a","type":"letter","case":"lower","keyId":"a","layer":"base","finger":"lp","hand":"L","frequency":"very-high","pairedChar":"A","pairedLayer":"shift"},{"char":"b","type":"letter","case":"lower","keyId":"b","layer":"base","finger":"li","hand":"L","frequency":"medium","pairedChar":"B","pairedLayer":"shift"},{"char":"c","type":"letter","case":"lower","keyId":"c","layer":"base","finger":"lm","hand":"L","frequency":"high","pairedChar":"C","pairedLayer":"shift"},{"char":"d","type":"letter","case":"lower","keyId":"d","layer":"base","finger":"lm","hand":"L","frequency":"high","pairedChar":"D","pairedLayer":"shift"},{"char":"e","type":"letter","case":"lower","keyId":"e","layer":"base","finger":"lm","hand":"L","frequency":"very-high","pairedChar":"E","pairedLayer":"shift"},{"char":"f","type":"letter","case":"lower","keyId":"f","layer":"base","finger":"li","hand":"L","frequency":"high","pairedChar":"F","pairedLayer":"shift"},{"char":"g","type":"letter","case":"lower","keyId":"g","layer":"base","finger":"li","hand":"L","frequency":"high","pairedChar":"G","pairedLayer":"shift"},{"char":"h","type":"letter","case":"lower","keyId":"h","layer":"base","finger":"ri","hand":"R","frequency":"very-high","pairedChar":"H","pairedLayer":"shift"},{"char":"i","type":"letter","case":"lower","keyId":"i","layer":"base","finger":"rm","hand":"R","frequency":"very-high","pairedChar":"I","pairedLayer":"shift"},{"char":"j","type":"letter","case":"lower","keyId":"j","layer":"base","finger":"ri","hand":"R","frequency":"medium","pairedChar":"J","pairedLayer":"shift"},{"char":"k","type":"letter","case":"lower","keyId":"k","layer":"base","finger":"rm","hand":"R","frequency":"medium","pairedChar":"K","pairedLayer":"shift"},{"char":"l","type":"letter","case":"lower","keyId":"l","layer":"base","finger":"rr","hand":"R","frequency":"high","pairedChar":"L","pairedLayer":"shift"},{"char":"m","type":"letter","case":"lower","keyId":"m","layer":"base","finger":"ri","hand":"R","frequency":"high","pairedChar":"M","pairedLayer":"shift"},{"char":"n","type":"letter","case":"lower","keyId":"n","layer":"base","finger":"ri","hand":"R","frequency":"very-high","pairedChar":"N","pairedLayer":"shift"},{"char":"o","type":"letter","case":"lower","keyId":"o","layer":"base","finger":"rr","hand":"R","frequency":"very-high","pairedChar":"O","pairedLayer":"shift"},{"char":"p","type":"letter","case":"lower","keyId":"p","layer":"base","finger":"rp","hand":"R","frequency":"high","pairedChar":"P","pairedLayer":"shift"},{"char":"q","type":"letter","case":"lower","keyId":"q","layer":"base","finger":"lp","hand":"L","frequency":"medium","pairedChar":"Q","pairedLayer":"shift"},{"char":"r","type":"letter","case":"lower","keyId":"r","layer":"base","finger":"li","hand":"L","frequency":"very-high","pairedChar":"R","pairedLayer":"shift"},{"char":"s","type":"letter","case":"lower","keyId":"s","layer":"base","finger":"lr","hand":"L","frequency":"very-high","pairedChar":"S","pairedLayer":"shift"},{"char":"t","type":"letter","case":"lower","keyId":"t","layer":"base","finger":"li","hand":"L","frequency":"very-high","pairedChar":"T","pairedLayer":"shift"},{"char":"u","type":"letter","case":"lower","keyId":"u","layer":"base","finger":"ri","hand":"R","frequency":"high","pairedChar":"U","pairedLayer":"shift"},{"char":"v","type":"letter","case":"lower","keyId":"v","layer":"base","finger":"li","hand":"L","frequency":"medium","pairedChar":"V","pairedLayer":"shift"},{"char":"w","type":"letter","case":"lower","keyId":"w","layer":"base","finger":"lr","hand":"L","frequency":"high","pairedChar":"W","pairedLayer":"shift"},{"char":"x","type":"letter","case":"lower","keyId":"x","layer":"base","finger":"lr","hand":"L","frequency":"medium","pairedChar":"X","pairedLayer":"shift"},{"char":"y","type":"letter","case":"lower","keyId":"y","layer":"base","finger":"ri","hand":"R","frequency":"high","pairedChar":"Y","pairedLayer":"shift"},{"char":"z","type":"letter","case":"lower","keyId":"z","layer":"base","finger":"lp","hand":"L","frequency":"medium","pairedChar":"Z","pairedLayer":"shift"},{"char":"A","type":"letter","case":"upper","keyId":"a","layer":"shift","finger":"lp","hand":"L","frequency":"very-high","pairedChar":"a","pairedLayer":"base"},{"char":"B","type":"letter","case":"upper","keyId":"b","layer":"shift","finger":"li","hand":"L","frequency":"medium","pairedChar":"b","pairedLayer":"base"},{"char":"C","type":"letter","case":"upper","keyId":"c","layer":"shift","finger":"lm","hand":"L","frequency":"high","pairedChar":"c","pairedLayer":"base"},{"char":"D","type":"letter","case":"upper","keyId":"d","layer":"shift","finger":"lm","hand":"L","frequency":"high","pairedChar":"d","pairedLayer":"base"},{"char":"E","type":"letter","case":"upper","keyId":"e","layer":"shift","finger":"lm","hand":"L","frequency":"very-high","pairedChar":"e","pairedLayer":"base"},{"char":"F","type":"letter","case":"upper","keyId":"f","layer":"shift","finger":"li","hand":"L","frequency":"high","pairedChar":"f","pairedLayer":"base"},{"char":"G","type":"letter","case":"upper","keyId":"g","layer":"shift","finger":"li","hand":"L","frequency":"high","pairedChar":"g","pairedLayer":"base"},{"char":"H","type":"letter","case":"upper","keyId":"h","layer":"shift","finger":"ri","hand":"R","frequency":"very-high","pairedChar":"h","pairedLayer":"base"},{"char":"I","type":"letter","case":"upper","keyId":"i","layer":"shift","finger":"rm","hand":"R","frequency":"very-high","pairedChar":"i","pairedLayer":"base"},{"char":"J","type":"letter","case":"upper","keyId":"j","layer":"shift","finger":"ri","hand":"R","frequency":"medium","pairedChar":"j","pairedLayer":"base"},{"char":"K","type":"letter","case":"upper","keyId":"k","layer":"shift","finger":"rm","hand":"R","frequency":"medium","pairedChar":"k","pairedLayer":"base"},{"char":"L","type":"letter","case":"upper","keyId":"l","layer":"shift","finger":"rr","hand":"R","frequency":"high","pairedChar":"l","pairedLayer":"base"},{"char":"M","type":"letter","case":"upper","keyId":"m","layer":"shift","finger":"ri","hand":"R","frequency":"high","pairedChar":"m","pairedLayer":"base"},{"char":"N","type":"letter","case":"upper","keyId":"n","layer":"shift","finger":"ri","hand":"R","frequency":"very-high","pairedChar":"n","pairedLayer":"base"},{"char":"O","type":"letter","case":"upper","keyId":"o","layer":"shift","finger":"rr","hand":"R","frequency":"very-high","pairedChar":"o","pairedLayer":"base"},{"char":"P","type":"letter","case":"upper","keyId":"p","layer":"shift","finger":"rp","hand":"R","frequency":"high","pairedChar":"p","pairedLayer":"base"},{"char":"Q","type":"letter","case":"upper","keyId":"q","layer":"shift","finger":"lp","hand":"L","frequency":"medium","pairedChar":"q","pairedLayer":"base"},{"char":"R","type":"letter","case":"upper","keyId":"r","layer":"shift","finger":"li","hand":"L","frequency":"very-high","pairedChar":"r","pairedLayer":"base"},{"char":"S","type":"letter","case":"upper","keyId":"s","layer":"shift","finger":"lr","hand":"L","frequency":"very-high","pairedChar":"s","pairedLayer":"base"},{"char":"T","type":"letter","case":"upper","keyId":"t","layer":"shift","finger":"li","hand":"L","frequency":"very-high","pairedChar":"t","pairedLayer":"base"},{"char":"U","type":"letter","case":"upper","keyId":"u","layer":"shift","finger":"ri","hand":"R","frequency":"high","pairedChar":"u","pairedLayer":"base"},{"char":"V","type":"letter","case":"upper","keyId":"v","layer":"shift","finger":"li","hand":"L","frequency":"medium","pairedChar":"v","pairedLayer":"base"},{"char":"W","type":"letter","case":"upper","keyId":"w","layer":"shift","finger":"lr","hand":"L","frequency":"high","pairedChar":"w","pairedLayer":"base"},{"char":"X","type":"letter","case":"upper","keyId":"x","layer":"shift","finger":"lr","hand":"L","frequency":"medium","pairedChar":"x","pairedLayer":"base"},{"char":"Y","type":"letter","case":"upper","keyId":"y","layer":"shift","finger":"ri","hand":"R","frequency":"high","pairedChar":"y","pairedLayer":"base"},{"char":"Z","type":"letter","case":"upper","keyId":"z","layer":"shift","finger":"lp","hand":"L","frequency":"medium","pairedChar":"z","pairedLayer":"base"},{"char":"0","type":"digit","keyId":"k0","layer":"base","finger":"rp","hand":"R","frequency":"low"},{"char":"1","type":"digit","keyId":"k1","layer":"base","finger":"lp","hand":"L","frequency":"low"},{"char":"2","type":"digit","keyId":"k2","layer":"base","finger":"lr","hand":"L","frequency":"low"},{"char":"3","type":"digit","keyId":"k3","layer":"base","finger":"lm","hand":"L","frequency":"low"},{"char":"4","type":"digit","keyId":"k4","layer":"base","finger":"li","hand":"L","frequency":"low"},{"char":"5","type":"digit","keyId":"k5","layer":"base","finger":"li","hand":"L","frequency":"low"},{"char":"6","type":"digit","keyId":"k6","layer":"base","finger":"ri","hand":"R","frequency":"low"},{"char":"7","type":"digit","keyId":"k7","layer":"base","finger":"ri","hand":"R","frequency":"low"},{"char":"8","type":"digit","keyId":"k8","layer":"base","finger":"rm","hand":"R","frequency":"low"},{"char":"9","type":"digit","keyId":"k9","layer":"base","finger":"rr","hand":"R","frequency":"low"},{"char":"!","type":"symbol","keyId":"k1","layer":"shift","finger":"lp","hand":"L","frequency":"rare"},{"char":"@","type":"symbol","keyId":"k2","layer":"shift","finger":"lr","hand":"L","frequency":"rare"},{"char":"#","type":"symbol","keyId":"k3","layer":"shift","finger":"lm","hand":"L","frequency":"rare"},{"char":"$","type":"symbol","keyId":"k4","layer":"shift","finger":"li","hand":"L","frequency":"rare"},{"char":"%","type":"symbol","keyId":"k5","layer":"shift","finger":"li","hand":"L","frequency":"rare"},{"char":"^","type":"symbol","keyId":"k6","layer":"shift","finger":"ri","hand":"R","frequency":"rare"},{"char":"&","type":"symbol","keyId":"k7","layer":"shift","finger":"ri","hand":"R","frequency":"rare"},{"char":"*","type":"symbol","keyId":"k8","layer":"shift","finger":"rm","hand":"R","frequency":"rare"},{"char":"(","type":"symbol","keyId":"k9","layer":"shift","finger":"rr","hand":"R","frequency":"rare"},{"char":")","type":"symbol","keyId":"k0","layer":"shift","finger":"rp","hand":"R","frequency":"rare"},{"char":".","type":"punctuation","keyId":"period","layer":"base","finger":"rr","hand":"R","frequency":"low"},{"char":",","type":"punctuation","keyId":"comma","layer":"base","finger":"rm","hand":"R","frequency":"low"},{"char":";","type":"punctuation","keyId":"semicolon","layer":"base","finger":"rp","hand":"R","frequency":"low"},{"char":":","type":"punctuation","keyId":"semicolon","layer":"shift","finger":"rp","hand":"R","frequency":"low"},{"char":"'","type":"punctuation","keyId":"quote","layer":"base","finger":"rp","hand":"R","frequency":"low"},{"char":"\"","type":"punctuation","keyId":"quote","layer":"shift","finger":"rp","hand":"R","frequency":"low"},{"char":"/","type":"punctuation","keyId":"slash","layer":"base","finger":"rp","hand":"R","frequency":"low"},{"char":"?","type":"punctuation","keyId":"slash","layer":"shift","finger":"rp","hand":"R","frequency":"low"},{"char":"-","type":"punctuation","keyId":"minus","layer":"base","finger":"rp","hand":"R","frequency":"low"},{"char":"_","type":"punctuation","keyId":"minus","layer":"shift","finger":"rp","hand":"R","frequency":"low"},{"char":"+","type":"punctuation","keyId":"equal","layer":"shift","finger":"rp","hand":"R","frequency":"low"},{"char":"=","type":"punctuation","keyId":"equal","layer":"base","finger":"rp","hand":"R","frequency":"low"},{"char":"[","type":"punctuation","keyId":"bracketL","layer":"base","finger":"rp","hand":"R","frequency":"low"},{"char":"{","type":"punctuation","keyId":"bracketL","layer":"shift","finger":"rp","hand":"R","frequency":"low"},{"char":"]","type":"punctuation","keyId":"bracketR","layer":"base","finger":"rp","hand":"R","frequency":"low"},{"char":"}","type":"punctuation","keyId":"bracketR","layer":"shift","finger":"rp","hand":"R","frequency":"low"},{"char":"|","type":"punctuation","keyId":"backslash","layer":"shift","finger":"rp","hand":"R","frequency":"low"},{"char":"\\","type":"punctuation","keyId":"backslash","layer":"base","finger":"rp","hand":"R","frequency":"low"},{"char":"`","type":"punctuation","keyId":"grave","layer":"base","finger":"lp","hand":"L","frequency":"low"},{"char":"~","type":"punctuation","keyId":"grave","layer":"shift","finger":"lp","hand":"L","frequency":"low"},{"char":"<","type":"punctuation","keyId":"comma","layer":"shift","finger":"rm","hand":"R","frequency":"low"},{"char":">","type":"punctuation","keyId":"period","layer":"shift","finger":"rr","hand":"R","frequency":"low"},{"char":" ","type":"space","keyId":"space","layer":"base","finger":"lt","hand":"L","frequency":"very-high"}];

  // Fast lookup maps
  const CATALOG_MAPS = {
    standard: {},
    nida: {},
    english: {}
  };

  KHMER_CATALOG.forEach(c => {
    CATALOG_MAPS.standard[c.char] = c;
    CATALOG_MAPS.nida[c.char] = c;
  });
  ENGLISH_CATALOG.forEach(c => {
    CATALOG_MAPS.english[c.char] = c;
  });

  /* In-memory review state */
  const reviewState = {
    version: 2,
    completedReviews: [],
    dismissedCandidates: { standard: {}, nida: {}, english: {} },
    lastReviewTimestamps: { standard: null, nida: null, english: null },
    rules: Object.assign({}, DEFAULT_REVIEW_RULES)
  };

  /* Normalization helper */
  function normalizeLayout(id){
    if(!id) return 'nida';
    const s = String(id).toLowerCase();
    if(s.includes('eng')) return 'english';
    if(s.includes('std') || s.includes('standard')) return 'standard';
    return 'nida';
  }

  /* Seeded PRNG for deterministic practice generation */
  function mulberry32(a){
    return function(){
      let t = (a += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- Persistence (Debounced & Safe) ---------- */
  let saveTimeout = null;

  function loadReviewData(){
    try {
      if(typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return;
      const parsed = JSON.parse(raw);
      if(!parsed || typeof parsed !== 'object') return;

      if(Array.isArray(parsed.completedReviews)){
        reviewState.completedReviews = parsed.completedReviews.slice(-50);
      }
      if(parsed.dismissedCandidates && typeof parsed.dismissedCandidates === 'object'){
        VALID_LAYOUTS.forEach(l => {
          if(parsed.dismissedCandidates[l]){
            reviewState.dismissedCandidates[l] = parsed.dismissedCandidates[l];
          }
        });
      }
      if(parsed.lastReviewTimestamps && typeof parsed.lastReviewTimestamps === 'object'){
        VALID_LAYOUTS.forEach(l => {
          if(parsed.lastReviewTimestamps[l]){
            reviewState.lastReviewTimestamps[l] = parsed.lastReviewTimestamps[l];
          }
        });
      }
      if(parsed.rules && typeof parsed.rules === 'object'){
        reviewState.rules = Object.assign({}, DEFAULT_REVIEW_RULES, parsed.rules);
      }
    } catch(err){
      console.warn('PK_REVIEW: Failed to load from localStorage:', err);
    }
  }

  function saveReviewData(){
    if(saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(flush, 500);
  }

  function flush(){
    if(saveTimeout){
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
    try {
      if(typeof localStorage === 'undefined') return;
      if(typeof window !== 'undefined' && window.__isResettingProgress) return;
      const payload = {
        version: 2,
        completedReviews: reviewState.completedReviews.slice(-50),
        dismissedCandidates: reviewState.dismissedCandidates,
        lastReviewTimestamps: reviewState.lastReviewTimestamps,
        rules: reviewState.rules
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch(err){
      console.warn('PK_REVIEW: Failed to save to localStorage:', err);
    }
  }

  loadReviewData();

  /* ============================================================
     CATALOG & METADATA ACCESS
     ============================================================ */

  function getCharacterCatalog(layoutId){
    const l = normalizeLayout(layoutId);
    return l === 'english' ? ENGLISH_CATALOG.slice() : KHMER_CATALOG.slice();
  }

  function getCharacterMeta(layoutId, charUnit){
    const l = normalizeLayout(layoutId);
    return CATALOG_MAPS[l] && CATALOG_MAPS[l][charUnit]
      ? Object.assign({}, CATALOG_MAPS[l][charUnit])
      : null;
  }

  /* ============================================================
     CURRICULUM SAFETY & INTRODUCED SETS
     ============================================================ */

  function getIntroducedCharSet(layoutId){
    const l = normalizeLayout(layoutId);
    const set = new Set();

    // 1. Master Unlock check
    try {
      if(typeof localStorage !== 'undefined' && localStorage.getItem('khmerUnlockAll') === '1'){
        getCharacterCatalog(l).forEach(c => set.add(c.char));
        return set;
      }
    } catch(e){}

    // 2. Scan CURRICULUM_DATA for all unlocked / completed lessons
    const cData = (typeof window !== 'undefined' && window.CURRICULUM_DATA) || (typeof global !== 'undefined' && global.CURRICULUM_DATA);
    if(cData && cData[l] && Array.isArray(cData[l].lessons)){
      const lessons = cData[l].lessons;
      for(let i = 0; i < lessons.length; i++){
        const lesson = lessons[i];
        let isUnlocked = (i === 0);

        if(!isUnlocked && typeof window !== 'undefined' && typeof window.isLessonLocked === 'function'){
          isUnlocked = !window.isLessonLocked(lesson.id);
        } else if(!isUnlocked && typeof global.PK_PROGRESS !== 'undefined'){
          const prevId = (lesson.unlockRequirements && lesson.unlockRequirements.previousLesson) || (lessons[i-1] ? lessons[i-1].id : null);
          const prevProg = prevId ? global.PK_PROGRESS.getLessonProgress(l, prevId) : null;
          isUnlocked = prevProg && (prevProg.completed || prevProg.totalAttempts > 0);
        }

        if(isUnlocked){
          if(Array.isArray(lesson.newKeys)){
            lesson.newKeys.forEach(nk => { if(nk && nk.char) set.add(nk.char); });
          }
        } else {
          break;
        }
      }
    }

    // 3. Scan PK_PROGRESS: any character already practiced with attempts > 0 was introduced
    const progressApi = (typeof window !== 'undefined' && window.PK_PROGRESS) || (typeof global !== 'undefined' && global.PK_PROGRESS);
    if(progressApi && typeof progressApi.getAllCharsProgress === 'function'){
      const allChars = progressApi.getAllCharsProgress(l);
      Object.keys(allChars).forEach(ch => {
        if(allChars[ch] && allChars[ch].attempts > 0){
          set.add(ch);
        }
      });
    }

    // 4. Default anchor fallback if learner is completely brand new
    if(set.size === 0){
      if(l === 'english'){
        ['f', 'j', 'd', 'k', 's', 'l', 'a', ';', ' '].forEach(c => set.add(c));
      } else {
        ['ថ', 'ក', ' ', 'ដ', 'ញ', 'ស', 'ង', 'ហ', 'ល', 'ា'].forEach(c => set.add(c));
      }
    }

    return set;
  }

  function getIntroducedKeySet(layoutId){
    const l = normalizeLayout(layoutId);
    const set = new Set();

    // 1. Master Unlock
    try {
      if(typeof localStorage !== 'undefined' && localStorage.getItem('khmerUnlockAll') === '1'){
        getCharacterCatalog(l).forEach(c => { if(c.keyId) set.add(c.keyId); });
        return set;
      }
    } catch(e){}

    // 2. Scan CURRICULUM_DATA
    const cData = (typeof window !== 'undefined' && window.CURRICULUM_DATA) || (typeof global !== 'undefined' && global.CURRICULUM_DATA);
    if(cData && cData[l] && Array.isArray(cData[l].lessons)){
      const lessons = cData[l].lessons;
      for(let i = 0; i < lessons.length; i++){
        const lesson = lessons[i];
        let isUnlocked = (i === 0);

        if(!isUnlocked && typeof window !== 'undefined' && typeof window.isLessonLocked === 'function'){
          isUnlocked = !window.isLessonLocked(lesson.id);
        } else if(!isUnlocked && typeof global.PK_PROGRESS !== 'undefined'){
          const prevId = (lesson.unlockRequirements && lesson.unlockRequirements.previousLesson) || (lessons[i-1] ? lessons[i-1].id : null);
          const prevProg = prevId ? global.PK_PROGRESS.getLessonProgress(l, prevId) : null;
          isUnlocked = prevProg && (prevProg.completed || prevProg.totalAttempts > 0);
        }

        if(isUnlocked){
          if(Array.isArray(lesson.newKeys)){
            lesson.newKeys.forEach(nk => { if(nk && nk.keyId) set.add(nk.keyId); });
          }
          if(Array.isArray(lesson.requiredKeys)){
            lesson.requiredKeys.forEach(k => set.add(k));
          }
        } else {
          break;
        }
      }
    }

    // 3. Scan PK_PROGRESS keys
    const progressApi = (typeof window !== 'undefined' && window.PK_PROGRESS) || (typeof global !== 'undefined' && global.PK_PROGRESS);
    if(progressApi && typeof progressApi.getAllKeysProgress === 'function'){
      const allKeys = progressApi.getAllKeysProgress(l);
      Object.keys(allKeys).forEach(k => {
        if(allKeys[k] && allKeys[k].attempts > 0){
          set.add(k);
        }
      });
    }

    // 4. Default anchor fallback
    if(set.size === 0){
      if(l === 'english'){
        ['f', 'j', 'd', 'k', 's', 'l', 'a', 'semicolon', 'space'].forEach(k => set.add(k));
      } else {
        ['f', 'k', 'd', 'j', 's', 'g', 'h', 'l', 'a', 'space'].forEach(k => set.add(k));
      }
    }

    return set;
  }

  function isCharacterIntroduced(layoutId, charUnit){
    if(!charUnit) return false;
    const l = normalizeLayout(layoutId);
    return getIntroducedCharSet(l).has(charUnit);
  }

  function isKeyIntroduced(layoutId, keyId){
    if(!keyId) return false;
    const l = normalizeLayout(layoutId);
    return getIntroducedKeySet(l).has(keyId);
  }

  /* ============================================================
     LAYOUT AVERAGE METRICS & PHASE 7 MASTERY
     ============================================================ */

  function getLayoutAverageResponseTime(layoutId){
    const l = normalizeLayout(layoutId);
    if(typeof PK_TRACKER !== 'undefined' && typeof PK_TRACKER.getAllCharStats === 'function'){
      const allStats = PK_TRACKER.getAllCharStats(l);
      let totalMs = 0, count = 0;
      Object.keys(allStats).forEach(ch => {
        const s = allStats[ch];
        if(s && s.attempts >= 5 && s.avgResponseTimeMs > 0){
          totalMs += s.avgResponseTimeMs;
          count++;
        }
      });
      if(count > 0) return Math.round(totalMs / count);
    }
    return 450;
  }

  function computeCharacterMastery(layoutId, charUnit){
    const l = normalizeLayout(layoutId);
    if(!charUnit) return 'locked';
    if(!isCharacterIntroduced(l, charUnit)) return 'locked';

    const progressApi = (typeof window !== 'undefined' && window.PK_PROGRESS) || (typeof global !== 'undefined' && global.PK_PROGRESS);
    if(!progressApi || typeof progressApi.getCharProgress !== 'function'){
      return 'learning';
    }

    const p = progressApi.getCharProgress(l, charUnit);
    if(!p || p.attempts < 15 || p.accuracy < 85){
      return 'learning';
    }
    if(p.attempts >= 40 && p.accuracy >= 95 && p.avgResponseTimeMs <= 600){
      return 'mastered';
    }
    return 'proficient';
  }

  function getCharacterMasterySummary(layoutId){
    const l = normalizeLayout(layoutId);
    const catalog = getCharacterCatalog(l);
    const total = catalog.length;
    let mastered = 0, proficient = 0, learning = 0, locked = 0;
    const breakdown = { mastered: [], proficient: [], learning: [], locked: [] };

    catalog.forEach(item => {
      const ch = item.char;
      const status = computeCharacterMastery(l, ch);
      breakdown[status].push(ch);
      if(status === 'mastered') mastered++;
      else if(status === 'proficient') proficient++;
      else if(status === 'learning') learning++;
      else if(status === 'locked') locked++;
    });

    return {
      layout: l,
      total,
      mastered,
      proficient,
      learning,
      locked,
      masteredPct: total > 0 ? Math.round((mastered / total) * 100) : 0,
      proficientPct: total > 0 ? Math.round((proficient / total) * 100) : 0,
      learningPct: total > 0 ? Math.round((learning / total) * 100) : 0,
      lockedPct: total > 0 ? Math.round((locked / total) * 100) : 0,
      overallScorePct: total > 0
        ? Math.round(((mastered * 1.0 + proficient * 0.7 + learning * 0.2) / total) * 100)
        : 0,
      breakdown
    };
  }

  function getConfusionPairs(layoutId, minOccurrences = 3){
    const l = normalizeLayout(layoutId);
    if(typeof PK_TRACKER === 'undefined') return [];
    const pairCounts = {}, pairMeta = {};
    const mistakes = (typeof PK_TRACKER.getRecentMistakes === 'function')
      ? PK_TRACKER.getRecentMistakes(100)
      : [];

    mistakes.forEach(m => {
      if(m && m.layout === l && m.expected && m.produced && m.expected !== m.produced){
        const key = m.expected + '->' + m.produced;
        pairCounts[key] = (pairCounts[key] || 0) + 1;
        if(!pairMeta[key]){
          pairMeta[key] = { expected: m.expected, produced: m.produced, lastOccurred: m.timestamp || Date.now() };
        }
      }
    });

    const result = [];
    Object.keys(pairCounts).forEach(k => {
      if(pairCounts[k] >= minOccurrences){
        result.push({
          expected: pairMeta[k].expected,
          produced: pairMeta[k].produced,
          count: pairCounts[k],
          lastOccurred: pairMeta[k].lastOccurred,
          priority: 'high',
          recommendedAction: 'generate-alternating-pair-drill'
        });
      }
    });
    return result.sort((a, b) => b.count - a.count);
  }

  function getSlowKeys(layoutId, thresholdRatio = 1.8){
    const l = normalizeLayout(layoutId);
    const progressApi = (typeof window !== 'undefined' && window.PK_PROGRESS) || (typeof global !== 'undefined' && global.PK_PROGRESS);
    if(!progressApi || typeof progressApi.getAllKeysProgress !== 'function') return [];
    const allKeys = progressApi.getAllKeysProgress(l);
    const layoutAvg = getLayoutAverageResponseTime(l);
    const thresholdMs = layoutAvg * thresholdRatio;
    const result = [];

    Object.keys(allKeys).forEach(k => {
      const p = allKeys[k];
      if(p && p.attempts >= 4 && p.avgResponseTimeMs > thresholdMs){
        result.push({
          keyId: k,
          avgResponseTimeMs: p.avgResponseTimeMs,
          ratio: Math.round((p.avgResponseTimeMs / layoutAvg) * 10) / 10,
          accuracy: p.accuracy,
          attempts: p.attempts,
          priority: 'medium',
          recommendedAction: 'generate-speed-drill'
        });
      }
    });
    return result.sort((a, b) => b.ratio - a.ratio);
  }

  function getStaleCharacters(layoutId, thresholdDays = 7){
    const l = normalizeLayout(layoutId);
    const progressApi = (typeof window !== 'undefined' && window.PK_PROGRESS) || (typeof global !== 'undefined' && global.PK_PROGRESS);
    if(!progressApi || typeof progressApi.getAllCharsProgress !== 'function') return [];
    const allChars = progressApi.getAllCharsProgress(l);
    const now = Date.now();
    const thresholdMs = thresholdDays * 86400000;
    const result = [];

    Object.keys(allChars).forEach(ch => {
      const p = allChars[ch];
      if(p && p.attempts >= 5 && p.accuracy >= 85 && p.lastPracticed){
        const elapsed = now - p.lastPracticed;
        if(elapsed > thresholdMs){
          result.push({
            char: ch,
            daysAgo: Math.round((elapsed / 86400000) * 10) / 10,
            accuracy: p.accuracy,
            attempts: p.attempts,
            priority: 'low',
            recommendedAction: 'refresher-drill'
          });
        }
      }
    });
    return result.sort((a, b) => b.daysAgo - a.daysAgo);
  }

  function getLowAccuracyCharacters(layoutId, threshold = 85){
    const l = normalizeLayout(layoutId);
    const progressApi = (typeof window !== 'undefined' && window.PK_PROGRESS) || (typeof global !== 'undefined' && global.PK_PROGRESS);
    if(!progressApi || typeof progressApi.getAllCharsProgress !== 'function') return [];
    const allChars = progressApi.getAllCharsProgress(l);
    const result = [];

    Object.keys(allChars).forEach(ch => {
      const p = allChars[ch];
      if(p && p.attempts >= 3 && p.accuracy < threshold && p.incorrect >= 2){
        result.push({
          char: ch,
          accuracy: p.accuracy,
          attempts: p.attempts,
          incorrect: p.incorrect,
          priority: p.accuracy < 70 ? 'high' : 'medium',
          recommendedAction: 'generate-targeted-drill'
        });
      }
    });
    return result.sort((a, b) => a.accuracy - b.accuracy);
  }

  function getReviewCandidates(layoutId, maxCount = 8){
    return getReviewTargets(layoutId, { maxCount });
  }

  function getCharacterDetail(layoutId, charUnit){
    const l = normalizeLayout(layoutId);
    const meta = getCharacterMeta(l, charUnit);
    const progressApi = (typeof window !== 'undefined' && window.PK_PROGRESS) || (typeof global !== 'undefined' && global.PK_PROGRESS);
    const p = progressApi ? progressApi.getCharProgress(l, charUnit) : null;
    const mastery = computeCharacterMastery(l, charUnit);
    const layoutAvgMs = getLayoutAverageResponseTime(l);

    return {
      char: charUnit,
      layout: l,
      mastery,
      meta,
      stats: p,
      layoutAvgMs,
      isIntroduced: isCharacterIntroduced(l, charUnit)
    };
  }

  /* ============================================================
     PHASE 8 REVIEW TARGET DETECTION & SCORING
     ============================================================ */

  /**
   * Identifies all valid review candidates for a layout,
   * calculates explainable priority scores, and ranks them.
   */
  function getReviewTargets(layoutId, options = {}){
    const l = normalizeLayout(layoutId);
    const maxCount = options.maxCount || 8;
    const minEvidenceAttempts = reviewState.rules.minEvidenceAttempts || 3;
    const minEvidenceErrors = reviewState.rules.minEvidenceErrors || 2;
    const now = Date.now();
    const dismissalWindowMs = 24 * 3600 * 1000;
    const dismissed = reviewState.dismissedCandidates[l] || {};

    const progressApi = (typeof window !== 'undefined' && window.PK_PROGRESS) || (typeof global !== 'undefined' && global.PK_PROGRESS);
    if(!progressApi) return [];

    const introducedChars = getIntroducedCharSet(l);
    const introducedKeys = getIntroducedKeySet(l);
    const targets = [];

    // 1. Weak Physical Keys (PK_PROGRESS keys)
    const allKeys = progressApi.getAllKeysProgress(l);
    Object.keys(allKeys).forEach(k => {
      const kp = allKeys[k];
      if(!kp || kp.attempts < minEvidenceAttempts) return;
      if(!introducedKeys.has(k)) return;
      if(dismissed[k] && (now - dismissed[k]) < dismissalWindowMs) return;

      // Mastered check: if accuracy >= 90% and attempts >= 10, skip unless declining
      if(kp.accuracy >= 90 && kp.attempts >= 10 && kp.incorrect < 2) return;

      if(kp.accuracy < 85 && kp.incorrect >= minEvidenceErrors){
        const deficit = 100 - kp.accuracy;
        const volumeFactor = Math.log2(Math.max(2, kp.attempts));
        const priorityScore = (deficit * volumeFactor) + (kp.incorrect * 10);
        const priority = (kp.accuracy < 70 || kp.incorrect >= 5) ? 'high' : 'medium';

        targets.push({
          id: `target_key_${k}`,
          targetId: k,
          type: 'key',
          category: 'key',
          title: `Key ${k.toUpperCase()}`,
          titleKm: `គ្រាប់ចុច ${k.toUpperCase()}`,
          reason: `Accuracy is ${kp.accuracy}% with ${kp.incorrect} errors over ${kp.attempts} strokes.`,
          accuracy: kp.accuracy,
          attempts: kp.attempts,
          errors: kp.incorrect,
          avgResponseTimeMs: kp.avgResponseTimeMs,
          priority,
          priorityScore,
          triggers: ['low-accuracy', 'repeated-mistakes']
        });
      }
    });

    // 2. Weak Logical Characters & Multi-Codepoint Units
    const allChars = progressApi.getAllCharsProgress(l);
    Object.keys(allChars).forEach(ch => {
      const cp = allChars[ch];
      if(!cp || cp.attempts < minEvidenceAttempts) return;
      if(!introducedChars.has(ch)) return;
      if(dismissed[ch] && (now - dismissed[ch]) < dismissalWindowMs) return;

      const isMasteredHealthy = (cp.accuracy >= 90 && cp.attempts >= 10 && cp.incorrect < 2);

      if(!isMasteredHealthy && cp.accuracy < 85 && cp.incorrect >= minEvidenceErrors){
        const deficit = 100 - cp.accuracy;
        const volumeFactor = Math.log2(Math.max(2, cp.attempts));
        const priorityScore = (deficit * volumeFactor) + (cp.incorrect * 10);
        const priority = (cp.accuracy < 70 || cp.incorrect >= 5) ? 'high' : 'medium';

        targets.push({
          id: `target_char_${ch}`,
          targetId: ch,
          type: 'character',
          category: 'char',
          title: `Character "${ch}"`,
          titleKm: `តួអក្សរ «${ch}»`,
          reason: `Character "${ch}" has ${cp.accuracy}% accuracy (${cp.incorrect} mistakes in ${cp.attempts} attempts).`,
          accuracy: cp.accuracy,
          attempts: cp.attempts,
          errors: cp.incorrect,
          avgResponseTimeMs: cp.avgResponseTimeMs,
          priority,
          priorityScore,
          triggers: ['low-accuracy']
        });
      } else if(cp.lastPracticed && (now - cp.lastPracticed) > (7 * 86400000) && cp.accuracy >= 85){
        // Stale refresher
        const daysAgo = Math.round((now - cp.lastPracticed) / 86400000);
        targets.push({
          id: `target_stale_${ch}`,
          targetId: ch,
          type: 'character',
          category: 'char',
          title: `Refresh "${ch}"`,
          titleKm: `រំលឹក «${ch}»`,
          reason: `Quick refresher: Not practiced in ${daysAgo} days (previously ${cp.accuracy}%).`,
          accuracy: cp.accuracy,
          attempts: cp.attempts,
          errors: cp.incorrect,
          avgResponseTimeMs: cp.avgResponseTimeMs,
          priority: 'low',
          priorityScore: 25 + Math.min(25, daysAgo),
          triggers: ['stale-character']
        });
      }
    });

    // 3. Weak Finger Concentration
    if(progressApi && typeof progressApi.getAllFingersProgress === 'function'){
      const allFingers = progressApi.getAllFingersProgress(l);
      let totalFingerErrors = 0;
      Object.keys(allFingers).forEach(f => {
        if(allFingers[f]) totalFingerErrors += (allFingers[f].incorrect || 0);
      });

      const fingerNames = {
        lp: 'Left Pinky', lr: 'Left Ring', lm: 'Left Middle', li: 'Left Index', lt: 'Left Thumb',
        rt: 'Right Thumb', ri: 'Right Index', rm: 'Right Middle', rr: 'Right Ring', rp: 'Right Pinky'
      };

      Object.keys(allFingers).forEach(f => {
        const fp = allFingers[f];
        if(!fp || fp.attempts < 3 || fp.incorrect < 2) return;
        const errShare = totalFingerErrors > 0 ? (fp.incorrect / totalFingerErrors) * 100 : 0;

        // If accuracy < 75% or error share >= 30% and >= 3 errors
        if(fp.accuracy < 75 || (errShare >= 30 && fp.incorrect >= 3)){
          const fName = fingerNames[f] || f.toUpperCase();
          targets.push({
            id: `target_finger_${f}`,
            targetId: f,
            type: 'finger',
            category: 'finger',
            title: `${fName} Coordination`,
            titleKm: `ការសម្របសម្រួលម្រាមដៃ ${fName}`,
            reason: `Finger error concentration on ${f.toUpperCase()} (${Math.round(errShare)}% error share, ${fp.incorrect} mistakes).`,
            accuracy: fp.accuracy,
            attempts: fp.attempts,
            errors: fp.incorrect,
            avgResponseTimeMs: fp.avgResponseTimeMs || 450,
            priority: (fp.accuracy < 60 || errShare >= 40) ? 'high' : 'medium',
            priorityScore: 90 + Math.round(errShare),
            triggers: ['finger-fatigue']
          });
        }
      });
    }

    // 4. Slow Keys (High accuracy but sluggish)
    const slowList = getSlowKeys(l, reviewState.rules.slowKeyRatioThreshold || 1.8);
    slowList.forEach(sk => {
      if(!introducedKeys.has(sk.keyId)) return;
      targets.push({
        id: `target_slow_${sk.keyId}`,
        targetId: sk.keyId,
        type: 'speed',
        category: 'speed',
        title: `Fluidity on Key ${sk.keyId.toUpperCase()}`,
        titleKm: `ល្បឿនគ្រាប់ចុច ${sk.keyId.toUpperCase()}`,
        reason: `Good accuracy (${sk.accuracy}%) but response time is ${sk.avgResponseTimeMs}ms (${sk.ratio}x average).`,
        accuracy: sk.accuracy,
        attempts: sk.attempts,
        errors: 0,
        avgResponseTimeMs: sk.avgResponseTimeMs,
        priority: 'medium',
        priorityScore: 40 + Math.round(sk.ratio * 15),
        triggers: ['slow-key']
      });
    });

    // 5. Confusion Pairs
    const pairs = getConfusionPairs(l, reviewState.rules.confusionMinCount || 3);
    pairs.forEach(p => {
      if(!introducedChars.has(p.expected) || !introducedChars.has(p.produced)) return;
      targets.push({
        id: `target_confusion_${p.expected}_${p.produced}`,
        targetId: `${p.expected}->${p.produced}`,
        type: 'confusion',
        category: 'confusion',
        title: `Contrast: ${p.expected} vs ${p.produced}`,
        titleKm: `ប្រៀបធៀប៖ ${p.expected} និង ${p.produced}`,
        reason: `Repeatedly substituted "${p.produced}" when "${p.expected}" was required (${p.count} times).`,
        accuracy: 75,
        attempts: p.count * 3,
        errors: p.count,
        avgResponseTimeMs: 450,
        priority: 'high',
        priorityScore: 110 + (p.count * 10),
        triggers: ['confusion-pair']
      });
    });

    // Deduplicate by targetId keeping highest score
    const targetMap = {};
    targets.forEach(t => {
      const existing = targetMap[t.targetId];
      if(!existing || t.priorityScore > existing.priorityScore){
        targetMap[t.targetId] = t;
      }
    });

    // Sort descending by priorityScore
    const finalTargets = Object.values(targetMap).sort((a, b) => b.priorityScore - a.priorityScore);
    return finalTargets.slice(0, maxCount);
  }

  /* ============================================================
     PHASE 8 ADAPTIVE DRILL GENERATOR
     ============================================================ */

  /**
   * Generates a pedagogical, deterministic adaptive drill
   * combining weak target with solid home row anchor keys.
   */
  function generateReviewDrill(layoutId, options = {}){
    const l = normalizeLayout(layoutId);
    const target = options.target || null;
    const category = options.category || (target ? 'key' : 'mixed');
    const length = Math.max(20, Math.min(options.length || reviewState.rules.targetDrillLength || 28, 40));
    const rng = options.seed ? mulberry32(options.seed) : Math.random;

    const introducedChars = getIntroducedCharSet(l);
    const introducedKeys = getIntroducedKeySet(l);

    // Identify target weakness
    let targetObj = null;
    if(target){
      targetObj = {
        targetId: target,
        type: category,
        title: target.toUpperCase(),
        titleKm: target,
        reason: `Targeted review on ${target}`
      };
    } else {
      const candidates = getReviewTargets(l, { maxCount: 1 });
      if(candidates.length > 0){
        targetObj = candidates[0];
      }
    }

    // Default fallback anchors if learner has no weaknesses
    const englishAnchors = ['f', 'j', 'd', 'k', 's', 'l', 'a', ';'].filter(c => introducedChars.has(c));
    const khmerAnchors = ['ថ', 'ក', 'ដ', 'ញ', 'ស', 'ង', 'ហ', 'ល', 'ា'].filter(c => introducedChars.has(c));
    const activeAnchors = l === 'english'
      ? (englishAnchors.length > 0 ? englishAnchors : ['f', 'j', 'd', 'k'])
      : (khmerAnchors.length > 0 ? khmerAnchors : ['ថ', 'ក', 'ដ', 'ញ']);

    let targetChar = 'f';
    let targetKey = 'f';

    if(targetObj){
      if(targetObj.type === 'key'){
        targetKey = targetObj.targetId;
        const catalog = getCharacterCatalog(l);
        const match = catalog.find(c => c.keyId === targetKey && c.layer === 'base');
        targetChar = match ? match.char : targetKey;
      } else if(targetObj.type === 'finger'){
        const fingerMap = {
          li: l === 'english' ? ['f', 'g', 'r', 't', 'v', 'b'] : ['ថ', 'ង', 'េ', 'រ', 'ត', 'វ'],
          ri: l === 'english' ? ['j', 'h', 'u', 'y', 'm', 'n'] : ['ក', 'ហ', 'ុ', 'យ', 'ម', 'ន'],
          lm: l === 'english' ? ['d', 'e', 'c'] : ['ដ', 'ច', 'ឌ'],
          rm: l === 'english' ? ['k', 'i', 'comma'] : ['ក', 'ិ', 'ុំ'],
          lr: l === 'english' ? ['s', 'w', 'x'] : ['ស', 'ឹ', 'ខ'],
          rr: l === 'english' ? ['l', 'o', 'period'] : ['ល', 'ោ', '។'],
          lp: l === 'english' ? ['a', 'q', 'z'] : ['ា', 'ឆ', 'ឋ'],
          rp: l === 'english' ? [';', 'p', 'slash'] : ['ើ', 'ផ', '៊']
        };
        const fKeys = (fingerMap[targetObj.targetId] || ['f', 'j']).filter(k => introducedChars.has(k));
        targetChar = fKeys[0] || activeAnchors[0];
        targetKey = targetChar;
      } else {
        targetChar = targetObj.targetId;
        targetKey = targetChar;
      }
    } else {
      targetChar = activeAnchors[0];
      targetKey = targetChar;
      targetObj = {
        targetId: targetChar,
        type: 'key',
        title: targetChar.toUpperCase(),
        titleKm: targetChar,
        reason: 'Baseline rhythm and accuracy practice'
      };
    }

    // Build drill tokens using alternating anchoring patterns
    const tokens = [];
    const a1 = activeAnchors[0] || 'f';
    const a2 = activeAnchors[1] || 'j';
    const a3 = activeAnchors[2] || 'd';
    const a4 = activeAnchors[3] || 'k';

    // Pattern 1: Target Isolation Focus (e.g. F F F F)
    tokens.push(targetChar, targetChar, targetChar, targetChar, ' ');

    // Pattern 2: Home Row Sandwich (e.g. A1 T A1 Space A2 T A2 Space)
    tokens.push(a1, targetChar, a1, ' ', a2, targetChar, a2, ' ');

    // Pattern 3: Alternating Contrast (e.g. T A3 T A3 Space T A4 T A4 Space)
    tokens.push(targetChar, a3, targetChar, a3, ' ', targetChar, a4, targetChar, a4, ' ');

    // Pattern 4: Double Anchor Integration (e.g. A1 A1 T T A2 A2 Space)
    tokens.push(a1, a1, targetChar, targetChar, a2, a2, ' ');

    // Pattern 5: Fluency Rhythm
    tokens.push(targetChar, a2, targetChar, a1, targetChar, ' ');

    // Slice or pad to requested length
    let chars = tokens.slice(0, length);
    if(chars.length < length){
      while(chars.length < length){
        chars.push(targetChar, a1, ' ');
      }
      chars = chars.slice(0, length);
    }
    // Clean up trailing space if present at end
    if(chars[chars.length - 1] === ' '){
      chars.pop();
    }

    // Strict Curriculum Safety Filter:
    // Guarantee NO unintroduced characters are in the generated drill
    chars = chars.map(c => {
      if(c === ' ') return ' ';
      return introducedChars.has(c) ? c : a1;
    });

    // Build parallel layers and keyIds arrays
    const layers = [];
    const keyIds = [];
    chars.forEach(ch => {
      if(ch === ' '){
        layers.push('base');
        keyIds.push('space');
      } else {
        const meta = getCharacterMeta(l, ch);
        if(meta){
          layers.push(meta.layer || 'base');
          keyIds.push(meta.keyId || ch);
        } else {
          layers.push('base');
          keyIds.push(ch);
        }
      }
    });

    // Query before baseline stats from PK_PROGRESS
    const progressApi = (typeof window !== 'undefined' && window.PK_PROGRESS) || (typeof global !== 'undefined' && global.PK_PROGRESS);
    let beforeStats = null;
    if(progressApi){
      if(targetObj.type === 'key'){
        beforeStats = progressApi.getKeyProgress(l, targetKey);
      } else {
        beforeStats = progressApi.getCharProgress(l, targetChar);
      }
    }

    const drillDef = {
      id: `rev_${targetKey}_${Date.now()}`,
      title: `Review — ${targetObj.title}`,
      titleKm: `ការរំលឹក — ${targetObj.titleKm || targetObj.title}`,
      type: 'review',
      category: targetObj.category || 'key',
      target: targetObj.targetId,
      targetKey: targetKey,
      targetChar: targetChar,
      reason: targetObj.reason,
      isRemedial: true,
      threshold: 85,
      beforeStats: beforeStats ? {
        accuracy: beforeStats.accuracy,
        avgResponseTimeMs: beforeStats.avgResponseTimeMs,
        attempts: beforeStats.attempts
      } : { accuracy: 80, avgResponseTimeMs: 450, attempts: 5 },
      chars,
      layers,
      keyIds,
      sections: [
        {
          id: 'sec_rev_1',
          type: 'drill',
          title: `Focused ${targetChar} Practice`,
          startIndex: 0,
          endIndex: chars.length - 1,
          totalUnits: chars.length
        }
      ],
      generate: function(){
        return {
          chars: this.chars,
          layers: this.layers,
          keyIds: this.keyIds,
          sections: this.sections
        };
      }
    };

    return drillDef;
  }

  /* ============================================================
     PHASE 8 REVIEW COMPLETION & BEFORE / AFTER MEASUREMENT
     ============================================================ */

  /**
   * Finalizes an adaptive review drill, measures improvement delta,
   * and updates persistent storage via PK_PROGRESS.
   */
  function completeReviewSession(layoutId, drillDef, attemptResult = {}){
    if(!drillDef) return null;
    const l = normalizeLayout(layoutId);
    const progressApi = (typeof window !== 'undefined' && window.PK_PROGRESS) || (typeof global !== 'undefined' && global.PK_PROGRESS);

    const targetKey = drillDef.targetKey || drillDef.target;
    const targetChar = drillDef.targetChar || drillDef.target;
    const before = drillDef.beforeStats || { accuracy: 80, avgResponseTimeMs: 500, attempts: 5 };

    // Record review attempt into persistent progress if passed
    if(progressApi && typeof progressApi.recordLessonAttempt === 'function'){
      progressApi.recordLessonAttempt({
        layoutId: l,
        lessonId: drillDef.id,
        levelId: 'review',
        accuracy: attemptResult.accuracy || 100,
        wpm: attemptResult.wpm || 0,
        timeSec: attemptResult.timeSec || 15,
        mistakes: attemptResult.mistakes || 0,
        corrections: attemptResult.corrections || 0,
        units: drillDef.chars ? drillDef.chars.length : 25,
        threshold: 85,
        sections: drillDef.sections
      });
    }

    // Record simulated units so key & char progress gets updated
    if(progressApi && typeof progressApi.recordTypingUnit === 'function' && Array.isArray(drillDef.chars)){
      const errCount = attemptResult.mistakes || 0;
      const totalUnits = drillDef.chars.length;
      const correctCount = Math.max(0, totalUnits - errCount);

      for(let i = 0; i < correctCount; i++){
        progressApi.recordTypingUnit({
          layout: l,
          expectedKeyId: targetKey,
          expected: targetChar,
          correct: true,
          responseTimeMs: attemptResult.avgResponseTimeMs || 280
        });
      }
      for(let i = 0; i < errCount; i++){
        progressApi.recordTypingUnit({
          layout: l,
          expectedKeyId: targetKey,
          expected: targetChar,
          correct: false,
          responseTimeMs: attemptResult.avgResponseTimeMs ? attemptResult.avgResponseTimeMs * 1.5 : 450
        });
      }
    }

    // Query updated after-statistics
    let after = null;
    if(progressApi){
      if(drillDef.category === 'key'){
        after = progressApi.getKeyProgress(l, targetKey);
      } else {
        after = progressApi.getCharProgress(l, targetChar);
      }
    }

    const afterAcc = (typeof attemptResult.accuracy === 'number')
      ? attemptResult.accuracy
      : (after ? after.accuracy : 100);
    const afterTime = (typeof attemptResult.avgResponseTimeMs === 'number')
      ? attemptResult.avgResponseTimeMs
      : (after ? after.avgResponseTimeMs : (before.avgResponseTimeMs || 400));

    const deltaAcc = afterAcc - before.accuracy;
    const deltaSpeed = before.avgResponseTimeMs - afterTime;

    const improved = afterAcc >= 90 || deltaAcc >= 4 || (attemptResult.accuracy && attemptResult.accuracy >= 90);

    let message = '';
    if(improved){
      message = (deltaAcc > 0)
        ? `Target accuracy improved from ${before.accuracy}% to ${afterAcc}% (+${deltaAcc}%)!`
        : `Target practiced at ${afterAcc}% accuracy with steady fluency.`;
    } else {
      message = `Target accuracy is ${afterAcc}%. Additional practice will build muscle memory.`;
    }

    // Record completed review session in reviewState
    const revRecord = {
      id: drillDef.id,
      layoutId: l,
      target: drillDef.target,
      beforeAccuracy: before.accuracy,
      afterAccuracy: afterAcc,
      deltaAccuracy: deltaAcc,
      improved: !!improved,
      message,
      timestamp: Date.now()
    };

    reviewState.completedReviews.push(revRecord);
    if(reviewState.completedReviews.length > 50){
      reviewState.completedReviews.shift();
    }
    reviewState.lastReviewTimestamps[l] = revRecord.timestamp;
    saveReviewData();

    return revRecord;
  }

  /* ============================================================
     IN-SESSION REAL-TIME MICRO-ADAPTATION
     ============================================================ */

  /**
   * Adapts upcoming exercise units during an active practice session
   * if the learner starts struggling with a specific unit.
   */
  function adaptPracticeSession(sessionState, strokeResult){
    if(!sessionState || !strokeResult) return sessionState;
    if(!sessionState.windowErrors) sessionState.windowErrors = {};
    if(!sessionState.windowCount) sessionState.windowCount = 0;

    sessionState.windowCount++;
    if(!strokeResult.correct && strokeResult.expected){
      sessionState.windowErrors[strokeResult.expected] = (sessionState.windowErrors[strokeResult.expected] || 0) + 1;
    }

    // Every 8 strokes, inspect window
    if(sessionState.windowCount >= 8){
      let worstUnit = null;
      let worstCount = 0;
      Object.keys(sessionState.windowErrors).forEach(u => {
        if(sessionState.windowErrors[u] > worstCount){
          worstCount = sessionState.windowErrors[u];
          worstUnit = u;
        }
      });

      // If learner made >= 2 mistakes on one unit in the window, adapt upcoming units
      if(worstCount >= 2 && worstUnit && Array.isArray(sessionState.upcomingUnits)){
        // Reinforce the unit with an anchor
        const anchor = sessionState.anchor || 'f';
        sessionState.upcomingUnits.splice(2, 0, worstUnit, anchor, worstUnit);
      }

      // Reset micro-window
      sessionState.windowErrors = {};
      sessionState.windowCount = 0;
    }

    return sessionState;
  }

  /* Dismiss candidate temporarily */
  function dismissCandidate(layoutId, candidateId){
    const l = normalizeLayout(layoutId);
    if(!reviewState.dismissedCandidates[l]){
      reviewState.dismissedCandidates[l] = {};
    }
    reviewState.dismissedCandidates[l][candidateId] = Date.now();
    saveReviewData();
  }

  /* Record completed review */
  function recordReviewCompleted(record){
    if(!record) return;
    const l = normalizeLayout(record.layoutId);
    const entry = {
      id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      layoutId: l,
      timestamp: Date.now(),
      characters: Array.isArray(record.characters) ? record.characters.slice() : [],
      accuracy: typeof record.accuracy === 'number' ? record.accuracy : 100,
      totalUnits: typeof record.totalUnits === 'number' ? record.totalUnits : 0,
      durationMs: typeof record.durationMs === 'number' ? record.durationMs : 0
    };
    reviewState.completedReviews.push(entry);
    if(reviewState.completedReviews.length > 50){
      reviewState.completedReviews.shift();
    }
    reviewState.lastReviewTimestamps[l] = entry.timestamp;
    saveReviewData();
  }

  /* ============================================================
     EXPORTED API
     ============================================================ */

  const api = {
    // Catalogs & Metadata
    getCharacterCatalog,
    getCharacterMeta,
    isCharacterIntroduced,
    isKeyIntroduced,
    getIntroducedCharSet,
    getIntroducedKeySet,

    // Mastery & Summaries
    computeCharacterMastery,
    getCharacterMasterySummary,
    getCharacterDetail,
    getLayoutAverageResponseTime,

    // Weakness & Confusion Detection
    getConfusionPairs,
    getSlowKeys,
    getStaleCharacters,
    getLowAccuracyCharacters,

    // Target Selection & Priority
    getReviewTargets,
    getReviewCandidates,

    // Drill Generator
    generateReviewDrill,
    startAdaptivePractice(layoutId){
      const l = resolveLayout(layoutId);
      const drill = generateReviewDrill(l);
      if(!drill) return null;
      if(typeof global.startLesson === 'function'){
        global.startLesson(drill);
      }
      return drill;
    },

    // Completion & Measurement
    completeReviewSession,
    adaptPracticeSession,
    dismissCandidate,
    recordReviewCompleted,

    // Storage & Rules
    getReviewRules(){ return JSON.parse(JSON.stringify(reviewState.rules)); },
    setReviewRules(r){
      reviewState.rules = Object.assign({}, DEFAULT_REVIEW_RULES, r);
      saveReviewData();
    },
    getCompletedReviews(limit){
      const lim = typeof limit === 'number' && limit > 0 ? limit : 20;
      return reviewState.completedReviews.slice(-lim);
    },
    flush,
    reload: loadReviewData,
    reset(){
      reviewState.completedReviews = [];
      reviewState.dismissedCandidates = { standard: {}, nida: {}, english: {} };
      reviewState.lastReviewTimestamps = { standard: null, nida: null, english: null };
      reviewState.rules = Object.assign({}, DEFAULT_REVIEW_RULES);
      flush();
    }
  };

  global.PK_REVIEW = api;

})(typeof window !== 'undefined' ? window : global);
