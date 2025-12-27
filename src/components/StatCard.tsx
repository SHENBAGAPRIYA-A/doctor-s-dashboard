import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning';
  delay?: number;
}

const StatCard = ({ title, value, icon: Icon, trend, variant = 'default', delay = 0 }: StatCardProps) => {
  const variantStyles = {
    default: 'border-border',
    primary: 'border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10',
    success: 'border-medical-green/20 bg-gradient-to-br from-medical-green/5 to-medical-green/10',
    warning: 'border-medical-orange/20 bg-gradient-to-br from-medical-orange/5 to-medical-orange/10',
  };

  const iconStyles = {
    default: 'bg-secondary text-secondary-foreground',
    primary: 'bg-primary text-primary-foreground',
    success: 'bg-medical-green text-primary-foreground',
    warning: 'bg-medical-orange text-primary-foreground',
  };

  return (
    <div
      className={cn(
        'bg-card rounded-xl border p-6 shadow-md hover:shadow-lg transition-all duration-300 animate-slide-up',
        variantStyles[variant]
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-4xl font-bold text-foreground tracking-tight">{value}</p>
          {trend && (
            <p
              className={cn(
                'text-xs font-medium flex items-center gap-1',
                trend.isPositive ? 'text-medical-green' : 'text-medical-red'
              )}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}% from last week</span>
            </p>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconStyles[variant])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
