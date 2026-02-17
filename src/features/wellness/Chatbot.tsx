import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Plus, Trash2 } from 'lucide-react';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../providers/ToastProvider';
import { wellnessApi } from '../wellness/services/wellnessApi';


interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export function Chatbot() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Load conversations on mount
  useEffect(() => {
    const saved = localStorage.getItem('wellness_conversations');
    if (saved) {
      const parsed = JSON.parse(saved) as Conversation[];
      setConversations(parsed);
      if (parsed.length > 0) {
        setActiveConversationId(parsed[0].id);
        setMessages(parsed[0].messages);
      }
    } else {
      // Start with welcome message
      const newConv = createNewConversation();
      setConversations([newConv]);
      setActiveConversationId(newConv.id);
      setMessages(newConv.messages);
    }
  }, []);

  // Save conversations whenever they change
  useEffect(() => {
    localStorage.setItem('wellness_conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createNewConversation = (): Conversation => {
    const id = Date.now().toString();
    const welcomeMessage: Message = {
      id: '0',
      text: "Hello! I'm your wellness AI assistant. I can help you with fitness, nutrition, sleep, stress management, and more. What would you like to talk about today?",
      sender: 'bot',
      timestamp: new Date(),
    };
    return {
      id,
      title: 'New Conversation',
      messages: [welcomeMessage],
      createdAt: new Date(),
    };
  };

  const handleNewConversation = () => {
    const newConv = createNewConversation();
    setConversations([newConv, ...conversations]);
    setActiveConversationId(newConv.id);
    setMessages(newConv.messages);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setSending(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    // Add user message to chat
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');

    try {
      // Send message to API with conversation history
      const history = updatedMessages
        .slice(1) // Skip welcome message
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));
      
      const response = await wellnessApi.sendChatMessage(inputText, history);
      
      // Handle response safely
      let botText = 'Unable to process your request';
      if (response && typeof response === 'object' && response.content) {
        botText = response.content;
      } else if (typeof response === 'string') {
        botText = response;
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        sender: 'bot',
        timestamp: new Date(),
      };

      const messagesWithBot = [...updatedMessages, botMessage];
      setMessages(messagesWithBot);

      // Update conversation with new messages
      if (activeConversationId) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeConversationId
              ? {
                  ...conv,
                  messages: messagesWithBot,
                  title: conv.messages.length === 1 
                    ? inputText.substring(0, 30) + '...'
                    : conv.title,
                }
              : conv
          )
        );
      }

      showToast('Message sent', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to send message', 'error');
      
      // Remove user message on error
      setMessages(messages);
    } finally {
      setSending(false);
    }
  };

  const selectConversation = (convId: string) => {
    setActiveConversationId(convId);
    const conv = conversations.find((c) => c.id === convId);
    if (conv) {
      setMessages(conv.messages);
    }
  };

  const handleDeleteConversation = (convId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    
    if (activeConversationId === convId) {
      if (conversations.length > 1) {
        const nextConv = conversations.find((c) => c.id !== convId);
        if (nextConv) {
          selectConversation(nextConv.id);
        }
      } else {
        const newConv = createNewConversation();
        setConversations([newConv]);
        setActiveConversationId(newConv.id);
        setMessages(newConv.messages);
      }
    }
    
    setShowDeleteConfirm(null);
    showToast('Conversation deleted', 'success');
  };

  return (
    <ScreenWrapper className="bg-gray-50 h-screen overflow-hidden flex">
      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? 'w-64' : 'w-0'
        } bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <button
            onClick={handleNewConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition"
          >
            <Plus size={20} />
            New Chat
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div key={conv.id} className="group">
              <button
                onClick={() => selectConversation(conv.id)}
                className={`w-full text-left px-4 py-3 border-none focus:outline-none transition ${
                  activeConversationId === conv.id
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : 'hover:bg-gray-100'
                }`}
              >
                <p className="text-sm font-medium text-gray-900 truncate">{conv.title}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(conv.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(conv.id)}
                className="hidden group-hover:flex absolute right-2 top-1/2 -translate-y-1/2 p-1 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/wellness')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={24} className="text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Wellness Chat Assistant</h1>
              <p className="text-sm text-gray-500">Get personalized wellness advice</p>
            </div>
          </div>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
          >
            {showSidebar ? '←' : '→'}
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xl px-4 py-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-900 rounded-bl-none'
                }`}
              >
                <p className="text-sm md:text-base whitespace-pre-wrap break-words">{message.text}</p>
                <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <Input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask me anything about wellness..."
              disabled={sending}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={sending || !inputText.trim()}
              title="Send message"
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
            >
              <Send size={20} />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Ask about fitness routines, nutrition, sleep, stress management, or any wellness topic
          </p>
        </form>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Conversation?</h3>
            <p className="text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  handleDeleteConversation(showDeleteConfirm);
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </ScreenWrapper>
  );
}
