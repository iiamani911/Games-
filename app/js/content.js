/* =========================================================
   Kanz — bilingual game content (Arabic + English)
   ========================================================= */
'use strict';

const CATS = {
  riddle:    { icon:'🧩', ar:'ألغاز',          en:'Riddles' },
  number:    { icon:'🔢', ar:'ألغاز الأرقام',   en:'Number puzzles' },
  word:      { icon:'🔤', ar:'ألعاب الكلمات',   en:'Word games' },
  pattern:   { icon:'🔷', ar:'الأنماط',         en:'Patterns' },
  knowledge: { icon:'🌍', ar:'معلومات عامة',    en:'General knowledge' },
  health:    { icon:'🥗', ar:'صحة وتغذية',      en:'Health & food' }
};
const CAT_ORDER = ['riddle','number','word','pattern','knowledge','health'];

const STAGES = [
  { icon:'🏝️', cat:'riddle',
    ar:{ name:'شاطئ الألغاز', desc:'ألغاز ذكية تحتاج إلى عقل يقظ وخيال واسع.', story:'وجدتم زجاجة قديمة على الشاطئ، وفي داخلها خريطة ممزقة! أول قطعة منها يحرسها حارس الألغاز…' },
    en:{ name:'Riddle Beach', desc:'Clever riddles for sharp minds and big imaginations.', story:'You found an old bottle on the beach with a torn map inside! The first piece is guarded by the Riddle Keeper…' } },
  { icon:'🌴', cat:'number',
    ar:{ name:'غابة الأرقام', desc:'حسابات وألغاز رقمية تفتح الطريق بين الأشجار.', story:'الطريق يدخل غابة كثيفة، وعلى كل شجرة رقم غامض. حلّوا الألغاز الرقمية لتجدوا الممر الصحيح!' },
    en:{ name:'Number Jungle', desc:'Math puzzles that clear the path through the trees.', story:'The trail enters a thick jungle with a mysterious number on every tree. Solve them to find the right path!' } },
  { icon:'🗿', cat:'word',
    ar:{ name:'كهف الحروف', desc:'كلمات مبعثرة ومعانٍ ومرادفات وأمثال.', story:'في عمق الجبل كهف مظلم، جدرانه مليئة بحروف متناثرة. رتّبوا الكلمات لتضيء المشاعل!' },
    en:{ name:'Letter Cave', desc:'Scrambled words, meanings, opposites and sayings.', story:'Deep in the mountain lies a dark cave covered in scattered letters. Unscramble the words to light the torches!' } },
  { icon:'🏛️', cat:'pattern',
    ar:{ name:'معبد الأنماط', desc:'أعداد ورموز وحروف تسير بنظام سري.', story:'أمامكم معبد قديم، أبوابه لا تُفتح إلا لمن يكتشف النمط المخفي في النقوش.' },
    en:{ name:'Pattern Temple', desc:'Numbers, symbols and letters following a secret rule.', story:'An ancient temple stands before you. Its doors open only for those who crack the hidden pattern.' } },
  { icon:'🌋', cat:'knowledge',
    ar:{ name:'جبل المعرفة', desc:'أسئلة من العلوم والجغرافيا والتاريخ.', story:'على قمة الجبل حكيم عجوز لن يسمح لكم بالعبور إلا بعد أسئلته.' },
    en:{ name:'Knowledge Peak', desc:'Questions from science, geography and history.', story:'A wise old sage sits on the mountain top. Answer the questions to pass!' } },
  { icon:'🥗', cat:'health',
    ar:{ name:'واحة الصحة', desc:'أسئلة عن الأكل الصحي والنوم والنشاط.', story:'المحطة الأخيرة قبل الكنز! واحة خضراء لا يعبرها إلا من يعرف أسرار الجسم القوي.' },
    en:{ name:'Healthy Oasis', desc:'Questions about healthy food, sleep and staying active.', story:'The last stop before the treasure! Only those who know the secrets of a strong body may cross this green oasis.' } }
];

/* ---------------- Question bank ----------------
   B(cat, level, ar, en): each language is [question, answer, [3 wrongs], hint, explanation]
   P(level, ar, en): each language is [sequence[], answer, [3 wrongs], hint, explanation]   */
const BANK = [];
let _bid = 0;
function _mk(id, lang, cat, level, arr, q){
  const [qq, a, w, h, e] = arr;
  return { id:id+lang, lang, cat, level, q: q || qq, answer:String(a), wrongs:w.map(String), hint:h||'', ex:e||'', seq: q ? qq : null };
}
function B(cat, level, ar, en){ const id = cat[0] + (++_bid); if(ar) BANK.push(_mk(id,'ar',cat,level,ar)); if(en) BANK.push(_mk(id,'en',cat,level,en)); }
function P(level, ar, en){ const id = 'p' + (++_bid); if(ar) BANK.push(_mk(id,'ar','pattern',level,ar,'ما الذي يأتي بعد ذلك؟')); if(en) BANK.push(_mk(id,'en','pattern',level,en,'What comes next?')); }

