(function (global) {
  'use strict';

  var VERSION = '1.2.0';
  var SUPPLY_TYPE = 'ac-dc-isolated';
  var TOPOLOGY = 'flyback-dcm';
  var designOptions = {
    supplyTypes: [
      { value: SUPPLY_TYPE, label: 'AC/DC ایزوله', supported: true },
      { value: 'dc-dc-isolated', label: 'DC/DC ایزوله', supported: false },
      { value: 'ac-dc-nonisolated', label: 'AC/DC غیرایزوله', supported: false }
    ],
    topologies: [
      { value: TOPOLOGY, label: 'فلای‌بک DCM', supported: true },
      { value: 'flyback-ccm', label: 'فلای‌بک CCM', supported: false },
      { value: 'forward', label: 'فوروارد', supported: false },
      { value: 'llc', label: 'رزونانسی LLC', supported: false },
      { value: 'half-bridge', label: 'نیم‌پل', supported: false },
      { value: 'full-bridge', label: 'تمام‌پل', supported: false }
    ]
  };
  function supportsConfiguration(config) {
    return !!config && config.supplyType === SUPPLY_TYPE && config.topology === TOPOLOGY;
  }
  var modules = {
    input: { title: 'ورودی و یکسوساز', english: 'INPUT & RECTIFIER', subtitle: 'از برق ورودی تا یک باس DC مطمئن.', accent: '#d8a77f', summary: ['bulkStd', 'busMin', 'lineRms'] },
    transformer: { title: 'طراحی ترانسفورماتور', english: 'TRANSFORMER DESIGN', subtitle: 'از مشخصات اولیه تا هسته، سیم‌پیچ و گپ هوایی.', accent: '#d8a77f', summary: ['lp', 'np', 'ns'] },
    switching: { title: 'سوئیچینگ و کنترل', english: 'SWITCHING & CONTROL', subtitle: 'کلید قدرت، محدودکننده جریان و حفاظت را دقیق‌تر انتخاب کنید.', accent: '#d8a77f', summary: ['vdsRating', 'senseR', 'mosLoss'] },
    output: { title: 'فیلتر و خروجی', english: 'OUTPUT & FILTER', subtitle: 'خازن، دیود و فیلتر نهایی برای یک خروجی پایدار.', accent: '#d8a77f', summary: ['coutStd', 'rippleActual', 'diodeVr'] }
  };
  var fields = [];
  function field(key, label, symbol, unit, value, min, max, group, note) {
    fields.push({ key: key, label: label, symbol: symbol, unit: unit, defaultValue: value, min: min, max: max, group: group, note: note || '' });
  }
  field('vacMin', 'حداقل ورودی AC', 'Vac_min', 'V RMS', 85, 30, 500, 'basic', 'حداقل ولتاژ مؤثر شبکه، نه مقدار پیک.');
  field('vacMax', 'حداکثر ورودی AC', 'Vac_max', 'V RMS', 265, 30, 500, 'basic', 'برای شبکه ۲۳۰ ولت با تلرانس ۱۰٪، بازه ۲۰۷ تا ۲۵۳ وارد کنید.');
  field('vo', 'ولتاژ خروجی', 'Vo', 'V', 12, 1, 120, 'basic');
  field('io', 'جریان خروجی', 'Io', 'A', 5, 0.01, 30, 'basic');
  field('eff', 'بازده تخمینی', 'eta_pct', '%', 85, 40, 98, 'electrical', 'فرض طراحی برای بودجه توان؛ نتیجه اندازه‌گیری نیست.');
  field('fs', 'فرکانس سوئیچینگ', 'fs_kHz', 'kHz', 65, 15, 500, 'electrical');
  field('duty', 'حد دیوتی طراحی', 'Dmax_pct', '%', 42, 5, 65, 'electrical');
  field('vref', 'ولتاژ بازتابی هدف', 'VR_target', 'V', 100, 10, 250, 'electrical');
  field('vd', 'افت دیود خروجی', 'Vf_out', 'V', 0.5, 0.1, 2, 'electrical');
  field('bridgeV', 'افت هر دیود پل', 'Vf_bridge', 'V', 1, 0.3, 2, 'electrical');
  field('rippleIn', 'ریپل مجاز باس ورودی', 'dV_bus', 'V pp', 20, 1, 150, 'electrical');
  field('voltMargin', 'حاشیه ولتاژ قطعات', 'V_margin', '%', 20, 10, 100, 'electrical', 'اضافه بر اسپایک برآوردشده؛ جایگزین آزمون surge نیست.');
  field('mainsHz', 'فرکانس شبکه', 'f_line', 'Hz', 50, 45, 65, 'input');
  field('pf', 'ضریب توان تخمینی', 'PF', '', 0.65, 0.3, 1, 'input', 'برای پل و خازن بدون PFC؛ باید روی سخت‌افزار اندازه‌گیری شود.');
  field('holdMs', 'زمان نگه‌داری', 't_hold', 'ms', 20, 0, 1000, 'input');
  field('holdCutoff', 'قطع تنظیم در افت باس', 'V_UV', 'V', 65, 5, 500, 'input', 'کمتر از حداقل باس؛ حین hold-up تنظیم و DCM تضمین نمی‌شود.');
  field('bulkTol', 'تلرانس خازن ورودی', 'tol_in', '%', 20, 0, 50, 'input');
  field('dischargeS', 'زمان تخلیه هدف', 't_dis', 's', 60, 1, 600, 'input');
  field('safeV', 'ولتاژ هدف تخلیه', 'V_safe', 'V', 60, 5, 100, 'input', 'صرفاً هدف محاسبه؛ تأیید ایمنی یا مجوز تماس نیست.');
  field('ae', 'سطح مؤثر هسته Ae', 'Ae', 'mm2', 80, 5, 3000, 'transformer', 'از دیتاشیت هسته واقعی؛ مقدار پیش‌فرض یک مثال است.');
  field('aw', 'مساحت پنجره Aw', 'Aw', 'mm2', 100, 5, 6000, 'transformer');
  field('le', 'طول مسیر مغناطیسی', 'le', 'mm', 65, 5, 1000, 'transformer');
  field('mur', 'تراوایی نسبی ماده', 'mu_r', '', 2000, 100, 10000, 'transformer');
  field('bmax', 'سقف تغییر شار طراحی', 'dB_design', 'T', 0.2, 0.05, 0.35, 'transformer', 'برای بررسی اشباع، شار پسماند و دمای ماده را نیز لحاظ کنید.');
  field('j', 'چگالی جریان مس', 'J', 'A/mm2', 4, 1, 8, 'transformer');
  field('ku', 'ضریب پرشدگی مجاز', 'Ku', '%', 35, 10, 60, 'transformer', 'مس خالص؛ فضای عایق، بوبین و حاشیه‌ها جداگانه بررسی شود.');
  field('strand', 'قطر هر رشته مس', 'd_strand', 'mm', 0.25, 0.05, 2, 'transformer');
  field('ltol', 'تلرانس مثبت Lp', 'tol_Lp', '%', 10, 0, 30, 'transformer');
  field('oc', 'حاشیه محدودیت جریان', 'I_limit_margin', '%', 15, 5, 60, 'transformer');
  field('spike', 'اسپایک اضافی درین', 'V_spike', 'V', 70, 5, 250, 'switching', 'برآورد؛ ولتاژ واقعی با پروب مناسب اندازه‌گیری شود.');
  field('rds', 'مقاومت MOSFET در دمای کار', 'Rds_hot', 'ohm', 0.45, 0.005, 15, 'switching');
  field('tr', 'زمان هم‌پوشانی روشن‌شدن', 'tr', 'ns', 20, 0, 500, 'switching', 'در DCM ایدئال جریان روشن‌شدن صفر است؛ این مدل محافظه‌کارانه است.');
  field('tf', 'زمان هم‌پوشانی خاموش‌شدن', 'tf', 'ns', 40, 1, 500, 'switching');
  field('coss', 'Coss معادل انرژی', 'Coss_eq', 'pF', 60, 1, 3000, 'switching', 'غیرخطی است؛ برای دقت بیشتر از Eoss دیتاشیت استفاده کنید.');
  field('qg', 'بار کل گیت', 'Qg', 'nC', 20, 1, 500, 'switching');
  field('vg', 'ولتاژ درایو گیت', 'Vg', 'V', 12, 4, 20, 'switching');
  field('cs', 'آستانه حس جریان', 'Vcs', 'V', 0.8, 0.05, 2, 'switching');
  field('leak', 'اندوکتانس نشتی نسبت به Lp', 'leak_pct', '%', 2, 0.1, 15, 'switching');
  field('clampRipple', 'ریپل خازن اسنابر', 'clamp_ripple', '%', 10, 1, 30, 'switching');
  field('ta', 'دمای محیط', 'Ta', 'C', 45, -20, 100, 'switching');
  field('tj', 'سقف دمای پیوند طراحی', 'Tj_limit', 'C', 125, 60, 175, 'switching');
  field('rjc', 'مقاومت حرارتی پیوند تا بدنه', 'Rth_jc', 'C/W', 2, 0.1, 30, 'switching');
  field('rcs', 'مقاومت حرارتی رابط', 'Rth_cs', 'C/W', 0.5, 0, 10, 'switching');
  field('fbRef', 'مرجع فیدبک', 'Vfb', 'V', 2.495, 0.5, 5, 'switching');
  field('fbBottom', 'مقاومت پایین تقسیم‌کننده', 'Rfb_bottom', 'kohm', 10, 1, 100, 'switching');
  field('rippleOut', 'ریپل مجاز خروجی', 'ripple_out', '%', 1, 0.05, 10, 'output');
  field('capShare', 'سهم خازن از بودجه ریپل', 'cap_share', '%', 50, 10, 90, 'output');
  field('esr', 'ESR مجموع خازن‌های خروجی', 'ESR', 'mohm', 2, 0.1, 500, 'output', 'مقدار مجموع در فرکانس و دمای کاری.');
  field('outTol', 'کاهش ظرفیت مؤثر خروجی', 'tol_out', '%', 20, 0, 80, 'output', 'شامل تلرانس، بایاس DC و دما.');
  field('stepLoad', 'پله بار نسبت به جریان نامی', 'step_load', '%', 50, 1, 100, 'output');
  field('responseUs', 'زمان پاسخ فرضی حلقه', 't_response', 'us', 200, 10, 10000, 'output', 'برای تخمین افت گذرا؛ نتیجه طراحی جبران‌ساز نیست.');
  field('droop', 'افت مجاز در پله بار', 'droop', '%', 3, 0.2, 20, 'output');
  field('postFreq', 'فرکانس فیلتر LC اختیاری', 'f_LC', 'kHz', 3, 0.1, 100, 'output');
  field('postCap', 'خازن فیلتر LC اختیاری', 'C_LC', 'uF', 47, 1, 10000, 'output');
  field('postRipple', 'ریپل جریان سلف اختیاری', 'ripple_L', '%', 20, 1, 100, 'output');

  var defaults = {};
  fields.forEach(function (item) { defaults[item.key] = item.defaultValue; });
  var series = [];
  for (var decade = -2; decade <= 8; decade++) {
    [1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2].forEach(function (base) { series.push(Number((base * Math.pow(10, decade)).toPrecision(12))); });
  }
  function preferred(value) { return series.find(function (n) { return n >= value; }) || value; }
  function op(name) { return [name].concat(Array.prototype.slice.call(arguments, 1)); }
  var mul = function () { return op.apply(null, ['*'].concat(Array.prototype.slice.call(arguments))); };
  var add = function () { return op.apply(null, ['+'].concat(Array.prototype.slice.call(arguments))); };
  var sub = function (a, b) { return op('-', a, b); };
  var div = function (a, b) { return op('/', a, b); };
  var sq = function (a) { return op('^', a, 2); };
  var sqrt = function (a) { return op('SQRT', a); };
  var ceil = function (a) { return op('ROUNDUP', a, 0); };
  var pct = function (a) { return div(a, 100); };
  var margin = function (a) { return add(1, pct(a)); };
  var remain = function (a) { return sub(1, pct(a)); };
  var rows = [];
  function row(module, group, key, label, unit, expr, note) { rows.push({ module: module, group: group, key: key, label: label, unit: unit, expr: expr, note: note || '' }); }

  row('common', 'مشخصات و توان', 'pout', 'توان خروجی', 'W', mul('vo', 'io'));
  row('common', 'مشخصات و توان', 'pin', 'بودجه توان ورودی', 'W', div('pout', pct('eff')), 'بازده فرض‌شده؛ اندازه‌گیری نیست.');
  row('common', 'مشخصات و توان', 'lossBudget', 'بودجه کل تلفات', 'W', sub('pin', 'pout'));
  row('common', 'مشخصات و توان', 'psec', 'توان انتقالی به ثانویه و دیود', 'W', mul(add('vo', 'vd'), 'io'), 'مدل ایدئال مغناطیسی؛ تلفات باقیمانده در بودجه ورودی رزرو می‌شود.');
  row('common', 'باس و زمان‌بندی', 'rectMin', 'پیک باس در کمترین ورودی', 'V', sub(mul(sqrt(2), 'vacMin'), mul(2, 'bridgeV')));
  row('common', 'باس و زمان‌بندی', 'rectMax', 'پیک باس در بیشترین ورودی', 'V', sub(mul(sqrt(2), 'vacMax'), mul(2, 'bridgeV')));
  row('common', 'باس و زمان‌بندی', 'busMin', 'کف باس مبنای طراحی', 'V', sub('rectMin', 'rippleIn'));
  row('common', 'باس و زمان‌بندی', 'fHz', 'فرکانس در دستگاه SI', 'Hz', mul('fs', 1000));
  row('common', 'باس و زمان‌بندی', 'period', 'دوره سوئیچینگ', 'us', div(1e6, 'fHz'));

  row('input', 'پل و جریان شبکه', 'lineRms', 'جریان مؤثر شبکه، تخمینی', 'A', div('pin', mul('vacMin', 'pf')), 'PF ورودی تخمینی است؛ شکل جریان شارژ خازن مدل نشده.');
  row('input', 'پل و جریان شبکه', 'bridgeLoss', 'تلفات تقریبی پل دیود', 'W', div(mul(2, 'bridgeV', 'pin'), 'busMin'));
  row('input', 'پل و جریان شبکه', 'bridgeVr', 'حداقل ریتینگ ولتاژ معکوس پل', 'V', mul('rectMax', margin('voltMargin')));
  row('input', 'پل و جریان شبکه', 'fuseBase', 'مبنای اولیه جریان فیوز', 'A', mul('lineRms', 1.6), 'انتخاب نهایی نوع کندکار و I2t با جریان هجومی و هماهنگی حفاظت.');
  row('input', 'خازن بالک', 'bulkRipple', 'ظرفیت از ریپل نیم‌دوره', 'uF', div(mul('pin', 1e6), mul('mainsHz', sub(sq('rectMin'), sq('busMin')))), 'تخلیه در کل نیم‌دوره، برآورد محافظه‌کارانه بدون زاویه هدایت پل.');
  row('input', 'خازن بالک', 'bulkHold', 'ظرفیت از انرژی نگه‌داری', 'uF', div(mul(2, 'pin', 'holdMs', 1000), sub(sq('busMin'), sq('holdCutoff'))), 'شروع قطع برق از کف باس؛ قابلیت تنظیم زیر busMin جداگانه بررسی شود.');
  row('input', 'خازن بالک', 'bulkRequired', 'ظرفیت نامی با لحاظ تلرانس', 'uF', div(op('MAX', 'bulkRipple', 'bulkHold'), remain('bulkTol')));
  row('input', 'خازن بالک', 'bulkStd', 'ظرفیت E12 رو به بالا', 'uF', op('PREF', 'bulkRequired'), 'ظرفیت پیشنهادی؛ ریتینگ ریپل جریان و عمر خازن باید بررسی شود.');
  row('input', 'خازن بالک', 'bulkEff', 'کمترین ظرفیت مؤثر', 'uF', mul('bulkStd', remain('bulkTol')));
  row('input', 'خازن بالک', 'bulkValley', 'کف باس با ظرفیت پیشنهادی', 'V', sqrt(op('MAX', 0, sub(sq('rectMin'), div(mul('pin', 1e6), mul('mainsHz', 'bulkEff'))))));
  row('input', 'خازن بالک', 'bulkRating', 'حداقل ریتینگ ولتاژ خازن', 'V', mul('rectMax', margin('voltMargin')));
  row('input', 'خازن بالک', 'holdActual', 'نگه‌داری انرژی محاسبه‌شده', 'ms', div(mul('bulkEff', 0.001, sub(sq('busMin'), sq('holdCutoff'))), mul(2, 'pin')));
  row('input', 'تخلیه و انرژی', 'storedEnergy', 'انرژی ذخیره‌شده در بدترین تلرانس', 'J', mul(0.5, 'bulkStd', 1e-6, margin('bulkTol'), sq('rectMax')), 'برق شهر و خازن بالک حتی پس از قطع برق خطرناک‌اند.');
  row('input', 'تخلیه و انرژی', 'bleedR', 'حداکثر مقاومت تخلیه', 'kohm', div(mul('dischargeS', 1000), mul('bulkStd', margin('bulkTol'), op('LN', div('rectMax', 'safeV')))), 'مدل RC با مقاومت ثابت؛ تحمل ولتاژ و خطای مقاومت جداگانه لحاظ شود.');
  row('input', 'تخلیه و انرژی', 'bleedW', 'اتلاف اولیه مقاومت تخلیه', 'W', div(sq('rectMax'), mul('bleedR', 1000)));

  var L = mul('lp', 1e-6);
  var A = mul('ae', 1e-6);
  row('transformer', 'اندوکتانس و جریان', 'lp', 'اندوکتانس مغناطیس‌کننده اولیه', 'uH', div(mul(sq('busMin'), sq(pct('duty')), 1e6), mul(2, 'pin', 'fHz')), 'از بودجه Pin و حد دیوتی؛ بازه مجاز ساخت Lp باید اندازه‌گیری شود.');
  row('transformer', 'اندوکتانس و جریان', 'ipDesign', 'پیک اولیه در بودجه توان', 'A', div(mul(2, 'pin'), mul('busMin', pct('duty'))));
  row('transformer', 'اندوکتانس و جریان', 'ipLimit', 'آستانه هدف محدودیت جریان', 'A', mul('ipDesign', margin('oc')), 'تأخیر کنترلر و خطای حس جریان در این آستانه لحاظ نشده.');
  row('transformer', 'اندوکتانس و جریان', 'ipOp', 'پیک اولیه در بار نامی مدل', 'A', sqrt(div(mul(2, 'psec'), mul(L, 'fHz'))), 'از توان ثانویه شامل دیود؛ با پیک طراحی اشتباه نشود.');
  row('transformer', 'سیم‌پیچ و شار', 'np', 'تعداد دور اولیه، گرد به بالا', 'turn', ceil(div(mul(L, margin('ltol'), 'ipLimit'), mul('bmax', A))), 'در حد جریان و بیشترین Lp؛ تلفات هسته هنوز باید از دیتاشیت بررسی شود.');
  row('transformer', 'سیم‌پیچ و شار', 'ns', 'تعداد دور ثانویه، گرد به بالا', 'turn', ceil(div(mul('np', add('vo', 'vd')), 'vref')));
  row('transformer', 'سیم‌پیچ و شار', 'ratio', 'نسبت دور واقعی Np/Ns', '', div('np', 'ns'));
  row('transformer', 'سیم‌پیچ و شار', 'vrActual', 'ولتاژ بازتابی پس از گردکردن دور', 'V', mul('ratio', add('vo', 'vd')));
  row('transformer', 'زمان‌بندی واقعی', 'dOn', 'دیوتی روشن در ورودی کمینه', '%', div(mul(100, L, 'ipOp', 'fHz'), 'busMin'));
  row('transformer', 'زمان‌بندی واقعی', 'dHigh', 'دیوتی روشن در ورودی بیشینه', '%', div(mul(100, L, 'ipOp', 'fHz'), 'rectMax'));
  row('transformer', 'زمان‌بندی واقعی', 'dDemag', 'سهم زمان تخلیه ثانویه', '%', div(mul(100, L, 'ipOp', 'fHz'), 'vrActual'));
  row('transformer', 'زمان‌بندی واقعی', 'idle', 'حاشیه بی‌جریانی در بار نامی', '%', sub(sub(100, 'dOn'), 'dDemag'), 'باید مثبت باشد؛ صفر مرز BCM و منفی خارج از مدل DCM است.');
  row('transformer', 'زمان‌بندی واقعی', 'designIdle', 'حاشیه DCM در بودجه توان', '%', sub(sub(100, 'duty'), div(mul(100, L, 'ipDesign', 'fHz'), 'vrActual')));
  row('transformer', 'زمان‌بندی واقعی', 'designIdleWorst', 'حاشیه DCM با بیشترین Lp', '%', sub(100, mul(sub(100, 'designIdle'), sqrt(margin('ltol')))), 'در توان ثابت، زمان هدایت و تخلیه با ریشه Lp تغییر می‌کنند.');
  row('transformer', 'زمان‌بندی واقعی', 'ton', 'زمان روشن اولیه', 'us', mul(pct('dOn'), 'period'));
  row('transformer', 'زمان‌بندی واقعی', 'tdemag', 'زمان تخلیه مغناطیسی', 'us', mul(pct('dDemag'), 'period'));
  row('transformer', 'زمان‌بندی واقعی', 'tidle', 'زمان بی‌جریانی', 'us', mul(pct('idle'), 'period'));
  row('transformer', 'جریان مؤثر و هسته', 'ipRms', 'RMS اولیه در بار نامی', 'A', mul('ipOp', sqrt(div('dOn', 300))));
  row('transformer', 'جریان مؤثر و هسته', 'ipRmsDesign', 'RMS اولیه در بودجه توان', 'A', mul('ipDesign', sqrt(div('duty', 300))));
  row('transformer', 'جریان مؤثر و هسته', 'isPeak', 'پیک ثانویه در بار نامی', 'A', mul('ipOp', 'ratio'));
  row('transformer', 'جریان مؤثر و هسته', 'isRms', 'RMS ثانویه در بار نامی', 'A', mul('isPeak', sqrt(div('dDemag', 300))));
  row('transformer', 'جریان مؤثر و هسته', 'bNormal', 'تغییر شار در بار نامی', 'T', div(mul(L, 'ipOp'), mul('np', A)));
  row('transformer', 'جریان مؤثر و هسته', 'bLimit', 'تغییر شار در حد جریان و Lp بیشینه', 'T', div(mul(L, margin('ltol'), 'ipLimit'), mul('np', A)), 'برای Bpeak واقعی، شار پسماند و منحنی ماده در دما را هم لحاظ کنید.');
  row('transformer', 'جریان مؤثر و هسته', 'al', 'AL هدف پس از گپ', 'nH/turn2', div(mul('lp', 1000), sq('np')));
  row('transformer', 'جریان مؤثر و هسته', 'gap', 'طول کل گپ معادل، تخمینی', 'mm', op('MAX', 0, sub(div(mul(4e-7, Math.PI, sq('np'), A, 1000), L), div('le', 'mur'))), 'بدون fringing؛ گپ نهایی با اندازه‌گیری Lp و نمونه‌سازی تعیین می‌شود.');
  row('transformer', 'سیم و پرشدگی', 'skin', 'عمق نفوذ مس در ۲۰ درجه', 'mm', mul(1000, sqrt(div(1.724e-8, mul(Math.PI, 'fHz', 4e-7, Math.PI)))));
  row('transformer', 'سیم و پرشدگی', 'wireAreaP', 'سطح مس موردنیاز اولیه', 'mm2', div('ipRmsDesign', 'j'));
  row('transformer', 'سیم و پرشدگی', 'wireAreaS', 'سطح مس ثانویه با ذخیره توان', 'mm2', div(mul('ipDesign', 'ratio', sqrt(div(mul(L, 'ipDesign', 'fHz'), mul(3, 'vrActual')))), 'j'));
  row('transformer', 'سیم و پرشدگی', 'strandsP', 'تعداد رشته موازی اولیه', '', ceil(div('wireAreaP', div(mul(Math.PI, sq('strand')), 4))));
  row('transformer', 'سیم و پرشدگی', 'strandsS', 'تعداد رشته موازی ثانویه', '', ceil(div('wireAreaS', div(mul(Math.PI, sq('strand')), 4))));
  row('transformer', 'سیم و پرشدگی', 'fill', 'پرشدگی مس با رشته‌های گرد شده', '%', div(mul(100, div(mul(Math.PI, sq('strand')), 4), add(mul('np', 'strandsP'), mul('ns', 'strandsS'))), 'aw'), 'عایق بین‌لایه، حاشیه ایمنی و bobbin در این نسبت مسی نیست.');

  row('output', 'بار و دیود', 'loadR', 'مقاومت بار معادل', 'ohm', div('vo', 'io'));
  row('output', 'بار و دیود', 'secondaryMean', 'میانگین جریان ثانویه مدل', 'A', mul('isPeak', div('dDemag', 200)), 'باید با Io برابر باشد؛ کنترل توازن بار.');
  row('output', 'بار و دیود', 'diodeVr', 'ریتینگ معکوس دیود با حاشیه', 'V', mul(add('vo', div('rectMax', 'ratio')), margin('voltMargin')), 'رینگینگ ثانویه باید اندازه‌گیری و به حاشیه اضافه شود.');
  row('output', 'بار و دیود', 'diodeAvg', 'جریان متوسط ریتینگ پیشنهادی', 'A', mul('io', 1.5), 'انتخاب بسته و هیت‌سینک از منحنی حرارتی سازنده.');
  row('output', 'بار و دیود', 'diodePeak', 'تحمل پیک پیشنهادی دیود', 'A', mul('ipLimit', 'ratio', 1.25));
  row('output', 'بار و دیود', 'diodeW', 'تلفات هدایت دیود', 'W', mul('io', 'vd'));
  row('output', 'خازن خروجی', 'capRms', 'جریان RMS خازن خروجی', 'A', sqrt(op('MAX', 0, sub(sq('isRms'), sq('io')))), 'برای شکل‌موج مثلثی DCM در بار نامی.');
  row('output', 'خازن خروجی', 'rippleTarget', 'بودجه ریپل خروجی', 'mV pp', mul('vo', 'rippleOut', 10));
  row('output', 'خازن خروجی', 'coutRipple', 'ظرفیت مؤثر از بار مثلثی', 'uF', div(mul('io', sq(sub(1, div('dDemag', 200))), 1e9), mul('fHz', 'rippleTarget', pct('capShare'))), 'Qpp = Io/fs × (1 - D2/2)^2؛ بودجه ESR جداگانه.');
  row('output', 'خازن خروجی', 'stepI', 'دامنه پله بار', 'A', mul('io', pct('stepLoad')));
  row('output', 'خازن خروجی', 'coutTransient', 'ظرفیت مؤثر از پله بار', 'uF', div(mul('stepI', 'responseUs'), sub(mul('vo', pct('droop')), mul('stepI', 'esr', 0.001))), 'تخلیه محافظه‌کارانه با جریان ثابت طی زمان پاسخ فرضی.');
  row('output', 'خازن خروجی', 'coutRequired', 'ظرفیت نامی موردنیاز', 'uF', div(op('MAX', 'coutRipple', 'coutTransient'), remain('outTol')));
  row('output', 'خازن خروجی', 'coutStd', 'ظرفیت نامی پیشنهادی E12', 'uF', op('PREF', 'coutRequired'));
  row('output', 'خازن خروجی', 'coutEff', 'ظرفیت مؤثر بدترین حالت', 'uF', mul('coutStd', remain('outTol')));
  row('output', 'خازن خروجی', 'esrMax', 'حد ESR از بودجه ریپل', 'mohm', div(mul('rippleTarget', remain('capShare')), 'isPeak'));
  row('output', 'خازن خروجی', 'rippleCap', 'ریپل خازنی برآوردشده', 'mV pp', div(mul('io', sq(sub(1, div('dDemag', 200))), 1e9), mul('fHz', 'coutEff')));
  row('output', 'خازن خروجی', 'rippleEsr', 'کران ریپل ناشی از ESR', 'mV pp', mul('isPeak', 'esr'));
  row('output', 'خازن خروجی', 'rippleActual', 'کران مجموع ریپل خروجی', 'mV pp', add('rippleCap', 'rippleEsr'), 'جمع محافظه‌کارانه مؤلفه‌ها؛ ESL و نویز سوئیچینگ محاسبه نشده.');
  row('output', 'خازن خروجی', 'transientDrop', 'افت برآوردی پله بار', 'mV', mul(1000, 'stepI', add(div('responseUs', 'coutEff'), mul('esr', 0.001))));
  row('output', 'خازن خروجی', 'coutRating', 'حداقل ریتینگ ولتاژ خازن خروجی', 'V', mul('vo', margin('voltMargin')));
  row('output', 'فیلتر LC اختیاری', 'postL', 'سلف پیشنهادی پس‌فیلتر', 'uH', div(1e6, mul(sq(mul(2, Math.PI, 'postFreq', 1000)), 'postCap', 1e-6)), 'فلای‌بک به سلف ذخیره انرژی خروجی نیاز ندارد؛ این فقط پس‌فیلتر اختیاری است.');
  row('output', 'فیلتر LC اختیاری', 'postIsat', 'تحمل اشباع هدف پس‌فیلتر', 'A', mul('io', add(1, div('postRipple', 200)), 1.25));
  row('output', 'فیلتر LC اختیاری', 'postZ', 'امپدانس مشخصه پس‌فیلتر', 'ohm', sqrt(div('postL', 'postCap')), 'این مقدار به‌تنهایی مقدار مقاومت دمپینگ نیست؛ رزونانس بررسی شود.');

  row('switching', 'تنش و حس جریان', 'vdsPeak', 'تنش برآوردی درین', 'V', add('rectMax', 'vrActual', 'spike'));
  row('switching', 'تنش و حس جریان', 'vdsRating', 'حداقل ریتینگ VDS پیشنهادی', 'V', mul('vdsPeak', margin('voltMargin')));
  row('switching', 'تنش و حس جریان', 'mosIpk', 'تحمل پیک جریان MOSFET', 'A', mul('ipLimit', 1.25), 'SOA، پالس، دما و تأخیر کنترلر باید تطبیق داده شوند.');
  row('switching', 'تنش و حس جریان', 'senseR', 'مقاومت حس جریان', 'ohm', div('cs', 'ipLimit'));
  row('switching', 'تنش و حس جریان', 'senseW', 'تلفات مقاومت حس در بار نامی', 'W', mul(sq('ipRms'), 'senseR'));
  row('switching', 'تلفات مرتبه اول', 'mosCond', 'تلفات هدایت MOSFET', 'W', mul(sq('ipRms'), 'rds'));
  row('switching', 'تلفات مرتبه اول', 'mosSwitch', 'تلفات هم‌پوشانی محافظه‌کارانه', 'W', mul(0.5, 'vdsPeak', 'ipOp', add('tr', 'tf'), 1e-9, 'fHz'), 'کران مرتبه اول؛ روشن‌شدن واقعی DCM و valley switching متفاوت است.');
  row('switching', 'تلفات مرتبه اول', 'mosCoss', 'اتلاف Coss با فرض hard switching', 'W', mul(0.5, 'coss', 1e-12, sq('vdsPeak'), 'fHz'));
  row('switching', 'تلفات مرتبه اول', 'mosLoss', 'جمع تلفات برآوردی MOSFET', 'W', add('mosCond', 'mosSwitch', 'mosCoss'));
  row('switching', 'تلفات مرتبه اول', 'driveW', 'توان درایو گیت', 'W', mul('qg', 1e-9, 'vg', 'fHz'), 'عمدتاً در درایور و مقاومت گیت؛ در تلفات هیت‌سینک MOSFET جمع نشده.');
  row('switching', 'اسنابر RCD', 'leakL', 'اندوکتانس نشتی فرض‌شده', 'uH', mul('lp', pct('leak')));
  row('switching', 'اسنابر RCD', 'clampV', 'ولتاژ خازن کلمپ نسبت به باس', 'V', add('vrActual', 'spike'));
  row('switching', 'اسنابر RCD', 'snubW', 'تلفات اسنابر در حد جریان', 'W', div(mul(0.5, 'leakL', 1e-6, sq('ipLimit'), 'fHz', 'clampV'), sub('clampV', 'vrActual')), 'مدل RCD با ولتاژ تقریباً ثابت؛ در آستانه جریان، نه بار نامی.');
  row('switching', 'اسنابر RCD', 'snubR', 'مقاومت اولیه اسنابر', 'kohm', div(sq('clampV'), mul('snubW', 1000)));
  row('switching', 'اسنابر RCD', 'clampNom', 'ولتاژ کلمپ در بار نامی مدل', 'V', div(add('vrActual', sqrt(add(sq('vrActual'), mul(2, 'snubR', 1000, 'leakL', 1e-6, sq('ipOp'), 'fHz')))), 2), 'حل موازنه انرژی RCD با مقاومت انتخابی؛ تقریب حالت پایا.');
  row('switching', 'اسنابر RCD', 'snubNomW', 'تلفات RCD در بار نامی مدل', 'W', div(sq('clampNom'), mul('snubR', 1000)));
  row('switching', 'اسنابر RCD', 'snubC', 'حداقل خازن اسنابر', 'nF', div(1e9, mul('snubR', 1000, 'fHz', pct('clampRipple'))));
  row('switching', 'اسنابر RCD', 'snubRating', 'توان مقاومت اسنابر با حاشیه', 'W', mul('snubW', 2));
  row('switching', 'حرارت و فیدبک', 'sinkTheta', 'حداکثر مقاومت حرارتی هیت‌سینک', 'C/W', sub(sub(div(sub('tj', 'ta'), 'mosLoss'), 'rjc'), 'rcs'), 'مدل حرارتی پایا؛ مقدار منفی یعنی مسیر حرارتی انتخابی کافی نیست.');
  row('switching', 'حرارت و فیدبک', 'fbTop', 'مقاومت بالای تقسیم‌کننده فیدبک', 'kohm', mul('fbBottom', sub(div('vo', 'fbRef'), 1)), 'فقط تقسیم‌کننده؛ جریان بایاس TL431/اپتو و جبران‌ساز طراحی نشده.');
  row('switching', 'حرارت و فیدبک', 'fcLimit', 'حد شروع محافظه‌کارانه پهنای باند', 'Hz', op('MIN', div('fHz', 20), mul('postFreq', 200)), 'fs/20 و fLC/5 برای پس‌فیلتر فرض‌شده؛ پایداری باید با Bode/FRA تأیید شود.');
  row('common', 'کنترل بودجه توان', 'knownLoss', 'جمع محافظه‌کارانه اقلام تلفات', 'W', add('mosLoss', 'diodeW', 'bridgeLoss', 'senseW', 'driveW', 'snubNomW', 'bleedW'), 'کنترل یکپارچه کل سیستم، نه بخشی از برگه‌های مستقل؛ بدون تلفات هسته و مس.');

  function referencesOf(expr) {
    if (typeof expr === 'string') return [expr];
    if (!Array.isArray(expr)) return [];
    return expr.slice(1).reduce(function (all, item) { return all.concat(referencesOf(item)); }, []);
  }

  var scopeCache = {};
  function scope(moduleId) {
    if (!modules[moduleId]) return { id: 'all', fields: fields, rows: rows, displayRows: rows, supportRows: [] };
    if (scopeCache[moduleId]) return scopeCache[moduleId];
    var commonKeys = moduleId === 'input'
      ? ['pout', 'pin', 'lossBudget', 'rectMin', 'rectMax', 'busMin']
      : ['pout', 'pin', 'lossBudget', 'psec', 'rectMin', 'rectMax', 'busMin', 'fHz', 'period'];
    var displayRows = rows.filter(function (r) { return r.module === moduleId || commonKeys.indexOf(r.key) !== -1; });
    var required = {}, byKey = {};
    rows.forEach(function (r) { byKey[r.key] = r; });
    function include(key) {
      if (required[key]) return;
      required[key] = true;
      if (byKey[key]) referencesOf(byKey[key].expr).forEach(include);
    }
    displayRows.forEach(function (r) { include(r.key); });
    // Only magnetic stages depend on DCM timing. Rectifier design is independent of the other modules.
    if (moduleId !== 'input') ['idle', 'designIdle', 'designIdleWorst', 'bLimit'].forEach(include);
    var displayKeys = displayRows.map(function (r) { return r.key; });
    scopeCache[moduleId] = {
      id: moduleId,
      fields: fields.filter(function (f) { return required[f.key]; }),
      rows: rows.filter(function (r) { return required[r.key]; }),
      displayRows: displayRows,
      supportRows: rows.filter(function (r) { return required[r.key] && displayKeys.indexOf(r.key) === -1; })
    };
    return scopeCache[moduleId];
  }

  function evaluate(expr, values) {
    if (typeof expr === 'number') return expr;
    if (typeof expr === 'string') {
      if (!Number.isFinite(values[expr])) throw new Error('Invalid reference: ' + expr);
      return values[expr];
    }
    var args = expr.slice(1).map(function (item) { return evaluate(item, values); });
    switch (expr[0]) {
      case '+': return args.reduce(function (a, b) { return a + b; }, 0);
      case '*': return args.reduce(function (a, b) { return a * b; }, 1);
      case '-': return args[0] - args[1];
      case '/': if (args[1] === 0) throw new Error('Division by zero'); return args[0] / args[1];
      case '^': return Math.pow(args[0], args[1]);
      case 'SQRT': return Math.sqrt(args[0]);
      case 'LN': return Math.log(args[0]);
      case 'ROUNDUP': return Math.ceil(args[0]);
      case 'MAX': return Math.max.apply(null, args);
      case 'MIN': return Math.min.apply(null, args);
      case 'PREF': return preferred(args[0]);
      default: throw new Error('Unknown expression');
    }
  }
  function formula(expr, references, excel) {
    if (typeof expr === 'number') return String(expr);
    if (typeof expr === 'string') return references[expr] || expr;
    var args = expr.slice(1).map(function (item) { return formula(item, references, excel); });
    if (['+', '-', '*', '/', '^'].indexOf(expr[0]) !== -1) return '(' + args.join(expr[0]) + ')';
    if (expr[0] === 'PREF' && excel) {
      var range = 'Standards!$A$5:$A$' + (series.length + 4);
      return 'IF(' + args[0] + '>MAX(' + range + '),' + args[0] + ',INDEX(' + range + ',COUNTIF(' + range + ',"<"&' + args[0] + ')+1))';
    }
    return (expr[0] === 'PREF' ? 'E12_UP' : expr[0]) + '(' + args.join(',') + ')';
  }
  function parseNumber(value) {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string' || !value.trim()) return NaN;
    var normalized = value.trim().replace(/[۰-۹]/g, function (c) { return c.charCodeAt(0) - 1776; }).replace(/[٠-٩]/g, function (c) { return c.charCodeAt(0) - 1632; }).replace(/٫/g, '.').replace(/٬/g, '').replace(/−/g, '-');
    return /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(normalized) ? Number(normalized) : NaN;
  }
  function calculate(raw, moduleId) {
    var plan = scope(moduleId);
    var values = {}, errors = {}, issues = [], computed = [];
    plan.fields.forEach(function (f) {
      var n = parseNumber(raw[f.key]);
      if (!Number.isFinite(n) || n < f.min || n > f.max) errors[f.key] = 'عدد بین ' + f.min + ' و ' + f.max + ' وارد کنید.';
      else values[f.key] = n;
    });
    if (!Object.keys(errors).length) {
      var low = Math.SQRT2 * values.vacMin - 2 * values.bridgeV - values.rippleIn;
      if (values.vacMax < values.vacMin) errors.vacMax = 'حداکثر ورودی باید حداقل برابر ورودی کمینه باشد.';
      if (low <= 5) errors.rippleIn = 'ریپل انتخابی، ولتاژ باس را به کمتر از ۵ ولت می‌رساند.';
      if (Number.isFinite(values.holdCutoff) && values.holdCutoff >= low) errors.holdCutoff = 'آستانه قطع باید کمتر از کف باس طراحی باشد.';
      if (Number.isFinite(values.safeV) && values.safeV >= Math.SQRT2 * values.vacMax - 2 * values.bridgeV) errors.safeV = 'ولتاژ تخلیه باید کمتر از پیک باس باشد.';
      if (Number.isFinite(values.vd) && values.vo * values.io / (values.eff / 100) < (values.vo + values.vd) * values.io) errors.eff = 'این بازده با تلفات دیود فرض‌شده سازگار نیست؛ بازده را کمتر کنید.';
      if (Number.isFinite(values.tj) && values.tj <= values.ta) errors.tj = 'سقف دمای پیوند باید بالاتر از دمای محیط باشد.';
      if (Number.isFinite(values.esr) && values.vo * values.droop / 100 <= values.io * values.stepLoad / 100 * values.esr / 1000) errors.esr = 'افت ESR به‌تنهایی از بودجه افت گذرا بیشتر است.';
    }
    if (Object.keys(errors).length) return { valid: false, modelValid: false, scope: plan.id, fields: plan.fields, values: values, errors: errors, issues: [], rows: [], displayRows: [], supportRows: [], results: {} };
    var symbols = {};
    fields.forEach(function (f) { symbols[f.key] = f.symbol; });
    plan.rows.forEach(function (r) {
      var n;
      try { n = evaluate(r.expr, values); } catch (error) { n = NaN; }
      if (!Number.isFinite(n)) errors[r.key] = 'محاسبه خارج از دامنه: ' + r.label;
      values[r.key] = n;
      computed.push(Object.assign({}, r, { value: n, formula: formula(r.expr, symbols, false) }));
    });
    function issue(level, module, text) {
      if (plan.id === 'all' || module === 'all' || module === plan.id) issues.push({ level: level, module: module, text: text });
    }
    if (values.idle <= 0 || values.designIdle <= 0 || values.designIdleWorst <= 0) issue('error', 'all', 'شرط DCM در بار نامی یا ذخیره توان و تلرانس Lp برقرار نیست. دیوتی را کم یا ولتاژ بازتابی را بیشتر کنید؛ خروجی معتبر طراحی غیرفعال است.');
    else if (values.designIdleWorst < 10) issue('warning', 'all', 'حاشیه DCM با تلرانس Lp کمتر از ۱۰٪ است؛ تغییر بار و ولتاژ می‌تواند مدار را به CCM ببرد.');
    if (values.fill > values.ku) issue('warning', 'transformer', 'مس سیم‌پیچ از ضریب پرشدگی مجاز بیشتر است؛ هسته/بوبین بزرگ‌تر یا آرایش سیم دیگری لازم است.');
    if (values.strand > 2 * values.skin) issue('warning', 'transformer', 'قطر رشته بیشتر از دو برابر عمق نفوذ است؛ اثر پوستی و مجاورت ممکن است تلفات را افزایش دهد.');
    if (values.gap <= 0) issue('warning', 'transformer', 'گپ معادل مثبت به دست نیامد؛ انتخاب هسته، تراوایی و Lp را بازبینی کنید.');
    if (values.esr > values.esrMax || values.rippleActual > values.rippleTarget) issue('warning', 'output', 'ESR انتخابی یا ریپل نهایی از بودجه بیشتر است؛ خازن کم‌ESR یا موازی‌سازی را بررسی کنید.');
    if (values.sinkTheta <= 0) issue('warning', 'switching', 'مسیر حرارتی مفروض کافی نیست؛ MOSFET یا شرایط حرارتی را تغییر دهید.');
    if (values.vo <= values.fbRef) issue('warning', 'switching', 'این مرجع فیدبک برای خروجی انتخابی مناسب نیست؛ مقاومت بالایی مثبت نمی‌شود.');
    if (values.postFreq >= values.fs / 5) issue('warning', 'output', 'فرکانس پس‌فیلتر نسبت به فرکانس سوئیچینگ بالا است؛ تضعیف و پایداری را بررسی کنید.');
    if (values.knownLoss > values.lossBudget) issue('warning', 'all', 'جمع محافظه‌کارانه تلفات پل، کلید، دیود، RCD، حس جریان، درایو و تخلیه از بودجه بازده بیشتر است؛ بازده یا قطعات مفروض را بازبینی کنید. تلفات مس و هسته هنوز اضافه نشده‌اند.');
    if (values.pout > 150) issue('warning', 'all', 'توان خروجی برای یک فلای‌بک DCM ساده بالاست؛ انتخاب توپولوژی، PFC و محدودیت‌های حرارتی را دوباره بررسی کنید.');
    if (values.holdMs > 0) issue('info', 'input', 'نگه‌داری فقط از نظر انرژی محاسبه شده؛ تنظیم خروجی و DCM زیر کف باس در این مدل تأیید نشده است.');
    var resultValues = {};
    computed.forEach(function (r) { resultValues[r.key] = r.value; });
    var displayKeys = plan.displayRows.map(function (r) { return r.key; });
    return {
      valid: !Object.keys(errors).length,
      modelValid: !Object.keys(errors).length && !issues.some(function (i) { return i.level === 'error'; }),
      scope: plan.id, fields: plan.fields, values: values, errors: errors, issues: issues, rows: computed,
      displayRows: computed.filter(function (r) { return displayKeys.indexOf(r.key) !== -1; }),
      supportRows: computed.filter(function (r) { return displayKeys.indexOf(r.key) === -1; }),
      results: resultValues
    };
  }

  var assumptions = [
    'مدل یک خروجی، فلای‌بک ایزوله، فرکانس ثابت و DCM است؛ برای Forward، LLC، نیم‌پل، تمام‌پل و CCM معتبر نیست.',
    'Lp با Pin=Pout/eta و دیوتی سقف تعیین می‌شود؛ جریان بار نامی با Psec=(Vo+Vf)Io محاسبه می‌شود تا توازن جریان ثانویه برقرار بماند. تفاوت توان، ذخیره تلفات است؛ مدل توزیع واقعی تلفات نیست.',
    'گرد کردن دور اولیه و ثانویه، ولتاژ بازتابی و زمان تخلیه را تغییر می‌دهد؛ شرط DCM پس از گردکردن دوباره بررسی می‌شود.',
    'روابط ولت-ثانیه، افت MOSFET و مقاومت حس را در جریان لحاظ نمی‌کنند؛ تلفات آن‌ها جداگانه تخمین زده می‌شود. تغییر شار محاسبه‌شده شامل شار پسماند نیست.',
    'تلفات هسته و مس AC/DC، فرینجینگ گپ، نشتی واقعی، ظرفیت انگلی، EMI، عایق‌بندی و فواصل خزشی/هوایی تعیین نشده‌اند.',
    'بازده، PF، ESR، زمان پاسخ حلقه، Coss و اسپایک ورودی‌های تخمینی‌اند. انتخاب نهایی قطعه به دیتاشیت، اندازه‌گیری، تحلیل حرارت و آزمون بار نیاز دارد.',
    'بخش کنترل شامل حدود تنش، حس جریان، RCD و تقسیم‌کننده است؛ طراحی جبران‌ساز و تأیید پایداری حلقه انجام نمی‌شود.',
    'برق شهر و انرژی خازن بالک خطر برق‌گرفتگی و آتش‌سوزی دارند. این ابزار پیش‌طراحی است، نه نقشه آماده ساخت یا گواهی ایمنی.'
  ];
  var sources = [
    { title: 'Texas Instruments: Designing a DCM flyback converter (SSZTCW6)', url: 'https://www.ti.com/lit/pdf/ssztcw6' },
    { title: 'Analog Devices: Designing Flyback Converters Using Peak-Current-Mode Controllers (AN5504)', url: 'https://www.analog.com/en/resources/technical-articles/designing-flyback-converters-using-peakcurrentmode-controllers.html' },
    { title: 'onsemi: Design Guidelines for Offline Flyback Converters (AN-4137)', url: 'https://www.onsemi.jp/download/application-notes/pdf/an-4137.pdf' },
    { title: 'Power Integrations: Flyback Transformer Design (AN-17)', url: 'https://www.power.com/sites/default/files/forum/files/AN-17.pdf' }
  ];
  function selfTest() {
    var r = calculate(defaults), v = r.values;
    var reference = calculate(Object.assign({}, defaults, { vacMin: 102 / Math.SQRT2, vo: 19.5, io: 1, eff: 78, fs: 50, duty: 40 }));
    function near(a, b) { return Math.abs(a - b) <= 1e-8 * Math.max(1, Math.abs(b)); }
    var checks = [
      r.valid && r.modelValid,
      near(v.pout, 60), near(v.pin, 60 / 0.85),
      near(0.5 * v.lp * 1e-6 * v.ipDesign * v.ipDesign * v.fHz, v.pin),
      near(0.5 * v.lp * 1e-6 * v.ipOp * v.ipOp * v.fHz, v.psec),
      near(v.secondaryMean, defaults.io), near(v.dOn + v.dDemag + v.idle, 100),
      v.bLimit <= defaults.bmax + 1e-12,
      v.bulkStd >= v.bulkRequired && v.coutStd >= v.coutRequired,
      !calculate(Object.assign({}, defaults, { io: 0 })).valid,
      !calculate(Object.assign({}, defaults, { vacMax: 30 })).valid,
      !calculate(Object.assign({}, defaults, { duty: 65, vref: 20 })).modelValid,
      !calculate(Object.assign({}, defaults, { holdCutoff: 400 })).valid,
      !calculate(Object.assign({}, defaults, { eff: 98 })).valid,
      !calculate(Object.assign({}, defaults, { esr: 500 })).valid,
      near(v.capRms * v.capRms + defaults.io * defaults.io, v.isRms * v.isRms),
      v.bulkValley >= v.busMin - 1e-9,
      parseNumber('۱۲٫۵') === 12.5,
      Number.isNaN(parseNumber('')),
      preferred(47) === 47 && preferred(47.01) === 56,
      reference.valid && reference.modelValid,
      near(reference.values.busMin, 80),
      near(reference.values.pin, 25),
      near(reference.values.lp, 409.6),
      near(reference.values.ipDesign, 1.5625),
      reference.values.bulkStd === 680,
      supportsConfiguration({ supplyType: SUPPLY_TYPE, topology: TOPOLOGY }),
      !supportsConfiguration({ supplyType: 'dc-dc-isolated', topology: TOPOLOGY }),
      !supportsConfiguration({ supplyType: SUPPLY_TYPE, topology: 'flyback-ccm' }),
      calculate(Object.assign({}, defaults, { esr: 500, tj: 20 }), 'transformer').valid,
      calculate(Object.assign({}, defaults, { ae: 0, duty: 65, vref: 20 }), 'input').modelValid,
      !calculate(Object.assign({}, defaults, { esr: 500 }), 'output').valid,
      Object.keys(modules).every(function (id) {
        var scoped = calculate(defaults, id);
        return scoped.valid && scoped.modelValid && scoped.displayRows.every(function (item) {
          return (item.module === 'common' || item.module === id) && near(item.value, v[item.key]);
        });
      }),
      rows.every(function (r) { return Number.isFinite(v[r.key]); })
    ];
    return { ok: checks.every(Boolean), count: checks.length };
  }
  global.VoltaEngine = { version: VERSION, topology: TOPOLOGY, supplyType: SUPPLY_TYPE, designOptions: designOptions, supportsConfiguration: supportsConfiguration, modules: modules, fields: fields, defaults: defaults, rows: rows, series: series, scope: scope, referencesOf: referencesOf, calculate: calculate, formula: formula, parseNumber: parseNumber, assumptions: assumptions, sources: sources, selfTest: selfTest };
})(typeof globalThis !== 'undefined' ? globalThis : window);