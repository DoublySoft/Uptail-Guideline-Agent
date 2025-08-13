'use client';

import { useState, useEffect, useCallback } from 'react';
import { Session } from '@/types/session';

interface SessionsListProps {
  onSessionSelect: (session: Session) => void;
  selectedSessionId?: string;
}

export default function SessionsList({ onSessionSelect, selectedSessionId }: SessionsListProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sessions');
      const data = await response.json();
      
      if (data.success) {
        setSessions(data.data);
      } else {
        setError(data.error || 'Failed to fetch sessions');
      }
    } catch {
      setError('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      setDeletingSessionId(sessionId);
      const response = await fetch(`/api/sessions?id=${sessionId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove the deleted session from the list
        setSessions(prev => prev.filter(session => session.id !== sessionId));
        
        // If the deleted session was selected, clear the selection
        if (selectedSessionId === sessionId) {
          onSessionSelect({} as Session);
        }
      } else {
        setError(data.error || 'Failed to delete session');
      }
    } catch {
      setError('Failed to delete session');
    } finally {
      setDeletingSessionId(null);
      setShowDeleteConfirm(null);
    }
  }, [selectedSessionId, onSessionSelect]);

  const handleDeleteClick = (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setShowDeleteConfirm(sessionId);
  };

  const handleDeleteConfirm = (sessionId: string) => {
    deleteSession(sessionId);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(null);
  };

  const handleSelectAll = () => {
    if (selectedSessions.size === sessions.length) {
      setSelectedSessions(new Set());
    } else {
      setSelectedSessions(new Set(sessions.map(s => s.id)));
    }
  };

  const handleSessionSelect = (sessionId: string, checked: boolean) => {
    const newSelected = new Set(selectedSessions);
    if (checked) {
      newSelected.add(sessionId);
    } else {
      newSelected.delete(sessionId);
    }
    setSelectedSessions(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedSessions.size === 0) return;
    
    try {
      setBulkDeleting(true);
      const response = await fetch('/api/sessions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: Array.from(selectedSessions) }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove deleted sessions from the list
        setSessions(prev => prev.filter(session => !selectedSessions.has(session.id)));
        
        // Clear selection
        setSelectedSessions(new Set());
        
        // If any of the deleted sessions was selected, clear the selection
        if (selectedSessionId && selectedSessions.has(selectedSessionId)) {
          onSessionSelect({} as Session);
        }
      } else {
        setError(data.error || 'Failed to delete sessions');
      }
    } catch {
      setError('Failed to delete sessions');
    } finally {
      setBulkDeleting(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow h-full min-h-[400px] flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Conversaciones</h2>
        </div>
        <div className="flex-1 p-4">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow h-full min-h-[400px] flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Conversaciones</h2>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={fetchSessions}
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
    <div className="bg-white rounded-lg shadow h-full min-h-[400px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Conversaciones</h2>
          {sessions.length > 0 && (
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={selectedSessions.size === sessions.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Seleccionar todo</span>
              </label>
              {selectedSessions.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 flex items-center space-x-1"
                >
                  {bulkDeleting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Eliminando...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Eliminar ({selectedSessions.size})</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600">
          {sessions.length} conversación{sessions.length !== 1 ? 'es' : ''} disponible{sessions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {sessions.length === 0 ? (
          <div className="p-4 text-center">
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No hay conversaciones disponibles</p>
          </div>
        ) : (
          <div className="p-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`p-3 rounded-lg transition-colors mb-2 border ${
                  selectedSessionId === session.id
                    ? 'bg-blue-50 border-blue-200'
                    : 'hover:bg-gray-50 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {/* Bulk Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedSessions.has(session.id)}
                      onChange={(e) => handleSessionSelect(session.id, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                    />
                    
                    {/* Session Info */}
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => onSessionSelect(session)}
                    >
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        Conversación #{session.id.slice(-8)}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="ml-2 flex items-center space-x-2">
                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDeleteClick(session.id, e)}
                      disabled={deletingSessionId === session.id}
                      className={`p-1 rounded hover:bg-red-100 transition-colors ${
                        deletingSessionId === session.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Eliminar conversación"
                    >
                      {deletingSessionId === session.id ? (
                        <svg className="w-4 h-4 text-red-500 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                    
                    {/* Arrow Icon */}
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                
                {/* Delete Confirmation Dialog */}
                {showDeleteConfirm === session.id && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 mb-3">
                      ¿Estás seguro de que quieres eliminar esta conversación? 
                      Esta acción eliminará todos los mensajes y directrices utilizadas.
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDeleteConfirm(session.id)}
                        disabled={deletingSessionId === session.id}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        {deletingSessionId === session.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                      <button
                        onClick={handleDeleteCancel}
                        disabled={deletingSessionId === session.id}
                        className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
