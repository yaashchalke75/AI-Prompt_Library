import { FileStack, FolderOpenDot, Star, Clock } from "lucide-react";
import { useAppSelector } from "@/app/hooks";

const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) => (
  <div className="flex items-center gap-4 rounded-xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-4 shadow-[var(--shadow-card)]">
    <div className="w-10 h-10 rounded-lg bg-ink-50 dark:bg-ink-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-2xl font-display font-semibold text-ink-900 dark:text-ink-50 tabular-nums leading-tight">
        {value}
      </p>
      <p className="text-xs text-ink-500 dark:text-ink-400">{label}</p>
    </div>
  </div>
);

export const DashboardStats = () => {
  const stats = useAppSelector((state) => state.prompts.stats);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <StatCard
        icon={<FileStack size={18} />}
        label="Total prompts"
        value={stats?.totalPrompts ?? 0}
      />
      <StatCard
        icon={<Star size={18} />}
        label="Favorites"
        value={stats?.favoritePrompts ?? 0}
      />
      <StatCard
        icon={<FolderOpenDot size={18} />}
        label="Categories in use"
        value={stats?.categoriesCount ?? 0}
      />
      <StatCard
        icon={<Clock size={18} />}
        label="Added recently"
        value={stats?.recentlyAdded?.length ?? 0}
      />
    </div>
  );
};