/* ===== Riddles (Arabic) ===== */
[
 ['easy','ما الشيء الذي له أسنان كثيرة لكنه لا يعضّ؟','المشط',['المقص','التمساح','المفتاح'],'نستخدمه كل صباح لترتيب الشعر.'],
 ['easy','ما الشيء الذي يكتب ولا يقرأ؟','القلم',['الكتاب','الدفتر','المعلّم'],'تجده في حقيبة المدرسة.'],
 ['easy','ما الشيء الذي له عين واحدة ولا يرى؟','الإبرة',['القرصان','الإعصار','الكاميرا'],'نستخدمه في الخياطة.'],
 ['easy','بيت بلا أبواب ولا نوافذ، إذا خرج ساكنه كسره. ما هو؟','البيضة',['الخيمة','العلبة','الكهف'],'يخرج منه كتكوت صغير.'],
 ['easy','يسمع بلا أذن، ويتكلم بلا لسان. ما هو؟','الهاتف',['الكتاب','الببغاء','المرآة'],'نتصل به بالأهل والأصدقاء.'],
 ['easy','ما الشيء الذي له أربع أرجل لكنه لا يمشي؟','الكرسي',['الحصان','السلحفاة','القطة'],'نجلس عليه.'],
 ['easy','له رقبة وليس له رأس. ما هو؟','الزجاجة',['الزرافة','الوردة','البطة'],'نشرب منها الماء.'],
 ['easy','يجري طوال الوقت ولا يمشي أبداً. ما هو؟','النهر',['الحصان','القطار','الأرنب'],'ماء عذب يجري بين ضفّتين.'],
 ['easy','شيء نأكل فيه كل يوم لكننا لا نأكله. ما هو؟','الصحن',['الخبز','الأرز','التفاح'],'تجده على مائدة الطعام.'],
 ['easy','يمشي بلا أرجل، ويبكي بلا عيون. ما هو؟','السحاب',['الثعبان','النهر','الطفل'],'تراه في السماء، ودموعه مطر.'],
 ['easy','ما الشيء الذي إذا لمسته صاح؟','الجرس',['القطة','البالون','الكتاب'],'تجده عند باب البيت.'],
 ['medium','شيء تراه في الليل ثلاث مرات، وفي النهار مرة واحدة. ما هو؟','حرف اللام',['القمر','النجوم','حرف النون'],'فكّر في حروف الكلمتين نفسيهما!','كلمة «الليل» فيها ثلاث لامات، و«النهار» فيها لام واحدة.'],
 ['medium','ما الذي يتكلم بكل لغات العالم دون أن يتعلّمها؟','الصدى',['الببغاء','المترجم','الراديو'],'تسمعه في الجبال والكهوف.','الصدى يردّد أي كلمة بأي لغة.'],
 ['medium','له أوراق وليس نباتاً، وله جلد وليس حيواناً. ما هو؟','الكتاب',['الشجرة','الحقيبة','الحذاء'],'نقرأ فيه.','للكتاب أوراق وغلاف من الجلد.'],
 ['medium','أخضر في الأرض، وأسود في السوق، وأحمر في البيت. ما هو؟','الشاي',['البطيخ','الفلفل','العنب'],'مشروب ساخن تحبه العائلة.','أوراقه خضراء، ويُباع أسود مجففاً، ويصبح أحمر عند تحضيره.'],
 ['medium','أخت خالك وليست خالتك. من تكون؟','أمك',['عمتك','جدتك','أختك'],'الخال هو أخو…','أخت خالك هي أمك.'],
 ['medium','تحمله ويحملك. ما هو؟','الحذاء',['الحقيبة','الكرسي','السرير'],'تلبسه في قدميك.'],
 ['medium','لا يعمل إلا إذا ضربته على رأسه. ما هو؟','المسمار',['الباب','الجرس','الكرة'],'يستخدمه النجّار مع المطرقة.'],
 ['medium','حيوان يطير، ويلد صغاره ولا يبيض. ما هو؟','الخفاش',['النسر','النعامة','البطريق'],'ينام مقلوباً في النهار.','الخفاش من الثدييات مع أنه يطير.'],
 ['medium','ما الشيء الذي كلما أخذت منه كبر؟','الحفرة',['البالون','الكعكة','الكيس'],'تصنعها بالمجرفة.'],
 ['medium','يقرصك ولا تراه. ما هو؟','الجوع',['البعوض','القطة','النمل'],'يختفي بعد وجبة لذيذة.'],
 ['medium','يرتفع دائماً ولا ينزل أبداً. ما هو؟','العمر',['المصعد','الطائرة','البالون'],'يزيد مع كل عيد ميلاد.'],
 ['hard','إذا أكلته كله استفدت، وإذا أكلت نصفه متّ! ما هو؟','السمسم',['العسل','الفطر','الثوم'],'انظر إلى نصف اسمه!','نصف كلمة «سمسم» هو «سم».'],
 ['hard','ما الشيء الموجود في وسط مكة؟','حرف الكاف',['الكعبة','زمزم','حرف الميم'],'لا تفكّر في المكان، بل في الكلمة!','كلمة «مكة»: م - ك - ة، والكاف في وسطها.'],
 ['hard','فيّ مدن بلا بيوت، وأنهار بلا ماء، وغابات بلا أشجار. ما أنا؟','الخريطة',['الحلم','الصحراء','اللوحة'],'نحتاجها في هذه المغامرة!'],
 ['hard','أنا ابن الماء، فإن تركوني في الماء متّ. من أنا؟','الثلج',['السمك','الصدف','الغيم'],'يذوب إذا وُضع في الماء.'],
 ['hard','كلما اقتربت منه ابتعد عنك، تراه ولا تصل إليه أبداً. ما هو؟','الأفق',['القمر','الظل','الجبل'],'حيث تبدو السماء ملتقية بالأرض.'],
 ['hard','يكسو الناس وهو عارٍ. ما هو؟','الإبرة',['الخيّاط','القطن','الخروف'],'أداة صغيرة جداً في علبة الخياطة.'],
 ['hard','يدخل الماء ولا يبتلّ أبداً. ما هو؟','الظل',['السمكة','الصابون','الغوّاص'],'يتبعك في الشمس.'],
 ['hard','أمامك دائماً لكنك لا تستطيع رؤيته. ما هو؟','المستقبل',['الطريق','أنفك','الماضي'],'يأتي بعد اليوم.'],
 ['hard','إذا نطقت باسمي كسرتني. من أنا؟','الصمت',['الزجاج','الصوت','الوعد'],'عكس الكلام.','بمجرد أن تقول «صمت» تكون قد كسرت الصمت!'],
 ['hard','ابن أبيك وابن أمك، وليس أخاك. من هو؟','أنت',['ابن عمك','خالك','جدك'],'انظر في المرآة!']
].forEach(([l,...r]) => B('riddle', l, r, null));

/* ===== Riddles (English) ===== */
[
 ['easy','What has hands but can’t clap?','A clock',['A tree','A robot','A glove'],'It tells you the time.'],
 ['easy','What has to be broken before you can use it?','An egg',['A window','A pencil','A door'],'You might eat it for breakfast.'],
 ['easy','What has lots of teeth but can’t bite?','A comb',['A shark','A saw','A zipper'],'You use it on your hair.'],
 ['easy','What gets wetter the more it dries?','A towel',['A sponge','The rain','A fish'],'You use it after a shower.'],
 ['easy','What has legs but doesn’t walk?','A table',['A spider','A horse','A frog'],'You eat dinner on it.'],
 ['easy','I have keys but open no locks. What am I?','A piano',['A door','A car','A map'],'It makes music.'],
 ['easy','What goes up but never comes down?','Your age',['A balloon','A rocket','A ball'],'It grows every birthday.'],
 ['easy','What has one eye but can’t see?','A needle',['A pirate','A storm','A camera'],'It’s used for sewing.'],
 ['medium','The more you take, the more you leave behind. What are they?','Footsteps',['Photos','Cookies','Breaths'],'Think about walking on sand.'],
 ['medium','What can travel around the world while staying in a corner?','A stamp',['A plane','A spider','The wind'],'You find it on an envelope.'],
 ['medium','What has a head and a tail but no body?','A coin',['A snake','A comet','A kite'],'Flip it!'],
 ['medium','What can you catch but not throw?','A cold',['A ball','A fish','A bus'],'Achoo!'],
 ['medium','What runs but never walks, and has a mouth but never talks?','A river',['A clock','A dog','A car'],'It flows into the sea.'],
 ['medium','What is full of holes but still holds water?','A sponge',['A net','A bucket','A cloud'],'You wash dishes with it.'],
 ['medium','What belongs to you, but other people use it more than you do?','Your name',['Your phone','Your bike','Your shoes'],'People call you by it.'],
 ['medium','What has cities but no houses, forests but no trees, and rivers but no water?','A map',['A dream','A desert','A painting'],'We need one in this adventure!'],
 ['hard','What can fill a room but takes up no space?','Light',['Water','A balloon','Furniture'],'Flip a switch.'],
 ['hard','The more of it there is, the less you see. What is it?','Darkness',['Light','Glass','Mirrors'],'It comes at night.'],
 ['hard','What breaks when you say its name?','Silence',['Glass','A promise','A record'],'The opposite of noise.'],
 ['hard','I speak without a mouth and hear without ears. What am I?','An echo',['A radio','A ghost','A parrot'],'You hear me in caves and mountains.'],
 ['hard','What comes once in a minute, twice in a moment, but never in a thousand years?','The letter M',['The letter E','A second','A star'],'Look at the spelling!','“minute” has one M, “moment” has two, “thousand years” has none.'],
 ['hard','Forward I am heavy, backward I am not. What am I?','A ton',['A rock','A truck','A box'],'Read the word backwards!','“ton” backwards is “not”.'],
 ['hard','If you have me, you want to share me. If you share me, you don’t have me. What am I?','A secret',['A cake','A toy','A coin'],'Shh… don’t tell anyone!']
].forEach(([l,...r]) => B('riddle', l, null, r));

