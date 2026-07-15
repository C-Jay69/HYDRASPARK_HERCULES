import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Doc, Id } from "@/convex/_generated/dataModel.d.ts";
import { Send, Zap, ArrowLeft, Shield, MoreVertical } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce.ts";
import IcebreakerModal from "./IcebreakerModal.tsx";

type Props = {
  matchId: Id<"matches">;
  otherProfile: Doc<"profiles">;
  myProfile: Doc<"profiles">;
  onBack?: () => void;
};

export default function ChatThread({ matchId, otherProfile, myProfile, onBack }: Props) {
  const [input, setInput] = useState("");
  const [showIcebreaker, setShowIcebreaker] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sendMessage = useMutation(api.chat.sendMessage);
  const setTyping = useMutation(api.chat.setTyping);
  const markRead = useMutation(api.chat.markRead);

  const { results: messages, status } = usePaginatedQuery(
    api.chat.getMessages,
    { matchId },
    { initialNumItems: 40 }
  );

  const typingIndicators = useQuery(api.chat.getTypingIndicators, { matchId });
  const otherIsTyping = (typingIndicators ?? []).length > 0;

  // Debounced typing stop
  const [debouncedInput] = useDebounce(input, 1500);
  useEffect(() => {
    if (debouncedInput === "" && input === "") {
      setTyping({ matchId, isTyping: false }).catch(() => {});
    }
  }, [debouncedInput, input, matchId, setTyping]);

  // Mark read on open
  useEffect(() => {
    markRead({ matchId }).catch(() => {});
  }, [matchId, markRead]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  function handleInputChange(val: string) {
    setInput(val);
    if (val.trim()) {
      setTyping({ matchId, isTyping: true }).catch(() => {});
    } else {
      setTyping({ matchId, isTyping: false }).catch(() => {});
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setTyping({ matchId, isTyping: false }).catch(() => {});
    try {
      await sendMessage({ matchId, content: text });
    } catch {
      toast.error("Failed to send message");
    }
  }

  const sortedMessages = [...(messages ?? [])].reverse();

  return (
    <div className="flex flex-col h-full bg-[#080810]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#0d0d1a] flex-shrink-0">
        {onBack && (
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white cursor-pointer mr-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
          <img src={otherProfile.photos[0]} className="w-full h-full object-cover" alt={otherProfile.name} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white text-sm">{otherProfile.name}</span>
            {otherProfile.isVerified && <Shield className="w-3.5 h-3.5 text-cyan-400" />}
          </div>
          <p className="text-white/30 text-xs">{otherProfile.location}</p>
        </div>
        <button
          onClick={() => setShowIcebreaker(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-bold hover:bg-purple-500/30 transition-all cursor-pointer"
        >
          <Zap className="w-3 h-3" />
          Icebreaker
        </button>
        <button className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white cursor-pointer">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-4 py-4 space-y-2">
        {status === "LoadingFirstPage" && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                <Skeleton className={`h-10 rounded-2xl ${i % 2 === 0 ? "w-40" : "w-52"}`} />
              </div>
            ))}
          </div>
        )}

        {sortedMessages.length === 0 && status !== "LoadingFirstPage" && (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-12">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500/50">
              <img src={otherProfile.photos[0]} className="w-full h-full object-cover" alt={otherProfile.name} />
            </div>
            <div className="text-center">
              <p className="text-white font-bold">You matched with {otherProfile.name}!</p>
              <p className="text-white/40 text-sm mt-1">Say something or try the Icebreaker</p>
            </div>
          </div>
        )}

        {sortedMessages.map((msg) => {
          const isMe = msg.senderId === myProfile._id;
          return (
            <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              {!isMe && (
                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mr-2 self-end mb-1">
                  <img src={otherProfile.photos[0]} className="w-full h-full object-cover" alt={otherProfile.name} />
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? "bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-br-sm"
                    : "bg-white/8 text-white/90 rounded-bl-sm border border-white/5"
                }`}
              >
                {msg.content}
                {isMe && (
                  <div className={`text-[10px] mt-0.5 text-right ${msg.readAt ? "text-cyan-400/70" : "text-white/30"}`}>
                    {msg.readAt ? "✓✓" : "✓"}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {otherIsTyping && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
              <img src={otherProfile.photos[0]} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="bg-white/8 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
              {[0, 0.2, 0.4].map((delay, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-white/40 animate-bounce"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 px-4 py-3 border-t border-white/5 bg-[#0d0d1a] flex-shrink-0">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Message ${otherProfile.name}…`}
            rows={1}
            className="flex-1 bg-transparent text-white text-sm placeholder:text-white/25 outline-none resize-none max-h-32 leading-relaxed"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white hover:opacity-90 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-default flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {showIcebreaker && (
        <IcebreakerModal
          matchId={matchId}
          myProfile={myProfile}
          otherProfile={otherProfile}
          onClose={() => setShowIcebreaker(false)}
        />
      )}
    </div>
  );
}