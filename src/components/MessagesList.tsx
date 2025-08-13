'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Message } from '@/types/message';
import { GuidelineUsage } from '@/types/guideline-usage';

interface MessagesListProps {
  sessionId: string;
  onGuidelineUsageSelect?: (usage: GuidelineUsage) => void;
}

export default function MessagesList({ sessionId, onGuidelineUsageSelect }: MessagesListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messageGuidelines, setMessageGuidelines] = useState<Map<string, GuidelineUsage[]>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sessions/${sessionId}/messages`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.data);
        
        // Fetch guidelines for all assistant messages
        const assistantMessages = data.data.filter((msg: Message) => msg.role === 'assistant');
        await Promise.all(
          assistantMessages.map(async (message: Message) => {
            try {
              const guidelineResponse = await fetch(`/api/messages/${message.id}/guideline-usage`);
              const guidelineData = await guidelineResponse.json();
              if (guidelineData.success) {
                setMessageGuidelines(prev => new Map(prev).set(message.id, guidelineData.data));
              }
            } catch (error) {
              console.error(`Failed to fetch guidelines for message ${message.id}:`, error);
            }
          })
        );
      } else {
        setError(data.error || 'Failed to fetch messages');
      }
    } catch {
      setError('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      fetchMessages();
    }
  }, [sessionId, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  };

  const addMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const userMessage = newMessage.trim();
      setNewMessage('');
      
      // Add user message to UI immediately for better UX
      const tempUserMessage = {
        id: `temp-${Date.now()}`,
        sessionId,
        role: 'user' as const,
        content: userMessage,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setMessages(prev => [...prev, tempUserMessage]);
      
      // Show typing indicator
      setIsTyping(true);
      
      // Call the AI agent - it will create the real messages in the database
      setTimeout(() => {
        generateAssistantResponse(userMessage, tempUserMessage.id);
      }, 1000);
    } catch {
      setError('Error al enviar mensaje');
      setIsTyping(false);
    }
  };

  const generateAssistantResponse = async (userMessage: string, tempMessageId: string) => {
    try {
      // Call the AI agent to generate a real response
      const agentResponse = await fetch('/api/agent/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sessionId,
        }),
      });

      if (!agentResponse.ok) {
        throw new Error('Failed to get AI response');
      }

      const agentData = await agentResponse.json();
      
      // Remove the temporary user message and typing indicator with smooth transition
      setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
      setIsTyping(false);
      
      // Add the real messages from the AI agent to the UI
      // We'll fetch the real messages to get the proper IDs and guidelines
      await fetchMessages();
      
      // Scroll to bottom to show the new response
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      
      // Update session ID if it changed
      if (agentData.sessionId && agentData.sessionId !== sessionId) {
        console.log('Session ID updated:', agentData.sessionId);
      }
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      
      // Remove the temporary user message and typing indicator with smooth transition
      setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
      setIsTyping(false);
      
      // Show error message
      setError('Error al generar respuesta del agente');
    }
  };

  const handleMessageClick = async (message: Message) => {
    if (message.role === 'assistant' && onGuidelineUsageSelect) {
      try {
        // Fetch real guideline usages for this message
        const response = await fetch(`/api/messages/${message.id}/guideline-usage`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          // If there are real guideline usages, use the first one
          const realUsage = data.data[0];
          onGuidelineUsageSelect(realUsage);
        } else {
          // If no real guideline usages exist, show a message or create a placeholder
          // For now, we'll just not show anything if there are no guidelines
          console.log('No guideline usages found for this message');
        }
      } catch (error) {
        console.error('Failed to fetch guideline usages:', error);
      }
    }
  };

  const getGuidelineStrengthIcon = (strength: string) => {
    return strength === 'hard' ? '🔴' : '🟡';
  };

  const getGuidelinePriorityColor = (priority: number) => {
    if (priority >= 8) return 'text-purple-600';
    if (priority >= 6) return 'text-red-600';
    if (priority >= 4) return 'text-orange-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow h-full min-h-[500px] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
        </div>
        <div className="flex-1 p-4">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow h-full min-h-[500px] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={fetchMessages}
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
    <div className="bg-white rounded-lg shadow h-full min-h-[500px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
        <p className="text-sm text-gray-600 mt-1">
          {messages.length} mensaje{messages.length !== 1 ? 's' : ''} en esta conversación
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
        {messages.map((message) => {
          const guidelines = messageGuidelines.get(message.id) || [];
          const hasGuidelines = guidelines.length > 0;
          const isTempMessage = message.id.startsWith('temp-');
          
          return (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} transition-all duration-300 ease-in-out ${
                isTempMessage ? 'opacity-90 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg transition-colors ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                } ${
                  message.role === 'assistant' ? 'cursor-pointer' : ''
                }`}
                onClick={() => handleMessageClick(message)}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                
                {/* Guideline indicators for assistant messages */}
                {message.role === 'assistant' && (
                  <div className="mt-2 space-y-2">
                    {hasGuidelines ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-blue-800">
                            Directrices aplicadas ({guidelines.length})
                          </span>
                          <span className="text-xs text-blue-600">
                            {guidelines.filter(g => g.guideline?.strength === 'hard').length} obligatorias
                          </span>
                        </div>
                        
                        {/* Guideline previews */}
                        <div className="space-y-1">
                          {guidelines.slice(0, 2).map((guideline) => (
                            <div key={guideline.id} className="flex items-center space-x-2 text-xs">
                              <span className={getGuidelinePriorityColor(guideline.guideline?.priority || 1)}>
                                {getGuidelineStrengthIcon(guideline.guideline?.strength || 'soft')}
                              </span>
                              <span className="text-gray-700 truncate">
                                {guideline.guideline?.title || 'Directriz desconocida'}
                              </span>
                              <span className={`px-1 py-0.5 rounded text-xs font-medium ${getGuidelinePriorityColor(guideline.guideline?.priority || 1)}`}>
                                P{guideline.guideline?.priority || 1}
                              </span>
                            </div>
                          ))}
                          {guidelines.length > 2 && (
                            <div className="text-xs text-blue-600 text-center pt-1 border-t border-blue-200">
                              +{guidelines.length - 2} más directrices
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 text-center py-1">
                        Sin directrices aplicadas
                      </div>
                    )}
                  </div>
                )}
                
                <div className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(message.createdAt).toLocaleTimeString()}
                </div>
                
                {message.role === 'assistant' && (
                  <div className="text-xs text-blue-600 mt-1 text-center">
                    Pulsa para ver detalles
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start animate-in slide-in-from-left-2 duration-300">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm font-medium">Agente escribiendo...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 flex-shrink-0">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe tu mensaje aquí..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && addMessage()}
            disabled={isTyping}
          />
          <button
            onClick={addMessage}
            disabled={!newMessage.trim() || isTyping}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