/* ===== Words (Arabic) ===== */
[
 ['easy','ما عكس كلمة «طويل»؟','قصير',['كبير','عريض','سريع'],'فكّر في الطول.'],
 ['easy','ما جمع كلمة «قلم»؟','أقلام',['قلمات','قلوم','قلمون'],'يبدأ بالهمزة.'],
 ['easy','أي كلمة لا تنتمي إلى المجموعة؟ (تفاح، موز، جزر، برتقال)','جزر',['تفاح','موز','برتقال'],'ثلاث منها فواكه.','الجزر من الخضراوات.'],
 ['easy','ما مرادف كلمة «سعيد»؟','فرحان',['حزين','غاضب','نعسان'],'شعور جميل.'],
 ['easy','أي كلمة لا تنتمي إلى المجموعة؟ (أسد، نمر، حمامة، فهد)','حمامة',['أسد','نمر','فهد'],'ثلاثة منها حيوانات مفترسة.','الحمامة طائر، والبقية من فصيلة القطط.'],
 ['easy','ما عكس كلمة «ليل»؟','نهار',['قمر','نوم','ظلام'],'وقت شروق الشمس.'],
 ['easy','ما عكس كلمة «ساخن»؟','بارد',['دافئ','حار','جاف'],'مثل الثلج.'],
 ['easy','صوت القطة يُسمّى…','مواء',['نباح','زئير','صهيل'],'«مياو»!'],
 ['medium','ما مرادف كلمة «الغيث»؟','المطر',['الريح','الثلج','الرعد'],'ينزل من السحاب.'],
 ['medium','ما عكس كلمة «بخيل»؟','كريم',['فقير','غني','ذكي'],'صفة حاتم الطائي.'],
 ['medium','ما مفرد كلمة «أنهار»؟','نهر',['نهار','منهر','أنهر'],'ماء يجري.'],
 ['medium','أي كلمة لا تنتمي إلى المجموعة؟ (عطارد، الزهرة، القمر، المريخ)','القمر',['عطارد','الزهرة','المريخ'],'ثلاثة منها كواكب.','القمر تابع يدور حول الأرض وليس كوكباً.'],
 ['medium','أكمل المثل: «الصديق وقت…»','الضيق',['الفرح','الصباح','اللعب'],'الصديق الحقيقي يظهر في الشدّة.'],
 ['medium','أي كلمة تُقرأ بالشكل نفسه من اليمين ومن اليسار؟','باب',['بيت','قلم','شمس'],'جرّب قراءة كل كلمة بالعكس.','«باب» بالعكس تبقى «باب».'],
 ['medium','أكمل المثل: «إذا كان الكلام من فضة، فالسكوت من…»','ذهب',['حديد','نحاس','ماس'],'معدن أغلى من الفضة.'],
 ['medium','بيت النحل يُسمّى…','خلية',['عش','جحر','وكر'],'فيها العسل.'],
 ['medium','ما مرادف كلمة «شجاع»؟','مقدام',['جبان','خجول','كسول'],'لا يخاف التقدّم.'],
 ['hard','ما معنى كلمة «الهِزَبْر»؟','الأسد',['النسر','الحصان','الذئب'],'من أسماء ملك الغابة.'],
 ['hard','ما معنى كلمة «اليَراع»؟','القلم',['السيف','الكتاب','الحبر'],'أداة الكاتب قديماً.'],
 ['hard','أكمل الحكمة: «مَن جدّ…»','وجد',['نجح','سهر','ربح'],'«ومن زرع حصد».'],
 ['hard','ما جمع كلمة «رسالة» جمعَ تكسير؟','رسائل',['رسول','مراسل','أرسال'],'على وزن «فعائل».'],
 ['hard','صغير الأسد يُسمّى…','شبل',['جرو','مهر','حمل'],'يبدأ بحرف الشين.'],
 ['hard','صوت الحصان يُسمّى…','صهيل',['خوار','ثغاء','نقيق'],'يبدأ بحرف الصاد.'],
 ['hard','ما مثنّى كلمة «عين» في حالة الرفع؟','عينان',['عينين','عيون','أعين'],'المثنّى المرفوع ينتهي بـ«ان».'],
 ['hard','ما معنى كلمة «السَّغَب»؟','الجوع',['العطش','التعب','الخوف'],'ورد في القرآن: «في يومٍ ذي مسغبة».']
].forEach(([l,...r]) => B('word', l, r, null));

/* ===== Words (English) ===== */
[
 ['easy','What is the opposite of “hot”?','cold',['warm','wet','fast'],'Think of ice.'],
 ['easy','What is the plural of “child”?','children',['childs','childes','childrens'],'It’s an irregular plural.'],
 ['easy','Which word doesn’t belong? (apple, banana, carrot, grape)','carrot',['apple','banana','grape'],'Three of them are fruits.','A carrot is a vegetable.'],
 ['easy','Which word means the same as “happy”?','glad',['sad','angry','sleepy'],'A nice feeling.'],
 ['easy','Which word is spelled correctly?','beautiful',['beutiful','beautifull','beatiful'],'b-e-a-u…'],
 ['easy','A baby cat is called a…','kitten',['puppy','cub','calf'],'It says “mew”.'],
 ['medium','Which word means the same as “huge”?','enormous',['tiny','quiet','quick'],'Really, really big.'],
 ['medium','What is the opposite of “ancient”?','modern',['old','broken','famous'],'Think new technology.'],
 ['medium','What is the plural of “mouse”?','mice',['mouses','meese','mousen'],'An irregular plural.'],
 ['medium','Which word doesn’t belong? (Mercury, Venus, Moon, Mars)','Moon',['Mercury','Venus','Mars'],'Three are planets.','The Moon orbits Earth; it isn’t a planet.'],
 ['medium','Which word reads the same forwards and backwards?','level',['lever','label','leave'],'Try reading each one backwards.'],
 ['medium','Complete the saying: “Actions speak louder than…”','words',['shouts','music','thunder'],'What you do matters more than what you say.'],
 ['medium','A baby kangaroo is called a…','joey',['cub','kid','foal'],'It lives in a pouch.'],
 ['hard','What does “benevolent” mean?','kind',['angry','lazy','noisy'],'A benevolent king helps his people.'],
 ['hard','What does “ephemeral” mean?','short-lived',['enormous','ancient','invisible'],'Like a soap bubble.'],
 ['hard','What is the past tense of “seek”?','sought',['seeked','sook','sighted'],'It rhymes with “caught”.'],
 ['hard','A group of lions is called a…','pride',['pack','herd','flock'],'It’s also a feeling.'],
 ['hard','What is the fear of spiders called?','arachnophobia',['claustrophobia','acrophobia','hydrophobia'],'Spiders are “arachnids”.'],
 ['hard','Which word means the same as “meticulous”?','careful',['careless','fast','loud'],'Paying attention to every detail.']
].forEach(([l,...r]) => B('word', l, null, r));

