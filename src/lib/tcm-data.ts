/**
 * 中医数据字典
 * 包含脉象、舌象、面色等诊断信息的详细解释
 * 数据来源：《中医诊断学》及相关国家标准
 */

// ==================== 脉象数据 ====================

/**
 * 脉象主脉类型
 */
export const PULSE_TYPES = [
  { id: 'fu', name: '浮', category: 'basic' },
  { id: 'chen', name: '沉', category: 'basic' },
  { id: 'chi', name: '迟', category: 'basic' },
  { id: 'shu', name: '数', category: 'basic' },
  { id: 'xu', name: '虚', category: 'basic' },
  { id: 'shi', name: '实', category: 'basic' },
  { id: 'hua', name: '滑', category: 'shape' },
  { id: 'se', name: '涩', category: 'shape' },
  { id: 'chang', name: '长', category: 'shape' },
  { id: 'duan', name: '短', category: 'shape' },
  { id: 'hong', name: '洪', category: 'strength' },
  { id: 'wei', name: '微', category: 'strength' },
  { id: 'jin', name: '紧', category: 'strength' },
  { id: 'huan', name: '缓', category: 'strength' },
  { id: 'xian', name: '弦', category: 'strength' },
  { id: 'ruo', name: '弱', category: 'strength' },
  { id: 'xi', name: '细', category: 'strength' },
  { id: 'fu-cang', name: '伏', category: 'strength' },
  { id: 'dong', name: '动', category: 'strength' },
  { id: 'da', name: '大', category: 'strength' },
  { id: 'ji', name: '疾', category: 'special' },
  { id: 'cu', name: '促', category: 'special' },
  { id: 'jie', name: '结', category: 'special' },
  { id: 'dai', name: '代', category: 'special' },
  { id: 'xi-shu', name: '细数', category: 'compound' },
];

/**
 * 脉象修饰符（力度/程度）
 */
export const PULSE_MODIFIERS = [
  { id: 'youli', name: '有力', description: '脉象有力，提示正气充足，邪气亢盛' },
  { id: 'wuli', name: '无力', description: '脉象无力，提示正气虚弱' },
  { id: 'wei', name: '微', description: '轻微出现该脉象特征，程度较轻' },
  { id: 'ming', name: '明显', description: '该脉象特征明显，程度较重' },
  { id: 'ji', name: '极', description: '该脉象特征极度明显，病情较重' },
];

/**
 * 脉象详细解释
 */
export const PULSE_DETAILS: Record<string, { feature: string; meaning: string; examples?: string }> = {
  fu: {
    feature: '轻取即得，重按稍减；举之有余，按之不足',
    meaning: '主表证；外感邪气侵袭肌表；亦可见于虚证（久病体虚、虚阳外越）',
    examples: '浮而有力为表实，浮而无力为表虚或虚阳外越',
  },
  chen: {
    feature: '轻取不应，重按始得；举之不足，按之有余',
    meaning: '主里证；有力为里实，无力为里虚；邪郁于里，气血阻滞；脏腑虚弱，阳虚气陷',
    examples: '沉而有力为里实，沉而无力为里虚',
  },
  chi: {
    feature: '一息不足四至（每分钟少于60次）',
    meaning: '主寒证；有力为实寒，无力为虚寒；心气虚弱等病证',
    examples: '迟而有力为实寒，迟而无力为虚寒',
  },
  shu: {
    feature: '一息五六至（每分钟90～130次）',
    meaning: '主热证；浮数为表热，沉数为里热，洪数为实热，细数为虚热；弦数多为肝火旺；亦可见于气虚证（数而无力）',
    examples: '数而有力为实热，数而无力为虚热或气虚',
  },
  xu: {
    feature: '三部九候皆无力，重按空虚',
    meaning: '主虚证；气血两虚；难以鼓动脉搏',
  },
  shi: {
    feature: '三部皆有力，形大，脉长，势强有力',
    meaning: '主实证；邪气亢盛而正气充足',
  },
  hua: {
    feature: '往来流利，应指圆滑，如盘走珠',
    meaning: '主痰饮、食滞、实热；妊娠（2～9月）；气血充盛者亦可见',
    examples: '滑而有力为痰热、食积，滑而无力为痰饮',
  },
  se: {
    feature: '形细，率迟，不畅，力律不匀，如轻刀刮竹',
    meaning: '主气滞、血瘀、精伤、血少；贫血、失血、产后、血瘀疾患',
    examples: '涩而有力为血瘀，涩而无力为精伤血少',
  },
  chang: {
    feature: '脉动超过寸关尺三部',
    meaning: '主阳证、热证、实证（气机壅盛）',
  },
  duan: {
    feature: '不满三部，或只见关部',
    meaning: '主气虚、气滞',
  },
  hong: {
    feature: '位浮，脉大，势强，来盛去衰',
    meaning: '主阳热亢盛；高热病人；心之病脉',
    examples: '洪而有力为实热亢盛',
  },
  wei: {
    feature: '脉形极细，脉势极软，似有似无',
    meaning: '主气血大虚；阳气衰微',
  },
  jin: {
    feature: '绷急有力，如绳索绞转',
    meaning: '主寒证、痛证、宿食；外感风寒、剧痛',
    examples: '紧而有力为寒实、剧痛',
  },
  huan: {
    feature: '一息四至，不快不慢',
    meaning: '主正常脉象（有胃气）；湿证；病后复元',
  },
  xian: {
    feature: '端直而长，挺然指下，如按琴弦',
    meaning: '主肝胆病证、痛证、痰饮；高血压、动脉硬化',
    examples: '弦而有力为肝火旺、痛证，弦而无力为肝血不足',
  },
  ruo: {
    feature: '位沉、形细、势软',
    meaning: '主气血不足；阳气衰弱',
  },
  xi: {
    feature: '脉道狭小，如按细线，应指明显，势软无力',
    meaning: '主气血两虚，湿证；阴虚、血虚证；慢性病患者',
    examples: '细而有力为湿证，细而无力为气血两虚',
  },
  'fu-cang': {
    feature: '推筋着骨始得',
    meaning: '主邪闭、剧烈疼痛、厥证',
  },
  dong: {
    feature: '具有滑、数、短三种特征',
    meaning: '主疼痛、惊恐',
  },
  da: {
    feature: '脉形大而无来盛去衰之势',
    meaning: '主病进（大而有力）；正虚（大而无力）',
  },
  ji: {
    feature: '一息七至以上（约130～160次/分）',
    meaning: '主阳气极盛，阴气欲竭；元气将脱；重证',
  },
  cu: {
    feature: '数、止、无定数',
    meaning: '主阳盛热实、气血痰湿停滞；实热证；脉细促而无力为虚脱之象',
  },
  jie: {
    feature: '迟、止、无定数',
    meaning: '主阴盛寒积、气血瘀滞、痰结食积；结而无力为气血虚衰',
  },
  dai: {
    feature: '缓、止、有定数，良久复来',
    meaning: '主脏气衰微；心律失常（如二联律、三联律）',
  },
  'xi-shu': {
    feature: '脉细而数，兼具细脉和数脉特征',
    meaning: '主阴虚内热、气血两虚有热',
    examples: '细数而有力为阴虚火旺，细数而无力为气血两虚',
  },
};

