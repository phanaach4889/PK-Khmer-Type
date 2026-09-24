/* ============================================================
   PK Khmer Type — Phase 7 Progress Tracking & Mastery System
   ============================================================
   Granular per-character mastery assessment, confusion-pair
   detection, slow-key analysis, stale-character tracking, and
   adaptive review candidate prioritization.
   100% offline, privacy-first, zero network telemetry.
   ============================================================ */

(function(global){
  'use strict';

  const STORAGE_KEY = 'khmerReviewData_v1';
  const VALID_LAYOUTS = ['standard', 'nida', 'english'];

  // Default review rules from data/shared/review-rules.json
  const DEFAULT_REVIEW_RULES = {"version":"1.0.0","triggerRules":[{"id":"low-accuracy","condition":"characterAccuracy < threshold in recent window","threshold":0.85,"recentWindow":20,"action":"generate-targeted-drill","priority":"high"},{"id":"confusion-pair","condition":"two chars confused > threshold times","threshold":3,"recentWindow":100,"action":"generate-alternating-pair-drill","priority":"high"},{"id":"slow-key","condition":"response time > 2x average","threshold":2,"recentWindow":50,"action":"generate-speed-drill","priority":"medium"},{"id":"shift-mistake","condition":"> threshold shift errors on a char","threshold":3,"recentWindow":50,"action":"generate-shift-specific-drill","priority":"medium"},{"id":"stale-character","condition":"not practiced in > threshold days","threshold":7,"recentWindow":null,"action":"include-in-next-review","priority":"low"},{"id":"level-regression","condition":"level accuracy drops below unlock threshold","threshold":0.85,"recentWindow":100,"action":"suggest-level-review","priority":"high"}],"drillComposition":{"singleCharRepetition":0.4,"pairDrills":0.3,"wordPractice":0.2,"sentencePractice":0.1},"reviewSchedule":{"insertEveryNLessons":5,"maxCharactersPerReview":8,"minAccuracyToClear":0.85,"staleDays":7}};

  // Pre-bundled character metadata catalogs for zero-latency offline operation
  const KHMER_CATALOG = [{"char":"ក","unicode":"U+1780","codepoint":6016,"name":"Ka","nameKm":"កា","type":"consonant","series":"a-series","group":"velar","keyId":"k","layer":"base","finger":"rm","hand":"R","frequency":"very-high","pairedChar":"គ","pairedKeyId":"k","pairedLayer":"shift"},{"char":"ខ","unicode":"U+1781","codepoint":6017,"name":"Kha","nameKm":"ខា","type":"consonant","series":"a-series","group":"velar","keyId":"x","layer":"base","finger":"lr","hand":"L","frequency":"medium","pairedChar":"ឃ","pairedKeyId":"x","pairedLayer":"shift"},{"char":"គ","unicode":"U+1782","codepoint":6018,"name":"Ko","nameKm":"គោ","type":"consonant","series":"o-series","group":"velar","keyId":"k","layer":"shift","finger":"rm","hand":"R","frequency":"high","pairedChar":"ក","pairedKeyId":"k","pairedLayer":"base"},{"char":"ឃ","unicode":"U+1783","codepoint":6019,"name":"Kho","nameKm":"ឃោ","type":"consonant","series":"o-series","group":"velar","keyId":"x","layer":"shift","finger":"lr","hand":"L","frequency":"low","pairedChar":"ខ","pairedKeyId":"x","pairedLayer":"base"},{"char":"ង","unicode":"U+1784","codepoint":6020,"name":"Ngo","nameKm":"ង៉ោ","type":"consonant","series":"o-series","group":"velar","keyId":"g","layer":"base","finger":"li","hand":"L","frequency":"high","pairedChar":"អ","pairedKeyId":"g","pairedLayer":"shift"},{"char":"ច","unicode":"U+1785","codepoint":6021,"name":"Ca","nameKm":"ចា","type":"consonant","series":"a-series","group":"palatal","keyId":"c","layer":"base","finger":"lm","hand":"L","frequency":"medium","pairedChar":"ជ","pairedKeyId":"c","pairedLayer":"shift"},{"char":"ឆ","unicode":"U+1786","codepoint":6022,"name":"Cha","nameKm":"ឆា","type":"consonant","series":"a-series","group":"palatal","keyId":"q","layer":"base","finger":"lp","hand":"L","frequency":"low","pairedChar":"ឈ","pairedKeyId":"q","pairedLayer":"shift"},{"char":"ជ","unicode":"U+1787","codepoint":6023,"name":"Co","nameKm":"ជោ","type":"consonant","series":"o-series","group":"palatal","keyId":"c","layer":"shift","finger":"lm","hand":"L","frequency":"medium","pairedChar":"ច","pairedKeyId":"c","pairedLayer":"base"},{"char":"ឈ","unicode":"U+1788","codepoint":6024,"name":"Cho","nameKm":"ឈោ","type":"consonant","series":"o-series","group":"palatal","keyId":"q","layer":"shift","finger":"lp","hand":"L","frequency":"low","pairedChar":"ឆ","pairedKeyId":"q","pairedLayer":"base"},{"char":"ញ","unicode":"U+1789","codepoint":6025,"name":"Nyo","nameKm":"ញោ","type":"consonant","series":"o-series","group":"palatal","keyId":"j","layer":"shift","finger":"ri","hand":"R","frequency":"high"},{"char":"ដ","unicode":"U+178A","codepoint":6026,"name":"Da","nameKm":"ដា","type":"consonant","series":"a-series","group":"retroflex","keyId":"d","layer":"base","finger":"lm","hand":"L","frequency":"high","pairedChar":"ឌ","pairedKeyId":"d","pairedLayer":"shift"},{"char":"ឋ","unicode":"U+178B","codepoint":6027,"name":"Tha","nameKm":"ឋា","type":"consonant","series":"a-series","group":"retroflex","keyId":"z","layer":"base","finger":"lp","hand":"L","frequency":"low","pairedChar":"ឍ","pairedKeyId":"z","pairedLayer":"shift"},{"char":"ឌ","unicode":"U+178C","codepoint":6028,"name":"Do","nameKm":"ឌោ","type":"consonant","series":"o-series","group":"retroflex","keyId":"d","layer":"shift","finger":"lm","hand":"L","frequency":"low","pairedChar":"ដ","pairedKeyId":"d","pairedLayer":"base"},{"char":"ឍ","unicode":"U+178D","codepoint":6029,"name":"Tho","nameKm":"ឍោ","type":"consonant","series":"o-series","group":"retroflex","keyId":"z","layer":"shift","finger":"lp","hand":"L","frequency":"low","pairedChar":"ឋ","pairedKeyId":"z","pairedLayer":"base"},{"char":"ណ","unicode":"U+178E","codepoint":6030,"name":"Na","nameKm":"ណា","type":"consonant","series":"o-series","group":"retroflex","keyId":"n","layer":"shift","finger":"ri","hand":"R","frequency":"medium","pairedChar":"ន","pairedKeyId":"n","pairedLayer":"base"},{"char":"ត","unicode":"U+178F","codepoint":6031,"name":"Ta","nameKm":"តា","type":"consonant","series":"a-series","group":"dental","keyId":"t","layer":"base","finger":"li","hand":"L","frequency":"very-high","pairedChar":"ទ","pairedKeyId":"t","pairedLayer":"shift"},{"char":"ថ","unicode":"U+1790","codepoint":6032,"name":"Tha","nameKm":"ថា","type":"consonant","series":"a-series","group":"dental","keyId":"f","layer":"base","finger":"li","hand":"L","frequency":"medium","pairedChar":"ធ","pairedKeyId":"f","pairedLayer":"shift"},{"char":"ទ","unicode":"U+1791","codepoint":6033,"name":"To","nameKm":"ទោ","type":"consonant","series":"o-series","group":"dental","keyId":"t","layer":"shift","finger":"li","hand":"L","frequency":"high","pairedChar":"ត","pairedKeyId":"t","pairedLayer":"base"},{"char":"ធ","unicode":"U+1792","codepoint":6034,"name":"Tho","nameKm":"ធោ","type":"consonant","series":"o-series","group":"dental","keyId":"f","layer":"shift","finger":"li","hand":"L","frequency":"medium","pairedChar":"ថ","pairedKeyId":"f","pairedLayer":"base"},{"char":"ន","unicode":"U+1793","codepoint":6035,"name":"No","nameKm":"នោ","type":"consonant","series":"o-series","group":"dental","keyId":"n","layer":"base","finger":"ri","hand":"R","frequency":"very-high","pairedChar":"ណ","pairedKeyId":"n","pairedLayer":"shift"},{"char":"ប","unicode":"U+1794","codepoint":6036,"name":"Ba","nameKm":"បា","type":"consonant","series":"a-series","group":"labial","keyId":"b","layer":"base","finger":"li","hand":"L","frequency":"very-high","pairedChar":"ព","pairedKeyId":"b","pairedLayer":"shift"},{"char":"ផ","unicode":"U+1795","codepoint":6037,"name":"Pha","nameKm":"ផា","type":"consonant","series":"a-series","group":"labial","keyId":"p","layer":"base","finger":"rp","hand":"R","frequency":"medium","pairedChar":"ភ","pairedKeyId":"p","pairedLayer":"shift"},{"char":"ព","unicode":"U+1796","codepoint":6038,"name":"Po","nameKm":"ពោ","type":"consonant","series":"o-series","group":"labial","keyId":"b","layer":"shift","finger":"li","hand":"L","frequency":"high","pairedChar":"ប","pairedKeyId":"b","pairedLayer":"base"},{"char":"ភ","unicode":"U+1797","codepoint":6039,"name":"Pho","nameKm":"ភោ","type":"consonant","series":"o-series","group":"labial","keyId":"p","layer":"shift","finger":"rp","hand":"R","frequency":"medium","pairedChar":"ផ","pairedKeyId":"p","pairedLayer":"base"},{"char":"ម","unicode":"U+1798","codepoint":6040,"name":"Mo","nameKm":"មោ","type":"consonant","series":"o-series","group":"labial","keyId":"m","layer":"base","finger":"ri","hand":"R","frequency":"very-high"},{"char":"យ","unicode":"U+1799","codepoint":6041,"name":"Yo","nameKm":"យោ","type":"consonant","series":"o-series","group":"other","keyId":"y","layer":"base","finger":"ri","hand":"R","frequency":"very-high"},{"char":"រ","unicode":"U+179A","codepoint":6042,"name":"Ro","nameKm":"រោ","type":"consonant","series":"o-series","group":"other","keyId":"r","layer":"base","finger":"li","hand":"L","frequency":"very-high"},{"char":"ល","unicode":"U+179B","codepoint":6043,"name":"Lo","nameKm":"លោ","type":"consonant","series":"o-series","group":"other","keyId":"l","layer":"base","finger":"rr","hand":"R","frequency":"very-high","pairedChar":"ឡ","pairedKeyId":"l","pairedLayer":"shift"},{"char":"វ","unicode":"U+179C","codepoint":6044,"name":"Vo","nameKm":"វោ","type":"consonant","series":"o-series","group":"other","keyId":"v","layer":"base","finger":"li","hand":"L","frequency":"high"},{"char":"ស","unicode":"U+179F","codepoint":6047,"name":"Sa","nameKm":"សា","type":"consonant","series":"a-series","group":"other","keyId":"s","layer":"base","finger":"lr","hand":"L","frequency":"very-high"},{"char":"ហ","unicode":"U+17A0","codepoint":6048,"name":"Ha","nameKm":"ហា","type":"consonant","series":"a-series","group":"other","keyId":"h","layer":"base","finger":"ri","hand":"R","frequency":"high"},{"char":"ឡ","unicode":"U+17A1","codepoint":6049,"name":"La","nameKm":"ឡា","type":"consonant","series":"a-series","group":"other","keyId":"l","layer":"shift","finger":"rr","hand":"R","frequency":"low","pairedChar":"ល","pairedKeyId":"l","pairedLayer":"base"},{"char":"អ","unicode":"U+17A2","codepoint":6050,"name":"Qa","nameKm":"អា","type":"consonant","series":"a-series","group":"other","keyId":"g","layer":"shift","finger":"li","hand":"L","frequency":"very-high","pairedChar":"ង","pairedKeyId":"g","pairedLayer":"base"},{"char":"ា","unicode":"U+17B6","codepoint":6070,"type":"dependent-vowel","keyId":"a","layer":"base","finger":"lp","hand":"L","frequency":"very-high"},{"char":"ិ","unicode":"U+17B7","codepoint":6071,"type":"dependent-vowel","keyId":"i","layer":"base","finger":"rm","hand":"R","frequency":"very-high"},{"char":"ី","unicode":"U+17B8","codepoint":6072,"type":"dependent-vowel","keyId":"i","layer":"shift","finger":"rm","hand":"R","frequency":"high"},{"char":"ុ","unicode":"U+17BB","codepoint":6075,"type":"dependent-vowel","keyId":"u","layer":"base","finger":"ri","hand":"R","frequency":"very-high"},{"char":"ូ","unicode":"U+17BC","codepoint":6076,"type":"dependent-vowel","keyId":"u","layer":"shift","finger":"ri","hand":"R","frequency":"high"},{"char":"ួ","unicode":"U+17BD","codepoint":6077,"type":"dependent-vowel","keyId":"y","layer":"shift","finger":"ri","hand":"R","frequency":"high"},{"char":"ើ","unicode":"U+17BE","codepoint":6078,"type":"dependent-vowel","keyId":"semicolon","layer":"base","finger":"rp","hand":"R","frequency":"high"},{"char":"ឿ","unicode":"U+17BF","codepoint":6079,"type":"dependent-vowel","keyId":"bracketL","layer":"shift","finger":"rp","hand":"R","frequency":"low"},{"char":"ៀ","unicode":"U+17C0","codepoint":6080,"type":"dependent-vowel","keyId":"bracketL","layer":"base","finger":"rp","hand":"R","frequency":"high"},{"char":"េ","unicode":"U+17C1","codepoint":6081,"type":"dependent-vowel","keyId":"e","layer":"base","finger":"lm","hand":"L","frequency":"very-high"},{"char":"ែ","unicode":"U+17C2","codepoint":6082,"type":"dependent-vowel","keyId":"e","layer":"shift","finger":"lm","hand":"L","frequency":"high"},{"char":"ៃ","unicode":"U+17C3","codepoint":6083,"type":"dependent-vowel","keyId":"s","layer":"shift","finger":"lr","hand":"L","frequency":"medium"},{"char":"ោ","unicode":"U+17C4","codepoint":6084,"type":"dependent-vowel","keyId":"o","layer":"base","finger":"rr","hand":"R","frequency":"very-high"},{"char":"ៅ","unicode":"U+17C5","codepoint":6085,"type":"dependent-vowel","keyId":"o","layer":"shift","finger":"rr","hand":"R","frequency":"medium"},{"char":"ឹ","unicode":"U+17B9","codepoint":6073,"type":"dependent-vowel","keyId":"w","layer":"base","finger":"lr","hand":"L","frequency":"medium"},{"char":"ឺ","unicode":"U+17BA","codepoint":6074,"type":"dependent-vowel","keyId":"w","layer":"shift","finger":"lr","hand":"L","frequency":"low"},{"char":"ុំ","unicode":"U+17BB+U+17C6","codepoint":[6075,6086],"type":"compound-vowel","keyId":"comma","layer":"base","finger":"rm","hand":"R","frequency":"low"},{"char":"ុះ","unicode":"U+17BB+U+17C7","codepoint":[6075,6087],"type":"compound-vowel","keyId":"comma","layer":"shift","finger":"rm","hand":"R","frequency":"low"},{"char":"ាំ","unicode":"U+17B6+U+17C6","codepoint":[6070,6086],"type":"compound-vowel","keyId":"a","layer":"shift","finger":"lp","hand":"L","frequency":"low"},{"char":"េះ","unicode":"U+17C1+U+17C7","codepoint":[6081,6087],"type":"compound-vowel","keyId":"v","layer":"shift","finger":"li","hand":"L","frequency":"low"},{"char":"ោះ","unicode":"U+17C4+U+17C7","codepoint":[6084,6087],"type":"compound-vowel","keyId":"semicolon","layer":"shift","finger":"rp","hand":"R","frequency":"low"},{"char":"ះ","unicode":"U+17C7","codepoint":6087,"type":"compound-vowel","keyId":"h","layer":"shift","finger":"ri","hand":"R","frequency":"medium"},{"char":"ំ","unicode":"U+17C6","codepoint":6086,"type":"compound-vowel","keyId":"m","layer":"shift","finger":"ri","hand":"R","frequency":"medium"},{"char":"្","unicode":"U+17D2","codepoint":6098,"type":"coeng","keyId":"j","layer":"base","finger":"ri","hand":"R","frequency":"high"},{"char":"់","unicode":"U+17CB","codepoint":6091,"type":"diacritic","keyId":"quote","layer":"base","finger":"rp","hand":"R","frequency":"high"},{"char":"៉","unicode":"U+17C9","codepoint":6089,"type":"diacritic","keyId":"quote","layer":"shift","finger":"rp","hand":"R","frequency":"rare"},{"char":"៊","unicode":"U+17CA","codepoint":6090,"type":"diacritic","keyId":"slash","layer":"base","finger":"rp","hand":"R","frequency":"rare"},{"char":"៍","unicode":"U+17CD","codepoint":6093,"type":"diacritic","keyId":"k6","layer":"shift","finger":"ri","hand":"R","frequency":"rare"},{"char":"៏","unicode":"U+17CF","codepoint":6095,"type":"diacritic","keyId":"k8","layer":"shift","finger":"rm","hand":"R","frequency":"rare"},{"char":"័","unicode":"U+17D0","codepoint":6096,"type":"diacritic","keyId":"k7","layer":"shift","finger":"ri","hand":"R","frequency":"rare"},{"char":"៌","unicode":"U+17CC","codepoint":6092,"type":"diacritic","keyId":"minus","layer":"shift","finger":"rp","hand":"R","frequency":"rare"},{"char":"ៗ","unicode":"U+17D7","codepoint":6103,"type":"special-mark","keyId":"k2","layer":"shift","finger":"lr","hand":"L","frequency":"rare"},{"char":"៛","unicode":"U+17DB","codepoint":6107,"type":"special-mark","keyId":"k4","layer":"shift","finger":"li","hand":"L","frequency":"rare"},{"char":"។","unicode":"U+17D4","codepoint":6100,"type":"special-mark","keyId":"period","layer":"base","finger":"rr","hand":"R","frequency":"very-high"},{"char":"៕","unicode":"U+17D5","codepoint":6101,"type":"special-mark","keyId":"period","layer":"shift","finger":"rr","hand":"R","frequency":"rare"},{"char":"៖","unicode":"U+17D6","codepoint":6102,"type":"special-mark","keyId":"semicolon","layer":"altgr","finger":"rp","hand":"R","frequency":"rare"},{"char":"ៈ","unicode":"U+17C8","codepoint":6088,"type":"special-mark","keyId":"quote","layer":"altgr","finger":"rp","hand":"R","frequency":"rare"},{"char":"«","unicode":"U+00AB","codepoint":171,"type":"special-mark","keyId":"grave","layer":"base","finger":"lp","hand":"L","frequency":"rare"},{"char":"»","unicode":"U+00BB","codepoint":187,"type":"special-mark","keyId":"grave","layer":"shift","finger":"lp","hand":"L","frequency":"rare"},{"char":"ឥ","unicode":"U+17A5","codepoint":6053,"type":"independent-vowel","keyId":"minus","layer":"base","finger":"rp","hand":"R","frequency":"rare"},{"char":"ឦ","unicode":"U+17A6","codepoint":6054,"type":"independent-vowel","keyId":"i","layer":"altgr","finger":"rm","hand":"R","frequency":"rare"},{"char":"ឧ","unicode":"U+17A7","codepoint":6055,"type":"independent-vowel","keyId":"bracketR","layer":"shift","finger":"rp","hand":"R","frequency":"rare"},{"char":"ឩ","unicode":"U+17A9","codepoint":6057,"type":"independent-vowel","keyId":"bracketL","layer":"altgr","finger":"rp","hand":"R","frequency":"rare"},{"char":"ឪ","unicode":"U+17AA","codepoint":6058,"type":"independent-vowel","keyId":"bracketR","layer":"base","finger":"rp","hand":"R","frequency":"rare"},{"char":"ឫ","unicode":"U+17AB","codepoint":6059,"type":"independent-vowel","keyId":"r","layer":"altgr","finger":"li","hand":"L","frequency":"rare"},{"char":"ឬ","unicode":"U+17AC","codepoint":6060,"type":"independent-vowel","keyId":"r","layer":"shift","finger":"li","hand":"L","frequency":"rare"},{"char":"ឭ","unicode":"U+17AD","codepoint":6061,"type":"independent-vowel","keyId":"backslash","layer":"shift","finger":"rp","hand":"R","frequency":"rare"},{"char":"ឮ","unicode":"U+17AE","codepoint":6062,"type":"independent-vowel","keyId":"backslash","layer":"base","finger":"rp","hand":"R","frequency":"rare"},{"char":"ឯ","unicode":"U+17AF","codepoint":6063,"type":"independent-vowel","keyId":"e","layer":"altgr","finger":"lm","hand":"L","frequency":"rare"},{"char":"ឰ","unicode":"U+17B0","codepoint":6064,"type":"independent-vowel","keyId":"p","layer":"altgr","finger":"rp","hand":"R","frequency":"rare"},{"char":"ឱ","unicode":"U+17B1","codepoint":6065,"type":"independent-vowel","keyId":"o","layer":"altgr","finger":"rr","hand":"R","frequency":"rare"},{"char":"ឲ","unicode":"U+17B2","codepoint":6066,"type":"independent-vowel","keyId":"equal","layer":"base","finger":"rp","hand":"R","frequency":"rare"},{"char":"ឳ","unicode":"U+17B3","codepoint":6067,"type":"independent-vowel","keyId":"bracketR","layer":"altgr","finger":"rp","hand":"R","frequency":"rare"},{"char":"០","unicode":"U+17E0","codepoint":6112,"type":"digit","keyId":"k0","layer":"base","finger":"rp","hand":"R","frequency":"rare"},{"char":"១","unicode":"U+17E1","codepoint":6113,"type":"digit","keyId":"k1","layer":"base","finger":"lp","hand":"L","frequency":"rare"},{"char":"២","unicode":"U+17E2","codepoint":6114,"type":"digit","keyId":"k2","layer":"base","finger":"lr","hand":"L","frequency":"rare"},{"char":"៣","unicode":"U+17E3","codepoint":6115,"type":"digit","keyId":"k3","layer":"base","finger":"lm","hand":"L","frequency":"rare"},{"char":"៤","unicode":"U+17E4","codepoint":6116,"type":"digit","keyId":"k4","layer":"base","finger":"li","hand":"L","frequency":"rare"},{"char":"៥","unicode":"U+17E5","codepoint":6117,"type":"digit","keyId":"k5","layer":"base","finger":"li","hand":"L","frequency":"rare"},{"char":"៦","unicode":"U+17E6","codepoint":6118,"type":"digit","keyId":"k6","layer":"base","finger":"ri","hand":"R","frequency":"rare"},{"char":"៧","unicode":"U+17E7","codepoint":6119,"type":"digit","keyId":"k7","layer":"base","finger":"ri","hand":"R","frequency":"rare"},{"char":"៨","unicode":"U+17E8","codepoint":6120,"type":"digit","keyId":"k8","layer":"base","finger":"rm","hand":"R","frequency":"rare"},{"char":"៩","unicode":"U+17E9","codepoint":6121,"type":"digit","keyId":"k9","layer":"base","finger":"rr","hand":"R","frequency":"rare"}];
  const ENGLISH_CATALOG = [{"char":"a","type":"letter","case":"lower","keyId":"a","layer":"base","finger":"lp","hand":"L","frequency":"very-high","pairedChar":"A","pairedLayer":"shift"},{"char":"b","type":"letter","case":"lower","keyId":"b","layer":"base","finger":"li","hand":"L","frequency":"medium","pairedChar":"B","pairedLayer":"shift"},{"char":"c","type":"letter","case":"lower","keyId":"c","layer":"base","finger":"lm","hand":"L","frequency":"high","pairedChar":"C","pairedLayer":"shift"},{"char":"d","type":"letter","case":"lower","keyId":"d","layer":"base","finger":"lm","hand":"L","frequency":"high","pairedChar":"D","pairedLayer":"shift"},{"char":"e","type":"letter","case":"lower","keyId":"e","layer":"base","finger":"lm","hand":"L","frequency":"very-high","pairedChar":"E","pairedLayer":"shift"},{"char":"f","type":"letter","case":"lower","keyId":"f","layer":"base","finger":"li","hand":"L","frequency":"high","pairedChar":"F","pairedLayer":"shift"},{"char":"g","type":"letter","case":"lower","keyId":"g","layer":"base","finger":"li","hand":"L","frequency":"high","pairedChar":"G","pairedLayer":"shift"},{"char":"h","type":"letter","case":"lower","keyId":"h","layer":"base","finger":"ri","hand":"R","frequency":"very-high","pairedChar":"H","pairedLayer":"shift"},{"char":"i","type":"letter","case":"lower","keyId":"i","layer":"base","finger":"rm","hand":"R","frequency":"very-high","pairedChar":"I","pairedLayer":"shift"},{"char":"j","type":"letter","case":"lower","keyId":"j","layer":"base","finger":"ri","hand":"R","frequency":"medium","pairedChar":"J","pairedLayer":"shift"},{"char":"k","type":"letter","case":"lower","keyId":"k","layer":"base","finger":"rm","hand":"R","frequency":"medium","pairedChar":"K","pairedLayer":"shift"},{"char":"l","type":"letter","case":"lower","keyId":"l","layer":"base","finger":"rr","hand":"R","frequency":"high","pairedChar":"L","pairedLayer":"shift"},{"char":"m","type":"letter","case":"lower","keyId":"m","layer":"base","finger":"ri","hand":"R","frequency":"high","pairedChar":"M","pairedLayer":"shift"},{"char":"n","type":"letter","case":"lower","keyId":"n","layer":"base","finger":"ri","hand":"R","frequency":"very-high","pairedChar":"N","pairedLayer":"shift"},{"char":"o","type":"letter","case":"lower","keyId":"o","layer":"base","finger":"rr","hand":"R","frequency":"very-high","pairedChar":"O","pairedLayer":"shift"},{"char":"p","type":"letter","case":"lower","keyId":"p","layer":"base","finger":"rp","hand":"R","frequency":"high","pairedChar":"P","pairedLayer":"shift"},{"char":"q","type":"letter","case":"lower","keyId":"q","layer":"base","finger":"lp","hand":"L","frequency":"medium","pairedChar":"Q","pairedLayer":"shift"},{"char":"r","type":"letter","case":"lower","keyId":"r","layer":"base","finger":"li","hand":"L","frequency":"very-high","pairedChar":"R","pairedLayer":"shift"},{"char":"s","type":"letter","case":"lower","keyId":"s","layer":"base","finger":"lr","hand":"L","frequency":"very-high","pairedChar":"S","pairedLayer":"shift"},{"char":"t","type":"letter","case":"lower","keyId":"t","layer":"base","finger":"li","hand":"L","frequency":"very-high","pairedChar":"T","pairedLayer":"shift"},{"char":"u","type":"letter","case":"lower","keyId":"u","layer":"base","finger":"ri","hand":"R","frequency":"high","pairedChar":"U","pairedLayer":"shift"},{"char":"v","type":"letter","case":"lower","keyId":"v","layer":"base","finger":"li","hand":"L","frequency":"medium","pairedChar":"V","pairedLayer":"shift"},{"char":"w","type":"letter","case":"lower","keyId":"w","layer":"base","finger":"lr","hand":"L","frequency":"high","pairedChar":"W","pairedLayer":"shift"},{"char":"x","type":"letter","case":"lower","keyId":"x","layer":"base","finger":"lr","hand":"L","frequency":"medium","pairedChar":"X","pairedLayer":"shift"},{"char":"y","type":"letter","case":"lower","keyId":"y","layer":"base","finger":"ri","hand":"R","frequency":"high","pairedChar":"Y","pairedLayer":"shift"},{"char":"z","type":"letter","case":"lower","keyId":"z","layer":"base","finger":"lp","hand":"L","frequency":"medium","pairedChar":"Z","pairedLayer":"shift"},{"char":"A","type":"letter","case":"upper","keyId":"a","layer":"shift","finger":"lp","hand":"L","frequency":"very-high","pairedChar":"a","pairedLayer":"base"},{"char":"B","type":"letter","case":"upper","keyId":"b","layer":"shift","finger":"li","hand":"L","frequency":"medium","pairedChar":"b","pairedLayer":"base"},{"char":"C","type":"letter","case":"upper","keyId":"c","layer":"shift","finger":"lm","hand":"L","frequency":"high","pairedChar":"c","pairedLayer":"base"},{"char":"D","type":"letter","case":"upper","keyId":"d","layer":"shift","finger":"lm","hand":"L","frequency":"high","pairedChar":"d","pairedLayer":"base"},{"char":"E","type":"letter","case":"upper","keyId":"e","layer":"shift","finger":"lm","hand":"L","frequency":"very-high","pairedChar":"e","pairedLayer":"base"},{"char":"F","type":"letter","case":"upper","keyId":"f","layer":"shift","finger":"li","hand":"L","frequency":"high","pairedChar":"f","pairedLayer":"base"},{"char":"G","type":"letter","case":"upper","keyId":"g","layer":"shift","finger":"li","hand":"L","frequency":"high","pairedChar":"g","pairedLayer":"base"},{"char":"H","type":"letter","case":"upper","keyId":"h","layer":"shift","finger":"ri","hand":"R","frequency":"very-high","pairedChar":"h","pairedLayer":"base"},{"char":"I","type":"letter","case":"upper","keyId":"i","layer":"shift","finger":"rm","hand":"R","frequency":"very-high","pairedChar":"i","pairedLayer":"base"},{"char":"J","type":"letter","case":"upper","keyId":"j","layer":"shift","finger":"ri","hand":"R","frequency":"medium","pairedChar":"j","pairedLayer":"base"},{"char":"K","type":"letter","case":"upper","keyId":"k","layer":"shift","finger":"rm","hand":"R","frequency":"medium","pairedChar":"k","pairedLayer":"base"},{"char":"L","type":"letter","case":"upper","keyId":"l","layer":"shift","finger":"rr","hand":"R","frequency":"high","pairedChar":"l","pairedLayer":"base"},{"char":"M","type":"letter","case":"upper","keyId":"m","layer":"shift","finger":"ri","hand":"R","frequency":"high","pairedChar":"m","pairedLayer":"base"},{"char":"N","type":"letter","case":"upper","keyId":"n","layer":"shift","finger":"ri","hand":"R","frequency":"very-high","pairedChar":"n","pairedLayer":"base"},{"char":"O","type":"letter","case":"upper","keyId":"o","layer":"shift","finger":"rr","hand":"R","frequency":"very-high","pairedChar":"o","pairedLayer":"base"},{"char":"P","type":"letter","case":"upper","keyId":"p","layer":"shift","finger":"rp","hand":"R","frequency":"high","pairedChar":"p","pairedLayer":"base"},{"char":"Q","type":"letter","case":"upper","keyId":"q","layer":"shift","finger":"lp","hand":"L","frequency":"medium","pairedChar":"q","pairedLayer":"base"},{"char":"R","type":"letter","case":"upper","keyId":"r","layer":"shift","finger":"li","hand":"L","frequency":"very-high","pairedChar":"r","pairedLayer":"base"},{"char":"S","type":"letter","case":"upper","keyId":"s","layer":"shift","finger":"lr","hand":"L","frequency":"very-high","pairedChar":"s","pairedLayer":"base"},{"char":"T","type":"letter","case":"upper","keyId":"t","layer":"shift","finger":"li","hand":"L","frequency":"very-high","pairedChar":"t","pairedLayer":"base"},{"char":"U","type":"letter","case":"upper","keyId":"u","layer":"shift","finger":"ri","hand":"R","frequency":"high","pairedChar":"u","pairedLayer":"base"},{"char":"V","type":"letter","case":"upper","keyId":"v","layer":"shift","finger":"li","hand":"L","frequency":"medium","pairedChar":"v","pairedLayer":"base"},{"char":"W","type":"letter","case":"upper","keyId":"w","layer":"shift","finger":"lr","hand":"L","frequency":"high","pairedChar":"w","pairedLayer":"base"},{"char":"X","type":"letter","case":"upper","keyId":"x","layer":"shift","finger":"lr","hand":"L","frequency":"medium","pairedChar":"x","pairedLayer":"base"},{"char":"Y","type":"letter","case":"upper","keyId":"y","layer":"shift","finger":"ri","hand":"R","frequency":"high","pairedChar":"y","pairedLayer":"base"},{"char":"Z","type":"letter","case":"upper","keyId":"z","layer":"shift","finger":"lp","hand":"L","frequency":"medium","pairedChar":"z","pairedLayer":"base"},{"char":"0","type":"digit","keyId":"k0","layer":"base","finger":"rp","hand":"R","frequency":"low"},{"char":"1","type":"digit","keyId":"k1","layer":"base","finger":"lp","hand":"L","frequency":"low"},{"char":"2","type":"digit","keyId":"k2","layer":"base","finger":"lr","hand":"L","frequency":"low"},{"char":"3","type":"digit","keyId":"k3","layer":"base","finger":"lm","hand":"L","frequency":"low"},{"char":"4","type":"digit","keyId":"k4","layer":"base","finger":"li","hand":"L","frequency":"low"},{"char":"5","type":"digit","keyId":"k5","layer":"base","finger":"li","hand":"L","frequency":"low"},{"char":"6","type":"digit","keyId":"k6","layer":"base","finger":"ri","hand":"R","frequency":"low"},{"char":"7","type":"digit","keyId":"k7","layer":"base","finger":"ri","hand":"R","frequency":"low"},{"char":"8","type":"digit","keyId":"k8","layer":"base","finger":"rm","hand":"R","frequency":"low"},{"char":"9","type":"digit","keyId":"k9","layer":"base","finger":"rr","hand":"R","frequency":"low"},{"char":"!","type":"symbol","keyId":"k1","layer":"shift","finger":"lp","hand":"L","frequency":"rare"},{"char":"@","type":"symbol","keyId":"k2","layer":"shift","finger":"lr","hand":"L","frequency":"rare"},{"char":"#","type":"symbol","keyId":"k3","layer":"shift","finger":"lm","hand":"L","frequency":"rare"},{"char":"$","type":"symbol","keyId":"k4","layer":"shift","finger":"li","hand":"L","frequency":"rare"},{"char":"%","type":"symbol","keyId":"k5","layer":"shift","finger":"li","hand":"L","frequency":"rare"},{"char":"^","type":"symbol","keyId":"k6","layer":"shift","finger":"ri","hand":"R","frequency":"rare"},{"char":"&","type":"symbol","keyId":"k7","layer":"shift","finger":"ri","hand":"R","frequency":"rare"},{"char":"*","type":"symbol","keyId":"k8","layer":"shift","finger":"rm","hand":"R","frequency":"rare"},{"char":"(","type":"symbol","keyId":"k9","layer":"shift","finger":"rr","hand":"R","frequency":"rare"},{"char":")","type":"symbol","keyId":"k0","layer":"shift","finger":"rp","hand":"R","frequency":"rare"},{"char":".","type":"punctuation","keyId":"period","layer":"base","finger":"rr","hand":"R","frequency":"low"},{"char":",","type":"punctuation","keyId":"comma","layer":"base","finger":"rm","hand":"R","frequency":"low"},{"char":";","type":"punctuation","keyId":"semicolon","layer":"base","finger":"rp","hand":"R","frequency":"low"},{"char":":","type":"punctuation","keyId":"semicolon","layer":"shift","finger":"rp","hand":"R","frequency":"low"},{"char":"'","type":"punctuation","keyId":"quote","layer":"base","finger":"rp","hand":"R","frequency":"low"},{"char":"\"","type":"punctuation","keyId":"quote","layer":"shift","finger":"rp","hand":"R","frequency":"low"},{"char":"/","type":"punctuation","keyId":"slash","layer":"base","finger":"rp","hand":"R","frequency":"low"},{"char":"?","type":"punctuation","keyId":"slash","layer":"shift","finger":"rp","hand":"R","frequency":"low"},{"char":"-","type":"punctuation","keyId":"minus","layer":"base","finger":"rp","hand":"R","frequency":"low"},{"char":"_","type":"punctuation","keyId":"minus","layer":"shift","finger":"rp","hand":"R","frequency":"low"},{"char":"+","type":"punctuation","keyId":"equal","layer":"shift","finger":"rp","hand":"R","frequency":"low"},{"char":"=","type":"punctuation","keyId":"equal","layer":"base","finger":"rp","hand":"R","frequency":"low"},{"char":"[","type":"punctuation","keyId":"bracketL","layer":"base","finger":"rp","hand":"R","frequency":"low"},{"char":"{","type":"punctuation","keyId":"bracketL","layer":"shift","finger":"rp","hand":"R","frequency":"low"},{"char":"]","type":"punctuation","keyId":"bracketR","layer":"base","finger":"rp","hand":"R","frequency":"low"},{"char":"}","type":"punctuation","keyId":"bracketR","layer":"shift","finger":"rp","hand":"R","frequency":"low"},{"char":"|","type":"punctuation","keyId":"backslash","layer":"shift","finger":"rp","hand":"R","frequency":"low"},{"char":"\\","type":"punctuation","keyId":"backslash","layer":"base","finger":"rp","hand":"R","frequency":"low"},{"char":"`","type":"punctuation","keyId":"grave","layer":"base","finger":"lp","hand":"L","frequency":"low"},{"char":"~","type":"punctuation","keyId":"grave","layer":"shift","finger":"lp","hand":"L","frequency":"low"},{"char":"<","type":"punctuation","keyId":"comma","layer":"shift","finger":"rm","hand":"R","frequency":"low"},{"char":">","type":"punctuation","keyId":"period","layer":"shift","finger":"rr","hand":"R","frequency":"low"},{"char":" ","type":"space","keyId":"space","layer":"base","finger":"lt","hand":"L","frequency":"very-high"}];

  // Build fast lookup maps by character
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
    version: 1,
    completedReviews: [],
    dismissedCandidates: { standard: {}, nida: {}, english: {} },
    lastReviewTimestamps: { standard: null, nida: null, english: null },
    rules: JSON.parse(JSON.stringify(DEFAULT_REVIEW_RULES))
  };

  /* Helper to normalize layout IDs */
  function normalizeLayout(id){
    if(!id) return 'nida';
    const s = String(id).toLowerCase();
    if(s.includes('eng')) return 'english';
    if(s.includes('std') || s.includes('standard')) return 'standard';
    return 'nida';
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
      const payload = {
        version: 1,
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

  /* Load stored data on initialize */
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
     LESSON & CHARACTER INTRODUCTION DETECTION
     ============================================================ */

  /* Check whether a character has been introduced in the active layout's curriculum */
  function isCharacterIntroduced(layoutId, charUnit){
    if(!charUnit) return false;
    const l = normalizeLayout(layoutId);

    // 1. If learner has already practiced it at least once, it is introduced
    if(typeof PK_TRACKER !== 'undefined' && typeof PK_TRACKER.getCharStats === 'function'){
      const stats = PK_TRACKER.getCharStats(l, charUnit);
      if(stats && stats.attempts > 0) return true;
    }

    // 2. If 'Master Unlock' cheat/override is enabled
    try {
      if(typeof localStorage !== 'undefined' && localStorage.getItem('khmerUnlockAll') === '1'){
        return true;
      }
    } catch(e){}

    // 3. Check curriculum lessons for this layout
    const cData = (typeof window !== 'undefined' && window.CURRICULUM_DATA)
      ? window.CURRICULUM_DATA
      : (typeof global !== 'undefined' && global.CURRICULUM_DATA)
      ? global.CURRICULUM_DATA
      : null;

    let lessons = null;
    if(cData && cData[l] && Array.isArray(cData[l].lessons)){
      lessons = cData[l].lessons;
    } else if(typeof window !== 'undefined' && window.LESSON_SETS && Array.isArray(window.LESSON_SETS[l])){
      lessons = window.LESSON_SETS[l];
    }

    if(!lessons || !lessons.length){
      // If curriculum lessons are not available, default to true so tracking is not blocked
      return true;
    }

    // Scan lessons: find lessons that introduce this character
    for(let i = 0; i < lessons.length; i++){
      const lesson = lessons[i];
      let introduces = false;

      if(Array.isArray(lesson.newKeys)){
        introduces = lesson.newKeys.some(nk => nk && nk.char === charUnit);
      } else if(Array.isArray(lesson.keys)){
        introduces = lesson.keys.includes(charUnit);
      }

      if(introduces){
        // Check if this lesson is unlocked
        if(typeof window !== 'undefined' && typeof window.isLessonLocked === 'function'){
          if(!window.isLessonLocked(lesson.id)) return true;
        } else {
          // Fallback unlock check: first lesson is unlocked, or previous lesson was completed
          if(i === 0) return true;
          const prevLesson = lessons[i - 1];
          const prevId = (lesson.unlockRequirements && lesson.unlockRequirements.previousLesson) || (prevLesson ? prevLesson.id : null);
          if(!prevId) return true;
          try {
            if(typeof localStorage !== 'undefined' && localStorage.getItem('khmerLessonBest_' + prevId)){
              return true;
            }
          } catch(e){}
        }
      }
    }

    return false;
  }

  /* ============================================================
     LAYOUT AVERAGE METRICS
     ============================================================ */

  function getLayoutAverageResponseTime(layoutId){
    const l = normalizeLayout(layoutId);
    if(typeof PK_TRACKER === 'undefined' || typeof PK_TRACKER.getAllCharStats !== 'function'){
      return 500;
    }
    const allStats = PK_TRACKER.getAllCharStats(l);
    let totalMs = 0;
    let count = 0;
    Object.keys(allStats).forEach(ch => {
      const s = allStats[ch];
      if(s && s.attempts >= 5 && s.avgResponseTimeMs > 0){
        totalMs += s.avgResponseTimeMs;
        count++;
      }
    });
    return count > 0 ? Math.round(totalMs / count) : 500;
  }

  /* ============================================================
     MASTERY ASSESSMENT ENGINE
     ============================================================
     Mastery states:
     - 'locked': Not yet introduced in any unlocked lesson
     - 'learning': Introduced, attempts < 20 or accuracy < 85%
     - 'proficient': attempts >= 20, accuracy >= 85%, normal speed
     - 'mastered': attempts >= 50, accuracy >= 95%, fast response time (< 1.5x avg)
     ============================================================ */

  function computeCharacterMastery(layoutId, charUnit){
    const l = normalizeLayout(layoutId);
    if(!charUnit) return 'locked';

    const introduced = isCharacterIntroduced(l, charUnit);
    if(!introduced) return 'locked';

    if(typeof PK_TRACKER === 'undefined' || typeof PK_TRACKER.getCharStats !== 'function'){
      return 'learning';
    }

    const stats = PK_TRACKER.getCharStats(l, charUnit);
    if(!stats || stats.attempts < 20 || stats.accuracy < 85){
      return 'learning';
    }

    // Qualified for at least proficient
    const layoutAvgMs = getLayoutAverageResponseTime(l);
    const speedRatio = layoutAvgMs > 0 ? (stats.avgResponseTimeMs / layoutAvgMs) : 1.0;

    // Check mastered requirements: >= 50 attempts, >= 95% accuracy, fast speed
    if(stats.attempts >= 50 && stats.accuracy >= 95 && (speedRatio <= 1.5 || stats.avgResponseTimeMs <= 700)){
      return 'mastered';
    }

    return 'proficient';
  }

  function getCharacterMasterySummary(layoutId){
    const l = normalizeLayout(layoutId);
    const catalog = getCharacterCatalog(l);
    const total = catalog.length;

    let mastered = 0;
    let proficient = 0;
    let learning = 0;
    let locked = 0;

    const breakdown = {
      mastered: [],
      proficient: [],
      learning: [],
      locked: []
    };

    catalog.forEach(item => {
      const ch = item.char;
      const status = computeCharacterMastery(l, ch);
      breakdown[status].push(ch);
      if(status === 'mastered') mastered++;
      else if(status === 'proficient') proficient++;
      else if(status === 'learning') learning++;
      else if(status === 'locked') locked++;
    });

    const masteredPct = total > 0 ? Math.round((mastered / total) * 100) : 0;
    const proficientPct = total > 0 ? Math.round((proficient / total) * 100) : 0;
    const learningPct = total > 0 ? Math.round((learning / total) * 100) : 0;
    const lockedPct = total > 0 ? Math.round((locked / total) * 100) : 0;

    // Weighted overall learning progress
    const overallScorePct = total > 0
      ? Math.round(((mastered * 1.0 + proficient * 0.7 + learning * 0.2) / total) * 100)
      : 0;

    return {
      layout: l,
      total,
      mastered,
      proficient,
      learning,
      locked,
      masteredPct,
      proficientPct,
      learningPct,
      lockedPct,
      overallScorePct,
      breakdown
    };
  }

  /* ============================================================
     WEAKNESS & CONFUSION ANALYSIS
     ============================================================ */

  /* Detect pairs of characters that the learner frequently mixes up */
  function getConfusionPairs(layoutId, minOccurrences = 3){
    const l = normalizeLayout(layoutId);
    if(typeof PK_TRACKER === 'undefined') return [];

    const pairCounts = {};
    const pairMeta = {};

    // 1. Scan recent mistakes from PK_TRACKER
    const mistakes = (typeof PK_TRACKER.getRecentMistakes === 'function')
      ? PK_TRACKER.getRecentMistakes(100)
      : [];

    mistakes.forEach(m => {
      if(m && m.layout === l && m.expected && m.produced && m.expected !== m.produced){
        const key = m.expected + '->' + m.produced;
        pairCounts[key] = (pairCounts[key] || 0) + 1;
        if(!pairMeta[key]){
          pairMeta[key] = {
            expected: m.expected,
            produced: m.produced,
            lastOccurred: m.timestamp || Date.now()
          };
        } else if(m.timestamp && m.timestamp > pairMeta[key].lastOccurred){
          pairMeta[key].lastOccurred = m.timestamp;
        }
      }
    });

    // 2. Scan per-character recent errors
    const allStats = (typeof PK_TRACKER.getAllCharStats === 'function')
      ? PK_TRACKER.getAllCharStats(l)
      : {};

    Object.keys(allStats).forEach(exp => {
      const cs = allStats[exp];
      if(cs && Array.isArray(cs.recentErrors)){
        cs.recentErrors.forEach(err => {
          const prod = err && err.produced;
          if(prod && prod !== exp){
            const key = exp + '->' + prod;
            // Only add if not already captured in mistakes
            if(!pairCounts[key]){
              pairCounts[key] = 1;
              pairMeta[key] = {
                expected: exp,
                produced: prod,
                lastOccurred: err.time || Date.now()
              };
            }
          }
        });
      }
    });

    const result = [];
    Object.keys(pairCounts).forEach(key => {
      const count = pairCounts[key];
      if(count >= minOccurrences){
        const info = pairMeta[key];
        const expMeta = getCharacterMeta(l, info.expected);
        const prodMeta = getCharacterMeta(l, info.produced);

        const isBaseShiftPair = expMeta && expMeta.pairedChar === info.produced;
        const isSameFinger = expMeta && prodMeta && expMeta.finger && expMeta.finger === prodMeta.finger;

        result.push({
          expected: info.expected,
          produced: info.produced,
          count,
          lastOccurred: info.lastOccurred,
          isBaseShiftPair: !!isBaseShiftPair,
          isSameFinger: !!isSameFinger,
          priority: 'high',
          recommendedAction: 'generate-alternating-pair-drill'
        });
      }
    });

    // Sort by count descending
    result.sort((a, b) => b.count - a.count);
    return result;
  }

  /* Detect characters that take > thresholdRatio (default 2.0x) of layout average response time */
  function getSlowKeys(layoutId, thresholdRatio = 2.0){
    const l = normalizeLayout(layoutId);
    if(typeof PK_TRACKER === 'undefined' || typeof PK_TRACKER.getAllCharStats !== 'function'){
      return [];
    }
    const allStats = PK_TRACKER.getAllCharStats(l);
    const layoutAvgMs = getLayoutAverageResponseTime(l);
    const thresholdMs = layoutAvgMs * thresholdRatio;

    const result = [];
    Object.keys(allStats).forEach(ch => {
      const s = allStats[ch];
      if(s && s.attempts >= 5 && s.avgResponseTimeMs > thresholdMs){
        const ratio = Math.round((s.avgResponseTimeMs / layoutAvgMs) * 10) / 10;
        result.push({
          char: ch,
          avgResponseTimeMs: s.avgResponseTimeMs,
          layoutAvgMs,
          ratio,
          attempts: s.attempts,
          priority: 'medium',
          recommendedAction: 'generate-speed-drill'
        });
      }
    });

    result.sort((a, b) => b.ratio - a.ratio);
    return result;
  }

  /* Detect characters not practiced in > thresholdDays (default 7 days) */
  function getStaleCharacters(layoutId, thresholdDays = 7){
    const l = normalizeLayout(layoutId);
    if(typeof PK_TRACKER === 'undefined' || typeof PK_TRACKER.getAllCharStats !== 'function'){
      return [];
    }
    const allStats = PK_TRACKER.getAllCharStats(l);
    const now = Date.now();
    const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;

    const result = [];
    Object.keys(allStats).forEach(ch => {
      const s = allStats[ch];
      if(s && s.attempts > 0 && s.lastPracticed){
        const elapsed = now - s.lastPracticed;
        if(elapsed > thresholdMs){
          const daysAgo = Math.round((elapsed / (24 * 60 * 60 * 1000)) * 10) / 10;
          result.push({
            char: ch,
            lastPracticed: s.lastPracticed,
            daysAgo,
            attempts: s.attempts,
            priority: 'low',
            recommendedAction: 'include-in-next-review'
          });
        }
      }
    });

    result.sort((a, b) => b.daysAgo - a.daysAgo);
    return result;
  }

  /* Detect characters with accuracy < threshold (default 85%) */
  function getLowAccuracyCharacters(layoutId, threshold = 85){
    const l = normalizeLayout(layoutId);
    if(typeof PK_TRACKER === 'undefined' || typeof PK_TRACKER.getAllCharStats !== 'function'){
      return [];
    }
    const allStats = PK_TRACKER.getAllCharStats(l);
    const result = [];

    Object.keys(allStats).forEach(ch => {
      const s = allStats[ch];
      if(s && s.attempts >= 5 && s.accuracy < threshold){
        result.push({
          char: ch,
          accuracy: s.accuracy,
          attempts: s.attempts,
          priority: 'high',
          recommendedAction: 'generate-targeted-drill'
        });
      }
    });

    result.sort((a, b) => a.accuracy - b.accuracy);
    return result;
  }

  /* ============================================================
     NEEDS-REVIEW CANDIDATE QUEUE (PREPARES FOR PHASE 8)
     ============================================================ */

  function getReviewCandidates(layoutId, maxCount = 8){
    const l = normalizeLayout(layoutId);
    const now = Date.now();
    const dismissalWindowMs = 24 * 60 * 60 * 1000; // 24-hour temporary dismissal

    const dismissed = reviewState.dismissedCandidates[l] || {};
    const candidateMap = {};

    function ensureCandidate(ch){
      if(!candidateMap[ch]){
        const stats = (typeof PK_TRACKER !== 'undefined' && typeof PK_TRACKER.getCharStats === 'function')
          ? PK_TRACKER.getCharStats(l, ch)
          : null;
        const meta = getCharacterMeta(l, ch);
        candidateMap[ch] = {
          char: ch,
          triggers: [],
          priority: 'low',
          score: 0,
          accuracy: stats ? stats.accuracy : 100,
          attempts: stats ? stats.attempts : 0,
          avgResponseTimeMs: stats ? stats.avgResponseTimeMs : 0,
          confusedWith: [],
          recommendedAction: 'generate-targeted-drill',
          characterMeta: meta
        };
      }
      return candidateMap[ch];
    }

    // 1. Low accuracy triggers (High Priority)
    const lowAcc = getLowAccuracyCharacters(l, 85);
    lowAcc.forEach(item => {
      const c = ensureCandidate(item.char);
      c.triggers.push('low-accuracy');
      c.priority = 'high';
      c.score += 100 + (100 - item.accuracy);
      c.recommendedAction = item.recommendedAction;
    });

    // 2. Confusion pair triggers (High Priority)
    const confPairs = getConfusionPairs(l, 3);
    confPairs.forEach(pair => {
      const c = ensureCandidate(pair.expected);
      if(!c.triggers.includes('confusion-pair')){
        c.triggers.push('confusion-pair');
      }
      c.priority = 'high';
      c.score += 100 + (pair.count * 15);
      c.confusedWith.push({ char: pair.produced, count: pair.count });
      c.recommendedAction = 'generate-alternating-pair-drill';
    });

    // 3. Slow key triggers (Medium Priority)
    const slowKeys = getSlowKeys(l, 2.0);
    slowKeys.forEach(sk => {
      const c = ensureCandidate(sk.char);
      c.triggers.push('slow-key');
      if(c.priority !== 'high') c.priority = 'medium';
      c.score += 50 + Math.round(sk.ratio * 10);
      if(c.priority === 'medium') c.recommendedAction = sk.recommendedAction;
    });

    // 4. Stale character triggers (Low Priority)
    const stale = getStaleCharacters(l, 7);
    stale.forEach(st => {
      const c = ensureCandidate(st.char);
      c.triggers.push('stale-character');
      c.score += 20 + Math.min(30, Math.round(st.daysAgo));
      if(c.priority === 'low') c.recommendedAction = st.recommendedAction;
    });

    // Filter out dismissed candidates and locked characters
    const filtered = Object.keys(candidateMap)
      .map(ch => candidateMap[ch])
      .filter(c => {
        // Skip if dismissed within last 24h
        if(dismissed[c.char] && (now - dismissed[c.char]) < dismissalWindowMs){
          return false;
        }
        // Skip if locked
        if(!isCharacterIntroduced(l, c.char)){
          return false;
        }
        return true;
      });

    // Sort descending by score
    filtered.sort((a, b) => b.score - a.score);

    return filtered.slice(0, maxCount);
  }

  /* Detailed inspection of a single character */
  function getCharacterDetail(layoutId, charUnit){
    const l = normalizeLayout(layoutId);
    const meta = getCharacterMeta(l, charUnit);
    const stats = (typeof PK_TRACKER !== 'undefined' && typeof PK_TRACKER.getCharStats === 'function')
      ? PK_TRACKER.getCharStats(l, charUnit)
      : null;
    const mastery = computeCharacterMastery(l, charUnit);
    const layoutAvgMs = getLayoutAverageResponseTime(l);

    // Collect confusions for this specific character
    const confusions = [];
    if(stats && Array.isArray(stats.recentErrors)){
      const errCounts = {};
      stats.recentErrors.forEach(e => {
        if(e && e.produced){
          errCounts[e.produced] = (errCounts[e.produced] || 0) + 1;
        }
      });
      Object.keys(errCounts).forEach(p => {
        confusions.push({ produced: p, count: errCounts[p] });
      });
      confusions.sort((a, b) => b.count - a.count);
    }

    const activeTriggers = [];
    if(stats && stats.attempts >= 5 && stats.accuracy < 85){
      activeTriggers.push('low-accuracy');
    }
    if(confusions.some(c => c.count >= 3)){
      activeTriggers.push('confusion-pair');
    }
    if(stats && stats.attempts >= 5 && stats.avgResponseTimeMs > (layoutAvgMs * 2.0)){
      activeTriggers.push('slow-key');
    }
    if(stats && stats.attempts > 0 && stats.lastPracticed && (Date.now() - stats.lastPracticed) > (7 * 86400000)){
      activeTriggers.push('stale-character');
    }

    return {
      char: charUnit,
      layout: l,
      mastery,
      meta,
      stats,
      layoutAvgMs,
      confusions,
      activeTriggers,
      isIntroduced: isCharacterIntroduced(l, charUnit)
    };
  }

  /* Dismiss candidate temporarily */
  function dismissCandidate(layoutId, charUnit){
    const l = normalizeLayout(layoutId);
    if(!reviewState.dismissedCandidates[l]){
      reviewState.dismissedCandidates[l] = {};
    }
    reviewState.dismissedCandidates[l][charUnit] = Date.now();
    saveReviewData();
  }

  /* Record a completed review session */
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

  /* Public API */
  const api = {
    // Catalogs & Metadata
    getCharacterCatalog,
    getCharacterMeta,
    isCharacterIntroduced,

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

    // Review Candidates
    getReviewCandidates,
    dismissCandidate,
    recordReviewCompleted,

    // Rules & Persistence
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
      reviewState.rules = JSON.parse(JSON.stringify(DEFAULT_REVIEW_RULES));
      flush();
    }
  };

  global.PK_REVIEW = api;

})(typeof window !== 'undefined' ? window : global);
