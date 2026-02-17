import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Video, Users, MessageSquare, ChevronRight, Filter } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { useToast } from '../../providers/ToastProvider';
import { useAuth } from '../../providers/AuthProvider';
import { doctorApi } from './services/doctorApi';
import type { Appointment } from '../../types/models';

export function AppointmentsList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const loadAppointments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await doctorApi.getUserAppointments(String(user.id));
      setAppointments(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getConsultationIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'video':
        return <Video size={18} />;
      case 'in_person':
        return <Users size={18} />;
      case 'chat':
        return <MessageSquare size={18} />;
      default:
        return <Users size={18} />;
    }
  };

  const getConsultationLabel = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'video':
        return 'Video Call';
      case 'in_person':
        return 'In-Person';
      case 'chat':
        return 'Chat';
      default:
        return 'In-Person';
    }
  };

  const filteredAppointments = appointments.filter(apt => 
    filterStatus === 'all' || apt.status?.toLowerCase() === filterStatus
  );

  if (loading) {
    return (
      <ScreenWrapper className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
          <p className="text-gray-600">View and manage your appointments</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={20} className="text-gray-400" />
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('scheduled')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filterStatus === 'scheduled'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Scheduled
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filterStatus === 'completed'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilterStatus('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filterStatus === 'cancelled'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {filterStatus === 'all' ? 'No appointments yet' : `No ${filterStatus} appointments`}
            </h3>
            <p className="text-gray-500 mb-6">
              {filterStatus === 'all' 
                ? "You haven't booked any appointments yet."
                : `You don't have any ${filterStatus} appointments.`
              }
            </p>
            {filterStatus === 'all' && (
              <button
                onClick={() => navigate('/doctors')}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Book an Appointment
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {appointment.doctor?.name || 'Doctor'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <p className="text-gray-600 capitalize">{appointment.doctor?.specialty}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Calendar size={20} className="text-blue-500 flex-shrink-0" />
                      <span className="font-medium">{appointment.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Clock size={20} className="text-green-500 flex-shrink-0" />
                      <span className="font-medium">{appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      {getConsultationIcon(appointment.type)}
                      <span className="font-medium">{getConsultationLabel(appointment.type)}</span>
                    </div>
                    {appointment.doctor?.hospital && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <User size={20} className="text-purple-500 flex-shrink-0" />
                        <span className="font-medium truncate">{appointment.doctor.hospital}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/appointments/${appointment.id}`)}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    View Details
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScreenWrapper>
  );
}