/* ===== General knowledge (both) ===== */
B('knowledge','easy',['ما الكوكب الذي يُلقّب بالكوكب الأحمر؟','المريخ',['الأرض','زحل','عطارد'],'لونه بسبب الصدأ في صخوره.'],['Which planet is called the Red Planet?','Mars',['Earth','Saturn','Mercury'],'Its rocks are rusty!']);
B('knowledge','easy',['كم يوماً في السنة الميلادية العادية؟','365',['360','366','350'],'السنة الكبيسة فيها يوم زائد.'],['How many days are in a normal year?','365',['360','366','350'],'A leap year has one extra day.']);
B('knowledge','easy',['ما عاصمة مصر؟','القاهرة',['الإسكندرية','الجيزة','أسوان'],'يمرّ بها نهر النيل.'],['What is the capital of Egypt?','Cairo',['Alexandria','Giza','Aswan'],'The Nile runs through it.']);
B('knowledge','easy',['ما أسرع حيوان برّي في العالم؟','الفهد',['الأسد','الحصان','الغزال'],'جلده مرقّط.'],['What is the fastest land animal?','Cheetah',['Lion','Horse','Gazelle'],'It has spots.']);
B('knowledge','easy',['ما الحيوان الملقّب بسفينة الصحراء؟','الجمل',['الحصان','الفيل','الحمار'],'له سنام.'],['Which animal is called the “ship of the desert”?','Camel',['Horse','Elephant','Donkey'],'It has a hump.']);
B('knowledge','easy',['كم عدد أرجل العنكبوت؟','8',['6','4','10'],'أكثر من أرجل الحشرات.','للعنكبوت 8 أرجل، أما الحشرات فلها 6.'],['How many legs does a spider have?','8',['6','4','10'],'More than an insect.','Spiders have 8 legs; insects have 6.']);
B('knowledge','easy',['كم عدد قارات العالم؟','7',['5','6','8'],'منها آسيا وأفريقيا وأوروبا…'],['How many continents are there?','7',['5','6','8'],'Asia, Africa, Europe…']);
B('knowledge','easy',['ما أكبر حيوان على وجه الأرض؟','الحوت الأزرق',['الفيل','الزرافة','القرش الأبيض'],'يعيش في المحيط.'],['What is the largest animal on Earth?','Blue whale',['Elephant','Giraffe','Great white shark'],'It lives in the ocean.']);
B('knowledge','easy',['في أي فصل تتساقط أوراق كثير من الأشجار؟','الخريف',['الربيع','الصيف','الشتاء'],'يأتي بعد الصيف.'],['In which season do many trees lose their leaves?','Autumn',['Spring','Summer','Winter'],'It comes after summer.']);
B('knowledge','medium',['ما أكبر كوكب في المجموعة الشمسية؟','المشتري',['زحل','الأرض','نبتون'],'كوكب غازي فيه بقعة حمراء عظيمة.'],['What is the biggest planet in the Solar System?','Jupiter',['Saturn','Earth','Neptune'],'It has a Great Red Spot.']);
B('knowledge','medium',['ما أطول نهر في العالم بحسب أغلب المصادر؟','النيل',['الأمازون','الفرات','المسيسيبي'],'يمرّ بالسودان ومصر.'],['What is the longest river in the world, according to most sources?','The Nile',['The Amazon','The Euphrates','The Mississippi'],'It flows through Sudan and Egypt.']);
B('knowledge','medium',['ما عاصمة اليابان؟','طوكيو',['بكين','سيول','أوساكا'],'من أكبر مدن العالم سكاناً.'],['What is the capital of Japan?','Tokyo',['Beijing','Seoul','Osaka'],'One of the biggest cities on Earth.']);
B('knowledge','medium',['ما أكبر عضو في جسم الإنسان؟','الجلد',['الكبد','القلب','الدماغ'],'يغطي الجسم كله!'],['What is the largest organ of the human body?','Skin',['Liver','Heart','Brain'],'It covers your whole body!']);
B('knowledge','medium',['كم عدد لاعبي فريق كرة القدم داخل الملعب؟','11',['9','10','12'],'بمن فيهم حارس المرمى.'],['How many players does a football (soccer) team have on the field?','11',['9','10','12'],'Including the goalkeeper.']);
B('knowledge','medium',['ما أعلى جبل في العالم؟','إيفرست',['كليمنجارو','مون بلان','جبل طارق'],'في جبال الهيمالايا.'],['What is the tallest mountain in the world?','Everest',['Kilimanjaro','Mont Blanc','Gibraltar'],'It’s in the Himalayas.']);
B('knowledge','medium',['عند كم درجة مئوية يغلي الماء عند مستوى سطح البحر؟','100',['50','90','120'],'عدد من ثلاث خانات.'],['At what temperature (°C) does water boil at sea level?','100',['50','90','120'],'A three-digit number.']);
B('knowledge','medium',['كم عدد كواكب المجموعة الشمسية؟','8',['7','9','10'],'كان بلوتو يُعدّ منها سابقاً.'],['How many planets are in the Solar System?','8',['7','9','10'],'Pluto used to be counted.']);
B('knowledge','medium',['كم حرفاً في الأبجدية العربية؟','28',['26','29','30'],'من الألف إلى الياء.'],['How many letters are in the English alphabet?','26',['24','28','30'],'From A to Z.']);
B('knowledge','medium',['ما أصغر قارة في العالم؟','أستراليا',['أوروبا','أفريقيا','أمريكا الجنوبية'],'يعيش فيها الكنغر.'],['What is the smallest continent?','Australia',['Europe','Africa','South America'],'Kangaroos live there.']);
B('knowledge','hard',['ما الرمز الكيميائي للذهب؟','Au',['Ag','Go','Gd'],'الرمز Ag هو للفضة، وليس للذهب.','Au من الاسم اللاتيني Aurum.'],['What is the chemical symbol for gold?','Au',['Ag','Go','Gd'],'Ag is silver, not gold.','Au comes from the Latin “aurum”.']);
B('knowledge','hard',['ما أصغر دولة في العالم مساحةً؟','الفاتيكان',['موناكو','البحرين','سنغافورة'],'تقع داخل مدينة روما.'],['What is the smallest country in the world?','Vatican City',['Monaco','Bahrain','Singapore'],'It’s inside Rome.']);
B('knowledge','hard',['في أي عام هبط الإنسان على سطح القمر لأول مرة؟','1969',['1959','1975','1981'],'في أواخر الستينيات.'],['In what year did humans first land on the Moon?','1969',['1959','1975','1981'],'The late 1960s.']);
B('knowledge','hard',['ما عاصمة كندا؟','أوتاوا',['تورنتو','مونتريال','فانكوفر'],'ليست أكبر مدنها.'],['What is the capital of Canada?','Ottawa',['Toronto','Montreal','Vancouver'],'It’s not the biggest city.']);
B('knowledge','hard',['من مؤلف كتاب «القانون في الطب»؟','ابن سينا',['ابن خلدون','الخوارزمي','ابن بطوطة'],'لُقّب بالشيخ الرئيس.'],['Who wrote “The Canon of Medicine”?','Ibn Sina (Avicenna)',['Ibn Khaldun','Al-Khwarizmi','Ibn Battuta'],'He was a famous Persian physician.']);
B('knowledge','hard',['كم يستغرق ضوء الشمس تقريباً ليصل إلى الأرض؟','8 دقائق',['8 ثوانٍ','ساعة واحدة','يوم كامل'],'أكثر من دقيقة وأقل من ربع ساعة.'],['About how long does sunlight take to reach Earth?','8 minutes',['8 seconds','1 hour','1 day'],'More than a minute, less than 15.']);
B('knowledge','hard',['ما أعمق نقطة معروفة في محيطات العالم؟','خندق ماريانا',['مثلث برمودا','البحر الميت','خليج المكسيك'],'تقع في المحيط الهادئ.'],['What is the deepest known point in the oceans?','Mariana Trench',['Bermuda Triangle','Dead Sea','Gulf of Mexico'],'It’s in the Pacific Ocean.']);
B('knowledge','hard',['من العالِم الذي وضع أسس علم الجبر؟','الخوارزمي',['ابن الهيثم','البيروني','الفارابي'],'كلمة «خوارزمية» مشتقة من اسمه.'],['Which scholar is known as the father of algebra?','Al-Khwarizmi',['Ibn al-Haytham','Al-Biruni','Al-Farabi'],'The word “algorithm” comes from his name.']);
B('knowledge','hard',['ما أكثر غاز موجود في الغلاف الجوي للأرض؟','النيتروجين',['الأكسجين','ثاني أكسيد الكربون','الهيدروجين'],'نسبته نحو 78%.'],['Which gas makes up most of Earth’s atmosphere?','Nitrogen',['Oxygen','Carbon dioxide','Hydrogen'],'About 78%.']);
B('knowledge','hard',['ما عاصمة أستراليا؟','كانبرا',['سيدني','ملبورن','بيرث'],'ليست سيدني!'],['What is the capital of Australia?','Canberra',['Sydney','Melbourne','Perth'],'Not Sydney!']);
B('knowledge','hard',['من العالِم الذي يُعدّ رائد علم البصريات ومؤلف «كتاب المناظر»؟','ابن الهيثم',['ابن رشد','جابر بن حيان','الرازي'],'شرح كيف نرى الأشياء بانعكاس الضوء.'],['Which scientist pioneered optics and wrote the “Book of Optics”?','Ibn al-Haytham',['Ibn Rushd','Jabir ibn Hayyan','Al-Razi'],'He explained how we see using light.']);

