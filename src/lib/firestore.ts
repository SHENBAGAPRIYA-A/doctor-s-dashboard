import { db, getCurrentDoctor } from './firebase';
import { collection, getDocs, doc, getDoc, query, orderBy, Timestamp } from 'firebase/firestore';

// Types for Contact
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

// Parse Firestore document to Contact interface
const parseFirestoreDocument = (docId: string, data: any): Contact => {
  // Parse createdAt
  let createdAt = new Date();
  if (data.createdAt) {
    if (data.createdAt instanceof Timestamp) {
      createdAt = data.createdAt.toDate();
    } else if (typeof data.createdAt === 'string') {
      createdAt = new Date(data.createdAt);
    }
  }

  // Determine if patient is "New" or "Existing" based on createdAt matching today's date
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
  const isCreatedToday = createdAt >= todayStart && createdAt <= todayEnd;
  const type: 'New' | 'Existing' = isCreatedToday ? 'New' : 'Existing';
  
  // type field contains query type (Booking, FAQs, etc.)
  const queryType = data.type || 'General';
  
  // number field contains phone
  const phone = data.number || 'N/A';
  
  // Parse appointment date from requested_booked_time
  let appointmentDate: Date | undefined;
  if (data.requested_booked_time) {
    if (data.requested_booked_time instanceof Timestamp) {
      appointmentDate = data.requested_booked_time.toDate();
    } else if (typeof data.requested_booked_time === 'string' && data.requested_booked_time !== 'null') {
      try {
        const dateStr = data.requested_booked_time;
        appointmentDate = new Date(dateStr.replace(' at ', 'T').replace('.', ':'));
      } catch {
        // Invalid date format
      }
    }
  }
  
  // Determine urgency based on query type
  const urgency: 'High' | 'Medium' | 'Low' = 
    queryType === 'Emergency' ? 'High' :
    queryType === 'Follow-up' ? 'Medium' : 'Low';

  // Parse lastInteraction
  let lastInteraction: Date | undefined;
  if (data.updatedAt) {
    if (data.updatedAt instanceof Timestamp) {
      lastInteraction = data.updatedAt.toDate();
    } else if (typeof data.updatedAt === 'string') {
      lastInteraction = new Date(data.updatedAt);
    }
  }
  
  return {
    id: docId,
    name: data.name || 'Unknown',
    phone: phone === 'N/A' || phone === null ? 'N/A' : String(phone),
    email: data.email || '',
    type,
    queryType,
    status: data.status || 'Pending',
    urgency,
    createdAt,
    intent: data.intent,
    transcript: data.transcript,
    appointmentDate,
    totalVisits: 1,
    lastInteraction,
  };
};

// Fetch ALL contacts from Firestore using SDK
export const fetchDoctorContacts = async (): Promise<Contact[]> => {
  try {
    console.log('Fetching contacts from Firestore...');
    
    const contactsRef = collection(db, 'contacts');
    const querySnapshot = await getDocs(contactsRef);
    
    console.log('Documents found:', querySnapshot.size);
    
    if (querySnapshot.empty) {
      console.log('No documents found');
      return [];
    }

    const contacts: Contact[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const parsed = parseFirestoreDocument(doc.id, data);
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

// Get a single contact by ID using SDK
export const fetchContactById = async (contactId: string): Promise<Contact | null> => {
  try {
    const contactRef = doc(db, 'contacts', contactId);
    const docSnap = await getDoc(contactRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    const contact = parseFirestoreDocument(docSnap.id, data);

    return contact;
  } catch (error) {
    console.error('Error fetching contact:', error);
    throw error;
  }
};

// Calculate analytics from contacts
export const calculateAnalytics = (contacts: Contact[]) => {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  const totalPatients = contacts.length;
  
  // New patients today = patients with createdAt matching today's date (type is already set based on createdAt)
  const newPatientsToday = contacts.filter(c => c.type === 'New').length;
  
  // Total new patients (same as newPatientsToday since type is based on today's date)
  const newPatients = newPatientsToday;
  
  // Existing patients = patients with createdAt NOT matching today's date
  const existingPatients = contacts.filter(c => c.type === 'Existing').length;

  // Appointments today - filter by appointmentDate matching today
  const appointmentsToday = contacts.filter(c => {
    if (!c.appointmentDate) return false;
    const appointmentDate = new Date(c.appointmentDate);
    return appointmentDate >= todayStart && appointmentDate <= todayEnd;
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
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  // Calculate start of week (Monday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);

  // New patients per day = patients created on that specific day
  const newPatients = days.map((_, index) => {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(startOfWeek.getDate() + index);
    const dayStart = new Date(dayDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    return contacts.filter(c => {
      const createdDate = new Date(c.createdAt);
      return createdDate >= dayStart && createdDate <= dayEnd;
    }).length;
  });

  // Existing patients per day = patients NOT created on that day (created before that day)
  const existingPatients = days.map((_, index) => {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(startOfWeek.getDate() + index);
    const dayStart = new Date(dayDate);
    dayStart.setHours(0, 0, 0, 0);
    
    return contacts.filter(c => {
      const createdDate = new Date(c.createdAt);
      return createdDate < dayStart;
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
