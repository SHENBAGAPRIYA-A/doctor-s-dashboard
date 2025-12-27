import { FIRESTORE_BASE_URL, getCurrentDoctor } from './firebase';

// Types for Firestore document
export interface Contact {
  id: string;
  name: string;
  phone: string;
  type: 'New' | 'Existing';
  doctorId: string;
  status: string;
  urgency: 'High' | 'Medium' | 'Low';
  createdAt: Date;
  keywords?: string[];
  appointmentDate?: Date;
  totalVisits?: number;
  lastInteraction?: Date;
  queryType?: string;
}

interface FirestoreValue {
  stringValue?: string;
  integerValue?: string;
  timestampValue?: string;
  arrayValue?: { values?: Array<{ stringValue?: string }> };
}

interface FirestoreDocument {
  name: string;
  fields: Record<string, FirestoreValue>;
  createTime: string;
  updateTime: string;
}

// Parse Firestore document format
const parseFirestoreDocument = (doc: FirestoreDocument): Contact => {
  const fields = doc.fields;
  const docId = doc.name.split('/').pop() || '';
  
  return {
    id: docId,
    name: fields.name?.stringValue || 'Unknown',
    phone: fields.phone?.integerValue || fields.phone?.stringValue || 'N/A',
    type: (fields.type?.stringValue as 'New' | 'Existing') || 'New',
    doctorId: fields.doctorId?.stringValue || '',
    status: fields.status?.stringValue || 'Pending',
    urgency: (fields.urgency?.stringValue as 'High' | 'Medium' | 'Low') || 'Medium',
    createdAt: fields.createdAt?.timestampValue 
      ? new Date(fields.createdAt.timestampValue) 
      : new Date(),
    keywords: fields.keywords?.arrayValue?.values?.map(v => v.stringValue || '') || [],
    appointmentDate: fields.appointmentDate?.timestampValue 
      ? new Date(fields.appointmentDate.timestampValue) 
      : undefined,
    totalVisits: fields.totalVisits?.integerValue 
      ? parseInt(fields.totalVisits.integerValue) 
      : 1,
    lastInteraction: fields.lastInteraction?.timestampValue 
      ? new Date(fields.lastInteraction.timestampValue) 
      : undefined,
    queryType: fields.queryType?.stringValue || 'General',
  };
};

// Fetch all contacts for the logged-in doctor
export const fetchDoctorContacts = async (): Promise<Contact[]> => {
  const { doctorId } = getCurrentDoctor();
  
  if (!doctorId) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await fetch(`${FIRESTORE_BASE_URL}/contacts`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch contacts');
    }

    const data = await response.json();
    
    if (!data.documents) {
      return [];
    }

    // Parse and filter contacts by doctorId
    const contacts: Contact[] = data.documents
      .map((doc: FirestoreDocument) => parseFirestoreDocument(doc))
      .filter((contact: Contact) => contact.doctorId === doctorId);

    return contacts;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};

// Get a single contact by ID
export const fetchContactById = async (contactId: string): Promise<Contact | null> => {
  const { doctorId } = getCurrentDoctor();
  
  if (!doctorId) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await fetch(`${FIRESTORE_BASE_URL}/contacts/${contactId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch contact');
    }

    const doc = await response.json();
    const contact = parseFirestoreDocument(doc);

    // Verify this contact belongs to the logged-in doctor
    if (contact.doctorId !== doctorId) {
      return null;
    }

    return contact;
  } catch (error) {
    console.error('Error fetching contact:', error);
    throw error;
  }
};

// Calculate analytics from contacts
export const calculateAnalytics = (contacts: Contact[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalPatients = contacts.length;
  
  const newPatientsToday = contacts.filter(c => {
    const createdDate = new Date(c.createdAt);
    createdDate.setHours(0, 0, 0, 0);
    return createdDate.getTime() === today.getTime() && c.type === 'New';
  }).length;

  const existingPatients = contacts.filter(c => c.type === 'Existing').length;
  const newPatients = contacts.filter(c => c.type === 'New').length;

  const appointmentsToday = contacts.filter(c => {
    if (!c.appointmentDate) return false;
    const appointmentDate = new Date(c.appointmentDate);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate.getTime() === today.getTime();
  }).length;

  // Weekly data for charts (last 7 days)
  const weeklyData = getWeeklyData(contacts);
  
  // Query type distribution
  const queryTypeDistribution = getQueryTypeDistribution(contacts);

  // Weekly appointments trend (last 4 weeks)
  const appointmentsTrend = getAppointmentsTrend(contacts);

  return {
    totalPatients,
    newPatientsToday,
    existingPatients,
    newPatients,
    appointmentsToday,
    weeklyData,
    queryTypeDistribution,
    appointmentsTrend,
  };
};

const getWeeklyData = (contacts: Contact[]) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  // Calculate start of week (Monday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);

  const newPatients = days.map((_, index) => {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(startOfWeek.getDate() + index);
    
    return contacts.filter(c => {
      const createdDate = new Date(c.createdAt);
      createdDate.setHours(0, 0, 0, 0);
      return createdDate.getTime() === dayDate.getTime() && c.type === 'New';
    }).length;
  });

  const existingPatients = days.map((_, index) => {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(startOfWeek.getDate() + index);
    
    return contacts.filter(c => {
      const createdDate = new Date(c.createdAt);
      createdDate.setHours(0, 0, 0, 0);
      return createdDate.getTime() === dayDate.getTime() && c.type === 'Existing';
    }).length;
  });

  return { days, newPatients, existingPatients };
};

const getQueryTypeDistribution = (contacts: Contact[]) => {
  const types = ['Booking', 'FAQs', 'Follow-up', 'Emergency', 'Reports'];
  const distribution = types.map(type => 
    contacts.filter(c => c.queryType === type).length
  );
  
  // If no query types, generate sample data
  if (distribution.every(d => d === 0)) {
    return {
      labels: types,
      data: [12, 8, 15, 5, 10]
    };
  }
  
  return { labels: types, data: distribution };
};

const getAppointmentsTrend = (contacts: Contact[]) => {
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const today = new Date();
  
  const trend = weeks.map((_, weekIndex) => {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - ((3 - weekIndex) * 7 + 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    
    return contacts.filter(c => {
      if (!c.appointmentDate) return false;
      const appointmentDate = new Date(c.appointmentDate);
      return appointmentDate >= weekStart && appointmentDate < weekEnd;
    }).length;
  });

  // If no appointments, generate sample data
  if (trend.every(t => t === 0)) {
    return { weeks, data: [18, 25, 22, 30] };
  }

  return { weeks, data: trend };
};
