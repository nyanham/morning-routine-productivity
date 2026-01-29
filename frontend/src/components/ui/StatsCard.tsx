import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn, getProductivityColor, getProductivityBgColor } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon?: React.ReactNode;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
}: StatsCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-slate-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-primary-100 rounded-lg">{icon}</div>
        )}
      </div>
      {trend && trendValue && (
        <div className="flex items-center gap-1 mt-4">
          {getTrendIcon()}
          <span className={cn('text-sm font-medium', getTrendColor())}>
            {trendValue}
          </span>
          <span className="text-sm text-slate-500">vs last week</span>
        </div>
      )}
    </div>
  );
}
