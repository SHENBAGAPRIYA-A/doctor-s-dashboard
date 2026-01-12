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
  variant?: 'default' | 'primary' | 'newPatient' | 'existingPatient' | 'appointment';
  delay?: number;
}

const StatCard = ({ title, value, icon: Icon, trend, variant = 'default', delay = 0 }: StatCardProps) => {
  const variantStyles = {
    default: 'border-border',
    primary: 'border-[hsl(195,58%,25%)]/20 bg-gradient-to-br from-[hsl(195,58%,25%)]/5 to-[hsl(195,58%,25%)]/10',
    newPatient: 'border-[hsl(195,58%,25%)]/20 bg-gradient-to-br from-[hsl(195,58%,25%)]/5 to-[hsl(195,58%,25%)]/10',
    existingPatient: 'border-[hsl(166,62%,61%)]/20 bg-gradient-to-br from-[hsl(166,62%,61%)]/5 to-[hsl(166,62%,61%)]/10',
    appointment: 'border-[hsl(180,50%,45%)]/20 bg-gradient-to-br from-[hsl(180,50%,45%)]/5 to-[hsl(180,50%,45%)]/10',
  };

  const iconStyles = {
    default: 'bg-secondary text-secondary-foreground',
    primary: 'bg-[hsl(195,58%,25%)] text-white',
    newPatient: 'bg-[hsl(195,58%,25%)] text-white',
    existingPatient: 'bg-[hsl(166,62%,61%)] text-white',
    appointment: 'bg-[hsl(180,50%,45%)] text-white',
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
