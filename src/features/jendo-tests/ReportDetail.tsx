import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Calendar, Heart, BarChart3, FileText, ExternalLink } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { useToast } from '../../providers/ToastProvider';
import { jendoTestApi, type JendoTest } from '../../services/jendoTestApi';
import { jendoReportApi } from './services/jendoReportApi';

export function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [test, setTest] = useState<JendoTest | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    const loadReport = async () => {
      if (!id) return;
      try {
        // Loading test details
        const data = await jendoTestApi.getTestById(id);
        setTest(data);
      } catch (error: any) {
        showToast(error.message || 'Failed to load test details', 'error');
        navigate('/jendo-reports');
      } finally {
        // Done loading
      }
    };

    loadReport();
  }, [id]);

  const handleDownload = async () => {
    if (!id) return;
    setDownloadLoading(true);
    try {
      await jendoReportApi.downloadReport(id, 'test_report.pdf');
      showToast('Report downloaded successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to download report', 'error');
    } finally {
      setDownloadLoading(false);
    }
  };

  if (!test) {
    return (
      <ScreenWrapper className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </ScreenWrapper>
    );
  }

  const riskColorMap: Record<string, string> = {
    low: 'green',
    moderate: 'yellow',
    high: 'red',
  };

  const riskColor = riskColorMap[test.riskLevel?.toLowerCase() || 'low'];

  return (
    <ScreenWrapper className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/jendo-reports')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Test Report</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Test Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Jendo Test Results</h2>
            <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize bg-${riskColor}-100 text-${riskColor}-700`}>
              {test.riskLevel} Risk
            </span>
          </div>

          {/* Metrics Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Blood Pressure */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Heart size={20} className="text-red-500" />
                <span className="text-sm font-medium">Blood Pressure</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {test.bloodPressureSystolic}/{test.bloodPressureDiastolic} mmHg
              </p>
              <p className="text-xs text-gray-500 mt-1">Systolic/Diastolic</p>
            </div>

            {/* Heart Rate */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <BarChart3 size={20} className="text-blue-500" />
                <span className="text-sm font-medium">Heart Rate</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{test.heartRate || 'N/A'} bpm</p>
              <p className="text-xs text-gray-500 mt-1">Beats per minute</p>
            </div>

            {/* Test Date */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Calendar size={20} className="text-green-500" />
                <span className="text-sm font-medium">Test Date</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {new Date(test.createdAt || '').toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(test.createdAt || '').toLocaleTimeString()}
              </p>
            </div>

            {/* Risk Level */}
            <div className="border rounded-lg p-4">
              <span className="text-sm font-medium text-gray-600">Risk Assessment</span>
              <p className="text-2xl font-bold text-gray-900 mt-2 capitalize">{test.riskLevel}</p>
              <p className="text-xs text-gray-500 mt-1">
                {test.riskLevel === 'high' && 'Requires medical attention'}
                {test.riskLevel === 'moderate' && 'Monitor regularly'}
                {test.riskLevel === 'low' && 'Normal range'}
              </p>
            </div>
          </div>

          {/* Analysis */}
          {test.analysis && (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Analysis</h3>
              <p className="text-gray-600">{test.analysis}</p>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recommendations</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900">Regular Monitoring</p>
                <p className="text-sm text-gray-600">Continue monitoring your vital signs regularly</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900">Consult Your Doctor</p>
                <p className="text-sm text-gray-600">Schedule an appointment with your healthcare provider</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900">Maintain Wellness</p>
                <p className="text-sm text-gray-600">Check out our wellness tips for heart health</p>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Report Preview */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-blue-500" />
              <h3 className="text-lg font-bold text-gray-900">Report Preview</h3>
            </div>
            {test.reportPreviewUrl && (
              <a
                href={test.reportPreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                Open in new tab
                <ExternalLink size={14} />
              </a>
            )}
          </div>
          {test.reportPreviewUrl ? (
            <div className="w-full rounded-lg overflow-hidden border border-gray-200" style={{ height: '600px' }}>
              <iframe
                src={test.reportPreviewUrl}
                title="Report Preview"
                className="w-full h-full"
                style={{ border: 'none' }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <FileText size={48} className="mb-3" />
              <p className="text-sm">No report preview available</p>
            </div>
          )}
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={downloadLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={20} />
          {downloadLoading ? 'Downloading...' : 'Download Report'}
        </button>
      </div>
    </ScreenWrapper>
  );
}
