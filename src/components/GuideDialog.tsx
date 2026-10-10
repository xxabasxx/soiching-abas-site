import { ArrowLeft, ArrowUpLeft, Download, FileCode2, FolderOpen } from 'lucide-react';
import { Dialog } from './Dialog';
import { OfflineDownload } from './OfflineDownload';
import { useLanguage } from '../lib/language';

interface GuideDialogProps {
  mode: 'help' | 'setup' | 'offline';
  onClose: () => void;
  onStart: () => void;
  onOffline: () => void;
}

export function GuideDialog({ mode, onClose, onStart, onOffline }: GuideDialogProps) {
  const { t } = useLanguage();
  if (mode === 'offline') return <Dialog title={t('دریافت نسخه آفلاین', 'Download the offline edition')} subtitle={t('بسته کامل، با لینک مستقیم و بدون درخواست فایل از سرور', 'A complete package, assembled locally and ready to download')} onClose={onClose}>
    <div className="dialog-body"><OfflineDownload /></div>
  </Dialog>;

  if (mode === 'setup') return <Dialog title={t('پروژه شما، همیشه همراه شما', 'Take your project with you')} subtitle={t('راهنمای ذخیره، گزارش و استفاده آفلاین از محاسبات', 'Saving projects, exporting reports and working offline')} onClose={onClose} className="setup-dialog">
    <div className="dialog-body">
      <div className="guide-intro"><FolderOpen size={27} strokeWidth={1.5} /><p>{t('هر چهار کارت ماشین‌حساب آماده دارند. بالای هر صفحه، ابزارهای بارگذاری پروژه، ذخیره، Excel، متن و چاپ در دسترس‌اند.', 'Each card opens a working calculator. Import, save, Excel, text and print tools are available at the top of every worksheet.')}</p></div>
      <div className="setup-paths">{[{ name: t('ادامه طراحی با بارگذاری و ذخیره پروژه', 'Save and restore your design'), extension: '.abas.json' }, { name: t('محاسبات فرمول‌دار اختصاصی همین بخش', 'Section-specific formulas and results'), extension: '.xlsx' }, { name: t('گزارش همین بخش، همراه فرمول‌ها و فرض‌ها', 'Readable report with formulas and assumptions'), extension: '.txt' }].map((item) => <div className="setup-path" key={item.extension}><div><FileCode2 size={17} /><span>{item.name}</span></div><code dir="ltr">{item.extension}</code></div>)}</div>
      <p className="guide-paragraph">{t('Excel هر بخش شش برگه دارد: Inputs، Calculations، Dependencies، Checks، References و Standards. برای ادامه در سایت، فایل پروژه JSON را بارگذاری کنید؛ پروژه‌های .volta.json قبلی هم پذیرفته می‌شوند.', 'Each section exports six sheets: Inputs, Calculations, Dependencies, Checks, References and Standards. To continue in the website, import a project JSON. Legacy .volta.json projects remain supported.')}</p>
      <div className="guide-note"><strong>{t('برای آفلاین یا هاست', 'Offline or hosted')}</strong><p>{t('بسته آفلاین را کامل Extract کنید. index.html را باز کنید یا همه محتوا را روی هاست بگذارید. پوشه calculations و فایل‌های زبان را کنار صفحه اصلی نگه دارید.', 'Extract the entire offline ZIP. Open index.html or upload all contents to your host. Keep the calculations folder and language files beside the homepage.')}</p></div>
      <p className="guide-footnote">{t('مدل فعلی فلای‌بک ایزوله DCM است. پیش‌فرض قطعات نمونه‌اند؛ نتایج به تأیید دیتاشیت و آزمون واقعی نیاز دارند.', 'The model is an isolated DCM flyback. Component defaults are examples; verify results using datasheets and real hardware tests.')}</p>
    </div>
    <div className="dialog-footer offline-dialog-footer"><button className="offline-preview-link" onClick={onOffline}><Download size={14} />{t('دریافت نسخه آفلاین', 'Download offline')}</button><button className="primary-button" onClick={onClose}>{t('متوجه شدم', 'Understood')}<ArrowLeft size={16} /></button></div>
  </Dialog>;

  return <Dialog title={t('محاسبات، بدون هیچ واسطه‌ای', 'A direct path to your calculations')} subtitle={t('از انتخاب بخش تا صفحه محاسبات، فقط یک کلیک فاصله است.', 'One click from your design stage to its worksheet.')} onClose={onClose}>
    <div className="dialog-body">
      <div className="guide-step"><span>{t('۰۱', '01')}</span><div><h3>{t('بخش موردنیاز را انتخاب کنید', 'Choose a design stage')}</h3><p>{t('ورودی، ترانسفورماتور، سوئیچینگ یا خروجی. روی عنوان یا هر قسمت از کارت کلیک کنید.', 'Input, transformer, switching or output. Click anywhere on a card to open its worksheet.')}</p></div></div>
      <div className="guide-step"><span>{t('۰۲', '02')}</span><div><h3>{t('شروع محاسبات، فقط با فرمان شما', 'Start only when you are ready')}</h3><p>{t('نوع منبع و توپولوژی فعال را بررسی کنید؛ سپس چهار ورودی اصلی را بدهید و دکمه محاسبه را بزنید. ردیف‌های آینده خالی می‌مانند و متن، فرمول و عدد هر ردیف در نوبت خودش با کادر سبز ظاهر می‌شود.', 'Review the active supply type and topology, enter four main inputs and press Calculate. Future rows remain empty; each row reveals its text, formula and value inside a green frame when its turn arrives.')}</p></div></div>
      <div className="guide-step"><span>{t('۰۳', '03')}</span><div><h3>{t('پروژه و گزارش را همراه ببرید', 'Save your work and reports')}</h3><p>{t('از نوار بالا پروژه را ذخیره یا بارگذاری کنید، Excel فرمول‌دار و گزارش متن بگیرید یا چاپ کنید. زبان انتخابی بین صفحه‌ها حفظ می‌شود.', 'Use the toolbar to save or import projects, export formula-based Excel or text reports, and print. Your selected language travels between pages.')}</p></div></div>
      <p className="guide-footnote">{t('این ابزار برای پیش‌طراحی Flyback DCM است. ورودی نامعتبر یا نقض شرط DCM، گزارش بخش مربوط را غیرفعال می‌کند.', 'This is a preliminary Flyback DCM design tool. Invalid inputs or a failed DCM condition disable the affected design report.')}</p>
    </div>
    <div className="dialog-footer offline-dialog-footer"><button className="offline-preview-link" onClick={onOffline}><Download size={14} />{t('دانلود نسخه آفلاین', 'Download offline')}</button><button className="primary-button" onClick={onStart}>{t('انتخاب بخش محاسبات', 'Choose a calculator')}<ArrowUpLeft size={17} /></button></div>
  </Dialog>;
}