/* ===== Health & nutrition (both) ===== */
B('health','easy',['أي من هذه فاكهة؟','الفراولة',['الجزر','البروكلي','البطاطس'],'حمراء وصغيرة وفيها بذور من الخارج!'],['Which of these is a fruit?','Strawberry',['Carrot','Broccoli','Potato'],'Small, red, with seeds on the outside!']);
B('health','easy',['ما الذي يشكّل أكثر من نصف وزن جسمك؟','الماء',['الهواء','الشعر','الأظافر'],'نشربه كل يوم.','أكثر من نصف جسمك ماء، لذلك نشرب منه كثيراً.'],['What makes up more than half of your body weight?','Water',['Air','Hair','Nails'],'You drink it every day.','More than half of your body is water!']);
B('health','easy',['كم مرة يجب أن تنظّف أسنانك يومياً على الأقل؟','مرتين',['ولا مرة','مرة كل أسبوع','عشر مرات'],'صباحاً وقبل النوم.'],['How many times a day should you brush your teeth (at least)?','Twice',['Never','Once a week','Ten times'],'Morning and before bed.']);
B('health','easy',['أي طعام غني بالكالسيوم الذي يبني عظاماً قوية؟','الحليب',['الأرز','التفاح','الخيار'],'لونه أبيض.'],['Which food is rich in calcium for strong bones?','Milk',['Rice','Apple','Cucumber'],'It’s white.']);
B('health','easy',['أي من هذه من الخضراوات؟','البروكلي',['الموز','التفاح','العنب'],'يشبه شجرة صغيرة!'],['Which of these is a vegetable?','Broccoli',['Banana','Apple','Grapes'],'It looks like a tiny tree!']);
B('health','easy',['الجزر مفيد بشكل خاص لـ…','العينين',['الأظافر','الأذنين','لون الشعر'],'يحتوي على فيتامين أ.'],['Carrots are especially good for your…','Eyes',['Nails','Ears','Hair color'],'They contain vitamin A.']);
B('health','medium',['أي فيتامين يصنعه جسمك عند التعرض لأشعة الشمس؟','فيتامين د',['فيتامين ج','فيتامين أ','فيتامين ب12'],'مهم للعظام.'],['Which vitamin does your body make from sunlight?','Vitamin D',['Vitamin C','Vitamin A','Vitamin B12'],'Important for bones.']);
B('health','medium',['البرتقال مشهور بأنه غني بـ…','فيتامين ج',['فيتامين د','الحديد','الكافيين'],'يقوّي المناعة.'],['Oranges are famous for being rich in…','Vitamin C',['Vitamin D','Iron','Caffeine'],'It helps your immune system.']);
B('health','medium',['كم ساعة نوم يحتاجها الأطفال (6-12 سنة) تقريباً كل ليلة؟','من 9 إلى 12 ساعة',['من 4 إلى 5 ساعات','6 ساعات فقط','أكثر من 15 ساعة'],'أكثر مما يحتاجه الكبار.'],['About how much sleep do kids aged 6–12 need each night?','9–12 hours',['4–5 hours','Only 6 hours','More than 15 hours'],'More than adults need.']);
B('health','medium',['ما العنصر الغذائي الأهم لبناء العضلات؟','البروتين',['فيتامين ج','الألياف','الماء'],'تجده في البيض والسمك والبقوليات.'],['Which nutrient is most important for building muscles?','Protein',['Vitamin C','Fiber','Water'],'Eggs, fish and beans have lots of it.']);
B('health','medium',['ماذا نسمي الطاقة التي نحصل عليها من الطعام؟','السعرات الحرارية',['الكيلومترات','اللترات','الدرجات'],'نقرأها على عبوات الطعام.'],['What do we call the energy we get from food?','Calories',['Kilometres','Litres','Degrees'],'You can read it on food labels.']);
B('health','medium',['كم يجب أن تشغل الخضار والفواكه من طبقك؟','النصف',['الربع','الثلث','لا شيء'],'قاعدة «الطبق الصحي».'],['How much of your plate should be fruits and vegetables?','Half',['A quarter','A third','None'],'The “healthy plate” rule.']);
B('health','hard',['أي معدن موجود في السبانخ واللحوم يساعد الدم على نقل الأكسجين؟','الحديد',['الكالسيوم','الصوديوم','الزنك'],'نقصه يسبب فقر الدم.'],['Which mineral in spinach and red meat helps blood carry oxygen?','Iron',['Calcium','Sodium','Zinc'],'Too little causes anemia.']);
B('health','hard',['كم دقيقة على الأقل يُنصح أن يتحرك الأطفال وينشطوا يومياً؟','60 دقيقة',['10 دقائق','ساعة في الأسبوع','5 ساعات متواصلة'],'ساعة كاملة.'],['At least how long should kids be active every day?','60 minutes',['10 minutes','1 hour a week','5 hours non-stop'],'A full hour.']);
B('health','hard',['بماذا تساعد «الألياف» الموجودة في الخضار والحبوب؟','الهضم',['النظر','نمو الشعر','السمع'],'تعمل مثل مكنسة للأمعاء.'],['What does fiber (in veggies and grains) help with?','Digestion',['Eyesight','Hair growth','Hearing'],'Like a broom for your tummy.']);
B('health','hard',['أي من هذه من الحبوب الكاملة؟','الشوفان',['التفاح','الحليب','البيض'],'يؤكل غالباً في الفطور.'],['Which of these is a whole grain?','Oats',['Apple','Milk','Eggs'],'Often eaten for breakfast.']);
B('health','hard',['أي فاكهة تحتوي على أكبر نسبة من الماء؟','البطيخ',['الموز','الأفوكادو','التمر'],'اسمها يكاد يقول «ماء»!','البطيخ أكثر من 90% منه ماء.'],['Which fruit contains the most water?','Watermelon',['Banana','Avocado','Dates'],'Its name almost says it!','Watermelon is over 90% water.']);

