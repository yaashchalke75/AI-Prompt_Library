import clsx from 'clsx';
import type { Category } from '@/types';

const categoryColors: Record<Category, string> = {
  Coding: 'bg-[#5b7a9d]/15 text-[#41597a] dark:text-[#8fb0d1]',
  Marketing: 'bg-[#c0714f]/15 text-[#9a5a3e] dark:text-[#e0a184]',
  'Content Writing': 'bg-[#8a7ab8]/15 text-[#6b5c96] dark:text-[#b3a6dd]',
  Email: 'bg-[#4a8a6f]/15 text-[#396d57] dark:text-[#7fbfa2]',
  Resume: 'bg-[#a68a4a]/15 text-[#856d38] dark:text-[#d1b676]',
  SQL: 'bg-[#6b8e8e]/15 text-[#516f6f] dark:text-[#9fc2c2]',
  Design: 'bg-[#b8558c]/15 text-[#95436f] dark:text-[#dd8bb5]',
  'Social Media': 'bg-[#d19c4a]/15 text-[#a67735] dark:text-[#eec583]',
  Productivity: 'bg-[#5a9370]/15 text-[#457358] dark:text-[#8fc7a4]',
  Others: 'bg-ink-400/15 text-ink-500 dark:text-ink-300',
};

export const CategoryBadge = ({ category, className }: { category: Category; className?: string }) => (
  <span
    className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap',
      categoryColors[category],
      className
    )}
  >
    {category}
  </span>
);
