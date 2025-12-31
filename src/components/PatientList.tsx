import { useNavigate } from 'react-router-dom';
import { Phone, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Contact } from '@/lib/firestore';
import { format } from 'date-fns';

interface PatientListProps {
  patients: Contact[];
  loading?: boolean;
}

const PatientList = ({ patients, loading }: PatientListProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <p className="text-muted-foreground">No patients found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {patients.map((patient, index) => (
        <div
          key={patient.id}
          onClick={() => navigate(`/patient/${patient.id}`)}
          className={cn(
            'bg-card rounded-xl border border-border p-4 cursor-pointer',
            'hover:shadow-md hover:border-primary/30 transition-all duration-200',
            'animate-slide-up'
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-lg">
              {patient.name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground truncate">{patient.name}</h4>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{patient.phone}</span>
                </div>
                {patient.appointmentDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{format(new Date(patient.appointmentDate), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-semibold',
                  patient.type === 'New'
                    ? 'bg-medical-blue-light text-medical-blue'
                    : 'bg-medical-green-light text-medical-green'
                )}
              >
                {patient.type}
              </span>
              <span
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-semibold',
                  patient.urgency === 'High'
                    ? 'bg-medical-red-light text-medical-red'
                    : patient.urgency === 'Medium'
                    ? 'bg-medical-orange-light text-medical-orange'
                    : 'bg-medical-green-light text-medical-green'
                )}
              >
                {patient.urgency}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-medical-green-light text-medical-green">
                {patient.status}
              </span>
            </div>

            {/* Arrow */}
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PatientList;
