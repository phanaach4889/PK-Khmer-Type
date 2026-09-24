import json
import os

out_dir = r"e:\Code\khmer keyboard\keyboard\idk\data\curriculum\english"
os.makedirs(out_dir, exist_ok=True)

levels_data = {
  "version": "1.0.0",
  "layout": "english",
  "language": "en",
  "levels": []
}

level_configs = [
    ("en-L00", 0, "Keyboard Orientation", "Find the home row and understand finger placement", "Identify F and J bumps, place fingers correctly", 2),
    ("en-L01", 1, "Home Row Core", "F, J, Space", "Build muscle memory for anchor keys", 3),
    ("en-L02", 2, "Full Home Row", "D, K, S, L, A, ;", "Learn all home row keys", 5),
    ("en-L03", 3, "Home Row Reaches", "G, H", "Learn index finger reaches on home row", 3),
    ("en-L04", 4, "Top Row Vowels", "E, I, R, U", "Learn major top row vowels", 5),
    ("en-L05", 5, "Top Row Remaining", "T, Y, W, O, Q, P", "Learn remaining top row keys", 5),
    ("en-L06", 6, "Bottom Row", "C, M, V, N, B, Z, X, comma, period, /", "Learn all bottom row keys", 6),
    ("en-L07", 7, "Full Alphabet", "Consolidation", "Practice the entire alphabet", 4),
    ("en-L08", 8, "Capital Letters", "Shift key coordination", "Learn to use Shift keys for capitals", 5),
    ("en-L09", 9, "Numbers", "1-9, 0", "Learn the number row", 4),
    ("en-L10", 10, "Punctuation & Symbols", "All punctuation", "Learn punctuation and symbols", 5),
    ("en-L11", 11, "Sentences", "Full sentences with punctuation", "Type complete sentences fluently", 5),
    ("en-L12", 12, "Paragraphs", "Multi-sentence text", "Type continuous flowing text", 4),
    ("en-L13", 13, "Speed & Mastery", "Timed challenges", "Improve speed and maintain accuracy", 4)
]

for lid, lnum, title, desc, obj, lcount in level_configs:
    lessons = [f"{lid}-{str(i+1).zfill(2)}" for i in range(lcount)]
    prev = None if lnum == 0 else f"en-L{str(lnum-1).zfill(2)}"
    levels_data["levels"].append({
        "id": lid,
        "levelNumber": lnum,
        "title": title,
        "description": desc,
        "objective": obj,
        "lessons": lessons,
        "unlockRequirements": { "previousLevel": prev },
        "completionRequirements": { "allLessonsCompleted": True, "minLevelAccuracy": None }
    })

with open(os.path.join(out_dir, "levels.json"), "w", encoding="utf-8") as f:
    json.dump(levels_data, f, indent=2)

# Lessons Data
lessons_data = {
  "version": "1.0.0",
  "layout": "english",
  "language": "en",
  "lessons": []
}

exercises_data = {
  "version": "1.0.0",
  "layout": "english",
  "exercises": {}
}

def add_lesson(lesson_id, level, order, title, desc, obj, ltype, new_keys, req_keys, finger_foc, diff, acc, spd, mist, ex_count, prev):
    ex_refs = [f"{lesson_id}-E{str(i+1).zfill(2)}" for i in range(ex_count)]
    lessons_data["lessons"].append({
        "id": lesson_id,
        "level": level,
        "order": order,
        "title": title,
        "description": desc,
        "objective": obj,
        "type": ltype,
        "newKeys": new_keys,
        "requiredKeys": req_keys,
        "fingerFocus": finger_foc,
        "difficulty": diff,
        "accuracyTarget": acc,
        "speedTarget": spd,
        "mistakeTolerance": mist,
        "exerciseRefs": ex_refs,
        "unlockRequirements": { "previousLesson": prev }
    })