// ==================== 舌象数据 ====================

/**
 * 舌色类型
 */
export const TONGUE_COLORS = [
  { id: 'dan-hong', name: '淡红', description: '舌体颜色淡红润泽，白中透红，为气血调和之象' },
  { id: 'dan-bai', name: '淡白', description: '比正常舌浅淡，白色偏多红色偏少，主气血两虚、阳虚' },
  { id: 'hong', name: '红', description: '较淡红舌更红，呈鲜红色，主热证（实热、阴虚）' },
  { id: 'jiang', name: '绛', description: '深于红舌，略带暗红，主里热亢盛、阴虚火旺' },
  { id: 'zi', name: '紫', description: '全舌青紫或局部现青紫斑点，主气血运行不畅、瘀血阻滞' },
  { id: 'an', name: '暗', description: '舌色晦暗不泽，主气血瘀滞、脏腑功能减退' },
];

/**
 * 舌形类型
 */
export const TONGUE_SHAPES = [
  { id: 'pang-da', name: '胖大', description: '舌体较正常宽大，主脾肾阳虚、水湿内停' },
  { id: 'shou-bo', name: '瘦薄', description: '舌体瘦小而薄，主气血两虚、阴虚火旺' },
  { id: 'chi-hen', name: '齿痕', description: '舌边有牙齿压迫痕迹，主脾虚湿盛、水湿泛滥' },
  { id: 'lie-wen', name: '裂纹', description: '舌面出现深浅不一的裂纹，主阴液亏虚、脾虚湿侵' },
  { id: 'mang-ci', name: '芒刺', description: '舌乳头突起如刺，触之碍手，主脏腑热极、血分热盛' },
  { id: 'yu-ban', name: '瘀斑', description: '舌面有紫黑色点状或片状瘀点，主瘀血内阻' },
  { id: 'qing-jin', name: '青筋', description: '舌下青筋显露、怒张、迂曲，主气滞血瘀、寒凝血瘀、热壅血瘀等' },
];

/**
 * 舌态类型
 */
export const TONGUE_STATES = [
  { id: 'qiang-ying', name: '强硬', description: '舌体板硬强直，运动不灵，主热入心包、高热伤津、风痰阻络' },
  { id: 'wei-ruan', name: '痿软', description: '舌体软弱无力，伸缩困难，主气血俱虚、阴液亏损' },
  { id: 'chan-dong', name: '颤动', description: '舌体不自主抖动，主肝风内动' },
  { id: 'wai-xie', name: '歪斜', description: '舌体偏斜一侧，主中风或风痰阻络' },
  { id: 'tu-nong', name: '吐弄', description: '舌常伸出口外或舔唇，主心脾有热或动风先兆' },
];

