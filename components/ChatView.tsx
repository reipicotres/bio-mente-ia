import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Article, ChatMessage } from '../types';
import { getChatResponse, generateCitation } from '../services/geminiService';
import { ArrowLeftIcon, SendIcon, SparklesIcon, LinkIcon } from './icons';

interface ChatViewProps {
  article: Article;
  onBack: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ article, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);
  
  const handleSend = useCallback(async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
        let response: string;
        if(input.trim().toLowerCase() === '/cite'){
            response = await generateCitation(article);
        } else {
            response = await getChatResponse(article, [...messages, userMessage], input);
        }

      const modelMessage: ChatMessage = { role: 'model', content: response };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { role: 'model', content: 'Lo siento, no he podido procesar tu solicitud.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, article, messages]);

  return (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 flex flex-col h-[75vh]">
      <div className="flex items-start mb-4 border-b border-slate-700 pb-4">
        <button onClick={onBack} className="mr-4 mt-1 p-2 rounded-full hover:bg-slate-700 transition-colors">
          <ArrowLeftIcon className="h-5 w-5 text-slate-300" />
        </button>
        <div>
          <h3 className="text-lg font-bold text-slate-100">{article.title}</h3>
          <p className="text-sm text-slate-400 mt-1">{article.journal}, {article.year}</p>
          <a href={article.doi} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 mt-1.5 transition-colors w-fit">
            <LinkIcon className="h-3 w-3" />
            <span>{article.doi}</span>
          </a>
        </div>
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto pr-2 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <div className="flex-shrink-0 h-8 w-8 rounded-full bg-cyan-900 flex items-center justify-center"><SparklesIcon className="h-5 w-5 text-cyan-400"/></div>}
            <div className={`max-w-xl p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
             <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-cyan-900 flex items-center justify-center"><SparklesIcon className="h-5 w-5 text-cyan-400"/></div>
                <div className="max-w-xl p-3 rounded-lg bg-slate-700 text-slate-200">
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    </div>
                </div>
            </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Haz una pregunta sobre el artículo o escribe '/cite' para la bibliografía..."
            disabled={isTyping}
            className="w-full pl-4 pr-12 py-3 text-slate-200 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 placeholder:text-slate-500"
          />
          <button onClick={handleSend} disabled={isTyping || !input.trim()} className="absolute inset-y-0 right-0 m-1.5 p-2 rounded-full text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
            <SendIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;