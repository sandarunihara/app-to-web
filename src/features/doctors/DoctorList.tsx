import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { doctorApi } from './services/doctorApi';
import type { Doctor } from '../../types/models';
import { DoctorCard } from './components/DoctorCard';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { useToast } from '../../providers/ToastProvider';

export const DoctorList: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [specialty, setSpecialty] = useState('');

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setLoading(true);
                const data = await doctorApi.getAllDoctors();
                setDoctors(data);
            } catch (error: any) {
                showToast(error.message || 'Failed to fetch doctors', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch =
            doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.hospital.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSpecialty = specialty === '' || doc.specialty.toLowerCase() === specialty.toLowerCase();

        return matchesSearch && matchesSpecialty;
    });

    const specialties = Array.from(new Set(doctors.map(d => d.specialty)));

    return (
        <ScreenWrapper>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Find a Doctor</h1>
                        <p className="text-sm text-gray-500 mt-1">Book appointments with top cardiovascular specialists</p>
                    </div>
                    {!loading && (
                        <p className="text-sm text-gray-400 font-medium">{filteredDoctors.length} doctors available</p>
                    )}
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-xl border border-gray-200/80 p-4">
                    <div className="flex gap-3 flex-col md:flex-row">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search doctors, specialties, hospitals..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-300 focus:bg-white transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            value={specialty}
                            onChange={(e) => setSpecialty(e.target.value)}
                            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-300 min-w-[180px]"
                        >
                            <option value="">All Specialties</option>
                            {specialties.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Doctor Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-xl bg-gray-100 animate-pulse"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse"></div>
                                        <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="h-3 bg-gray-100 rounded w-full animate-pulse mb-2"></div>
                                <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredDoctors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filteredDoctors.map(doctor => (
                            <div
                                key={doctor.id}
                                onClick={() => navigate(`/doctors/${doctor.id}`)}
                                className="cursor-pointer hover:shadow-md transition-shadow rounded-xl"
                            >
                                <DoctorCard
                                    doctor={doctor}
                                    onClick={(doc) => navigate(`/doctors/${doc.id}`)}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500 text-base mb-4">No doctors found matching your criteria</p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSpecialty('');
                            }}
                            className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </ScreenWrapper>
    );
};