/**
 * 苔色类型
 */
export const COAT_COLORS = [
  { id: 'bai', name: '白', description: '舌面附着白色苔状物，主表证、寒证、湿证' },
  { id: 'huang', name: '黄', description: '苔呈黄色，分微黄、深黄、焦黄，主里证、热证' },
  { id: 'hui', name: '灰', description: '苔色浅黑为灰，主里热极盛或里寒极盛' },
  { id: 'hei', name: '黑', description: '苔色深黑，主里热极盛或里寒极盛' },
];

/**
 * 苔质类型
 */
export const COAT_TEXTURES = [
  { id: 'bo', name: '薄', description: '透过苔可见舌质（见底苔），主邪浅、病轻、胃气尚存' },
  { id: 'hou', name: '厚', description: '不见舌质（不见底苔），主邪盛入里、痰湿食积内停' },
  { id: 'ni', name: '腻', description: '颗粒细密紧贴，刮之难去，主湿浊、痰饮、食积、湿温' },
  { id: 'fu', name: '腐', description: '颗粒疏松如豆腐渣，刮之易去，主食积胃肠、痰浊内蕴' },
  { id: 'zao', name: '燥', description: '干燥无津，甚则干裂，主热盛伤津、阴液亏虚或阳气不化津' },
  { id: 'run', name: '润', description: '干湿适中，津液充足，主津液未伤，多见于寒证初起' },
  { id: 'hua', name: '滑', description: '水分过多，扪之湿滑，主寒、湿、痰饮内聚' },
  { id: 'bo-tu', name: '剥', description: '舌苔部分或全部脱落，光滑无苔，主胃气匮乏、胃阴枯涸' },
];

/**
 * 程度修饰符
 */
export const DEGREE_MODIFIERS = [
  { id: 'qing-wei', name: '轻微', description: '程度较轻，特征不明显' },
  { id: 'ming-xian', name: '明显', description: '程度中等，特征清晰可见' },
  { id: 'jiao-zhong', name: '较重', description: '程度较重，特征明显突出' },
  { id: 'ji-zhong', name: '极重', description: '程度极重，特征非常显著' },
];

/**
 * 舌色详细解释
 */
export const TONGUE_COLOR_DETAILS: Record<string, { meaning: string; symptoms: string }> = {
  'dan-hong': {
    meaning: '气血调和之象，见于健康人或病轻者',
    symptoms: '外感初起未伤内脏；内伤病轻或转愈佳兆',
  },
  'dan-bai': {
    meaning: '主气血两虚、阳虚',
    symptoms: '舌淡白光莹瘦薄——气血两虚；淡白湿润胖嫩——阳虚水湿内停',
  },
  'hong': {
    meaning: '主热证（实热、阴虚）',
    symptoms: '舌边尖红——肝胆热盛、心火上炎；全舌红粗苔芒刺——实热新病；舌红少苔——阴虚内热',
  },
  'jiang': {
    meaning: '主里热亢盛、阴虚火旺',
    symptoms: '绛有苔——热入营血、脏腑阳热偏盛；绛少苔/裂纹——久病阴虚火旺、热病后期胃肾阴损',
  },
  'zi': {
    meaning: '主气血运行不畅、瘀血阻滞',
    symptoms: '全舌青紫——全身血行瘀滞；局部瘀斑——局部血络损伤；淡紫湿润——寒凝血瘀；紫红干枯——热毒炽盛',
  },
  'an': {
    meaning: '主气血瘀滞、脏腑功能减退，气血运行不畅',
    symptoms: '多见于慢性病、久病入络；舌暗而紫——血瘀较重；舌暗淡——气虚血瘀；舌暗而湿润——阳虚血瘀',
  },
};

/**
 * 苔色详细解释
 */
export const COAT_COLOR_DETAILS: Record<string, { meaning: string; symptoms: string }> = {
  bai: {
    meaning: '主表证、寒证、湿证',
    symptoms: '薄白润——表寒；厚白腻——痰湿食积；积粉苔——瘟疫秽浊',
  },
  huang: {
    meaning: '主里证、热证',
    symptoms: '黄越深热越重；黄腻——湿热；焦黄干裂——热极伤阴',
  },
  hui: {
    meaning: '主里热极盛或里寒极盛',
    symptoms: '灰黑而干燥——热极津枯；灰黑而润滑——阳虚阴寒极盛',
  },
  hei: {
    meaning: '主里热极盛或里寒极盛',
    symptoms: '黑而干燥——热极津枯；黑而润滑——阳虚阴寒极盛',
  },
};

/**
 * 苔质详细解释
 */
