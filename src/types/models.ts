// User Types
export interface HealthParameters {
  height?: number;
  weight?: number;
  bmi?: number;
  bloodType?: string;
  allergies?: string[];
  chronicConditions?: string[];
}

export interface User {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  address?: string;
  nationality?: string;
  profileImage?: string;
  weight?: number;
  height?: number;
  bmi?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  healthParameters?: HealthParameters;
  riskLevel?: 'low' | 'moderate' | 'high';
  lastTestDate?: string;
  roles?: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn?: number;
  user: UserProfile;
  profileComplete?: boolean;
  message?: string;
  success?: boolean;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  profileComplete: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface GoogleAuthData {
  idToken: string;
  accessToken?: string;
}

export interface OTPVerification {
  email: string;
  otp: string;
}

// Doctor Types
export type DoctorSpecialty = 
  | 'cardiologist'
  | 'general'
  | 'neurologist'
  | 'dermatologist'
  | 'pediatrician'
  | 'orthopedic'
  | 'gynecologist'
  | 'ophthalmologist'
  | 'psychiatrist'
  | 'endocrinologist';

export type AppointmentType = 'video' | 'audio' | 'in_person' | 'chat';

export interface Doctor {
  id: string;
  name: string;
  specialty: DoctorSpecialty;
  hospital: string;
  experience: number;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  about?: string;
  qualifications: string[];
  availableDays: string[];
  consultationFee: number;
  consultationFees?: Record<string, number>;
  isAvailable: boolean;
  phone?: string;
  email?: string;
}

export interface DoctorSummary {
  id: string;
  name: string;
  specialty: DoctorSpecialty;
  hospital: string;
  rating: number;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  doctor: DoctorSummary;
  date: string;
  time: string;
  type: AppointmentType;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

export interface AppointmentBookingForm {
  doctorId: string;
  date: string;
  time: string;
  type: AppointmentType;
  notes?: string;
}

export interface AppointmentBookingRequest {
  userId: string | number;
  doctorId: string;
  email: string;
  date: string;
  time: string;
  specialty: string;
  qualifications: string;
  doctorName: string;
  type: string;
  status: string;
  notes?: string;
}

// Jendo Test Types
export type RiskLevel = 'low' | 'moderate' | 'high';

export interface JendoTest {
  id: string;
  userId: string;
  userName?: string;
  testDate: string;
  testTime?: string;
  riskLevel: RiskLevel;
  score: number;
  heartRate?: number;
  bloodPressure?: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  spo2?: number;
  ecgData?: string;
  analysis?: string;
  suggestions?: string[];
  createdAt: string;
}

export interface JendoTestSummary {
  id: string;
  testDate: string;
  riskLevel: RiskLevel;
  score: number;
}

export interface TestStatistics {
  totalTests: number;
  averageScore: number;
  lastTestDate: string;
  riskTrend: 'improving' | 'stable' | 'declining';
  testHistory: {
    date: string;
    score: number;
    riskLevel: RiskLevel;
  }[];
}

export interface RiskIndicator {
  level: RiskLevel;
  label: string;
  description: string;
  color: string;
  backgroundColor: string;
}

// Medical Record Types
export type IllnessCategory = 
  | 'diabetes'
  | 'cardiovascular'
  | 'pregnancy'
  | 'respiratory'
  | 'allergy'
  | 'general'
  | 'other';

export interface MedicalFolder {
  id: string;
  name: string;
  category: IllnessCategory;
  icon: string;
  color: string;
  recordCount: number;
  lastUpdated?: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'pdf' | 'document';
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

export interface MedicalRecord {
  id: string;
  userId: string;
  folderId: string;
  category: IllnessCategory;
  title: string;
  description?: string;
  date: string;
  doctorName?: string;
  hospitalName?: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecordForm {
  title: string;
  category: IllnessCategory;
  date: string;
  doctorName?: string;
  hospitalName?: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  attachments?: File[];
}

// Wellness Types
export type WellnessCategory = 'diet' | 'exercise' | 'sleep' | 'stress' | 'general' | 'chatbot' | 'learning';
export type ContentType = 'article' | 'video' | 'tutorial' | 'tip';

export interface WellnessTip {
  id: string;
  category: WellnessCategory;
  title: string;
  description: string;
  content?: string;
  imageUrl?: string;
  riskLevel?: 'low' | 'moderate' | 'high' | 'all';
  createdAt: string;
}

export interface LearningMaterial {
  id: string;
  type: ContentType;
  category: WellnessCategory;
  title: string;
  description: string;
  content?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  duration?: number;
  author: string;
  publishedAt: string;
  viewCount: number;
  isFeatured: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface WellnessRecommendation {
  id: string;
  category: WellnessCategory;
  title: string;
  description: string;
  icon: string;
  priority: number;
}

// Notification Types
export type NotificationType = 
  | 'risk_alert'
  | 'test_reminder'
  | 'appointment_reminder'
  | 'wellness_tip'
  | 'doctor_recommendation'
  | 'learning_update'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationPreferences {
  riskAlerts: boolean;
  testReminders: boolean;
  appointmentReminders: boolean;
  wellnessTips: boolean;
  learningUpdates: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

// Dashboard Types
export interface DashboardSummary {
  lastJendoScore?: number;
  riskLevel?: RiskLevel;
  nextAppointment?: Appointment;
  upcomingTests?: JendoTest[];
  recentMedicalRecords?: MedicalRecord[];
  wellnessRecommendations?: WellnessRecommendation[];
}

// Report Category Types (Medical Records v2)
export interface ReportCategory {
  id: number;
  name: string;
  icon?: string;
  createdAt: string;
  lastUpdated: string;
  sections?: ReportSection[];
}

export interface ReportSection {
  id: number;
  name: string;
  icon?: string | null;
  description?: string | null;
  categoryId: number;
  categoryName: string;
  items?: ReportItem[];
}

export interface ReportItem {
  id: number;
  name: string;
  description?: string | null;
  icon?: string | null;
  sectionId: number;
  sectionName: string;
}

export interface ReportValueAttachment {
  id: number;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
  reportItemValueId: number;
  downloadUrl: string;
}

export interface ReportValue {
  id: number;
  reportItemId: number;
  reportItemName: string;
  userId: number;
  valueNumber?: number | null;
  valueText?: string | null;
  valueDate: string;
  createdAt: string;
  updatedAt: string;
  attachments: ReportValueAttachment[];
}

export interface ReportValueRequest {
  reportItemId: number;
  userId: number;
  valueNumber?: number;
  valueText?: string;
  valueDate: string;
}
