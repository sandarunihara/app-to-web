import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, DollarSign, Award, Video, Users, MessageSquare } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { useToast } from '../../providers/ToastProvider';
import { useAuth } from '../../providers/AuthProvider';
import { doctorApi } from './services/doctorApi';
import type { Doctor, TimeSlot, AppointmentBookingRequest, AppointmentType } from '../../types/models';

export function DoctorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [consultationType, setConsultationType] = useState<AppointmentType>('in_person');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const loadDoctor = async () => {
      if (!id) return;
      try {
        // Loading state managed through component state
        const data = await doctorApi.getDoctorById(id);
        setDoctor(data);
        
        // Load slots for today
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
        const doctorSlots = await doctorApi.getAvailableSlots(id, today);
        setSlots(doctorSlots);
      } catch (error: any) {
        showToast(error.message || 'Failed to load doctor details', 'error');
        navigate('/doctors');
      } finally {
        // Loading complete
      }
    };

    loadDoctor();
  }, [id]);

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    
    try {
      // Loading slots
      const doctorSlots = await doctorApi.getAvailableSlots(id!, date);
      setSlots(doctorSlots);
      setSelectedSlot(null);
    } catch (error: any) {
      showToast(error.message || 'Failed to load slots', 'error');
    } finally {
      // Done loading
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot) {
      showToast('Please select a time slot', 'error');
      return;
    }

    if (!user) {
      showToast('Please login to book an appointment', 'error');
      navigate('/login');
      return;
    }

    if (!doctor) {
      showToast('Doctor information not available', 'error');
      return;
    }

    setBookingLoading(true);
    try {
      const bookingRequest: Partial<AppointmentBookingRequest> = {
        userId: String(user.id),
        doctorId: id!,
        email: user.email,
        date: selectedDate,
        time: selectedSlot.time,
        specialty: doctor.specialty,
        qualifications: doctor.qualifications.join(', '),
        doctorName: doctor.name,
        type: consultationType,
        status: 'scheduled',
      };
      await doctorApi.bookAppointment(bookingRequest);
      showToast('Appointment booked successfully', 'success');
      setTimeout(() => navigate('/doctors'), 2000);
    } catch (error: any) {
      showToast(error.message || 'Failed to book appointment', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  if (!doctor) {
    return (
      <ScreenWrapper className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/doctors')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Doctor Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-6">
          <div className="grid md:grid-cols-4 gap-6">
            {/* Image */}
            <div>
              <img
                src={doctor.imageUrl || 'https://via.placeholder.com/200'}
                alt={doctor.name}
                className="w-full rounded-lg object-cover aspect-square"
              />
            </div>

            {/* Details */}
            <div className="md:col-span-3">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{doctor.name}</h2>
              <p className="text-lg text-gray-600 mb-4 capitalize">{doctor.specialty}</p>

              {/* Rating and Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-400" size={20} fill="currentColor" />
                  <span className="font-semibold">{doctor.rating?.toFixed(1)}/5</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="text-blue-500" size={20} />
                  <span className="font-semibold">{doctor.experience} years</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="text-green-500" size={20} />
                  <span className="font-semibold">${doctor.consultationFee}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {doctor.isAvailable ? (
                  <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Available Now
                  </span>
                ) : (
                  <span className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                    Not Available
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Hospital */}
          <div className="border-t mt-6 pt-6">
            <p className="text-sm text-gray-500 mb-1">Hospital / Clinic</p>
            <p className="text-lg font-semibold text-gray-900">{doctor.hospital}</p>
          </div>

          {/* About */}
          {doctor.about && (
            <div className="border-t mt-6 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-600 leading-relaxed">{doctor.about}</p>
            </div>
          )}

          {/* Qualifications */}
          {doctor.qualifications && doctor.qualifications.length > 0 && (
            <div className="border-t mt-6 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Qualifications</h3>
              {doctor.qualifications && doctor.qualifications.length > 0 && (
                <p className="text-gray-600">{doctor.qualifications.join(', ')}</p>
              )}
            </div>
          )}
        </div>

        {/* Booking Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Book Appointment</h3>

          <div className="space-y-6">
            {/* Consultation Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Consultation Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setConsultationType('in_person')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    consultationType === 'in_person'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Users size={24} />
                    <span className="text-sm font-medium">In-Person</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setConsultationType('video')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    consultationType === 'video'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Video size={24} />
                    <span className="text-sm font-medium">Video Call</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setConsultationType('chat')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    consultationType === 'chat'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <MessageSquare size={24} />
                    <span className="text-sm font-medium">Chat</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Time Slots */}
            {slots.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Available Time Slots
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {slots.map((slot) => (
                    <button
                      key={`${slot.time}`}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-lg font-medium border-2 transition-colors ${
                        selectedSlot?.time === slot.time
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <Clock size={16} />
                        {slot.time}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {slots.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
                No available slots for this date. Please select another date.
              </div>
            )}

            {/* Summary */}
            {selectedSlot && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-gray-900">Appointment Summary</h4>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Doctor:</span> {doctor.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date:</span> {selectedDate}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Time:</span> {selectedSlot.time}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Type:</span> <span className="capitalize">{consultationType.replace('_', ' ')}</span>
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Fee:</span> ${doctor.consultationFee}
                </p>
              </div>
            )}

            {/* Book Button */}
            <button
              onClick={handleBookAppointment}
              disabled={!selectedSlot || bookingLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium disabled:bg-gray-400"
            >
              {bookingLoading ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </div>
        </div>
      </div>
    </ScreenWrapper>
  );
}