export const COAT_TEXTURE_DETAILS: Record<string, { meaning: string; symptoms: string }> = {
  bo: {
    meaning: '主邪浅、病轻、胃气尚存',
    symptoms: '正常人或表证初期',
  },
  hou: {
    meaning: '主邪盛入里、痰湿食积内停',
    symptoms: '病情较重，湿浊壅盛',
  },
  ni: {
    meaning: '主湿浊、痰饮、食积、湿温',
    symptoms: '白腻——寒湿；黄腻——湿热',
  },
  fu: {
    meaning: '主食积胃肠、痰浊内蕴、溃疡',
    symptoms: '胃气败坏之征',
  },
  zao: {
    meaning: '主热盛伤津、阴液亏虚或阳气不化津',
    symptoms: '高热、脱水、干燥综合征',
  },
  run: {
    meaning: '主津液未伤，多见于寒证初起',
    symptoms: '风寒表证、湿证早期',
  },
  hua: {
    meaning: '主寒、湿、痰饮内聚',
    symptoms: '阳虚水泛、水肿病',
  },
  'bo-tu': {
    meaning: '主胃气匮乏、胃阴枯涸、气血两虚',
    symptoms: '地图舌、镜面舌属此类',
  },
};

// ==================== 面色数据 ====================

/**
 * 面色类型（五色主病）
 */
export const FACE_COLORS = [
  { id: 'chang', name: '常色', description: '正常面色，红黄隐隐，明润含蓄' },
  { id: 'chao-hong', name: '潮红', description: '午后两颧潮红，主阴虚证' },
  { id: 'tong-hong', name: '通红', description: '满面通红，主实热证' },
  { id: 'cang-bai', name: '苍白', description: '白中带青，主外感寒邪或阳虚阴盛、阳气暴脱' },
  { id: 'wei-huang', name: '萎黄', description: '面色淡黄无华，主脾胃气虚' },
  { id: 'hui-an', name: '晦暗', description: '面色暗淡无光，主肾虚、瘀血' },
  { id: 'qing-zi', name: '青紫', description: '面色青紫，主寒证、痛证、气滞、血瘀、惊风' },
];

/**
 * 面色详细解释
 */
export const FACE_COLOR_DETAILS: Record<string, { organ: string; diseases: string; mechanism: string }> = {
  chang: {
    organ: '正常',
    diseases: '健康状态',
    mechanism: '气血调和，脏腑功能正常',
  },
  'chao-hong': {
    organ: '心',
    diseases: '阴虚证',
    mechanism: '虚火上炎，血脉扩张',
  },
  'tong-hong': {
    organ: '心',
    diseases: '实热证',
    mechanism: '邪热亢盛，血脉扩张',
  },
  'cang-bai': {
    organ: '肺',
    diseases: '虚证、寒证、失血、阳气暴脱',
    mechanism: '气血不足，阳虚寒盛，不能上荣于面',
  },
  'wei-huang': {
    organ: '脾',
    diseases: '脾胃气虚',
    mechanism: '脾失健运，气血不荣',
  },
  'hui-an': {
    organ: '肾',
    diseases: '肾虚、瘀血',
    mechanism: '肾阳虚衰，水寒不化，或瘀血内阻',
  },
  'qing-zi': {
    organ: '肝',
    diseases: '寒证、痛证、气滞、血瘀、惊风',
    mechanism: '寒凝气滞，血行不畅，筋脉拘急',
  },
};

// ==================== 神情数据 ====================

/**
 * 神情类型
 */
export const EXPRESSIONS = [
  { id: 'de-shen', name: '得神', description: '精神饱满，目光明亮，呼吸平稳，反应灵敏，正气充足' },
  { id: 'shao-shen', name: '少神', description: '精神不振，目光呆滞，反应迟钝，正气轻度受损' },
  { id: 'shi-shen', name: '失神', description: '精神萎靡，目光晦暗，反应迟钝，正气严重受损，病情危重' },
  { id: 'shen-pi', name: '神疲', description: '精神疲倦乏力，正气不足' },
  { id: 'shen-hun', name: '神昏', description: '意识不清，神志昏迷，病情危重' },
];

// ==================== 中药数据 ====================

/**
 * 中药单位类型
 */
export const HERB_UNITS = [
  { id: 'g', name: '克', description: '最常用单位' },
  { id: 'liang', name: '两', description: '约30克' },
  { id: 'qian', name: '钱', description: '约3克' },
  { id: 'ge', name: '个', description: '如大枣、桂圆' },
  { id: 'mei', name: '枚', description: '如大枣、杏仁' },
  { id: 'tiao', name: '条', description: '如蜈蚣、全蝎' },
  { id: 'pian', name: '片', description: '如生姜、附子' },
  { id: 'li', name: '粒', description: '如莲子、芡实' },
  { id: 'zhi', name: '只', description: '如蝉蜕' },
  { id: 'duo', name: '朵', description: '如菊花' },
  { id: 'shu', name: '束', description: '如薄荷' },
  { id: 'ba', name: '把', description: '如麻黄' },
];

