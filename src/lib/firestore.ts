import { FIRESTORE_BASE_URL, getCurrentDoctor } from './firebase';

// Types for Firestore document
export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: 'New' | 'Existing';
  queryType: string;
  status: string;
  urgency: 'High' | 'Medium' | 'Low';
  createdAt: Date;
  intent?: string;
  transcript?: string;
  appointmentDate?: Date;
  totalVisits?: number;
  lastInteraction?: Date;
}

interface FirestoreValue {
  stringValue?: string;
  integerValue?: string;
  timestampValue?: string;
  nullValue?: null;
  arrayValue?: { values?: Array<{ stringValue?: string }> };
}

interface FirestoreDocument {
  name: string;
  fields: Record<string, FirestoreValue>;
  createTime: string;
  updateTime: string;
}

// Parse Firestore document format - matching actual database fields
const parseFirestoreDocument = (doc: FirestoreDocument): Contact => {
  const fields = doc.fields;
  const docId = doc.name.split('/').pop() || '';
  
  // patient_type field contains "new" or "existing"
  const patientType = fields.patient_type?.stringValue?.toLowerCase() || 'new';
  const type: 'New' | 'Existing' = patientType === 'existing' ? 'Existing' : 'New';
  
  // type field contains query type (Booking, FAQs, etc.)
  const queryType = fields.type?.stringValue || 'General';
  
  // number field contains phone
  const phone = fields.number?.stringValue || fields.number?.integerValue || 'N/A';
  
  // Parse appointment date from requested_booked_time
  let appointmentDate: Date | undefined;
  if (fields.requested_booked_time?.timestampValue) {
    appointmentDate = new Date(fields.requested_booked_time.timestampValue);
  } else if (fields.requested_booked_time?.stringValue && fields.requested_booked_time.stringValue !== 'null') {
    // Try to parse string date like "2025-12-31 at 9.00"
    try {
      const dateStr = fields.requested_booked_time.stringValue;
      appointmentDate = new Date(dateStr.replace(' at ', 'T').replace('.', ':'));
    } catch {
      // Invalid date format
    }
  }
  
  // Determine urgency based on query type
  const urgency: 'High' | 'Medium' | 'Low' = 
    queryType === 'Emergency' ? 'High' :
    queryType === 'Follow-up' ? 'Medium' : 'Low';
  
  return {
    id: docId,
    name: fields.name?.stringValue || 'Unknown',
    phone: phone === 'N/A' || phone === null ? 'N/A' : String(phone),
    email: fields.email?.stringValue || '',
    type,
    queryType,
    status: fields.status?.stringValue || 'Pending',
    urgency,
    createdAt: doc.createTime ? new Date(doc.createTime) : new Date(),
    intent: fields.intent?.stringValue,
    transcript: fields.transcript?.stringValue,
    appointmentDate,
    totalVisits: 1,
    lastInteraction: doc.updateTime ? new Date(doc.updateTime) : undefined,
  };
};

// Fetch ALL contacts from Firestore
export const fetchDoctorContacts = async (): Promise<Contact[]> => {
  const url = `${FIRESTORE_BASE_URL}/contacts`;
  
  try {
    console.log('Fetching contacts from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch contacts:', response.status, errorText);
      throw new Error(`Failed to fetch contacts: ${response.status}`);
    }

    const data = await response.json();
    console.log('Firestore raw response:', data);
    
    if (!data.documents || data.documents.length === 0) {
      console.log('No documents found in response');
      return [];
    }

    // Parse all contacts
    const contacts: Contact[] = data.documents.map((doc: FirestoreDocument) => {
      const parsed = parseFirestoreDocument(doc);
      console.log('Parsed document:', parsed);
      return parsed;
    });
    
    console.log('Total parsed contacts:', contacts.length);
    return contacts;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};

// Get a single contact by ID
export const fetchContactById = async (contactId: string): Promise<Contact | null> => {
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

  // Count escalations (High urgency patients)
  const escalations = contacts.filter(c => c.urgency === 'High').length;

  // Weekly data for charts (last 7 days)
  const weeklyData = getWeeklyData(contacts);
  
  // Escalation distribution by urgency
  const escalationData = getEscalationData(contacts);

  // Weekly appointments trend (last 4 weeks)
  const appointmentsTrend = getAppointmentsTrend(contacts);

  return {
    totalPatients,
    newPatientsToday,
    existingPatients,
    newPatients,
    appointmentsToday,
    escalations,
    weeklyData,
    escalationData,
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

const getEscalationData = (contacts: Contact[]) => {
  const urgencyLevels = ['High', 'Medium', 'Low'];
  const distribution = urgencyLevels.map(level => 
    contacts.filter(c => c.urgency === level).length
  );
  
  return { labels: urgencyLevels, data: distribution };
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

  return { weeks, data: trend };
};
