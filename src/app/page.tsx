'use client';

import { useState } from 'react';
import GuidelinesList from '@/components/GuidelinesList';
import SessionsList from '@/components/SessionsList';
import MessagesList from '@/components/MessagesList';
import GuidelineUsageDetails from '@/components/GuidelineUsageDetails';
import SessionGuidelinesOverview from '@/components/SessionGuidelinesOverview';
import { Session } from '@/types/session';
import { GuidelineUsage } from '@/types/guideline-usage';

export default function Home() {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedUsage, setSelectedUsage] = useState<GuidelineUsage | null>(null);
  const [activeTab, setActiveTab] = useState<'guidelines' | 'sessions'>('sessions');
  const [guidelineView, setGuidelineView] = useState<'chat' | 'overview'>('chat');

  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session);
    setSelectedUsage(null);
    setGuidelineView('chat');
  };

  const handleGuidelineUsageSelect = (usage: GuidelineUsage) => {
    setSelectedUsage(usage);
  };

  const handleCloseSidebar = () => {
    setSelectedUsage(null);
  };

  const handleBackToSessions = () => {
    setSelectedSession(null);
    setSelectedUsage(null);
    setGuidelineView('chat');
  };

  const handleBackToChat = () => {
    setSelectedUsage(null);
  };

  const handleViewChange = (view: 'chat' | 'overview') => {
    setGuidelineView(view);
    setSelectedUsage(null);
  };

  // Mobile view states
  const showSessionsList = !selectedSession && !selectedUsage;
  const showChat = selectedSession && !selectedUsage && guidelineView === 'chat';
  const showOverview = selectedSession && !selectedUsage && guidelineView === 'overview';
  const showGuidelines = selectedUsage;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="h-screen flex flex-col">
        {/* Header Section */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Uptail Guidelines Agent
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Sistema de gestión de directrices para agentes de ventas. 
              Accede a las mejores prácticas y respuestas basadas en triggers y prioridades.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 justify-center">
                <button
                  onClick={() => setActiveTab('sessions')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'sessions'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Conversaciones
                </button>
                <button
                  onClick={() => setActiveTab('guidelines')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'guidelines'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Directrices
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content Section - Takes remaining height */}
        <div className="flex-1 min-h-0">
          {/* Tab Content */}
          {activeTab === 'guidelines' ? (
            <div className="h-full p-4 sm:p-6 lg:p-8">
              <GuidelinesList />
            </div>
          ) : (
            <div className="h-full">
              {/* Mobile Layout */}
              <div className="lg:hidden h-full relative">
                {showSessionsList && (
                  <div className="h-full p-4">
                    <SessionsList
                      onSessionSelect={handleSessionSelect}
                      selectedSessionId={undefined}
                    />
                  </div>
                )}

                {selectedSession && !showGuidelines && (
                  <div className="h-full relative">
                    {/* Back Button */}
                    <button
                      onClick={handleBackToSessions}
                      className="absolute top-4 left-4 z-20 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* View Toggle */}
                    <div className="absolute top-4 right-4 z-20 flex bg-white rounded-lg shadow-md p-1">
                      <button
                        onClick={() => handleViewChange('chat')}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${
                          guidelineView === 'chat'
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        Chat
                      </button>
                      <button
                        onClick={() => handleViewChange('overview')}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${
                          guidelineView === 'overview'
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        Resumen
                      </button>
                    </div>

                    {showChat && (
                      <div className="pt-20 h-full">
                        <MessagesList
                          sessionId={selectedSession.id}
                          onGuidelineUsageSelect={handleGuidelineUsageSelect}
                        />
                      </div>
                    )}

                    {showOverview && (
                      <div className="pt-20 h-full overflow-y-auto">
                        <SessionGuidelinesOverview
                          sessionId={selectedSession.id}
                          onGuidelineSelect={handleGuidelineUsageSelect}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Guideline Details - Full screen overlay on mobile */}
                {showGuidelines && selectedUsage && (
                  <div className="absolute inset-0 z-30 bg-white">
                    {/* Back Button */}
                    <button
                      onClick={handleBackToChat}
                      className="absolute top-4 left-4 z-40 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="pt-20 h-full">
                      <GuidelineUsageDetails
                        sessionId={selectedSession?.id || ''}
                        selectedUsage={selectedUsage}
                        onClose={handleBackToChat}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Layout */}
              <div className="hidden lg:grid lg:grid-cols-4 gap-6 h-full p-6">
                {/* Sessions List - Fixed height with scroll */}
                <div className="lg:col-span-1 min-h-0">
                  <SessionsList
                    onSessionSelect={handleSessionSelect}
                    selectedSessionId={selectedSession?.id}
                  />
                </div>

                {/* Main Content Area - Takes remaining height */}
                {selectedSession ? (
                  <div className="lg:col-span-2 min-h-0 flex flex-col">
                    {/* View Toggle */}
                    <div className="flex-shrink-0 mb-4 flex justify-center">
                      <div className="bg-white rounded-lg shadow-sm p-1 border border-gray-200">
                        <button
                          onClick={() => handleViewChange('chat')}
                          className={`px-4 py-2 text-sm rounded-md transition-colors ${
                            guidelineView === 'chat'
                              ? 'bg-blue-500 text-white'
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          Chat
                        </button>
                        <button
                          onClick={() => handleViewChange('overview')}
                          className={`px-4 py-2 text-sm rounded-md transition-colors ${
                            guidelineView === 'overview'
                              ? 'bg-blue-500 text-white'
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          Resumen de Directrices
                        </button>
                      </div>
                    </div>

                    {/* Content Area - Takes remaining height */}
                    <div className="flex-1 min-h-0">
                      {guidelineView === 'chat' ? (
                        <MessagesList
                          sessionId={selectedSession.id}
                          onGuidelineUsageSelect={handleGuidelineUsageSelect}
                        />
                      ) : (
                        <div className="h-full overflow-y-auto">
                          <SessionGuidelinesOverview
                            sessionId={selectedSession.id}
                            onGuidelineSelect={handleGuidelineUsageSelect}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="lg:col-span-2 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                      <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una Sesión</h3>
                      <p className="text-gray-500">
                        Elige una sesión del panel izquierdo para comenzar a chatear.
                      </p>
                    </div>
                  </div>
                )}

                {/* Guideline Details Sidebar - Fixed height with scroll */}
                <div className="lg:col-span-1 min-h-0">
                  {selectedUsage && (
                    <GuidelineUsageDetails
                      sessionId={selectedSession?.id || ''}
                      selectedUsage={selectedUsage}
                      onClose={handleCloseSidebar}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