/**
 * 需要特殊处理的中药（先煎/后下/包煎/烊化等）
 */
export const HERB_SPECIAL_HANDLING = {
  // 先煎
  decoct_first: [
    '附子', '川乌', '草乌', '麻黄', '桂枝', '干姜', '高良姜',
    '石膏', '寒水石', '滑石', '磁石', '代赭石', '龙骨', '牡蛎',
    '龟板', '鳖甲', '穿山甲', '鹿角', '熟地', '何首乌',
  ],
  // 后下
  decoct_last: [
    '薄荷', '藿香', '佩兰', '砂仁', '豆蔻', '草豆蔻', '红豆蔻',
    '肉桂', '沉香', '檀香', '降香', '细辛', '荆芥', '紫苏',
    '桑叶', '菊花', '金银花', '连翘', '蒲公英', '鱼腥草', '败酱草',
  ],
  // 包煎
  wrap_decoct: [
    '车前子', '滑石粉', '旋覆花', '辛夷', '青黛', '蒲黄', '海金沙',
    '蛤粉', '六一散', '益元散', '碧玉散',
  ],
  // 烊化
  dissolve: [
    '阿胶', '鹿角胶', '龟板胶', '鳖甲胶', '蜂蜜', '饴糖',
  ],
};

/**
 * 常用中药拼音映射表（用于搜索）
 */
export const HERB_PINYIN: Record<string, string> = {
  // 解表药
  '麻黄': 'mahuang',
  '桂枝': 'guizhi',
  '紫苏': 'zisu',
  '生姜': 'shengjiang',
  '薄荷': 'bohe',
  '荆芥': 'jingjie',
  '防风': 'fangfeng',
  '桑叶': 'sangye',
  '菊花': 'juhua',
  // 清热药
  '石膏': 'shigao',
  '知母': 'zhimu',
  '黄连': 'huanglian',
  '黄芩': 'huangqin',
  '金银花': 'jinyinhua',
  '连翘': 'lianqiao',
  '蒲公英': 'pugongying',
  '鱼腥草': 'yuxingcao',
  // 泻下药
  '大黄': 'dahuang',
  '芒硝': 'mangxiao',
  '番泻叶': 'fanxieye',
  // 祛风湿药
  '独活': 'duhuo',
  '威灵仙': 'weilingxian',
  '木瓜': 'mugua',
  '秦艽': 'qinjiao',
  // 化湿药
  '藿香': 'huoxiang',
  '佩兰': 'peilan',
  '砂仁': 'sharen',
  '豆蔻': 'doukou',
  // 利水渗湿药
  '茯苓': 'fuling',
  '薏苡仁': 'yiyiren',
  '泽泻': 'zexie',
  '车前子': 'cheqianzi',
  // 温里药
  '附子': 'fuzi',
  '干姜': 'ganjiang',
  '肉桂': 'rougui',
  '高良姜': 'gaoliangjiang',
  // 理气药
  '陈皮': 'chenpi',
  '青皮': 'qingpi',
  '枳实': 'zhishi',
  '枳壳': 'zhike',
  '木香': 'muxiang',
  '香附': 'xiangfu',
  '乌药': 'wuyao',
  '柴胡': 'chaihu',
  // 活血药
  '川芎': 'chuanxiong',
  '当归': 'danggui',
  '白芍': 'baishao',
  '赤芍': 'chishao',
  '桃仁': 'taoren',
  '红花': 'honghua',
  '丹参': 'danshen',
  '益母草': 'yimucao',
  // 止血药
  '仙鹤草': 'xianhecao',
  '白及': 'baiji',
  '三七': 'sanqi',
  '蒲黄': 'puhuang',
  // 消食药
  '山楂': 'shanzha',
  '神曲': 'shenqu',
  '麦芽': 'maiya',
  '鸡内金': 'jineijin',
  // 驱虫药
  '槟榔': 'binlang',
  '南瓜子': 'nanguazi',
  // 化痰药
  '半夏': 'banxia',
  '天南星': 'tiannanxing',
  '川贝母': 'chuanbeimu',
  '浙贝母': 'zhebeimu',
  '瓜蒌': 'gualou',
  '桔梗': 'jiegeng',
  '旋覆花': 'xuanfuhua',
  // 止咳平喘药
  '杏仁': 'xingren',
  '百部': 'baibu',
  '紫菀': 'ziwan',
  '款冬花': 'kuandonghua',
  '苏子': 'suzi',
  // 安神药
  '酸枣仁': 'suanzaoren',
  '柏子仁': 'baiziren',
  '远志': 'yuanzhi',
  '合欢皮': 'hehuanpi',
  // 平肝息风药
  '天麻': 'tianma',
  '钩藤': 'gouteng',
  '石决明': 'shijueming',
  '牡蛎': 'muli',
  '代赭石': 'daizheshi',
  // 开窍药
  '麝香': 'shexiang',
  '冰片': 'bingpian',
  '苏合香': 'suhexiang',
  // 补益药
  '人参': 'renshen',
  '西洋参': 'xiyangshen',
  '党参': 'dangshen',
  '黄芪': 'huangqi',
  '白术': 'baishu',
  '山药': 'shanyao',
  '甘草': 'gancao',
  '鹿茸': 'lurong',
  '淫羊藿': 'yinyanghuo',
  '杜仲': 'duzhong',
  '续断': 'xuduan',
  '熟地': 'shudi',
  '何首乌': 'heshouwu',
  '阿胶': 'ejiao',
  '麦冬': 'maidong',
  '天冬': 'tiandong',
  '沙参': 'shashen',
  '枸杞子': 'gouqizi',
  '女贞子': 'nuzhenzi',
  // 收涩药
  '五味子': 'wuweizi',
  '乌梅': 'wumei',
  '肉豆蔻': 'roudoukou',
  '莲子': 'lianzi',
  '芡实': 'qianshi',
  '山茱萸': 'shanzhuyu',
  // 其他
  '大枣': 'dazao',
  '葱白': 'congbai',
};