/* ===== Hand-written number teasers (both) ===== */
B('number','easy',['كم يوماً في 3 أسابيع؟','21',['18','24','14'],'في الأسبوع 7 أيام.','3 × 7 = 21'],['How many days are in 3 weeks?','21',['18','24','14'],'A week has 7 days.','3 × 7 = 21']);
B('number','easy',['كم دقيقة في ساعة ونصف؟','90',['60','80','150'],'الساعة 60 دقيقة.','60 + 30 = 90'],['How many minutes are in an hour and a half?','90',['60','80','150'],'An hour is 60 minutes.','60 + 30 = 90']);
B('number','medium',['عائلة فيها 4 إخوة، ولكل أخ منهم أخت واحدة. كم عدد الأبناء؟','5',['8','6','4'],'هل الأخت نفسها لكل الإخوة؟','الأخت مشتركة: 4 إخوة + أخت واحدة = 5.'],['A family has 4 brothers, and each brother has one sister. How many children are there?','5',['8','6','4'],'Is it the same sister?','They share one sister: 4 + 1 = 5.']);
B('number','medium',['حبل طوله 12 متراً، نريد قصّه إلى قطع طول كل منها 3 أمتار. كم قصّة نحتاج؟','3',['4','2','12'],'عدد القطع ليس عدد القصّات!','4 قطع تحتاج 3 قصّات فقط.'],['A 12-metre rope is cut into 3-metre pieces. How many cuts are needed?','3',['4','2','12'],'Pieces aren’t the same as cuts!','4 pieces need only 3 cuts.']);
B('number','hard',['إذا اصطادت 5 قطط 5 فئران في 5 دقائق، فكم قطة نحتاج لاصطياد 100 فأر في 100 دقيقة؟','5',['100','20','25'],'كم فأراً يصطاد القط الواحد في 5 دقائق؟','كل قطة تصطاد 20 فأراً في 100 دقيقة، فنحتاج 5 قطط.'],['If 5 cats catch 5 mice in 5 minutes, how many cats catch 100 mice in 100 minutes?','5',['100','20','25'],'How many mice does one cat catch in 5 minutes?','Each cat catches 20 mice in 100 minutes, so 5 cats.']);
B('number','hard',['مضرب وكرة ثمنهما معاً 110 قطع ذهبية، والمضرب أغلى من الكرة بـ100. كم ثمن الكرة؟','5',['10','15','1'],'الإجابة السريعة ليست دائماً صحيحة!','الكرة 5 والمضرب 105 = 110.'],['A bat and a ball cost 110 gold coins together. The bat costs 100 more than the ball. How much is the ball?','5',['10','15','1'],'The quick answer isn’t always right!','Ball 5 + bat 105 = 110.']);
B('number','hard',['كم مرة يظهر الرقم 1 عند كتابة الأعداد من 1 إلى 20؟','12',['11','10','2'],'العدد 11 فيه رقمان!','1، 10، 11 (مرتان)، و12 إلى 19 = 12.'],['How many times does the digit 1 appear when writing 1 to 20?','12',['11','10','2'],'11 has two of them!','1, 10, 11 (twice), 12–19 = 12.']);

/* ===== Hand-written patterns (both) ===== */
P('easy',[['الأحد','الاثنين','الثلاثاء'],'الأربعاء',['الخميس','السبت','الجمعة'],'أيام الأسبوع بالترتيب.'],[['Sunday','Monday','Tuesday'],'Wednesday',['Thursday','Saturday','Friday'],'Days of the week in order.']);
P('medium',[['السبت','الاثنين','الأربعاء'],'الجمعة',['الخميس','الأحد','الثلاثاء'],'نتخطّى يوماً كل مرة.'],[['Saturday','Monday','Wednesday'],'Friday',['Thursday','Sunday','Tuesday'],'Skip one day each time.']);
P('medium',[['1','4','9','16'],'25',['20','24','32'],'1×1، 2×2، 3×3…','5 × 5 = 25'],[['1','4','9','16'],'25',['20','24','32'],'1×1, 2×2, 3×3…','5 × 5 = 25']);
P('hard',[['يناير','مارس','مايو'],'يوليو',['يونيو','أغسطس','أبريل'],'نتخطّى شهراً كل مرة.'],[['January','March','May'],'July',['June','August','April'],'Skip a month each time.']);
P('hard',[['2','3','5','7','11'],'13',['12','15','14'],'أعداد لا تقبل القسمة إلا على 1 وعلى نفسها.','إنها الأعداد الأولية.'],[['2','3','5','7','11'],'13',['12','15','14'],'Only divisible by 1 and themselves.','They are prime numbers.']);
P('hard',[['1','8','27','64'],'125',['100','81','128'],'1×1×1، 2×2×2…','5 × 5 × 5 = 125'],[['1','8','27','64'],'125',['100','81','128'],'1×1×1, 2×2×2…','5 × 5 × 5 = 125']);

