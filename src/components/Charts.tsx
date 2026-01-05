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

// Professional color palette - Healthcare/Medical themed
const colors = {
  primary: 'hsl(217, 91%, 60%)',      // Professional Blue
  primaryLight: 'hsla(217, 91%, 60%, 0.15)',
  secondary: 'hsl(158, 64%, 52%)',    // Teal Green
  secondaryLight: 'hsla(158, 64%, 52%, 0.15)',
  accent: 'hsl(262, 83%, 58%)',       // Purple
  accentLight: 'hsla(262, 83%, 58%, 0.15)',
  warning: 'hsl(45, 93%, 47%)',       // Amber
  danger: 'hsl(0, 84%, 60%)',         // Red
  success: 'hsl(142, 71%, 45%)',      // Green
  neutral: 'hsl(215, 16%, 47%)',      // Slate
  gridColor: 'hsla(215, 20%, 65%, 0.2)',
};

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
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: colors.primary,
        borderWidth: 2,
      },
      {
        label: 'Existing Patients',
        data: existingPatients,
        borderColor: colors.secondary,
        backgroundColor: colors.secondaryLight,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: colors.secondary,
        borderWidth: 2,
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
          font: {
            size: 12,
            weight: 500,
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: colors.gridColor,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
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
        backgroundColor: [colors.primary, colors.secondary],
        borderColor: ['hsl(0, 0%, 100%)', 'hsl(0, 0%, 100%)'],
        borderWidth: 3,
        hoverOffset: 8,
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
          font: {
            size: 12,
            weight: 500,
          },
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

interface EscalationChartProps {
  labels: string[];
  data: number[];
}

export const EscalationChart = ({ labels, data }: EscalationChartProps) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Escalations',
        data,
        backgroundColor: [
          colors.danger,    // High - Red
          colors.warning,   // Medium - Amber
          colors.success,   // Low - Green
        ],
        borderRadius: 8,
        maxBarThickness: 60,
        borderSkipped: false,
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
          color: colors.gridColor,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <ChartCard title="Escalation by Urgency" delay={200}>
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
        borderColor: colors.accent,
        backgroundColor: colors.accentLight,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: colors.accent,
        borderWidth: 2,
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
          color: colors.gridColor,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
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