/**
 * 常用中药列表（含常用剂量参考）
 */
export const COMMON_HERBS = [
  // 解表药
  { name: '麻黄', dose: 6, unit: 'g', category: '解表', special: 'decoct_first' },
  { name: '桂枝', dose: 9, unit: 'g', category: '解表', special: 'decoct_first' },
  { name: '紫苏', dose: 9, unit: 'g', category: '解表', special: 'decoct_last' },
  { name: '生姜', dose: 3, unit: '片', category: '解表' },
  { name: '薄荷', dose: 3, unit: 'g', category: '解表', special: 'decoct_last' },
  { name: '荆芥', dose: 6, unit: 'g', category: '解表', special: 'decoct_last' },
  { name: '防风', dose: 6, unit: 'g', category: '解表' },
  { name: '桑叶', dose: 9, unit: 'g', category: '解表', special: 'decoct_last' },
  { name: '菊花', dose: 9, unit: 'g', category: '解表', special: 'decoct_last' },
  // 清热药
  { name: '石膏', dose: 30, unit: 'g', category: '清热', special: 'decoct_first' },
  { name: '知母', dose: 12, unit: 'g', category: '清热' },
  { name: '黄连', dose: 6, unit: 'g', category: '清热' },
  { name: '黄芩', dose: 9, unit: 'g', category: '清热' },
  { name: '金银花', dose: 15, unit: 'g', category: '清热', special: 'decoct_last' },
  { name: '连翘', dose: 12, unit: 'g', category: '清热', special: 'decoct_last' },
  { name: '蒲公英', dose: 15, unit: 'g', category: '清热', special: 'decoct_last' },
  { name: '鱼腥草', dose: 15, unit: 'g', category: '清热', special: 'decoct_last' },
  // 泻下药
  { name: '大黄', dose: 6, unit: 'g', category: '泻下' },
  { name: '芒硝', dose: 6, unit: 'g', category: '泻下' },
  { name: '番泻叶', dose: 3, unit: 'g', category: '泻下' },
  // 祛风湿药
  { name: '独活', dose: 9, unit: 'g', category: '祛风湿' },
  { name: '威灵仙', dose: 9, unit: 'g', category: '祛风湿' },
  { name: '木瓜', dose: 9, unit: 'g', category: '祛风湿' },
  { name: '秦艽', dose: 9, unit: 'g', category: '祛风湿' },
  // 化湿药
  { name: '藿香', dose: 9, unit: 'g', category: '化湿', special: 'decoct_last' },
  { name: '佩兰', dose: 9, unit: 'g', category: '化湿', special: 'decoct_last' },
  { name: '砂仁', dose: 6, unit: 'g', category: '化湿', special: 'decoct_last' },
  { name: '豆蔻', dose: 6, unit: 'g', category: '化湿', special: 'decoct_last' },
  // 利水渗湿药
  { name: '茯苓', dose: 15, unit: 'g', category: '利水' },
  { name: '薏苡仁', dose: 15, unit: 'g', category: '利水' },
  { name: '泽泻', dose: 9, unit: 'g', category: '利水' },
  { name: '车前子', dose: 9, unit: 'g', category: '利水', special: 'wrap_decoct' },
  // 温里药
  { name: '附子', dose: 6, unit: 'g', category: '温里', special: 'decoct_first' },
  { name: '干姜', dose: 6, unit: 'g', category: '温里', special: 'decoct_first' },
  { name: '肉桂', dose: 3, unit: 'g', category: '温里', special: 'decoct_last' },
  { name: '高良姜', dose: 6, unit: 'g', category: '温里', special: 'decoct_first' },
  // 理气药
  { name: '陈皮', dose: 9, unit: 'g', category: '理气' },
  { name: '青皮', dose: 6, unit: 'g', category: '理气' },
  { name: '枳实', dose: 6, unit: 'g', category: '理气' },
  { name: '枳壳', dose: 9, unit: 'g', category: '理气' },
  { name: '木香', dose: 6, unit: 'g', category: '理气' },
  { name: '香附', dose: 9, unit: 'g', category: '理气' },
  { name: '乌药', dose: 9, unit: 'g', category: '理气' },
  // 活血药
  { name: '川芎', dose: 6, unit: 'g', category: '活血' },
  { name: '当归', dose: 9, unit: 'g', category: '活血' },
  { name: '白芍', dose: 12, unit: 'g', category: '活血' },
  { name: '赤芍', dose: 9, unit: 'g', category: '活血' },
  { name: '桃仁', dose: 6, unit: 'g', category: '活血' },
  { name: '红花', dose: 6, unit: 'g', category: '活血' },
  { name: '丹参', dose: 12, unit: 'g', category: '活血' },
  { name: '益母草', dose: 15, unit: 'g', category: '活血' },
  // 止血药
  { name: '仙鹤草', dose: 15, unit: 'g', category: '止血' },
  { name: '白及', dose: 6, unit: 'g', category: '止血' },
  { name: '三七', dose: 3, unit: 'g', category: '止血' },
  { name: '蒲黄', dose: 6, unit: 'g', category: '止血', special: 'wrap_decoct' },
  // 消食药
  { name: '山楂', dose: 9, unit: 'g', category: '消食' },
  { name: '神曲', dose: 9, unit: 'g', category: '消食' },
  { name: '麦芽', dose: 9, unit: 'g', category: '消食' },
  { name: '鸡内金', dose: 6, unit: 'g', category: '消食' },
  // 驱虫药
  { name: '槟榔', dose: 9, unit: 'g', category: '驱虫' },
  { name: '南瓜子', dose: 30, unit: 'g', category: '驱虫' },
  // 化痰药
  { name: '半夏', dose: 9, unit: 'g', category: '化痰' },
  { name: '天南星', dose: 6, unit: 'g', category: '化痰' },
  { name: '川贝母', dose: 6, unit: 'g', category: '化痰' },
  { name: '浙贝母', dose: 9, unit: 'g', category: '化痰' },
  { name: '瓜蒌', dose: 12, unit: 'g', category: '化痰' },
  { name: '桔梗', dose: 6, unit: 'g', category: '化痰' },
  { name: '旋覆花', dose: 6, unit: 'g', category: '化痰', special: 'wrap_decoct' },
  // 止咳平喘药
  { name: '杏仁', dose: 6, unit: 'g', category: '止咳' },
  { name: '桑叶', dose: 9, unit: 'g', category: '止咳', special: 'decoct_last' },
  { name: '百部', dose: 9, unit: 'g', category: '止咳' },
  { name: '紫菀', dose: 9, unit: 'g', category: '止咳' },
  { name: '款冬花', dose: 9, unit: 'g', category: '止咳' },
  { name: '苏子', dose: 6, unit: 'g', category: '止咳' },
  { name: '麻黄', dose: 6, unit: 'g', category: '止咳', special: 'decoct_first' },
  // 安神药
  { name: '酸枣仁', dose: 12, unit: 'g', category: '安神' },
  { name: '柏子仁', dose: 9, unit: 'g', category: '安神' },
  { name: '远志', dose: 6, unit: 'g', category: '安神' },
  { name: '合欢皮', dose: 9, unit: 'g', category: '安神' },
  // 平肝息风药
  { name: '天麻', dose: 6, unit: 'g', category: '平肝' },
  { name: '钩藤', dose: 12, unit: 'g', category: '平肝' },
  { name: '石决明', dose: 15, unit: 'g', category: '平肝', special: 'decoct_first' },
  { name: '牡蛎', dose: 15, unit: 'g', category: '平肝', special: 'decoct_first' },
  { name: '代赭石', dose: 15, unit: 'g', category: '平肝', special: 'decoct_first' },
  // 开窍药
  { name: '麝香', dose: 0.1, unit: 'g', category: '开窍' },
  { name: '冰片', dose: 0.15, unit: 'g', category: '开窍' },
  { name: '苏合香', dose: 0.3, unit: 'g', category: '开窍' },
  // 补益药
  { name: '人参', dose: 3, unit: 'g', category: '补益' },
  { name: '西洋参', dose: 3, unit: 'g', category: '补益' },
  { name: '党参', dose: 12, unit: 'g', category: '补益' },
  { name: '黄芪', dose: 15, unit: 'g', category: '补益' },
  { name: '白术', dose: 12, unit: 'g', category: '补益' },
  { name: '山药', dose: 15, unit: 'g', category: '补益' },
  { name: '甘草', dose: 6, unit: 'g', category: '补益' },
  { name: '鹿茸', dose: 1, unit: 'g', category: '补益' },
  { name: '淫羊藿', dose: 9, unit: 'g', category: '补益' },
  { name: '杜仲', dose: 9, unit: 'g', category: '补益' },
  { name: '续断', dose: 9, unit: 'g', category: '补益' },
  { name: '当归', dose: 9, unit: 'g', category: '补益' },
  { name: '熟地', dose: 15, unit: 'g', category: '补益', special: 'decoct_first' },
  { name: '何首乌', dose: 12, unit: 'g', category: '补益', special: 'decoct_first' },
  { name: '白芍', dose: 12, unit: 'g', category: '补益' },
  { name: '阿胶', dose: 9, unit: 'g', category: '补益', special: 'dissolve' },
  { name: '麦冬', dose: 12, unit: 'g', category: '补益' },
  { name: '天冬', dose: 9, unit: 'g', category: '补益' },
  { name: '沙参', dose: 12, unit: 'g', category: '补益' },
  { name: '枸杞子', dose: 12, unit: 'g', category: '补益' },
  { name: '女贞子', dose: 12, unit: 'g', category: '补益' },
  // 收涩药
  { name: '五味子', dose: 6, unit: 'g', category: '收涩' },
  { name: '乌梅', dose: 6, unit: 'g', category: '收涩' },
  { name: '肉豆蔻', dose: 6, unit: 'g', category: '收涩' },
  { name: '莲子', dose: 9, unit: 'g', category: '收涩' },
  { name: '芡实', dose: 9, unit: 'g', category: '收涩' },
  { name: '山茱萸', dose: 9, unit: 'g', category: '收涩' },
  // 其他
  { name: '大枣', dose: 5, unit: '枚', category: '其他' },
  { name: '生姜', dose: 3, unit: '片', category: '其他' },
  { name: '葱白', dose: 3, unit: '根', category: '其他' },
  { name: '蜈蚣', dose: 2, unit: '条', category: '其他' },
  { name: '全蝎', dose: 3, unit: 'g', category: '其他' },
  { name: '蝉蜕', dose: 3, unit: 'g', category: '其他' },
];

