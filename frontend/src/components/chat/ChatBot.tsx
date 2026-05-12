"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const quickQuestions = [
  "Quels types de chambres proposez-vous ?",
  "Quels sont les prix des chambres ?",
  "Avez-vous des trajets disponibles ?",
  "Comment annuler une réservation ?",
  "Comment créer un compte ?",
  "Quels moyens de paiement ?",
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Bonjour ! Je suis l'assistant virtuel de LuxeStay & Transit. Je peux vous renseigner sur nos chambres, trajets, réservations et paiements. Comment puis-je vous aider ?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.post("/chat/query", { message: text });
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.response,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Erreur de communication avec l'assistant");
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Désolé, je rencontre une difficulté technique. Veuillez réessayer ou contacter notre service client.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-amber-600 text-white shadow-lg hover:bg-amber-700 transition-all flex items-center justify-center group"
      >
        <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden transition-all ${
          isMinimized ? "w-80 h-14" : "w-80 sm:w-96 h-[560px]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-stone-900 to-stone-800 text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Bot size={16} className="text-amber-400" />
            </div>
            <div>
              <span className="font-medium text-sm">Assistant LuxeStay</span>
              <span className="ml-2 text-[10px] text-emerald-400">● En ligne</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleMinimize}
              className="p-1.5 hover:bg-stone-700 rounded-lg transition-colors"
              title={isMinimized ? "Agrandir" : "Réduire"}
            >
              {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-stone-700 rounded-lg transition-colors"
              title="Fermer"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 h-[400px] bg-stone-50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-start gap-2 max-w-[85%] ${
                      message.sender === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === "user" ? "bg-amber-100" : "bg-stone-200"
                      }`}
                    >
                      {message.sender === "user" ? (
                        <User size={14} className="text-amber-700" />
                      ) : (
                        <Bot size={14} className="text-stone-700" />
                      )}
                    </div>
                    <div
                      className={`p-3 rounded-2xl text-sm ${
                        message.sender === "user"
                          ? "bg-stone-900 text-white rounded-tr-sm"
                          : "bg-white border border-stone-200 text-stone-700 rounded-tl-sm shadow-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.text}</p>
                      <span className="text-[10px] opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-2xl rounded-tl-sm px-4 py-2 shadow-sm">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            <div className="px-4 py-3 bg-stone-100 border-t border-stone-200">
              <p className="text-[10px] text-stone-400 mb-2">QUESTIONS RAPIDES</p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {quickQuestions.map((question, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickQuestion(question)}
                    className="flex-shrink-0 px-3 py-1.5 bg-white border border-stone-200 rounded-full text-xs text-stone-600 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 transition-all"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-stone-200 bg-white">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center hover:bg-stone-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </>
        )}

        {/* État minimisé */}
        {isMinimized && (
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-amber-400" />
              <span className="text-sm text-stone-600">Assistant LuxeStay</span>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <X size={14} className="text-stone-400" />
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}