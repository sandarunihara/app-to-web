import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, DollarSign, MapPin, X, Edit2 } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { useToast } from '../../providers/ToastProvider';
import { doctorApi } from '../doctors/services/doctorApi';
import type { Appointment } from '../../types/models';

export function AppointmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  // Removed unused imports

  useEffect(() => {
    const loadAppointment = async () => {
      if (!id) return;
      try {
        // Loading appointment
        const data = await doctorApi.getAppointmentById(id);
        setAppointment(data);
      } catch (error: any) {
        showToast(error.message || 'Failed to load appointment', 'error');
        navigate('/doctors');
      } finally {
        // Done loading
      }
    };

    loadAppointment();
  }, [id]);

  const handleCancel = async () => {
    if (!id || !window.confirm('Are you sure you want to cancel this appointment?')) return;

    setCancelLoading(true);
    try {
      await doctorApi.cancelAppointment(id);
      showToast('Appointment cancelled successfully', 'success');
      setTimeout(() => navigate('/doctors'), 2000);
    } catch (error: any) {
      showToast(error.message || 'Failed to cancel appointment', 'error');
    } finally {
      setCancelLoading(false);
    }
  };

  if (!appointment) {
    return (
      <ScreenWrapper className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </ScreenWrapper>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'yellow',
    scheduled: 'blue',
    confirmed: 'green',
    cancelled: 'red',
    completed: 'blue',
  };

  const statusColor = statusColors[appointment.status?.toLowerCase() || 'pending'];

  return (
    <ScreenWrapper className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Appointment</h2>
            <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize bg-${statusColor}-100 text-${statusColor}-700`}>
              {appointment.status}
            </span>
          </div>

          {/* Doctor Info */}
          <div className="border-b pb-6 mb-6">
            <p className="text-sm text-gray-500 mb-2">With</p>
            <p className="text-xl font-bold text-gray-900">{appointment.doctor?.name}</p>
            <p className="text-gray-600">{appointment.doctor?.specialty}</p>
          </div>

          {/* Appointment Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="flex gap-4">
              <Calendar className="text-blue-500 flex-shrink-0" size={24} />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="text-lg font-semibold text-gray-900">{appointment.date}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Clock className="text-green-500 flex-shrink-0" size={24} />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="text-lg font-semibold text-gray-900">{appointment.time}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <DollarSign className="text-yellow-500 flex-shrink-0" size={24} />
              <div>
                <p className="text-sm text-gray-500">Consultation Fee</p>
                <p className="text-lg font-semibold text-gray-900">$${appointment.doctor ? `${appointment.doctor.id}` : 'N/A'}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <MapPin className="text-red-500 flex-shrink-0" size={24} />
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{appointment.type}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-gray-600">{appointment.notes}</p>
            </div>
          )}
        </div>

        {/* Doctor Contact Card */}
        {appointment.doctor && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Doctor Contact Information</h3>
            <div className="space-y-3">
              {appointment.doctor?.hospital && (
                <div className="flex gap-3">
                  <MapPin className="text-gray-400 flex-shrink-0" size={20} />
                  <p className="text-gray-700">{appointment.doctor.hospital}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {['pending', 'confirmed', 'scheduled'].includes(appointment.status?.toLowerCase() || '') && (
          <div className="flex gap-4">
            <button
              onClick={() => navigate(`/doctors/${appointment.doctorId}`)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <Edit2 size={20} />
              Reschedule
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelLoading}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <X size={20} />
              {cancelLoading ? 'Cancelling...' : 'Cancel Appointment'}
            </button>
          </div>
        )}
      </div>
    </ScreenWrapper>
  );
}