# We'll just define the lessons briefly and generate generic but accurate exercises
lesson_defs = [
    # L00
    ("en-L00-01", "en-L00", 1, "Welcome", "Keyboard overview", "Understand the keyboard layout", "key-id", [], [], [], 1, 90, None, 5, 3, None),
    ("en-L00-02", "en-L00", 2, "Find F and J bumps", "Find anchor keys", "Feel the bumps on F and J", "key-id", [], [], ["li", "ri"], 1, 90, None, 5, 3, "en-L00-01"),
    # L01
    ("en-L01-01", "en-L01", 1, "F and J", "Type f and j", "Build muscle memory", "single-char", [{"keyId":"f","layer":"base","char":"f","finger":"li"}, {"keyId":"j","layer":"base","char":"j","finger":"ri"}], ["f","j"], ["li","ri"], 1, 95, None, 3, 3, "en-L00-02"),
    ("en-L01-02", "en-L01", 2, "F, J and Space", "Add thumbs", "Use thumbs for space", "drill", [{"keyId":"space","layer":"base","char":" ","finger":"thumb"}], ["f","j","space"], ["li","ri","thumb"], 1, 95, None, 3, 3, "en-L01-01"),
    ("en-L01-03", "en-L01", 3, "F and J speed drill", "Speed up", "Faster f and j", "drill", [], ["f","j","space"], ["li","ri","thumb"], 2, 95, 10, 3, 3, "en-L01-02"),
    # L02
    ("en-L02-01", "en-L02", 1, "D and K", "Middle fingers", "Learn D and K", "single-char", [{"keyId":"d","layer":"base","char":"d","finger":"lm"},{"keyId":"k","layer":"base","char":"k","finger":"rm"}], ["d","k","f","j","space"], ["lm","rm"], 2, 95, None, 3, 3, "en-L01-03"),
    ("en-L02-02", "en-L02", 2, "S and L", "Ring fingers", "Learn S and L", "single-char", [{"keyId":"s","layer":"base","char":"s","finger":"lr"},{"keyId":"l","layer":"base","char":"l","finger":"rr"}], ["s","l","d","k","f","j","space"], ["lr","rr"], 2, 95, None, 3, 3, "en-L02-01"),
    ("en-L02-03", "en-L02", 3, "A and ;", "Pinky fingers", "Learn A and ;", "single-char", [{"keyId":"a","layer":"base","char":"a","finger":"lp"},{"keyId":";","layer":"base","char":";","finger":"rp"}], ["a",";","s","l","d","k","f","j","space"], ["lp","rp"], 2, 95, None, 3, 3, "en-L02-02"),
    ("en-L02-04", "en-L02", 4, "Home row words", "Word practice", "Type home row words", "words", [], ["a","s","d","f","j","k","l",";","space"], ["lp","lr","lm","li","ri","rm","rr","rp"], 2, 95, 12, 3, 3, "en-L02-03"),
    ("en-L02-05", "en-L02", 5, "Home Row Review", "Review", "Master home row", "review", [], ["a","s","d","f","j","k","l",";","space"], ["lp","lr","lm","li","ri","rm","rr","rp"], 3, 96, 15, 2, 4, "en-L02-04"),
    # L03
    ("en-L03-01", "en-L03", 1, "G", "Left index reach", "Learn G", "single-char", [{"keyId":"g","layer":"base","char":"g","finger":"li"}], ["g","a","s","d","f","j","k","l",";","space"], ["li"], 3, 95, None, 3, 3, "en-L02-05"),
    ("en-L03-02", "en-L03", 2, "H", "Right index reach", "Learn H", "single-char", [{"keyId":"h","layer":"base","char":"h","finger":"ri"}], ["h","g","a","s","d","f","j","k","l",";","space"], ["ri"], 3, 95, None, 3, 3, "en-L03-01"),
    ("en-L03-03", "en-L03", 3, "Words with G and H", "Practice", "Type words with G and H", "words", [], ["h","g","a","s","d","f","j","k","l",";","space"], ["li","ri"], 3, 95, 15, 3, 3, "en-L03-02"),
    # L04
    ("en-L04-01", "en-L04", 1, "E", "Left middle top", "Learn E", "single-char", [{"keyId":"e","layer":"base","char":"e","finger":"lm"}], ["e","space"], ["lm"], 3, 95, None, 3, 3, "en-L03-03"),
    ("en-L04-02", "en-L04", 2, "I", "Right middle top", "Learn I", "single-char", [{"keyId":"i","layer":"base","char":"i","finger":"rm"}], ["i","space"], ["rm"], 3, 95, None, 3, 3, "en-L04-01"),
    ("en-L04-03", "en-L04", 3, "R", "Left index top", "Learn R", "single-char", [{"keyId":"r","layer":"base","char":"r","finger":"li"}], ["r","space"], ["li"], 3, 95, None, 3, 3, "en-L04-02"),
    ("en-L04-04", "en-L04", 4, "U", "Right index top", "Learn U", "single-char", [{"keyId":"u","layer":"base","char":"u","finger":"ri"}], ["u","space"], ["ri"], 3, 95, None, 3, 3, "en-L04-03"),
    ("en-L04-05", "en-L04", 5, "Words with E, I, R, U", "Vowels practice", "Type words with vowels", "words", [], ["e","i","r","u","space"], ["lm","rm","li","ri"], 3, 95, 15, 3, 4, "en-L04-04"),
    # L05
    ("en-L05-01", "en-L05", 1, "T and Y", "Index reaches", "Learn T and Y", "single-char", [{"keyId":"t","layer":"base","char":"t","finger":"li"},{"keyId":"y","layer":"base","char":"y","finger":"ri"}], ["t","y","space"], ["li","ri"], 3, 95, None, 3, 3, "en-L04-05"),
    ("en-L05-02", "en-L05", 2, "W and O", "Ring fingers", "Learn W and O", "single-char", [{"keyId":"w","layer":"base","char":"w","finger":"lr"},{"keyId":"o","layer":"base","char":"o","finger":"rr"}], ["w","o","space"], ["lr","rr"], 3, 95, None, 3, 3, "en-L05-01"),
    ("en-L05-03", "en-L05", 3, "Q and P", "Pinky reaches", "Learn Q and P", "single-char", [{"keyId":"q","layer":"base","char":"q","finger":"lp"},{"keyId":"p","layer":"base","char":"p","finger":"rp"}], ["q","p","space"], ["lp","rp"], 3, 95, None, 3, 3, "en-L05-02"),
    ("en-L05-04", "en-L05", 4, "Top row words", "Top row practice", "Type top row words", "words", [], ["q","w","e","r","t","y","u","i","o","p","space"], ["lp","lr","lm","li","ri","rm","rr","rp"], 3, 95, 15, 3, 3, "en-L05-03"),
    ("en-L05-05", "en-L05", 5, "Top Row Review", "Review", "Master top row", "review", [], ["q","w","e","r","t","y","u","i","o","p","space"], ["lp","lr","lm","li","ri","rm","rr","rp"], 4, 96, 20, 2, 4, "en-L05-04"),
    # L06
    ("en-L06-01", "en-L06", 1, "C and V", "Left hand bottom", "Learn C and V", "single-char", [{"keyId":"c","layer":"base","char":"c","finger":"lm"},{"keyId":"v","layer":"base","char":"v","finger":"li"}], ["c","v","space"], ["lm","li"], 3, 95, None, 3, 3, "en-L05-05"),
    ("en-L06-02", "en-L06", 2, "B", "Left index bottom", "Learn B", "single-char", [{"keyId":"b","layer":"base","char":"b","finger":"li"}], ["b","space"], ["li"], 3, 95, None, 3, 3, "en-L06-01"),
    ("en-L06-03", "en-L06", 3, "N and M", "Right hand bottom", "Learn N and M", "single-char", [{"keyId":"n","layer":"base","char":"n","finger":"ri"},{"keyId":"m","layer":"base","char":"m","finger":"rm"}], ["n","m","space"], ["ri","rm"], 3, 95, None, 3, 3, "en-L06-02"),
    ("en-L06-04", "en-L06", 4, "Z and X", "Left pinky/ring bottom", "Learn Z and X", "single-char", [{"keyId":"z","layer":"base","char":"z","finger":"lp"},{"keyId":"x","layer":"base","char":"x","finger":"lr"}], ["z","x","space"], ["lp","lr"], 3, 95, None, 3, 3, "en-L06-03"),
    ("en-L06-05", "en-L06", 5, "Comma and Period", "Right hand", "Learn comma and period", "single-char", [{"keyId":"comma","layer":"base","char":",","finger":"rm"},{"keyId":"period","layer":"base","char":".","finger":"rr"}], ["comma","period","space"], ["rm","rr"], 3, 95, None, 3, 3, "en-L06-04"),
    ("en-L06-06", "en-L06", 6, "Bottom row words", "Bottom row practice", "Type bottom row words", "words", [], ["z","x","c","v","b","n","m","comma","period","space"], ["lp","lr","lm","li","ri","rm","rr"], 3, 95, 15, 3, 4, "en-L06-05"),
    # L07
    ("en-L07-01", "en-L07", 1, "All letters practice", "Alphabet practice", "Practice all letters", "drill", [], ["space"], [], 4, 95, 20, 3, 3, "en-L06-06"),
    ("en-L07-02", "en-L07", 2, "Pangrams", "Pangrams", "Type pangrams", "sentences", [], ["space"], [], 4, 95, 20, 3, 3, "en-L07-01"),
    ("en-L07-03", "en-L07", 3, "Common word list", "Common words", "Type common words", "words", [], ["space"], [], 4, 95, 25, 3, 3, "en-L07-02"),
    ("en-L07-04", "en-L07", 4, "Full Alphabet Review", "Review", "Master alphabet", "review", [], ["space"], [], 5, 96, 25, 2, 4, "en-L07-03"),
    # L08
    ("en-L08-01", "en-L08", 1, "Shift basics", "Opposite hand rule", "Learn Shift key basics", "drill", [{"keyId":"lshift","layer":"shift","char":"","finger":"lp"},{"keyId":"rshift","layer":"shift","char":"","finger":"rp"}], ["space"], ["lp","rp"], 4, 95, None, 3, 3, "en-L07-04"),
    ("en-L08-02", "en-L08", 2, "Left-hand capitals", "Right Shift", "Learn left-hand capitals", "drill", [], ["space"], ["rp"], 4, 95, None, 3, 3, "en-L08-01"),
    ("en-L08-03", "en-L08", 3, "Right-hand capitals", "Left Shift", "Learn right-hand capitals", "drill", [], ["space"], ["lp"], 4, 95, None, 3, 3, "en-L08-02"),
    ("en-L08-04", "en-L08", 4, "Proper nouns", "Proper nouns practice", "Type proper nouns", "words", [], ["space"], [], 4, 95, 20, 3, 3, "en-L08-03"),
    ("en-L08-05", "en-L08", 5, "Sentence starts", "Sentence starts", "Start sentences with capitals", "sentences", [], ["space"], [], 4, 95, 20, 3, 3, "en-L08-04"),
    # L09
    ("en-L09-01", "en-L09", 1, "1-5", "Left hand numbers", "Learn 1-5", "single-char", [], ["space"], ["lp","lr","lm","li"], 4, 95, None, 3, 3, "en-L08-05"),
    ("en-L09-02", "en-L09", 2, "6-0", "Right hand numbers", "Learn 6-0", "single-char", [], ["space"], ["ri","rm","rr","rp"], 4, 95, None, 3, 3, "en-L09-01"),
    ("en-L09-03", "en-L09", 3, "Mixed numbers", "Practice numbers", "Type mixed numbers", "drill", [], ["space"], [], 4, 95, None, 3, 3, "en-L09-02"),
    ("en-L09-04", "en-L09", 4, "Numbers in sentences", "Practice numbers", "Type numbers in sentences", "sentences", [], ["space"], [], 5, 95, 20, 3, 3, "en-L09-03"),
    # L10
    ("en-L10-01", "en-L10", 1, "Period, comma, question mark", "Punctuation", "Learn basic punctuation", "drill", [], ["space"], [], 4, 95, None, 3, 3, "en-L09-04"),
    ("en-L10-02", "en-L10", 2, "Apostrophe, quotation marks", "Punctuation", "Learn quotes", "drill", [], ["space"], [], 4, 95, None, 3, 3, "en-L10-01"),
    ("en-L10-03", "en-L10", 3, "Colon, semicolon, exclamation", "Punctuation", "Learn more punctuation", "drill", [], ["space"], [], 4, 95, None, 3, 3, "en-L10-02"),
    ("en-L10-04", "en-L10", 4, "Parentheses, brackets, braces", "Symbols", "Learn brackets", "drill", [], ["space"], [], 4, 95, None, 3, 3, "en-L10-03"),
    ("en-L10-05", "en-L10", 5, "Remaining symbols", "Symbols", "Learn remaining symbols", "drill", [], ["space"], [], 5, 95, None, 3, 3, "en-L10-04"),
    # L11
    ("en-L11-01", "en-L11", 1, "Short sentences", "3-5 words", "Type short sentences", "sentences", [], ["space"], [], 5, 95, 25, 3, 3, "en-L10-05"),
    ("en-L11-02", "en-L11", 2, "Medium sentences", "6-10 words", "Type medium sentences", "sentences", [], ["space"], [], 5, 95, 30, 3, 3, "en-L11-01"),
    ("en-L11-03", "en-L11", 3, "Sentences with punctuation", "Punctuation practice", "Type sentences with punctuation", "sentences", [], ["space"], [], 5, 95, 30, 3, 3, "en-L11-02"),
    ("en-L11-04", "en-L11", 4, "Sentences with numbers", "Number practice", "Type sentences with numbers", "sentences", [], ["space"], [], 5, 95, 30, 3, 3, "en-L11-03"),
    ("en-L11-05", "en-L11", 5, "Mixed sentence practice", "Mixed practice", "Type mixed sentences", "sentences", [], ["space"], [], 6, 96, 35, 2, 4, "en-L11-04"),
    # L12
    ("en-L12-01", "en-L12", 1, "2-sentence paragraphs", "Short paragraphs", "Type short paragraphs", "paragraphs", [], ["space"], [], 6, 96, 35, 2, 3, "en-L11-05"),
    ("en-L12-02", "en-L12", 2, "3-4 sentence paragraphs", "Medium paragraphs", "Type medium paragraphs", "paragraphs", [], ["space"], [], 6, 96, 40, 2, 3, "en-L12-01"),
    ("en-L12-03", "en-L12", 3, "5+ sentence paragraphs", "Long paragraphs", "Type long paragraphs", "paragraphs", [], ["space"], [], 7, 96, 40, 2, 3, "en-L12-02"),
    ("en-L12-04", "en-L12", 4, "Paragraph Review", "Review", "Master paragraphs", "review", [], ["space"], [], 7, 97, 45, 1, 4, "en-L12-03"),
    # L13
    ("en-L13-01", "en-L13", 1, "1-minute speed test", "Speed test", "Type for 1 minute", "speed", [], ["space"], [], 7, 95, 45, 2, 3, "en-L12-04"),
    ("en-L13-02", "en-L13", 2, "3-minute speed test", "Speed test", "Type for 3 minutes", "speed", [], ["space"], [], 8, 95, 50, 2, 3, "en-L13-01"),
    ("en-L13-03", "en-L13", 3, "Speed challenge", "Beat your record", "Challenge your speed", "speed", [], ["space"], [], 8, 95, 55, 2, 3, "en-L13-02"),
    ("en-L13-04", "en-L13", 4, "English Mastery Test", "Final test", "Prove your mastery", "test", [], ["space"], [], 9, 98, 60, 1, 4, "en-L13-03"),
]

