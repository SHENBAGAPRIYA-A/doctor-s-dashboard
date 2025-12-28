import { useState, useEffect } from 'react';
import { FileText, Users, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { fetchDoctorContacts, calculateAnalytics } from '@/lib/firestore';
import type { Contact } from '@/lib/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  PatientsLineChart,
  PatientDistributionPie,
  EscalationChart,
  AppointmentsTrendChart,
} from '@/components/Charts';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Contact[]>([]);
  const [analytics, setAnalytics] = useState({
    totalPatients: 0,
    newPatientsToday: 0,
    existingPatients: 0,
    newPatients: 0,
    appointmentsToday: 0,
    escalations: 0,
    weeklyData: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as string[], newPatients: [] as number[], existingPatients: [] as number[] },
    escalationData: { labels: ['High', 'Medium', 'Low'] as string[], data: [] as number[] },
    appointmentsTrend: { weeks: ['Week 1', 'Week 2', 'Week 3', 'Week 4'] as string[], data: [] as number[] },
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const contacts = await fetchDoctorContacts();
        if (contacts && contacts.length > 0) {
          setPatients(contacts);
          setAnalytics(calculateAnalytics(contacts));
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-72 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Analytics and insights from your patient data
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold text-foreground">{analytics.totalPatients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-medical-green-light flex items-center justify-center">
                <TrendingUp className="w-6 h-6" style={{ color: 'hsl(142, 76%, 36%)' }} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New Patients</p>
                <p className="text-2xl font-bold text-foreground">{analytics.newPatients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-medical-orange-light flex items-center justify-center">
                <Calendar className="w-6 h-6" style={{ color: 'hsl(25, 95%, 53%)' }} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Appointments Today</p>
                <p className="text-2xl font-bold text-foreground">{analytics.appointmentsToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-medical-red-light flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" style={{ color: 'hsl(0, 84%, 60%)' }} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Escalations</p>
                <p className="text-2xl font-bold text-foreground">{analytics.escalations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PatientsLineChart
          days={analytics.weeklyData.days}
          newPatients={analytics.weeklyData.newPatients}
          existingPatients={analytics.weeklyData.existingPatients}
        />
        <PatientDistributionPie
          newPatients={analytics.newPatients}
          existingPatients={analytics.existingPatients}
        />
        <EscalationChart
          labels={analytics.escalationData.labels}
          data={analytics.escalationData.data}
        />
        <AppointmentsTrendChart
          weeks={analytics.appointmentsTrend.weeks}
          data={analytics.appointmentsTrend.data}
        />
      </div>
    </div>
  );
};

export default Reports;
