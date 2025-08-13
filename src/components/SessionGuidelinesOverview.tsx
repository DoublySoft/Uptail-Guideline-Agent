'use client';

import { useState, useEffect, useCallback } from 'react';
import { GuidelineUsage } from '@/types/guideline-usage';
import { Message } from '@/types/message';

interface SessionGuidelinesOverviewProps {
  sessionId: string;
  onGuidelineSelect?: (usage: GuidelineUsage) => void;
}

export default function SessionGuidelinesOverview({ sessionId, onGuidelineSelect }: SessionGuidelinesOverviewProps) {
  const [guidelineUsages, setGuidelineUsages] = useState<GuidelineUsage[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch both guideline usages and messages
      const [guidelineResponse, messagesResponse] = await Promise.all([
        fetch(`/api/sessions/${sessionId}/guideline-usage`),
        fetch(`/api/sessions/${sessionId}/messages`)
      ]);

      const guidelineData = await guidelineResponse.json();
      const messagesData = await messagesResponse.json();

      if (guidelineData.success && messagesData.success) {
        setGuidelineUsages(guidelineData.data);
        setMessages(messagesData.data);
      } else {
        setError('Failed to fetch session data');
      }
    } catch {
      setError('Failed to fetch session data');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      fetchData();
    }
  }, [sessionId, fetchData]);

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

  const getStrengthIcon = (strength: string) => {
    return strength === 'hard' ? '🔴' : '🟡';
  };

  const getPriorityIcon = (priority: number) => {
    if (priority >= 8) return '🔥';
    if (priority >= 6) return '⚡';
    if (priority >= 4) return '⚠️';
    return '✅';
  };

  // Group guidelines by message
  const guidelinesByMessage = messages
    .filter(msg => msg.role === 'assistant')
    .map(message => {
      const messageGuidelines = guidelineUsages.filter(usage => usage.messageId === message.id);
      return { message, guidelines: messageGuidelines };
    })
    .filter(({ guidelines }) => guidelines.length > 0);

  // Calculate statistics
  const totalGuidelines = guidelineUsages.length;
  const hardGuidelines = guidelineUsages.filter(u => u.guideline?.strength === 'hard').length;
  const softGuidelines = guidelineUsages.filter(u => u.guideline?.strength === 'soft').length;
  const messagesWithGuidelines = guidelinesByMessage.length;
  const averageGuidelinesPerMessage = messagesWithGuidelines > 0 ? (totalGuidelines / messagesWithGuidelines).toFixed(1) : '0';

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow h-full min-h-[600px] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Resumen de Directrices de la Sesión</h2>
          <p className="text-gray-600">Vista completa de todas las directrices aplicadas en esta conversación</p>
        </div>
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow h-full min-h-[600px] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Resumen de Directrices de la Sesión</h2>
          <p className="text-gray-600">Vista completa de todas las directrices aplicadas en esta conversación</p>
        </div>
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow h-full min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Resumen de Directrices de la Sesión</h2>
        <p className="text-gray-600">Vista completa de todas las directrices aplicadas en esta conversación</p>
      </div>

      {/* Statistics Cards */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Directrices</p>
                <p className="text-2xl font-bold text-blue-900">{totalGuidelines}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">🔴</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-600">Obligatorias</p>
                <p className="text-2xl font-bold text-red-900">{hardGuidelines}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">🟡</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600">Recomendadas</p>
                <p className="text-2xl font-bold text-yellow-900">{softGuidelines}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">💬</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Promedio por Mensaje</p>
                <p className="text-2xl font-bold text-green-900">{averageGuidelinesPerMessage}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guidelines by Message */}
      <div className="flex-1 overflow-y-auto min-h-0 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Directrices por Mensaje del Asistente</h3>
        
        {guidelinesByMessage.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <p className="text-gray-600 text-lg">No se han aplicado directrices en esta sesión</p>
            <p className="text-gray-500 text-sm">Las directrices aparecerán aquí cuando el asistente las utilice</p>
          </div>
        ) : (
          <div className="space-y-6">
            {guidelinesByMessage.map(({ message, guidelines }) => (
              <div key={message.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-700">
                        Mensaje del Asistente
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                        {guidelines.length} directriz{guidelines.length !== 1 ? 'es' : ''}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  {/* Message content preview */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {message.content}
                    </p>
                  </div>

                  {/* Guidelines grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {guidelines.map((usage) => (
                      <div 
                        key={usage.id} 
                        className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => onGuidelineSelect?.(usage)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm leading-tight">
                            {usage.guideline?.title || 'Directriz desconocida'}
                          </h4>
                          <div className="flex items-center space-x-1">
                            <span className="text-lg">
                              {getStrengthIcon(usage.guideline?.strength || 'soft')}
                            </span>
                            <span className="text-lg">
                              {getPriorityIcon(usage.guideline?.priority || 1)}
                            </span>
                          </div>
                        </div>

                        {usage.guideline && (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {usage.guideline.content}
                            </p>
                            
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStrengthColor(usage.guideline.strength)}`}>
                                {usage.guideline.strength === 'hard' ? 'Obligatorio' : 'Recomendado'}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(usage.guideline.priority)}`}>
                                P{usage.guideline.priority}
                              </span>
                            </div>

                            {usage.guideline.triggers.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {usage.guideline.triggers.slice(0, 2).map((trigger, index) => (
                                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                    {trigger}
                                  </span>
                                ))}
                                {usage.guideline.triggers.length > 2 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    +{usage.guideline.triggers.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="text-xs text-gray-500 mt-2 text-right">
                          {new Date(usage.usedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
