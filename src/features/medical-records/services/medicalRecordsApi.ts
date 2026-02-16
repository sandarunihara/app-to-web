export interface MedicalRecord {
    id: string;
    title: string;
    doctorName: string;
    hospitalName: string;
    date: string;
    type: 'Prescription' | 'Lab Report' | 'Diagnosis' | 'Other';
    fileUrl?: string; // URL to view/download
    fileName?: string;
}

export const medicalRecordsApi = {
    getAllRecords: async (): Promise<MedicalRecord[]> => {
        // Mock data
        return [
            {
                id: '1',
                title: 'General Checkup Prescription',
                doctorName: 'Dr. Sarah Johnson',
                hospitalName: 'City General Hospital',
                date: '2023-10-15',
                type: 'Prescription',
                fileName: 'prescription_oct15.pdf'
            },
            {
                id: '2',
                title: 'Blood Test Results',
                doctorName: 'Lab Corp',
                hospitalName: 'City General Hospital',
                date: '2023-10-12',
                type: 'Lab Report',
                fileName: 'blood_test_results.pdf'
            },
            {
                id: '3',
                title: 'MRI Scan Report',
                doctorName: 'Dr. Michael Chen',
                hospitalName: 'St. Mary\'s Medical Center',
                date: '2023-09-05',
                type: 'Lab Report',
                fileName: 'mri_scan.pdf'
            }
        ];
    },

    uploadRecord: async (file: File, metadata: any): Promise<MedicalRecord> => {
        // Mock upload
        return {
            id: Math.random().toString(),
            title: metadata.title || file.name,
            doctorName: metadata.doctorName || 'Unknown',
            hospitalName: metadata.hospitalName || 'Unknown',
            date: new Date().toISOString().split('T')[0],
            type: metadata.type || 'Other',
            fileName: file.name
        };
    },

    deleteRecord: async (id: string): Promise<void> => {
        // Mock delete
        console.log('Deleting record', id);
    }
};