/**
 * 获取中药的特殊处理类型
 */
export function getHerbSpecialHandling(herbName: string): string | null {
  if (HERB_SPECIAL_HANDLING.decoct_first.includes(herbName)) return 'decoct_first';
  if (HERB_SPECIAL_HANDLING.decoct_last.includes(herbName)) return 'decoct_last';
  if (HERB_SPECIAL_HANDLING.wrap_decoct.includes(herbName)) return 'wrap_decoct';
  if (HERB_SPECIAL_HANDLING.dissolve.includes(herbName)) return 'dissolve';
  return null;
}

/**
 * 获取特殊处理的中文描述
 */
export function getSpecialHandlingLabel(type: string): string {
  const labels: Record<string, string> = {
    decoct_first: '先煎',
    decoct_last: '后下',
    wrap_decoct: '包煎',
    dissolve: '烊化',
  };
  return labels[type] || type;
}

/**
 * 去重后的常用中药列表
 */
export const UNIQUE_COMMON_HERBS = COMMON_HERBS.reduce((acc, herb) => {
  const existing = acc.find(h => h.name === herb.name);
  if (!existing) {
    acc.push(herb);
  }
  return acc;
}, [] as typeof COMMON_HERBS);

// ==================== 辅助函数 ====================

/**
 * 获取脉象解释
 */
