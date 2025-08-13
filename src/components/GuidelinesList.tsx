'use client';

import { useState, useEffect, useCallback } from 'react';
import { Guideline } from '@/types/guideline';

export default function GuidelinesList() {
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuidelines = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/guidelines');
      const data = await response.json();
      
      if (data.success) {
        setGuidelines(data.data);
      } else {
        setError(data.error || 'Failed to fetch guidelines');
      }
    } catch {
      setError('Failed to fetch guidelines');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuidelines();
  }, [fetchGuidelines]);

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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow h-full min-h-[600px] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Directrices del Sistema</h2>
          <p className="text-gray-600">Todas las directrices disponibles para los agentes de ventas</p>
        </div>
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Directrices del Sistema</h2>
          <p className="text-gray-600">Todas las directrices disponibles para los agentes de ventas</p>
        </div>
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={fetchGuidelines}
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Directrices del Sistema</h2>
        <p className="text-gray-600">Todas las directrices disponibles para los agentes de ventas</p>
        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
          <span>Total: {guidelines.length} directrices</span>
          <span>•</span>
          <span>Obligatorias: {guidelines.filter(g => g.strength === 'hard').length}</span>
          <span>•</span>
          <span>Recomendadas: {guidelines.filter(g => g.strength === 'soft').length}</span>
        </div>
      </div>

      {/* Guidelines List */}
      <div className="flex-1 overflow-y-auto min-h-0 p-6">
        {guidelines.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <p className="text-gray-600 text-lg">No hay directrices disponibles</p>
            <p className="text-gray-500 text-sm">Las directrices aparecerán aquí cuando se creen</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {guidelines.map((guideline) => (
              <div key={guideline.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1 mr-4">
                    {guideline.title}
                  </h3>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStrengthColor(guideline.strength)}`}>
                      {guideline.strength === 'hard' ? 'Obligatorio' : 'Recomendado'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(guideline.priority)}`}>
                      Prioridad {guideline.priority}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">
                    {guideline.content}
                  </p>
                </div>

                {guideline.triggers.length > 0 && (
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-700 block mb-2">Desencadenantes:</span>
                    <div className="flex flex-wrap gap-2">
                      {guideline.triggers.map((trigger, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200">
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    {guideline.singleUse && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                        Uso único
                      </span>
                    )}
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
