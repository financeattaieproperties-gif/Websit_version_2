import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  User,
  Phone,
  Mail,
  Check,
  CheckCheck,
  CheckCircle2,
  Sparkles,
  Bot,
  RotateCcw,
  ExternalLink,
  BedDouble,
  Bath,
  MapPin,
  ShieldCheck,
  Headphones,
} from 'lucide-react';
import {
  fetchCustomerThread,
  getStoredCustomerSession,
  saveCustomerSession,
  sendCustomerChatMessage,
  markCustomerMessagesRead,
  sendCustomerTypingSignal,
  type ChatConversation,
} from '../../lib/chatService';
import {
  initAiChatSession,
  sendAiCustomerMessage,
  submitHumanHandoffRequest,
  sanitizeInternalListingUrl,
  type AiConversationState,
  type VerifiedPropertyCard,
} from '../../lib/aiChatEngine';

const AI_CONV_STORAGE_KEY = 'attaie_ai_conversation_state_v1';

const DARI_SUGGESTED_QUESTIONS = [
  'در کابل یک اپارتمان سه اتاقه برای کرایه دارین؟',
  'کرایه‌اش چند است؟',
  'این اپارتمان هنوز موجود است؟',
  'یک حویلی فروشی در کارته چهار دارین؟',
];

export const CustomerChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'human'>('ai');

  // AI Assistant state
  const [aiConv, setAiConv] = useState<AiConversationState | null>(() => {
    try {
      const raw = sessionStorage.getItem(AI_CONV_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AiConversationState) : null;
    } catch {
      return null;
    }
  });
  const [aiProviderLabel, setAiProviderLabel] = useState('AI Assistant');
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);

  // Explicit-consent Human Handoff modal inside AI tab
  const [showHandoffForm, setShowHandoffForm] = useState(false);
  const [handoffConsent, setHandoffConsent] = useState(false);
  const [handoffNotes, setHandoffNotes] = useState('');
  const [handoffSending, setHandoffSending] = useState(false);
  const [handoffMessage, setHandoffMessage] = useState<string | null>(null);

  // Direct Human Admin Chat state
  const [session, setSession] = useState(() => getStoredCustomerSession());
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [name, setName] = useState(session.name);
  const [phone, setPhone] = useState(session.phone);
  const [email, setEmail] = useState(session.email);
  const [messageText, setMessageText] = useState('');
  const [sendingHuman, setSendingHuman] = useState(false);
  const [humanError, setHumanError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Real-time typing indicator state (both customer & admin)
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [typingAdminName, setTypingAdminName] = useState('مشاور عطایی');
  const [isCustomerTypingLocal, setIsCustomerTypingLocal] = useState(false);
  const customerTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const adminTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCustomerTypingSentRef = useRef<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Detect current property ID if visitor is on /properties/:id
  const getCurrentPropertyId = (): number | null => {
    if (typeof window === 'undefined') return null;
    const m = /^\/properties\/(\d+)/.exec(window.location.pathname);
    return m ? Number.parseInt(m[1], 10) : null;
  };

  useEffect(() => {
    void initAiChatSession(aiConv?.id).then(res => {
      if (res.activeProviderLabel) {
        setAiProviderLabel(res.activeProviderLabel);
      }
      if (res.conversation) {
        setAiConv(res.conversation);
      }
    });
  }, []);

  useEffect(() => {
    if (aiConv) {
      try {
        sessionStorage.setItem(AI_CONV_STORAGE_KEY, JSON.stringify(aiConv));
      } catch {
        // ignore
      }
    }
  }, [aiConv]);

  const loadHumanThread = useCallback(async () => {
    if (!session.sessionId) return;
    const conv = await fetchCustomerThread(session.sessionId);
    if (conv) {
      // Check server-side or localStorage admin typing status (6s TTL)
      if (conv.is_admin_typing) {
        setIsAdminTyping(true);
        if (conv.typing_admin_name) {
          setTypingAdminName(conv.typing_admin_name);
        }
      } else if (conv.typing_admin_at) {
        const elapsed = Date.now() - new Date(conv.typing_admin_at).getTime();
        setIsAdminTyping(elapsed >= 0 && elapsed <= 6000);
        if (conv.typing_admin_name) {
          setTypingAdminName(conv.typing_admin_name);
        }
      } else {
        setIsAdminTyping(false);
      }

      setConversation(prev => {
        if (!isOpen && prev && conv.messages.length > prev.messages.length) {
          const newAdminMsgs = conv.messages
            .slice(prev.messages.length)
            .filter(m => m.sender === 'admin').length;
          if (newAdminMsgs > 0) {
            setUnreadCount(c => c + newAdminMsgs);
          }
        }
        return conv;
      });
    }
  }, [session.sessionId, isOpen]);

  // Real-time polling + BroadcastChannel + Storage listener for typing & read receipts
  useEffect(() => {
    void loadHumanThread();
    const interval = setInterval(() => {
      void loadHumanThread();
    }, 2500);

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'attaie_chat_conversations_v1') {
        void loadHumanThread();
      }
    };
    window.addEventListener('storage', onStorage);

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('attaie_live_chat_channel');
        bc.onmessage = (event: MessageEvent) => {
          const data = event.data as {
            type?: string;
            conversationId?: string;
            sender?: string;
            senderName?: string;
            isTyping?: boolean;
            reader?: string;
            readAt?: string;
          } | null;
          if (!data) return;

          if (data.conversationId && session.sessionId && data.conversationId !== session.sessionId) {
            return;
          }

          if (data.type === 'TYPING_STATUS' && data.sender === 'admin') {
            setIsAdminTyping(Boolean(data.isTyping));
            if (data.senderName) {
              setTypingAdminName(data.senderName);
            }
            if (adminTypingTimeoutRef.current) {
              clearTimeout(adminTypingTimeoutRef.current);
            }
            if (data.isTyping) {
              adminTypingTimeoutRef.current = setTimeout(() => {
                setIsAdminTyping(false);
              }, 6000);
            }
            return;
          }

          if (data.type === 'MESSAGES_READ' && data.reader === 'admin') {
            const readTime = data.readAt || new Date().toISOString();
            setConversation(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                unread_admin: 0,
                messages: prev.messages.map(m =>
                  m.sender === 'customer'
                    ? { ...m, read_status: 'read' as const, read_at: m.read_at || readTime }
                    : m
                ),
              };
            });
            return;
          }

          if (data.type === 'NEW_ADMIN_REPLY') {
            setIsAdminTyping(false);
            void loadHumanThread();
          }
        };
      }
    } catch {
      // ignore if BroadcastChannel is unsupported
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', onStorage);
      bc?.close();
    };
  }, [loadHumanThread, session.sessionId]);

  // Automatically mark incoming admin messages as 'read' when customer views the human chat tab
  useEffect(() => {
    if (!isOpen || activeTab !== 'human' || !session.sessionId || !conversation) return;
    const hasUnreadAdminMsg =
      (conversation.unread_customer || 0) > 0 ||
      conversation.messages.some(m => m.sender === 'admin' && m.read_status !== 'read');

    if (hasUnreadAdminMsg) {
      void markCustomerMessagesRead(session.sessionId).then(updated => {
        if (updated) {
          setConversation(updated);
        } else {
          const now = new Date().toISOString();
          setConversation(prev =>
            prev
              ? {
                  ...prev,
                  unread_customer: 0,
                  messages: prev.messages.map(m =>
                    m.sender === 'admin'
                      ? { ...m, read_status: 'read' as const, read_at: m.read_at || now }
                      : m
                  ),
                }
              : prev
          );
        }
      });
    }
  }, [isOpen, activeTab, session.sessionId, conversation?.messages.length, conversation?.unread_customer]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }
  }, [
    isOpen,
    activeTab,
    aiConv?.messages?.length,
    conversation?.messages?.length,
    showHandoffForm,
    isAdminTyping,
    aiLoading,
  ]);

  // Keyboard Escape to close panel
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  // Emit customer typing signal (throttled + auto-stops after 2.5s of inactivity)
  const handleCustomerTypingInput = (nextValue: string, mode: 'human' | 'ai') => {
    if (mode === 'human') {
      setMessageText(nextValue);
    } else {
      setAiInput(nextValue);
    }

    const activeText = nextValue.trim();
    if (!activeText) {
      setIsCustomerTypingLocal(false);
      if (customerTypingTimeoutRef.current) {
        clearTimeout(customerTypingTimeoutRef.current);
      }
      if (session.sessionId) {
        void sendCustomerTypingSignal(session.sessionId, false, name.trim() || session.name || 'Customer');
      }
      return;
    }

    setIsCustomerTypingLocal(true);
    const now = Date.now();
    if (session.sessionId && now - lastCustomerTypingSentRef.current > 1800) {
      lastCustomerTypingSentRef.current = now;
      void sendCustomerTypingSignal(session.sessionId, true, name.trim() || session.name || 'Customer');
    }

    if (customerTypingTimeoutRef.current) {
      clearTimeout(customerTypingTimeoutRef.current);
    }
    customerTypingTimeoutRef.current = setTimeout(() => {
      setIsCustomerTypingLocal(false);
      if (session.sessionId) {
        void sendCustomerTypingSignal(session.sessionId, false, name.trim() || session.name || 'Customer');
      }
    }, 2500);
  };

  const sendAiMessageText = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || aiLoading) return;

    setAiError(null);
    setLastFailedMessage(null);
    setAiLoading(true);
    setIsCustomerTypingLocal(false);

    try {
      const pageContext = `${window.location.pathname} — ${document.title.replace(/\s*\|\s*Attaie Properties.*$/i, '')}`;
      const res = await sendAiCustomerMessage({
        conversationId: aiConv?.id,
        message: trimmed,
        pageContext,
        propertyId: getCurrentPropertyId(),
        currentState: aiConv,
      });
      setAiConv(res.conversation);
      setAiInput('');
      if (res.reply.suggest_handoff) {
        setShowHandoffForm(true);
      }
    } catch (err) {
      setLastFailedMessage(trimmed);
      setAiError(err instanceof Error ? err.message : 'خطا در ارسال پیام به دستیار هوشمند.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendAiMessageText(aiInput);
  };

  const handleRetryAi = async () => {
    if (!lastFailedMessage) return;
    await sendAiMessageText(lastFailedMessage);
  };

  const handleHandoffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiError(null);
    if (!handoffConsent) {
      setAiError('لطفاً تیک رضایت ارسال مشخصات تماس به مشاور انسانی را فعال کنید.');
      return;
    }
    if (!name.trim() || !phone.trim()) {
      setAiError('لطفاً نام و شماره تماس خود را وارد نمایید.');
      return;
    }

    setHandoffSending(true);
    try {
      const res = await submitHumanHandoffRequest({
        conversationId: aiConv?.id || `aichat_${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        notes: handoffNotes.trim(),
        consentGiven: handoffConsent,
      });
      setHandoffMessage(res.message);
      setShowHandoffForm(false);
      const updatedSession = {
        sessionId: aiConv?.id || session.sessionId || `chat_${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
      };
      setSession(updatedSession);
      saveCustomerSession(updatedSession);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'خطا در ثبت درخواست مشاور انسانی.');
    } finally {
      setHandoffSending(false);
    }
  };

  const handleSendHuman = async (e: React.FormEvent) => {
    e.preventDefault();
    setHumanError(null);

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedMsg = messageText.trim();

    if (!trimmedName || !trimmedPhone) {
      setHumanError('لطفاً نام و شماره تماس خود را وارد کنید.');
      setEditingProfile(true);
      return;
    }
    if (!trimmedMsg) return;

    setSendingHuman(true);
    setIsCustomerTypingLocal(false);
    if (customerTypingTimeoutRef.current) {
      clearTimeout(customerTypingTimeoutRef.current);
    }

    try {
      const pageContext = `${window.location.pathname} — ${document.title.replace(/\s*\|\s*Attaie Properties.*$/i, '')}`;
      const updated = await sendCustomerChatMessage({
        sessionId: session.sessionId,
        name: trimmedName,
        phone: trimmedPhone,
        email: email.trim(),
        pageContext,
        message: trimmedMsg,
      });
      const updatedSession = {
        sessionId: updated.id,
        name: trimmedName,
        phone: trimmedPhone,
        email: email.trim(),
      };
      setSession(updatedSession);
      saveCustomerSession(updatedSession);
      setConversation(updated);
      setMessageText('');
      setEditingProfile(false);
    } catch (err) {
      setHumanError(err instanceof Error ? err.message : 'خطا در ارسال پیام.');
    } finally {
      setSendingHuman(false);
    }
  };

  const renderReadReceiptBadge = (readStatus?: 'sent' | 'read', readAt?: string | null) => {
    const isRead = readStatus === 'read';
    const timeLabel = readAt
      ? new Date(readAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';
    return (
      <span
        className={`inline-flex items-center gap-0.5 text-[10px] font-semibold mt-1 px-1 ${
          isRead ? 'text-brand-gold' : 'text-neutral-400'
        }`}
        title={isRead ? `خوانده شد (Read)${timeLabel ? ` • ${timeLabel}` : ''}` : 'ارسال شد (Sent)'}
      >
        {isRead ? (
          <>
            <CheckCheck size={12} className="text-brand-gold shrink-0" />
            <span>خوانده شد (Read)</span>
          </>
        ) : (
          <>
            <Check size={12} className="text-neutral-400 shrink-0" />
            <span>ارسال شد (Sent)</span>
          </>
        )}
      </span>
    );
  };

  const renderPropertyCard = (card: VerifiedPropertyCard) => {
    const safeLink = sanitizeInternalListingUrl(card.url || card.id);
    const priceFormatted =
      card.price > 0
        ? `$${card.price.toLocaleString()}${card.listing_type === 'rent' ? ' / ماه' : ''}`
        : 'قیمت توافقی';

    return (
      <div
        key={`${card.id}-${card.serial_number}`}
        dir="rtl"
        className="bg-white border border-brand-navy/15 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow mt-2"
      >
        <div className="flex gap-3 p-2.5 items-center">
          {card.image_url && (
            <img
              src={card.image_url}
              alt={card.title}
              className="w-16 h-16 rounded-lg object-cover shrink-0 bg-neutral-100"
              loading="lazy"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span
                dir="ltr"
                className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-navy/10 text-brand-navy"
              >
                {card.serial_number}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  card.status === 'available'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {card.status === 'available' ? 'موجود' : 'در حال معامله'}
              </span>
            </div>
            <h4 className="text-xs font-bold text-brand-navy truncate">{card.title}</h4>
            <div className="flex items-center gap-1 text-[11px] text-neutral-500 truncate mt-0.5">
              <MapPin size={11} className="shrink-0 text-brand-gold" />
              <span className="truncate">{card.location}</span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-1.5">
              <span dir="ltr" className="text-xs font-extrabold text-brand-gold">
                {priceFormatted}
              </span>
              <div className="flex items-center gap-2 text-[10px] text-neutral-600">
                {card.beds !== null && (
                  <span className="inline-flex items-center gap-0.5">
                    <BedDouble size={11} /> {card.beds} اتاق
                  </span>
                )}
                {card.baths !== null && (
                  <span className="inline-flex items-center gap-0.5">
                    <Bath size={11} /> {card.baths} تشناب
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-brand-cream/70 px-3 py-1.5 border-t border-brand-navy/10 flex items-center justify-between">
          <span className="text-[10px] text-neutral-600">
            {card.listing_type === 'rent' ? 'کرایی' : 'فروشی'} • {card.type}
          </span>
          <a
            href={safeLink}
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-gold hover:underline"
          >
            <span>مشاهده جزئیات ملک</span>
            <ExternalLink size={11} />
          </a>
        </div>
      </div>
    );
  };

  const hasProfile = Boolean(session.name.trim() && session.phone.trim());
  const showProfileFields = !hasProfile || editingProfile || !conversation;

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            dir="rtl"
            className="mb-3 w-[calc(100vw-2rem)] sm:w-[405px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-brand-navy/15 overflow-hidden flex flex-col font-arabic"
            role="dialog"
            aria-modal="false"
            aria-label="دستیار هوشمند املاک عطایی (Attaie AI Real-Estate Assistant)"
          >
            {/* Header with explicit AI Identification */}
            <div className="bg-brand-navy text-white px-4 py-3.5 shrink-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-gold/30 text-white border border-white/20">
                      <Bot size={12} />
                      <span>دستیار هوشمند AI • {aiProviderLabel}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {isAdminTyping ? `${typingAdminName} در حال نوشتن…` : 'متصل به دیتابیس املاک'}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                    رهنمای معاملات عطایی — پاسخگوی هوشمند
                  </h3>
                  <p className="text-[11px] text-white/75 mt-0.5 leading-relaxed">
                    جستجوی اپارتمان، حویلی، ویلا و نمره زمین در کابل به زبان دری، پشتو و انگلیسی
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="بستن پنجره گفتگو"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mode Switcher: AI Assistant vs Direct Human Advisor */}
              <div className="grid grid-cols-2 gap-1.5 mt-3 bg-white/10 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('ai')}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'ai'
                      ? 'bg-white text-brand-navy shadow-xs'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <Sparkles size={13} />
                  <span>دستیار هوشمند (AI)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('human')}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'human'
                      ? 'bg-white text-brand-navy shadow-xs'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <Headphones size={13} />
                  <span>مشاور انسانی</span>
                  {isAdminTyping && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </button>
              </div>
            </div>

            {activeTab === 'ai' ? (
              <>
                {/* AI Assistant Conversation Area */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-brand-cream/60 min-h-[250px] max-h-[360px]">
                  {/* Privacy & Grounding Disclosure Banner */}
                  <div className="bg-white border border-brand-navy/10 rounded-xl p-3 shadow-xs">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-brand-navy mb-1">
                      <ShieldCheck size={14} className="text-brand-gold shrink-0" />
                      <span>دستیار هوشمند املاک عطایی (AI Assistant)</span>
                    </div>
                    <p className="text-[11px] text-neutral-600 leading-relaxed">
                      سلام! من دستیار هوش مصنوعی رهنمای معاملات عطایی هستم و اطلاعات املاک را مستقیماً از دیتابیس رسمی بررسی می‌کنم. پیام‌های شما برای پاسخ‌دهی توسط سرویس هوش مصنوعی منتخب پردازش می‌شود.
                    </p>
                  </div>

                  {/* Suggested Questions in Afghan Dari */}
                  {(!aiConv || aiConv.messages.length === 0) && (
                    <div className="space-y-1.5 pt-0.5">
                      <p className="text-[11px] font-bold text-neutral-500 px-1">
                        سوالات پیشنهادی (کلیک کنید):
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {DARI_SUGGESTED_QUESTIONS.map(q => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => void sendAiMessageText(q)}
                            className="text-right text-xs bg-white hover:bg-brand-gold/10 text-brand-navy border border-brand-navy/15 hover:border-brand-gold/40 px-3 py-2 rounded-xl transition-colors cursor-pointer font-medium"
                          >
                            «{q}»
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Conversation History */}
                  {aiConv?.messages.map(msg => {
                    const isCustomer = msg.sender === 'customer';
                    const isSystem = msg.sender === 'system';

                    if (isSystem) {
                      return (
                        <div
                          key={msg.id}
                          className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3 text-xs leading-relaxed flex items-start gap-2"
                        >
                          <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{msg.text}</span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                      >
                        <span className="text-[10px] font-semibold text-neutral-500 mb-1 px-1">
                          {isCustomer ? 'شما' : '🤖 دستیار هوشمند عطایی'}
                        </span>
                        <div
                          className={`w-full max-w-[92%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap break-words ${
                            isCustomer
                              ? 'bg-brand-gold text-white rounded-tr-xs shadow-xs'
                              : 'bg-white text-brand-navy border border-brand-navy/10 rounded-tl-xs shadow-xs'
                          }`}
                        >
                          {msg.text}

                          {/* Verified Database Property Cards */}
                          {!isCustomer && msg.cards && msg.cards.length > 0 && (
                            <div className="mt-2.5 space-y-2">
                              {msg.cards.map(card => renderPropertyCard(card))}
                            </div>
                          )}
                        </div>
                        {isCustomer && renderReadReceiptBadge('read', msg.created_at)}
                      </div>
                    );
                  })}

                  {/* AI Typing / Processing Indicator */}
                  {aiLoading && (
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-semibold text-neutral-500 mb-1 px-1">
                        🤖 دستیار هوشمند عطایی
                      </span>
                      <div className="flex items-center gap-2 text-xs text-brand-navy bg-white border border-brand-navy/10 rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-xs">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce [animation-delay:150ms]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce [animation-delay:300ms]" />
                        </span>
                        <span>دستیار هوشمند در حال نوشتن پاسخ است (typing...)</span>
                      </div>
                    </div>
                  )}

                  {/* Handoff confirmation */}
                  {handoffMessage && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3 text-xs leading-relaxed flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{handoffMessage}</span>
                    </div>
                  )}

                  {/* Explicit Consent Human Handoff Form */}
                  {showHandoffForm && (
                    <form
                      onSubmit={handleHandoffSubmit}
                      className="bg-white border-2 border-brand-gold/30 rounded-xl p-3.5 space-y-2.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brand-navy">
                          🤝 درخواست ارتباط با مشاور انسانی
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowHandoffForm(false)}
                          className="text-[11px] text-neutral-400 hover:text-neutral-700 cursor-pointer"
                        >
                          انصراف
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="نام شما *"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 focus:border-brand-gold focus:outline-none text-neutral-900"
                        />
                        <input
                          type="tel"
                          required
                          dir="ltr"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="+93 78 222 2279 *"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 focus:border-brand-gold focus:outline-none text-neutral-900"
                        />
                      </div>
                      <input
                        type="text"
                        value={handoffNotes}
                        onChange={e => setHandoffNotes(e.target.value)}
                        placeholder="توضیحات اختیاری برای مشاور…"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 focus:border-brand-gold focus:outline-none text-neutral-900"
                      />
                      <label className="flex items-start gap-2 text-[11px] text-neutral-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={handoffConsent}
                          onChange={e => setHandoffConsent(e.target.checked)}
                          className="mt-0.5 rounded border-neutral-300"
                        />
                        <span>
                          رضایت دارم که نام، شماره تماس و خلاصه این گفتگو برای پیگیری به مشاور انسانی رهنمای معاملات عطایی ارسال شود.
                        </span>
                      </label>
                      <button
                        type="submit"
                        disabled={handoffSending || !handoffConsent}
                        className="w-full py-2 rounded-lg bg-brand-gold hover:bg-brand-gold-dark disabled:opacity-50 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        {handoffSending ? 'در حال ثبت درخواست…' : 'ثبت و ارسال به مشاور انسانی'}
                      </button>
                    </form>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Error & Retry Bar */}
                {aiError && (
                  <div className="px-3.5 py-2 bg-red-50 border-t border-red-200 flex items-center justify-between gap-2 text-xs text-red-700">
                    <span className="flex-1">{aiError}</span>
                    {lastFailedMessage && (
                      <button
                        type="button"
                        onClick={() => void handleRetryAi()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-600 text-white text-[11px] font-bold hover:bg-red-700 cursor-pointer shrink-0"
                      >
                        <RotateCcw size={12} />
                        <span>تلاش مجدد</span>
                      </button>
                    )}
                  </div>
                )}

                {/* AI Input Composer + Human Handoff Button */}
                <form
                  onSubmit={handleAiSubmit}
                  className="p-3 bg-white border-t border-neutral-200 space-y-2 shrink-0"
                >
                  <div className="flex items-center justify-between text-[11px] px-0.5">
                    <button
                      type="button"
                      onClick={() => setShowHandoffForm(s => !s)}
                      className="text-brand-gold hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Headphones size={12} />
                      <span>درخواست تماس مشاور انسانی</span>
                    </button>
                    <div className="flex items-center gap-2">
                      {isCustomerTypingLocal && (
                        <span className="text-[10px] text-emerald-600 font-medium animate-pulse">
                          در حال تایپ… (typing...)
                        </span>
                      )}
                      {aiConv && aiConv.messages.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setAiConv(null);
                            sessionStorage.removeItem(AI_CONV_STORAGE_KEY);
                          }}
                          className="text-neutral-400 hover:text-neutral-700 text-[10px] cursor-pointer"
                        >
                          گفتگوی جدید
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-end gap-2">
                    <textarea
                      rows={2}
                      value={aiInput}
                      onChange={e => handleCustomerTypingInput(e.target.value, 'ai')}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          void handleAiSubmit(e);
                        }
                      }}
                      placeholder="سوال خود را به دری، پشتو یا انگلیسی بنویسید… (مثلاً: اپارتمان سه اتاقه کرایی دارین؟)"
                      className="flex-1 resize-none rounded-xl border border-neutral-300 focus:border-brand-gold focus:outline-none px-3 py-2 text-xs text-neutral-900"
                    />
                    <button
                      type="submit"
                      disabled={aiLoading || !aiInput.trim()}
                      className="h-10 px-3.5 rounded-xl bg-brand-gold hover:bg-brand-gold-dark disabled:opacity-50 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Send size={14} />
                      <span>ارسال</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Direct Human Advisor Tab */
              <>
                <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-brand-cream/60 min-h-[250px] max-h-[360px]">
                  <div className="bg-white border border-brand-navy/10 rounded-xl p-3 shadow-xs">
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-brand-navy">
                        <Headphones size={14} className="text-brand-gold" />
                        <span>گفتگوی مستقیم با مشاوران عطایی</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCheck size={11} />
                        <span>تاییدیه خوانش فعال</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-600 leading-relaxed">
                      پیام شما مستقیماً به پنل مدیریت ادمین ارسال می‌شود و وضعیت «ارسال شد / خوانده شد» به صورت آنی نمایش داده می‌شود.
                    </p>
                  </div>

                  {conversation?.messages.map(msg => {
                    const isCustomer = msg.sender === 'customer';
                    const isSystem = msg.sender === 'system';
                    if (isSystem) {
                      return (
                        <div
                          key={msg.id}
                          className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3 text-xs leading-relaxed flex items-start gap-2"
                        >
                          <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{msg.text}</span>
                        </div>
                      );
                    }
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                      >
                        <span className="text-[10px] font-semibold text-neutral-500 mb-1 px-1">
                          {isCustomer ? 'شما' : msg.sender_name || 'مشاور عطایی'}
                        </span>
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap break-words ${
                            isCustomer
                              ? 'bg-brand-gold text-white rounded-tr-xs shadow-xs'
                              : 'bg-white text-brand-navy border border-brand-navy/10 rounded-tl-xs shadow-xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                        {isCustomer ? (
                          renderReadReceiptBadge(msg.read_status, msg.read_at)
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium mt-1 px-1">
                            <CheckCheck size={11} className="text-emerald-600" />
                            <span>دریافت شد</span>
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {/* Real-time Admin Typing Indicator Bubble */}
                  {isAdminTyping && (
                    <div className="flex flex-col items-end" role="status" aria-live="polite">
                      <span className="text-[10px] font-semibold text-neutral-500 mb-1 px-1">
                        👨‍💼 {typingAdminName || 'مشاور عطایی'}
                      </span>
                      <div className="bg-white border border-brand-gold/30 text-brand-navy rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-xs shadow-xs inline-flex items-center gap-2">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce [animation-delay:150ms]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce [animation-delay:300ms]" />
                        </span>
                        <span className="font-medium text-brand-navy">
                          {typingAdminName || 'مشاور عطایی'} در حال نوشتن پیام است… (typing...)
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <form
                  onSubmit={handleSendHuman}
                  className="p-3.5 bg-white border-t border-neutral-200 space-y-2.5 shrink-0"
                >
                  {humanError && (
                    <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5">
                      {humanError}
                    </div>
                  )}

                  {showProfileFields ? (
                    <div className="space-y-2 pb-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="relative">
                          <User
                            size={13}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
                          />
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="نام شما *"
                            className="w-full pr-7 pl-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 focus:border-brand-gold focus:outline-none text-neutral-900"
                          />
                        </div>
                        <div className="relative">
                          <Phone
                            size={13}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
                          />
                          <input
                            type="tel"
                            required
                            dir="ltr"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="+93 78 222 2279 *"
                            className="w-full pr-7 pl-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 focus:border-brand-gold focus:outline-none text-neutral-900"
                          />
                        </div>
                      </div>
                      <div className="relative">
                        <Mail
                          size={13}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
                        />
                        <input
                          type="email"
                          dir="ltr"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="Email (اختیاری)"
                          className="w-full pr-7 pl-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 focus:border-brand-gold focus:outline-none text-neutral-900"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 px-0.5">
                      <span>
                        نام: <strong className="text-brand-navy">{session.name}</strong> (
                        <span dir="ltr">{session.phone}</span>)
                      </span>
                      <div className="flex items-center gap-2">
                        {isCustomerTypingLocal && (
                          <span className="text-[10px] text-emerald-600 font-medium animate-pulse">
                            در حال تایپ… (typing...)
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditingProfile(true)}
                          className="text-brand-gold hover:underline font-medium cursor-pointer"
                        >
                          ویرایش مشخصات
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-end gap-2">
                    <textarea
                      rows={2}
                      value={messageText}
                      onChange={e => handleCustomerTypingInput(e.target.value, 'human')}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          void handleSendHuman(e);
                        }
                      }}
                      placeholder="پیام مستقیم خود را برای مشاور انسانی بنویسید…"
                      className="flex-1 resize-none rounded-xl border border-neutral-300 focus:border-brand-gold focus:outline-none px-3 py-2 text-xs text-neutral-900"
                    />
                    <button
                      type="submit"
                      disabled={sendingHuman || !messageText.trim()}
                      className="h-10 px-3.5 rounded-xl bg-brand-gold hover:bg-brand-gold-dark disabled:opacity-50 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Send size={14} />
                      <span>ارسال</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        className="relative flex items-center gap-2.5 bg-brand-navy hover:bg-brand-navy-light text-white px-4 py-3.5 rounded-full shadow-[0_6px_20px_rgba(2,14,58,0.38)] border border-white/15 hover:scale-105 transition-all duration-200 cursor-pointer"
        aria-label="دستیار هوشمند و گفتگوی آنلاین (AI Property Assistant)"
      >
        <MessageSquare size={22} className="text-white" />
        <span className="text-xs font-bold tracking-wide hidden sm:inline">
          {isAdminTyping ? 'مشاور در حال نوشتن…' : 'دستیار هوشمند املاک'}
        </span>
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-extrabold flex items-center justify-center shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};
