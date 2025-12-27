import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  delay?: number;
}

const ChartCard = ({ title, children, delay = 0 }: ChartCardProps) => (
  <div
    className="bg-card rounded-xl border border-border p-6 shadow-md animate-slide-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
    <div className="h-64">{children}</div>
  </div>
);

interface PatientsLineChartProps {
  days: string[];
  newPatients: number[];
  existingPatients: number[];
}

export const PatientsLineChart = ({ days, newPatients, existingPatients }: PatientsLineChartProps) => {
  const data = {
    labels: days,
    datasets: [
      {
        label: 'New Patients',
        data: newPatients,
        borderColor: 'hsl(199, 89%, 48%)',
        backgroundColor: 'hsla(199, 89%, 48%, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Existing Patients',
        data: existingPatients,
        borderColor: 'hsl(142, 76%, 36%)',
        backgroundColor: 'hsla(142, 76%, 36%, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'hsla(214, 20%, 90%, 0.5)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <ChartCard title="New vs Existing Patients" delay={100}>
      <Line data={data} options={options} />
    </ChartCard>
  );
};

interface PatientDistributionPieProps {
  newPatients: number;
  existingPatients: number;
}

export const PatientDistributionPie = ({ newPatients, existingPatients }: PatientDistributionPieProps) => {
  const data = {
    labels: ['New Patients', 'Existing Patients'],
    datasets: [
      {
        data: [newPatients, existingPatients],
        backgroundColor: ['hsl(199, 89%, 48%)', 'hsl(142, 76%, 36%)'],
        borderColor: ['hsl(199, 89%, 48%)', 'hsl(142, 76%, 36%)'],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
  };

  return (
    <ChartCard title="Patient Distribution" delay={150}>
      <Pie data={data} options={options} />
    </ChartCard>
  );
};

interface QueryTypeBarChartProps {
  labels: string[];
  data: number[];
}

export const QueryTypeBarChart = ({ labels, data }: QueryTypeBarChartProps) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Appointments',
        data,
        backgroundColor: [
          'hsl(199, 89%, 48%)',
          'hsl(142, 76%, 36%)',
          'hsl(25, 95%, 53%)',
          'hsl(0, 84%, 60%)',
          'hsl(262, 83%, 58%)',
        ],
        borderRadius: 8,
        maxBarThickness: 50,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'hsla(214, 20%, 90%, 0.5)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <ChartCard title="Appointments by Query Type" delay={200}>
      <Bar data={chartData} options={options} />
    </ChartCard>
  );
};

interface AppointmentsTrendProps {
  weeks: string[];
  data: number[];
}

export const AppointmentsTrendChart = ({ weeks, data }: AppointmentsTrendProps) => {
  const chartData = {
    labels: weeks,
    datasets: [
      {
        label: 'Appointments',
        data,
        borderColor: 'hsl(262, 83%, 58%)',
        backgroundColor: 'hsla(262, 83%, 58%, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'hsl(262, 83%, 58%)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'hsla(214, 20%, 90%, 0.5)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <ChartCard title="Appointments Trend" delay={250}>
      <Line data={chartData} options={options} />
    </ChartCard>
  );
};