export function getPulseDescription(pulseId: string): string {
  const detail = PULSE_DETAILS[pulseId];
  if (!detail) return '';
  return `【特征】${detail.feature}\n【主病】${detail.meaning}${detail.examples ? `\n【辨析】${detail.examples}` : ''}`;
}

/**
 * 获取舌色解释
 */
export function getTongueColorDescription(colorId: string): string {
  const detail = TONGUE_COLOR_DETAILS[colorId];
  if (!detail) return '';
  return `【主病】${detail.meaning}\n【表现】${detail.symptoms}`;
}

/**
 * 获取苔色解释
 */
export function getCoatColorDescription(colorId: string): string {
  const detail = COAT_COLOR_DETAILS[colorId];
  if (!detail) return '';
  return `【主病】${detail.meaning}\n【表现】${detail.symptoms}`;
}

/**
 * 获取苔质解释
 */
export function getCoatTextureDescription(textureId: string): string {
  const detail = COAT_TEXTURE_DETAILS[textureId];
  if (!detail) return '';
  return `【主病】${detail.meaning}\n【表现】${detail.symptoms}`;
}

/**
 * 获取面色解释
 */
export function getFaceColorDescription(colorId: string): string {
  const detail = FACE_COLOR_DETAILS[colorId];
  if (!detail) return '';
  return `【对应脏腑】${detail.organ}\n【主病】${detail.diseases}\n【病机】${detail.mechanism}`;
}