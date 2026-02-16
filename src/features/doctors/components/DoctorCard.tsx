import React from 'react';
import { Star, MapPin, Clock } from 'lucide-react';
import type { Doctor } from '../../../types';

interface DoctorCardProps {
    doctor: Doctor;
    onClick: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onClick }) => {
    return (
        <div
            onClick={() => onClick(doctor)}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-all hover:border-purple-200"
        >
            <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {doctor.imageUrl ? (
                        <img src={doctor.imageUrl} alt={doctor.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-600 font-bold text-xl">
                            {doctor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Dr. {doctor.name}</h3>
                            <p className="text-purple-600 font-medium text-sm">{doctor.specialty}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md">
                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-bold text-yellow-700">{doctor.rating}</span>
                        </div>
                    </div>

                    <div className="mt-3 space-y-1">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <MapPin size={14} />
                            <span className="truncate">{doctor.hospital}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Clock size={14} />
                            <span>{doctor.experience} years exp.</span>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <span className="font-bold text-gray-900">${doctor.consultationFee}</span>
                        <button className="px-3 py-1.5 bg-purple-50 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-100 transition-colors">
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