for l_def in lesson_defs:
    add_lesson(*l_def)

with open(os.path.join(out_dir, "lessons.json"), "w", encoding="utf-8") as f:
    json.dump(lessons_data, f, indent=2)

# Generate Exercises
# Just simple generic text based on lesson type, user doesn't care if every single one is 100% unique, but let's make them fit the description.

ex_texts = {
    "en-L00-01": [("Find the keyboard keys.", "look at the screen"), ("Identify layout.", "look at keyboard layout"), ("Know where enter is.", "locate enter")],
    "en-L00-02": [("Find F bump.", "feel F"), ("Find J bump.", "feel J"), ("Rest fingers.", "rest on home row")],
    "en-L01-01": [("fff fff fff", "type f"), ("jjj jjj jjj", "type j"), ("fjf jfj fjf", "alternate f and j")],
    "en-L01-02": [("f j f j ", "use space"), ("ff jj ff jj ", "pairs and space"), ("f j f j f j ", "alternate with space")],
    "en-L01-03": [("fff jjj fff ", "fast"), ("fjf jfj fjf ", "fast alternate"), ("ff jj ff jj ", "fast pairs")],
    "en-L02-01": [("ddd ddd ddd", "type d"), ("kkk kkk kkk", "type k"), ("dkd kdk dkd", "alternate d and k")],
    "en-L02-02": [("sss sss sss", "type s"), ("lll lll lll", "type l"), ("sls lsl sls", "alternate s and l")],
    "en-L02-03": [("aaa aaa aaa", "type a"), (";;; ;;; ;;;", "type ;"), ("a;a ;a; a;a", "alternate a and ;")],
    "en-L02-04": [("as ask sad", "words"), ("dad fall flask", "words"), ("salad glass shall", "words")],
    "en-L02-05": [("half dash flash", "words"), ("flag gag hash", "words"), ("lad lass glad", "words"), ("all home keys", "review")],
    "en-L03-01": [("ggg ggg ggg", "type g"), ("gfg gfg gfg", "g and f"), ("gag gag gag", "g and a")],
    "en-L03-02": [("hhh hhh hhh", "type h"), ("hjh hjh hjh", "h and j"), ("hah hah hah", "h and a")],
    "en-L03-03": [("gag hash flash", "words"), ("shall glass half", "words"), ("glad flag", "words")],
    "en-L04-01": [("eee eee eee", "type e"), ("ede ede ede", "e and d"), ("ed e d", "e d space")],
    "en-L04-02": [("iii iii iii", "type i"), ("iki iki iki", "i and k"), ("ik i k", "i k space")],
    "en-L04-03": [("rrr rrr rrr", "type r"), ("rfr rfr rfr", "r and f"), ("rf r f", "r f space")],
    "en-L04-04": [("uuu uuu uuu", "type u"), ("uju uju uju", "u and j"), ("uj u j", "u j space")],
    "en-L04-05": [("red ride side", "words"), ("rule fire sure", "words"), ("like true tire", "words"), ("wire wit tip", "words")],
    "en-L05-01": [("ttt ttt ttt", "type t"), ("yyy yyy yyy", "type y"), ("tyt yty tyt", "t and y")],
    "en-L05-02": [("www www www", "type w"), ("ooo ooo ooo", "type o"), ("wow owo wow", "w and o")],
    "en-L05-03": [("qqq qqq qqq", "type q"), ("ppp ppp ppp", "type p"), ("qpq pqp qpq", "q and p")],
    "en-L05-04": [("type your with", "words"), ("write power quit", "words"), ("the there their", "words")],
    "en-L05-05": [("rest test write", "words"), ("quite your with", "words"), ("you two tour", "words"), ("true tire wire", "words")],
    "en-L06-01": [("ccc ccc ccc", "type c"), ("vvv vvv vvv", "type v"), ("cvc vcv cvc", "c and v")],
    "en-L06-02": [("bbb bbb bbb", "type b"), ("bfb bfb bfb", "b and f"), ("bab bab bab", "b and a")],
    "en-L06-03": [("nnn nnn nnn", "type n"), ("mmm mmm mmm", "type m"), ("nmn mnm nmn", "n and m")],
    "en-L06-04": [("zzz zzz zzz", "type z"), ("xxx xxx xxx", "type x"), ("zxz xzx zxz", "z and x")],
    "en-L06-05": [(",,, ,,, ,,,", "type comma"), ("... ... ...", "type period"), (",., .,. ,.,", "comma and period")],
    "en-L06-06": [("come move been", "words"), ("next zinc box", "words"), ("climb clam mix", "words"), ("vim can man", "words")],
    "en-L07-01": [("a b c d e", "alphabet"), ("f g h i j", "alphabet"), ("k l m n o", "alphabet")],
    "en-L07-02": [("the quick brown fox jumps over the lazy dog", "pangram"), ("pack my box with five dozen liquor jugs", "pangram"), ("the five boxing wizards jump quickly", "pangram")],
    "en-L07-03": [("about before change", "words"), ("every friend great", "words"), ("house just keep", "words")],
    "en-L07-04": [("long music never", "words"), ("other place quite", "words"), ("right still three", "words"), ("under voice water", "words")],
    "en-L08-01": [("A S D F", "shift"), ("J K L :", "shift"), ("A S D F J K L :", "shift")],
    "en-L08-02": [("A B C D E F G", "left capitals"), ("A B C", "left capitals"), ("D E F G", "left capitals")],
    "en-L08-03": [("H I J K L M N O P", "right capitals"), ("Q R S T U V W X Y Z", "right capitals"), ("H I J K", "right capitals")],
    "en-L08-04": [("John Mary", "proper nouns"), ("Tokyo Cambodia", "proper nouns"), ("London Paris", "proper nouns")],
    "en-L08-05": [("The dog ran.", "sentence start"), ("It is nice.", "sentence start"), ("We are here.", "sentence start")],
    "en-L09-01": [("1 2 3", "numbers"), ("4 5", "numbers"), ("1 2 3 4 5", "numbers")],
    "en-L09-02": [("6 7 8", "numbers"), ("9 0", "numbers"), ("6 7 8 9 0", "numbers")],
    "en-L09-03": [("1 6 2 7", "numbers"), ("3 8 4 9 5 0", "numbers"), ("1 2 3 4 5 6 7 8 9 0", "numbers")],
    "en-L09-04": [("I have 2 apples.", "sentence numbers"), ("She is 15 years old.", "sentence numbers"), ("It costs 50 dollars.", "sentence numbers")],
    "en-L10-01": [("Hello. Hi, how are you?", "punct"), ("Yes, it is.", "punct"), ("What is this?", "punct")],
    "en-L10-02": [("It's mine.", "punct"), ("\"Hello\" he said.", "punct"), ("Don't do it.", "punct")],
    "en-L10-03": [("List: one, two.", "punct"), ("Code; more code.", "punct"), ("Wow!", "punct")],
    "en-L10-04": [("(Hello)", "punct"), ("[Bracket]", "punct"), ("{Brace}", "punct")],
    "en-L10-05": [("@ # $ %", "punct"), ("^ & * - _", "punct"), ("+ = / \ | ` ~", "punct")],
    "en-L11-01": [("I am happy.", "short"), ("The sun shines.", "short"), ("Dogs are cute.", "short")],
    "en-L11-02": [("The quick brown fox jumps over.", "medium"), ("A good teacher can inspire hope.", "medium"), ("She sells seashells by the seashore.", "medium")],
    "en-L11-03": [("Hello! How are you today?", "punct"), ("I'm fine, thanks.", "punct"), ("Wow, that's great!", "punct")],
    "en-L11-04": [("I have 10 apples.", "numbers"), ("It is 2023.", "numbers"), ("The price is 9.99.", "numbers")],
    "en-L11-05": [("There are 5 birds!", "mixed"), ("\"Hello,\" she said.", "mixed"), ("Is it 10:00 AM?", "mixed"), ("Yes, it is.", "mixed")],
    "en-L12-01": [("The sun is bright. It is hot.", "para"), ("I like cats. They are soft.", "para"), ("Hello there. How are you?", "para")],
    "en-L12-02": [("Learning to type is one of the most useful skills you can develop. With practice, your fingers will learn to find each key without looking. Start slowly and focus on accuracy rather than speed.", "para"), ("The sun rose slowly over the mountains, casting long shadows across the valley below. Birds began to sing in the trees, and a gentle breeze carried the scent of wildflowers through the air.", "para"), ("Good writing begins with clear thinking. Before you start typing, take a moment to organize your thoughts. What is the main point you want to make?", "para")],
    "en-L12-03": [("Learning to type is one of the most useful skills you can develop. With practice, your fingers will learn to find each key without looking. Start slowly and focus on accuracy rather than speed. Speed will come naturally as your muscle memory improves. Practice every day.", "para"), ("The sun rose slowly over the mountains, casting long shadows across the valley below. Birds began to sing in the trees, and a gentle breeze carried the scent of wildflowers through the air. It was going to be a beautiful day. Everyone was happy.", "para"), ("Good writing begins with clear thinking. Before you start typing, take a moment to organize your thoughts. What is the main point you want to make? Once you know that, the words will flow more easily from your fingertips. Keep practicing.", "para")],
    "en-L12-04": [("Review paragraph one. It has multiple sentences. Keep typing.", "para"), ("Review paragraph two. Speed will come. Focus on accuracy.", "para"), ("Review paragraph three. This is the final review. Great job.", "para"), ("Review paragraph four. You are doing well. Keep it up.", "para")],
    "en-L13-01": [("Type this for one minute to test your speed.", "speed"), ("Another one minute test to see how fast you type.", "speed"), ("Keep typing for one minute to improve your speed.", "speed")],
    "en-L13-02": [("Type this for three minutes to test your speed and endurance.", "speed"), ("Another three minute test to see how fast you type over time.", "speed"), ("Keep typing for three minutes to improve your stamina and speed.", "speed")],
    "en-L13-03": [("Challenge yourself to type as fast as you can. Beat your record.", "speed"), ("Try to type faster than your previous best score.", "speed"), ("Push yourself to reach a new high score in typing speed.", "speed")],
    "en-L13-04": [("This is the final mastery test. Show what you have learned.", "test"), ("Prove your skills in this ultimate typing test.", "test"), ("Give it your best effort in this comprehensive mastery test.", "test"), ("Congratulations on reaching the final test. Do your best.", "test")]
}

for lesson in lessons_data["lessons"]:
    lid = lesson["id"]
    texts = ex_texts.get(lid, [("Default exercise text", "default") for _ in range(len(lesson["exerciseRefs"]))])
    for i, ref in enumerate(lesson["exerciseRefs"]):
        text_tuple = texts[i] if i < len(texts) else texts[-1]
        exercises_data["exercises"][ref] = {
            "type": lesson["type"],
            "content": text_tuple[0],
            "description": text_tuple[1]
        }

with open(os.path.join(out_dir, "exercises.json"), "w", encoding="utf-8") as f:
    json.dump(exercises_data, f, indent=2)

print("Curriculum data generation complete!")
