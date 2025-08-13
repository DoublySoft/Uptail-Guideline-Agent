'use client';

import { useState, useEffect, useCallback } from 'react';
import { GuidelineUsage } from '@/types/guideline-usage';

interface GuidelineUsageDetailsProps {
  sessionId: string;
  selectedUsage?: GuidelineUsage;
  onClose: () => void;
}

export default function GuidelineUsageDetails({ sessionId, selectedUsage, onClose }: GuidelineUsageDetailsProps) {
  const [guidelineUsages, setGuidelineUsages] = useState<GuidelineUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuidelineUsages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sessions/${sessionId}/guideline-usage`);
      const data = await response.json();
      
      if (data.success) {
        setGuidelineUsages(data.data);
      } else {
        setError(data.error || 'Failed to fetch guideline usages');
      }
    } catch {
      setError('Failed to fetch guideline usages');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      fetchGuidelineUsages();
    }
  }, [sessionId, fetchGuidelineUsages]);

  const getStrengthColor = (strength: string) => {
    return strength === 'hard' 
      ? 'bg-red-100 text-red-800 border-red-200' 
      : 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (priority >= 6) return 'bg-red-100 text-red-800 border-red-200';
    if (priority >= 4) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  if (!selectedUsage) {
    return null;
  }

  // Filter guidelines to show only those for the selected message
  const messageGuidelines = guidelineUsages.filter(usage => usage.messageId === selectedUsage.messageId);

  return (
    <div className="bg-white rounded-lg shadow h-full min-h-[600px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0 bg-white">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Directrices utilizadas</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 bg-gray-50">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ) : error ? (
          <div className="text-red-600 text-sm bg-white p-4 rounded-lg border border-red-200">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Guidelines for the selected message */}
            <div>
              <div className="space-y-4">
                {messageGuidelines.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-4">📝</div>
                    <p className="text-gray-600">No se encontraron directrices para este mensaje</p>
                  </div>
                ) : (
                  messageGuidelines.map((usage) => (
                    <div key={usage.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h5 className="font-semibold text-gray-900 text-lg">
                          {usage.guideline?.title || 'Directriz desconocida'}
                        </h5>
                        <div className="flex flex-col items-end space-y-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStrengthColor(usage.guideline?.strength || 'soft')}`}>
                            {usage.guideline?.strength === 'hard' ? 'Obligatorio' : 'Recomendado'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(usage.guideline?.priority || 1)}`}>
                            Prioridad {usage.guideline?.priority || 1}
                          </span>
                        </div>
                      </div>
                      
                      {usage.guideline && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
                          <p className="text-sm text-gray-800 leading-relaxed">
                            {usage.guideline.content}
                          </p>
                        </div>
                      )}

                      {usage.guideline?.triggers && usage.guideline.triggers.length > 0 && (
                        <div className="mb-3">
                          <span className="text-xs text-gray-700 font-medium block mb-2">Desencadenantes:</span>
                          <div className="flex flex-wrap gap-2">
                            {usage.guideline.triggers.map((trigger, index) => (
                              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                                {trigger}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Usado el {new Date(usage.usedAt).toLocaleString()}</span>
                        {usage.guideline?.singleUse && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                            Uso único
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Summary Statistics for the message */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Resumen del mensaje</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total directrices:</span>
                  <span className="ml-2 font-medium text-gray-900">{messageGuidelines.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Directrices obligatorias:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {messageGuidelines.filter(u => u.guideline?.strength === 'hard').length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Directrices recomendadas:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {messageGuidelines.filter(u => u.guideline?.strength === 'soft').length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Prioridad promedio:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {messageGuidelines.length > 0 
                      ? (messageGuidelines.reduce((sum, u) => sum + (u.guideline?.priority || 0), 0) / messageGuidelines.length).toFixed(1)
                      : '0'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