/* ---------------- Scramble words ---------------- */
const SCRAMBLE = {
  ar:{
    easy:[['قمر','يضيء السماء ليلاً'],['شمس','تضيء النهار'],['بحر','ماء مالح واسع'],['كتاب','نقرأ فيه'],['وردة','لها رائحة جميلة'],['سمكة','تعيش في الماء'],['نجمة','تلمع في السماء'],['كنز','نبحث عنه اليوم!'],['أسد','ملك الغابة'],['موز','فاكهة صفراء'],['قلم','نكتب به'],['بيت','نسكن فيه']],
    medium:[['مدرسة','مكان التعلّم'],['فراشة','حشرة بأجنحة ملوّنة'],['سفينة','تبحر في البحر'],['طائرة','تطير بالركاب'],['حديقة','فيها أشجار وورود'],['خريطة','دليل الوصول إلى الكنز'],['قرصان','بحّار يبحث عن الكنوز'],['بوصلة','تدلّك على الاتجاه'],['مفتاح','يفتح الأبواب'],['زرافة','أطول الحيوانات'],['دلفين','حيوان بحري ذكي'],['جزيرة','أرض يحيط بها الماء']],
    hard:[['مغامرة','رحلة مليئة بالمفاجآت'],['ديناصور','زواحف عملاقة انقرضت'],['تلسكوب','نرى به النجوم البعيدة'],['بركان','جبل يقذف الحمم'],['أخطبوط','له ثمانية أذرع'],['فراولة','فاكهة حمراء صغيرة'],['كهرباء','تشغّل الأجهزة'],['عنكبوت','ينسج بيته من الخيوط'],['بطريق','طائر لا يطير يعيش في البرد'],['مستشفى','مكان علاج المرضى'],['برتقال','فاكهة اسمها لون أيضاً'],['بروكلي','خضار يشبه شجرة صغيرة']]
  },
  en:{
    easy:[['MOON','Shines at night'],['STAR','Twinkles in the sky'],['FISH','Lives in water'],['BOOK','You read it'],['LION','King of the jungle'],['TREE','Has leaves and branches'],['SHIP','Sails the sea'],['GOLD','Shiny treasure metal'],['MILK','Good for your bones'],['APPLE','A crunchy fruit']],
    medium:[['PIRATE','Sails looking for treasure'],['ISLAND','Land surrounded by water'],['ROCKET','Flies to space'],['GARDEN','Full of flowers'],['DRAGON','A fire-breathing legend'],['BANANA','A yellow fruit'],['CARROT','An orange vegetable'],['PLANET','Earth is one'],['CASTLE','Where kings live'],['JUNGLE','A thick wild forest']],
    hard:[['TREASURE','What we are hunting for!'],['ADVENTURE','A journey full of surprises'],['DINOSAUR','Giant extinct reptile'],['TELESCOPE','See faraway stars'],['VOLCANO','A mountain that erupts'],['OCTOPUS','Has eight arms'],['BROCCOLI','A green mini tree you can eat'],['COMPASS','Shows you north'],['SANDWICH','Bread with filling'],['BUTTERFLY','Colorful flying insect']]
  }
};

/* ---------------- Foods ---------------- */
const FOODS = [
  { id:'apple', e:'🍎', ok:true,  ar:'تفاحة', en:'Apple', far:'التفاح غني بالألياف ويقوّي الهضم.', fen:'Apples are packed with fiber.' },
  { id:'broccoli', e:'🥦', ok:true, ar:'بروكلي', en:'Broccoli', far:'البروكلي مليء بفيتامين ج والحديد.', fen:'Broccoli is full of vitamin C and iron.' },
  { id:'carrot', e:'🥕', ok:true, ar:'جزر', en:'Carrot', far:'الجزر غني بفيتامين أ المفيد للعينين.', fen:'Carrots have vitamin A for your eyes.' },
  { id:'banana', e:'🍌', ok:true, ar:'موز', en:'Banana', far:'الموز يعطي طاقة سريعة وصحية.', fen:'Bananas give quick, healthy energy.' },
  { id:'milk', e:'🥛', ok:true, ar:'حليب', en:'Milk', far:'الحليب يقوّي العظام والأسنان.', fen:'Milk builds strong bones and teeth.' },
  { id:'water', e:'💧', ok:true, ar:'ماء', en:'Water', far:'الماء يروي جسمك ويحسّن تركيزك.', fen:'Water keeps your brain sharp.' },
  { id:'salad', e:'🥗', ok:true, ar:'سلطة', en:'Salad', far:'السلطة مليئة بالفيتامينات والألياف.', fen:'Salad is loaded with vitamins.' },
  { id:'fish', e:'🐟', ok:true, ar:'سمك مشوي', en:'Grilled fish', far:'السمك غني بأوميغا 3 المفيد للدماغ.', fen:'Fish has omega-3 for your brain.' },
  { id:'egg', e:'🥚', ok:true, ar:'بيض', en:'Eggs', far:'البيض غني بالبروتين لبناء العضلات.', fen:'Eggs are full of protein for muscles.' },
  { id:'grapes', e:'🍇', ok:true, ar:'عنب', en:'Grapes', far:'العنب فيه مضادات أكسدة مفيدة.', fen:'Grapes have healthy antioxidants.' },
  { id:'cucumber', e:'🥒', ok:true, ar:'خيار', en:'Cucumber', far:'الخيار معظمه ماء ومنعش جداً.', fen:'Cucumbers are mostly water — so fresh!' },
  { id:'orange', e:'🍊', ok:true, ar:'برتقال', en:'Orange', far:'البرتقال يقوّي المناعة بفيتامين ج.', fen:'Oranges boost immunity with vitamin C.' },
  { id:'strawberry', e:'🍓', ok:true, ar:'فراولة', en:'Strawberries', far:'الفراولة لذيذة وغنية بفيتامين ج.', fen:'Strawberries are tasty and rich in vitamin C.' },
  { id:'watermelon', e:'🍉', ok:true, ar:'بطيخ', en:'Watermelon', far:'البطيخ يروي العطش في الصيف.', fen:'Watermelon keeps you hydrated.' },
  { id:'chicken', e:'🍗', ok:true, ar:'دجاج مشوي', en:'Grilled chicken', far:'الدجاج المشوي بروتين قليل الدهون.', fen:'Grilled chicken is lean protein.' },
  { id:'oats', e:'🥣', ok:true, ar:'شوفان', en:'Oatmeal', far:'الشوفان فطور يعطي طاقة طويلة.', fen:'Oatmeal gives long-lasting energy.' },
  { id:'tomato', e:'🍅', ok:true, ar:'طماطم', en:'Tomato', far:'الطماطم مفيدة للقلب والبشرة.', fen:'Tomatoes are good for heart and skin.' },
  { id:'avocado', e:'🥑', ok:true, ar:'أفوكادو', en:'Avocado', far:'الأفوكادو فيه دهون صحية.', fen:'Avocados have healthy fats.' },
  { id:'fries', e:'🍟', ok:false, ar:'بطاطس مقلية', en:'French fries', far:'بطاطس مقرمشة ذهبية اللون.', fen:'Crispy golden potatoes.' },
  { id:'burger', e:'🍔', ok:false, ar:'برغر', en:'Burger', far:'شطيرة مشهورة في كل العالم.', fen:'A sandwich famous all over the world.' },
  { id:'donut', e:'🍩', ok:false, ar:'دونات', en:'Donut', far:'حلوى مستديرة بفتحة في الوسط.', fen:'A round treat with a hole in the middle.' },
  { id:'candy', e:'🍬', ok:false, ar:'حلوى', en:'Candy', far:'حلوى ملوّنة بنكهات كثيرة.', fen:'Colorful sweets in lots of flavors.' },
  { id:'lollipop', e:'🍭', ok:false, ar:'مصّاصة', en:'Lollipop', far:'حلوى على عصا!', fen:'A sweet on a stick!' },
  { id:'soda', e:'🥤', ok:false, ar:'مشروب غازي', en:'Soda', far:'مشروب فوّار مليء بالفقاعات.', fen:'A fizzy, bubbly drink.' },
  { id:'chocolate', e:'🍫', ok:false, ar:'لوح شوكولاتة', en:'Chocolate bar', far:'تُصنع الشوكولاتة من حبوب الكاكاو.', fen:'Chocolate is made from cocoa beans.' },
  { id:'cake', e:'🍰', ok:false, ar:'كيك', en:'Cake', far:'الكيك نجم حفلات أعياد الميلاد.', fen:'Cake is the star of birthday parties.' },
  { id:'hotdog', e:'🌭', ok:false, ar:'هوت دوغ', en:'Hot dog', far:'شطيرة طويلة اشتهرت في الملاعب.', fen:'A long sandwich famous at stadiums.' },
  { id:'cookie', e:'🍪', ok:false, ar:'بسكويت', en:'Cookies', far:'بسكويت مخبوز ومقرمش.', fen:'Crunchy baked cookies.' },
  { id:'icecream', e:'🍦', ok:false, ar:'آيس كريم', en:'Ice cream', far:'حلوى باردة لأيام الصيف.', fen:'A cold treat for summer days.' },
  { id:'pizza', e:'🍕', ok:false, ar:'بيتزا', en:'Pizza', far:'أصل البيتزا من إيطاليا.', fen:'Pizza comes from Italy.' },
  { id:'cupcake', e:'🧁', ok:false, ar:'كب كيك', en:'Cupcake', far:'كعكة صغيرة بحجم كفّ اليد.', fen:'A little cake the size of your hand.' }
];

