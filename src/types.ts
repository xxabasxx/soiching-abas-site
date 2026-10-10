export type ModuleId = 'input' | 'transformer' | 'switching' | 'output';

export interface CalculationModule {
  id: ModuleId;
  title: string;
  titleEn?: string;
  english: string;
  description: string;
  descriptionEn?: string;
  path: string;
}

export const DEFAULT_MODULES: CalculationModule[] = [
  {
    id: 'input',
    title: 'ورودی و یکسوساز',
    english: 'INPUT & RECTIFIER',
    description: 'محاسبات ولتاژ ورودی، پل دیود و انتخاب خازن بالک.',
    path: './calculations/input.html',
  },
  {
    id: 'transformer',
    title: 'طراحی ترانسفورماتور',
    english: 'TRANSFORMER DESIGN',
    description: 'طراحی هسته، تعداد دور و سیم‌پیچ ترانس سوئیچینگ.',
    path: './calculations/transformer.html',
  },
  {
    id: 'switching',
    title: 'سوئیچینگ و کنترل',
    english: 'SWITCHING & CONTROL',
    description: 'انتخاب کلید قدرت، فرکانس سوئیچینگ و مدار کنترل.',
    path: './calculations/switching.html',
  },
  {
    id: 'output',
    title: 'فیلتر و خروجی',
    english: 'OUTPUT & FILTER',
    description: 'محاسبات سلف، خازن و ریپل؛ برای یک خروجی پایدار.',
    path: './calculations/output.html',
  },
];

export const HERO_URL = './images/volta-copper-hero.jpg';