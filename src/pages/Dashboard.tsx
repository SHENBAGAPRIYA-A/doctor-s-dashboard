import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, UserCheck, Calendar, Bell, Search } from 'lucide-react';
import { isAuthenticated, getCurrentDoctor } from '@/lib/firebase';
import { fetchDoctorContacts, calculateAnalytics } from '@/lib/firestore';
import type { Contact } from '@/lib/firestore';
import DashboardSidebar from '@/components/DashboardSidebar';
import StatCard from '@/components/StatCard';
import PatientList from '@/components/PatientList';
import {
  PatientsLineChart,
  PatientDistributionPie,
  QueryTypeBarChart,
  AppointmentsTrendChart,
} from '@/components/Charts';
import { Input } from '@/components/ui/input';

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [analytics, setAnalytics] = useState({
    totalPatients: 0,
    newPatientsToday: 0,
    existingPatients: 0,
    newPatients: 0,
    appointmentsToday: 0,
    weeklyData: { days: [] as string[], newPatients: [] as number[], existingPatients: [] as number[] },
    queryTypeDistribution: { labels: [] as string[], data: [] as number[] },
    appointmentsTrend: { weeks: [] as string[], data: [] as number[] },
  });

  const doctor = getCurrentDoctor();

  useEffect(() => {
    // For demo purposes, allow access without auth
    // In production, uncomment the auth check below:
    // if (!isAuthenticated()) {
    //   navigate('/login');
    //   return;
    // }

    // Fetch data
    const loadData = async () => {
      try {
        // Try to fetch real data, fall back to sample data for demo
        if (isAuthenticated()) {
          const contacts = await fetchDoctorContacts();
          setPatients(contacts);
          setAnalytics(calculateAnalytics(contacts));
        } else {
          // Use sample data for demo
          const sampleData = generateSampleData();
          setPatients(sampleData);
          setAnalytics(calculateAnalytics(sampleData));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Use sample data if fetch fails
        const sampleData = generateSampleData();
        setPatients(sampleData);
        setAnalytics(calculateAnalytics(sampleData));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

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
              days={analytics.weeklyData.days.length ? analytics.weeklyData.days : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
              newPatients={analytics.weeklyData.newPatients.length ? analytics.weeklyData.newPatients : [5, 8, 12, 7, 10, 6]}
              existingPatients={analytics.weeklyData.existingPatients.length ? analytics.weeklyData.existingPatients : [8, 6, 10, 12, 8, 14]}
            />
            <PatientDistributionPie
              newPatients={analytics.newPatients || 45}
              existingPatients={analytics.existingPatients || 55}
            />
            <QueryTypeBarChart
              labels={analytics.queryTypeDistribution.labels.length ? analytics.queryTypeDistribution.labels : ['Booking', 'FAQs', 'Follow-up', 'Emergency', 'Reports']}
              data={analytics.queryTypeDistribution.data.length ? analytics.queryTypeDistribution.data : [12, 8, 15, 5, 10]}
            />
            <AppointmentsTrendChart
              weeks={analytics.appointmentsTrend.weeks.length ? analytics.appointmentsTrend.weeks : ['Week 1', 'Week 2', 'Week 3', 'Week 4']}
              data={analytics.appointmentsTrend.data.length ? analytics.appointmentsTrend.data : [18, 25, 22, 30]}
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

// Generate sample data for demo purposes
const generateSampleData = (): Contact[] => {
  const names = ['John Smith', 'Emily Johnson', 'Michael Brown', 'Sarah Davis', 'David Wilson', 'Jessica Taylor', 'Robert Anderson', 'Jennifer Thomas'];
  const types: Array<'New' | 'Existing'> = ['New', 'Existing'];
  const urgencies: Array<'High' | 'Medium' | 'Low'> = ['High', 'Medium', 'Low'];
  const queryTypes = ['Booking', 'FAQs', 'Follow-up', 'Emergency', 'Reports'];
  
  return names.map((name, index) => ({
    id: `patient-${index}`,
    name,
    phone: `+1 555-${String(1000 + index).padStart(4, '0')}`,
    type: types[index % 2],
    doctorId: 'demo-doctor',
    status: 'Completed',
    urgency: urgencies[index % 3],
    createdAt: new Date(Date.now() - index * 86400000),
    keywords: ['Consultation', 'Check-up'],
    appointmentDate: new Date(Date.now() + index * 86400000),
    totalVisits: Math.floor(Math.random() * 10) + 1,
    lastInteraction: new Date(Date.now() - index * 43200000),
    queryType: queryTypes[index % queryTypes.length],
  }));
};

export default Dashboard;