/* ---------------- Voice phrases ---------------- */
const PHRASES = {
  correct:{
    ar:['رائع جداً!','إجابة عبقرية!','يا سلام! إجابة صحيحة!','ضربة معلم!','هذا هو الذكاء!','ممتاز! الكنز يقترب!','برافو! أداء خرافي!','إجابة ذهبية!'],
    en:['Awesome!','You nailed it!','Genius move!','Brilliant!','The treasure is getting closer!','Unstoppable!','That’s the spirit!','Golden answer!']
  },
  wrong:{
    ar:['لا بأس، السؤال القادم لك!','قريبة جداً! لا استسلام!','كل الأبطال يخطئون أحياناً!','محاولة جميلة! المغامرة مستمرة!'],
    en:['No worries, you’ve got the next one!','So close! Keep going!','Every hero misses sometimes!','Nice try! The adventure continues!']
  },
  streak:{ ar:['سلسلة نارية!','لا أحد يوقفكم!','نار نار نار!'], en:['You’re on fire!','Nobody can stop you!','Hat trick!'] },
  healthy:{
    ar:['اختيار بطل!','جسمك يشكرك!','طاقة خارقة!','صحتين وعافية!','هذا ما يأكله الأبطال!','قوة ونشاط!'],
    en:['Hero choice!','Your body says thank you!','Power up!','Super healthy!','That’s what champions eat!','Energy boost!']
  },
  treat:{ ar:['بالهناء والشفاء!','لذيذ!','وجبة خفيفة لذيذة!','تم! ماذا بعد؟'], en:['Yum, enjoy!','Tasty!','A tasty snack!','Got it! What’s next?'] },
  next:{ ar:['التالي!','لنرَ الطبق القادم!','هيا للطبق التالي!'], en:['Next one!','Let’s see what’s next!','On to the next plate!'] },
  boost:{ ar:['قوة خارقة! مكافأة إضافية!','شحنة كاملة! أنت بطل!'], en:['Super power unlocked! Bonus!','Fully charged! You’re a hero!'] },
  levelUp:{ ar:['مستوى جديد! أنتم تكبرون!'], en:['Level up! You’re getting stronger!'] },
  win:{ ar:['مبروك! الكنز لكم!','يا لها من مغامرة! مبروك!'], en:['Congratulations! The treasure is yours!','What an adventure! Well done!'] }
};

/* ---------------- Avatars, shop, achievements ---------------- */
const AVATARS = ['🦁','🦊','🐼','🦄','🐙','🦉','🐬','🦋','🐢','🐯','🐨','🦜','🐳','🐲','🐧','🦈','🐝','🐸','🦩','🐿️'];
const COLORS = ['#ff8fab','#7bdff2','#b2f7ef','#f7d6e0','#ffd166','#a0c4ff','#caffbf','#ffadad','#bdb2ff','#fdffb6','#9bf6ff','#ffc6ff','#ffb703','#8ecae6','#90e0ef','#e9c46a','#f4a261','#c3f0ca','#d0b8ff','#ffcad4'];
const SHOP = [
  { e:'🦅', cost:40 }, { e:'🐺', cost:40 }, { e:'🤖', cost:60 }, { e:'👽', cost:60 }, { e:'🦖', cost:80 }, { e:'🚀', cost:90 },
  { e:'🧞', cost:100 }, { e:'🦸', cost:110 }, { e:'🧙', cost:120 }, { e:'🐉', cost:150 }, { e:'👑', cost:200 }, { e:'💎', cost:250 }
];
const ACHIEVEMENTS = [
  { id:'first',    icon:'🎯', ar:['أول إجابة صحيحة','أجب إجابة صحيحة لأول مرة'], en:['First win','Answer your first question correctly'] },
  { id:'streak',   icon:'🔥', ar:['سلسلة نارية','3 إجابات صحيحة متتالية'], en:['On fire','3 correct answers in a row'] },
  { id:'treasure', icon:'💎', ar:['صائد الكنوز','أكمل مغامرة كاملة'], en:['Treasure hunter','Finish a full adventure'] },
  { id:'champion', icon:'👑', ar:['بطل المغامرة','احصل على المركز الأول في اللعب الفردي'], en:['Champion','Win an individual adventure'] },
  { id:'daily',    icon:'📅', ar:['تحدي اليوم','أكمل التحدي اليومي'], en:['Daily player','Complete a daily challenge'] },
  { id:'daily3',   icon:'🗓️', ar:['ثلاثة أيام متتالية','العب التحدي اليومي 3 أيام متتالية'], en:['3-day streak','Play the daily challenge 3 days in a row'] },
  { id:'perfect',  icon:'🌟', ar:['يوم مثالي','6 من 6 في التحدي اليومي'], en:['Perfect day','Score 6/6 in the daily challenge'] },
  { id:'plate',    icon:'🥗', ar:['الطبق الذهبي','اجمع 150 نقطة في تحدي الوجبات'], en:['Golden plate','Score 150 in Snack Attack'] },
  { id:'healthy',  icon:'🥦', ar:['يوم صحي','احصل على مكافأة اليوم الصحي'], en:['Healthy day','Earn the healthy-day bonus'] },
  { id:'level5',   icon:'🧭', ar:['مستكشف خبير','صل إلى المستوى 5'], en:['Expert explorer','Reach level 5'] },
  { id:'shopper',  icon:'🛍️', ar:['أول شراء','اشترِ شخصية من المتجر'], en:['First purchase','Buy an avatar from the shop'] }
];
const TITLES = [ [1,'مستكشف مبتدئ','Rookie Explorer'], [3,'مغامر','Adventurer'], [5,'قبطان','Captain'], [8,'صائد كنوز','Treasure Hunter'], [12,'أسطورة','Legend'] ];
const DEFAULT_NAMES = ['أماني','جودي','مريم','ميمي','مرام','يمنى','ميس','سارة','رزان','جنى','رؤى','محمود','صبا','احمد'];
