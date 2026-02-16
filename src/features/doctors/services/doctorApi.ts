import { backendApi } from '../../../services/backendApi';
import { ENDPOINTS } from '../../../config/api.config';
import type { Doctor, Appointment, TimeSlot, DoctorSpecialty, AppointmentType } from '../../../types';

interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

interface PaginationResponse<T> {
  content: T[];
  page: number;
  size: number;
  total: number;
}

const mapSpecialty = (specialty: string): DoctorSpecialty => {
  const spec = specialty?.toLowerCase();
  if (spec === 'cardiologist' || spec === 'cardiology') return 'cardiologist';
  if (spec === 'neurologist' || spec === 'neurology') return 'neurologist';
  if (spec === 'pediatrician' || spec === 'pediatrics') return 'pediatrician';
  if (spec === 'dermatologist' || spec === 'dermatology') return 'dermatologist';
  if (spec === 'gynecologist' || spec === 'gynecology') return 'gynecologist';
  if (spec === 'ophthalmologist' || spec === 'ophthalmology') return 'ophthalmologist';
  if (spec === 'psychiatrist' || spec === 'psychiatry') return 'psychiatrist';
  if (spec === 'endocrinologist' || spec === 'endocrinology') return 'endocrinologist';
  if (spec === 'orthopedic' || spec === 'orthopedics') return 'orthopedic';
  if (spec === 'general' || spec === 'general practice' || spec === 'gp') return 'general';
  return 'general';
};

const normalizeQualifications = (qualifications: unknown, fallback?: unknown): string[] => {
  const source = qualifications ?? fallback;
  if (Array.isArray(source)) {
    return source.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof source === 'string') {
    return source.split(',').map((item) => item.trim()).filter(Boolean);
  }
  if (source) {
    return [String(source).trim()].filter(Boolean);
  }
  return [];
};

