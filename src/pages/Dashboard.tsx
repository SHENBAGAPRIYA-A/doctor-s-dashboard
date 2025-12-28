import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, UserCheck, Calendar, Bell, Search } from 'lucide-react';
import { getCurrentDoctor } from '@/lib/firebase';
import { fetchDoctorContacts, calculateAnalytics } from '@/lib/firestore';
import type { Contact } from '@/lib/firestore';
import DashboardSidebar from '@/components/DashboardSidebar';
import StatCard from '@/components/StatCard';
import PatientList from '@/components/PatientList';
import {
  PatientsLineChart,
  PatientDistributionPie,
  EscalationChart,
  AppointmentsTrendChart,
} from '@/components/Charts';
import { Input } from '@/components/ui/input';

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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

  const doctor = getCurrentDoctor();

  useEffect(() => {
    // Fetch data from Firestore
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Starting data fetch...');
        const contacts = await fetchDoctorContacts();
        console.log('Loaded contacts:', contacts);
        if (contacts && contacts.length > 0) {
          setPatients(contacts);
          setAnalytics(calculateAnalytics(contacts));
        } else {
          console.log('No contacts returned');
          setError('No data found in database');
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter patients based on search
  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-background flex w-full">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {doctor.email || 'Doctor'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-medical-red rounded-full" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Patients"
              value={loading ? '...' : analytics.totalPatients}
              icon={Users}
              variant="primary"
              delay={0}
            />
            <StatCard
              title="New Patients Today"
              value={loading ? '...' : analytics.newPatientsToday}
              icon={UserPlus}
              variant="success"
              trend={{ value: 12, isPositive: true }}
              delay={50}
            />
            <StatCard
              title="Existing Patients"
              value={loading ? '...' : analytics.existingPatients}
              icon={UserCheck}
              variant="default"
              delay={100}
            />
            <StatCard
              title="Appointments Today"
              value={loading ? '...' : analytics.appointmentsToday}
              icon={Calendar}
              variant="warning"
              delay={150}
            />
          </div>

          {/* Charts Grid */}
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

          {/* Patient List */}
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Recent Patients</h2>
              <span className="text-sm text-muted-foreground">
                {filteredPatients.length} patients
              </span>
            </div>
            <PatientList patients={filteredPatients.slice(0, 10)} loading={loading} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
