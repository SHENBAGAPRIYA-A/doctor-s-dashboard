import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  CheckCircle,
  User,
  Hash,
  Activity,
} from 'lucide-react';
import { isAuthenticated } from '@/lib/firebase';
import { fetchContactById } from '@/lib/firestore';
import type { Contact } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PatientDetails = () => {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<Contact | null>(null);

  useEffect(() => {
    // For demo purposes, allow access without auth
    // In production, uncomment the auth check below:
    // if (!isAuthenticated()) {
    //   navigate('/login');
    //   return;
    // }

    const loadPatient = async () => {
      if (!patientId) {
        navigate('/dashboard');
        return;
      }

      try {
        const data = await fetchContactById(patientId);
        if (data) {
          setPatient(data);
        } else {
          // Use sample data for demo
          setPatient(generateSamplePatient(patientId));
        }
      } catch (error) {
        console.error('Error loading patient:', error);
        setPatient(generateSamplePatient(patientId));
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [patientId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="bg-card rounded-xl border border-border p-8 space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-muted animate-pulse" />
              <div className="space-y-3">
                <div className="h-8 w-48 bg-muted rounded animate-pulse" />
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Patient not found</h2>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="gap-2 hover:bg-secondary"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        {/* Patient Card */}
        <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-accent p-8">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-primary-foreground/20 border-4 border-primary-foreground/30 flex items-center justify-center text-primary-foreground text-4xl font-bold">
                {patient.name.charAt(0).toUpperCase()}
              </div>
              {/* Name & Type */}
              <div>
                <h1 className="text-3xl font-bold text-primary-foreground mb-2">
                  {patient.name}
                </h1>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'px-4 py-1.5 rounded-full text-sm font-semibold',
                      patient.type === 'New'
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-primary-foreground/20 text-primary-foreground'
                    )}
                  >
                    {patient.type} Patient
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoCard
                icon={Hash}
                label="Patient ID"
                value={patient.id}
                delay={50}
              />
              <InfoCard
                icon={Phone}
                label="Phone Number"
                value={patient.phone}
                delay={100}
              />
              <InfoCard
                icon={User}
                label="Patient Type"
                value={patient.type}
                delay={150}
              />
              <InfoCard
                icon={Activity}
                label="Total Visits"
                value={String(patient.totalVisits || 1)}
                delay={200}
              />
              <InfoCard
                icon={Calendar}
                label="First Contact Date"
                value={formatDate(patient.createdAt)}
                delay={250}
              />
              <InfoCard
                icon={Clock}
                label="Last Interaction"
                value={formatDate(patient.lastInteraction || patient.createdAt)}
                delay={300}
              />
              <InfoCard
                icon={Calendar}
                label="Appointment Date & Time"
                value={patient.appointmentDate ? formatDateTime(patient.appointmentDate) : 'Not scheduled'}
                delay={350}
              />
              <InfoCard
                icon={AlertCircle}
                label="Urgency"
                value={patient.urgency}
                valueClassName={cn(
                  patient.urgency === 'High' && 'text-medical-red',
                  patient.urgency === 'Medium' && 'text-medical-orange',
                  patient.urgency === 'Low' && 'text-medical-green'
                )}
                delay={400}
              />
              <InfoCard
                icon={CheckCircle}
                label="Status"
                value={patient.status}
                valueClassName="text-medical-green"
                delay={450}
              />
            </div>

            {/* Keywords */}
            {patient.keywords && patient.keywords.length > 0 && (
              <div className="mt-8 animate-slide-up" style={{ animationDelay: '500ms' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Keywords</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {patient.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface InfoCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  valueClassName?: string;
  delay?: number;
}

const InfoCard = ({ icon: Icon, label, value, valueClassName, delay = 0 }: InfoCardProps) => (
  <div
    className="bg-secondary/50 rounded-lg p-4 animate-slide-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center gap-3 mb-2">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
    <p className={cn('text-lg font-semibold text-foreground', valueClassName)}>{value}</p>
  </div>
);

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatDateTime = (date: Date): string => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const generateSamplePatient = (id: string): Contact => ({
  id,
  name: 'John Smith',
  phone: '+1 555-1234',
  type: 'Existing',
  doctorId: 'demo-doctor',
  status: 'Completed',
  urgency: 'Medium',
  createdAt: new Date(Date.now() - 30 * 86400000),
  keywords: ['Consultation', 'Follow-up', 'Prescription'],
  appointmentDate: new Date(Date.now() + 7 * 86400000),
  totalVisits: 5,
  lastInteraction: new Date(Date.now() - 2 * 86400000),
  queryType: 'Follow-up',
});

export default PatientDetails;