export const doctorApi = {
  getAllDoctors: async (page = 0, size = 50): Promise<Doctor[]> => {
    try {
      const response = await backendApi.get<ApiResponse<PaginationResponse<any>>>(
        `/doctors?page=${page}&size=${size}`
      );
      const data = response.data?.content || [];
      return data.map((dto: any) => ({
        id: dto.id,
        name: dto.name,
        specialty: mapSpecialty(dto.specialty),
        hospital: dto.hospital,
        rating: dto.rating || 0,
        reviewCount: dto.reviewCount || 0,
        experience: dto.experience || 0,
        imageUrl: dto.imageUrl,
        isAvailable: dto.isAvailable ?? true,
        consultationFee: dto.consultationFee || 0,
        about: dto.about,
        qualifications: normalizeQualifications(dto.qualifications, dto.qualification),
        availableDays: dto.availableDays || [],
      })) as Doctor[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch doctors');
    }
  },

  getDoctorById: async (id: string): Promise<Doctor> => {
    try {
      const response = await backendApi.get<ApiResponse<any>>(`/doctors/${id}`);
      const dto = response.data || response;
      return {
        id: dto.id,
        name: dto.name,
        specialty: mapSpecialty(dto.specialty),
        hospital: dto.hospital,
        rating: dto.rating || 0,
        reviewCount: dto.reviewCount || 0,
        experience: dto.experience || 0,
        imageUrl: dto.imageUrl,
        isAvailable: dto.isAvailable ?? true,
        consultationFee: dto.consultationFee || 0,
        about: dto.about,
        qualifications: normalizeQualifications(dto.qualifications, dto.qualification),
        availableDays: dto.availableDays || [],
      } as Doctor;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch doctor details');
    }
  },

  getDoctorsBySpecialty: async (specialty: DoctorSpecialty, page = 0, size = 50): Promise<Doctor[]> => {
    try {
      const response = await backendApi.get<ApiResponse<PaginationResponse<any>>>(
        `/doctors/specialty/${specialty}?page=${page}&size=${size}`
      );
      const data = response.data?.content || [];
      return data.map((dto: any) => ({
        id: dto.id,
        name: dto.name,
        specialty: mapSpecialty(dto.specialty),
        hospital: dto.hospital,
        rating: dto.rating || 0,
        reviewCount: dto.reviewCount || 0,
        experience: dto.experience || 0,
        imageUrl: dto.imageUrl,
        isAvailable: dto.isAvailable ?? true,
        consultationFee: dto.consultationFee || 0,
        about: dto.about,
        qualifications: normalizeQualifications(dto.qualifications, dto.qualification),
        availableDays: dto.availableDays || [],
      })) as Doctor[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch doctors by specialty');
    }
  },

  searchDoctors: async (query: string, page = 0, size = 50): Promise<Doctor[]> => {
    try {
      const response = await backendApi.get<ApiResponse<PaginationResponse<any>>>(
        `/doctors/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`
      );
      const data = response.data?.content || [];
      return data.map((dto: any) => ({
        id: dto.id,
        name: dto.name,
        specialty: mapSpecialty(dto.specialty),
        hospital: dto.hospital,
        rating: dto.rating || 0,
        reviewCount: dto.reviewCount || 0,
        experience: dto.experience || 0,
        imageUrl: dto.imageUrl,
        isAvailable: dto.isAvailable ?? true,
        consultationFee: dto.consultationFee || 0,
        about: dto.about,
        qualifications: normalizeQualifications(dto.qualifications, dto.qualification),
        availableDays: dto.availableDays || [],
      })) as Doctor[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search doctors');
    }
  },

  getAvailableSlots: async (doctorId: string, date: string): Promise<TimeSlot[]> => {
    try {
      const response = await backendApi.get<ApiResponse<TimeSlot[]>>(
        ENDPOINTS.DOCTORS.AVAILABLE_SLOTS(String(doctorId), date)
      );
      const data = (response as any).data || response;
      if (!Array.isArray(data)) {
        return [];
      }

      return data.map((slot: any) => {
        if (slot && typeof slot === 'object') {
          if (typeof slot.time === 'string') {
            return { time: slot.time, isAvailable: slot.isAvailable ?? true } as TimeSlot;
          }
          if (typeof slot.startTime === 'string') {
            return { time: slot.startTime, isAvailable: !slot.isBooked } as TimeSlot;
          }
        }
        if (typeof slot === 'string') {
          return { time: slot, isAvailable: true } as TimeSlot;
        }
        return { time: '', isAvailable: false } as TimeSlot;
      }).filter((slot: TimeSlot) => Boolean(slot.time));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch available slots');
    }
  },

  getAppointments: async (page = 0, size = 50): Promise<Appointment[]> => {
    try {
      const response = await backendApi.get<ApiResponse<PaginationResponse<any>>>(
        `/appointments?page=${page}&size=${size}`
      );
      const data = response.data?.content || [];
      return data.map((dto: any) => ({
        id: dto.id,
        doctorId: dto.doctorId,
        userId: dto.userId,
        doctor: dto.doctor,
        date: dto.date || dto.appointmentDate,
        time: dto.time || dto.appointmentTime,
        type: (dto.type || dto.consultationType || 'in_person') as AppointmentType,
        status: dto.status,
        notes: dto.notes,
        createdAt: dto.createdAt,
      })) as Appointment[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch appointments');
    }
  },

  getAppointmentById: async (id: string): Promise<Appointment> => {
    try {
      const response = await backendApi.get<ApiResponse<any>>(`/appointments/${id}`);
      const dto = response.data || response;
      return {
        id: dto.id,
        doctorId: dto.doctorId,
        userId: dto.userId,
        doctor: dto.doctor,
        date: dto.date || dto.appointmentDate,
        time: dto.time || dto.appointmentTime,
        type: (dto.type || dto.consultationType || 'in_person') as AppointmentType,
        status: dto.status,
        notes: dto.notes,
        createdAt: dto.createdAt,
      } as Appointment;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch appointment details');
    }
  },

  bookAppointment: async (appointmentData: Partial<Appointment>): Promise<Appointment> => {
    try {
      const response = await backendApi.post<ApiResponse<any>>('/appointments', appointmentData);
      const dto = response.data || response;
      return {
        id: dto.id,
        doctorId: dto.doctorId,
        userId: dto.userId,
        doctor: dto.doctor,
        date: dto.date || dto.appointmentDate,
        time: dto.time || dto.appointmentTime,
        type: (dto.type || dto.consultationType || 'in_person') as AppointmentType,
        status: dto.status,
        notes: dto.notes,
        createdAt: dto.createdAt,
      } as Appointment;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to book appointment');
    }
  },

  updateAppointment: async (id: string, data: Partial<Appointment>): Promise<Appointment> => {
    try {
      const response = await backendApi.put<ApiResponse<any>>(`/appointments/${id}`, data);
      const dto = response.data || response;
      return {
        id: dto.id,
        doctorId: dto.doctorId,
        userId: dto.userId,
        doctor: dto.doctor,
        date: dto.date || dto.appointmentDate,
        time: dto.time || dto.appointmentTime,
        type: (dto.type || dto.consultationType || 'in_person') as AppointmentType,
        status: dto.status,
        notes: dto.notes,
        createdAt: dto.createdAt,
      } as Appointment;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update appointment');
    }
  },

  cancelAppointment: async (id: string): Promise<void> => {
    try {
      await backendApi.put(`/appointments/${id}/cancel`, {});
    } catch (error: any) {
      throw new Error(error.message || 'Failed to cancel appointment');
    }
  },

  deleteAppointment: async (id: string): Promise<void> => {
    try {
      await backendApi.delete(`/appointments/${id}`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete appointment');
    }
  },

  getUserAppointments: async (userId: string, page = 0, size = 50): Promise<Appointment[]> => {
    try {
      const response = await backendApi.get<ApiResponse<PaginationResponse<any>>>(
        `/users/${userId}/appointments?page=${page}&size=${size}`
      );
      const data = response.data?.content || [];
      return data.map((dto: any) => ({
        id: dto.id,
        doctorId: dto.doctorId,
        userId: dto.userId,
        doctor: dto.doctor,
        date: dto.date || dto.appointmentDate,
        time: dto.time || dto.appointmentTime,
        type: (dto.type || dto.consultationType || 'in_person') as AppointmentType,
        status: dto.status,
        notes: dto.notes,
        createdAt: dto.createdAt,
      })) as Appointment[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch user appointments');
    }
  },
};
