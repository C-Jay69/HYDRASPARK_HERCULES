import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { AnimatePresence, motion } from "motion/react";
import type { Doc, Id } from "@/convex/_generated/dataModel.d.ts";
import { X, Zap, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  matchId: Id<"matches">;
  myProfile: Doc<"profiles">;
  otherProfile: Doc<"profiles">;
  onClose: () => void;
};

type Step =
  | "intro"
  | "write_statements"
  | "awaiting_responder"
  | "guess_their_lie"
  | "write_your_statements"
  | "awaiting_guess"
  | "results";

export default function IcebreakerModal({ matchId, myProfile, otherProfile, onClose }: Props) {
  const icebreaker = useQuery(api.chat.getIcebreaker, { matchId });
  const startIcebreaker = useMutation(api.chat.startIcebreaker);
  const submitInitiator = useMutation(api.chat.submitInitiatorStatements);
  const submitResponder = useMutation(api.chat.submitResponderTurn);
  const submitGuess = useMutation(api.chat.submitInitiatorGuess);

  const [statements, setStatements] = useState(["", "", ""]);
  const [lieIndex, setLieIndex] = useState<number | null>(null);
  const [guess, setGuess] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const amInitiator = icebreaker?.initiatorId === myProfile._id;

  // Derive current step
  function getStep(): Step {
    if (!icebreaker) return "intro";
    const ib = icebreaker;
    if (ib.status === "pending_initiator" && amInitiator) return "write_statements";
    if (ib.status === "pending_initiator" && !amInitiator) return "awaiting_responder";
    if (ib.status === "pending_responder" && !amInitiator) return "guess_their_lie";
    if (ib.status === "pending_responder" && amInitiator) return "awaiting_responder";
    if (ib.status === "complete" && amInitiator && ib.initiatorGuess === undefined) return "awaiting_guess";
    return "results";
  }

  const step = getStep();

  async function handleStart() {
    setLoading(true);
    try {
      await startIcebreaker({ matchId });
    } catch { toast.error("Failed to start icebreaker"); }
    finally { setLoading(false); }
  }

  async function handleSubmitInitiator() {
    if (lieIndex === null) return toast.error("Mark which statement is the lie");
    if (statements.some((s) => !s.trim())) return toast.error("Fill in all 3 statements");
    setLoading(true);
    try {
      await submitInitiator({ matchId, statements, lieIndex });
    } catch { toast.error("Failed to submit"); }
    finally { setLoading(false); }
  }

  async function handleSubmitResponder() {
    if (guess === null) return toast.error("Guess which is the lie first");
    if (statements.some((s) => !s.trim())) return toast.error("Fill in all 3 statements");
    if (lieIndex === null) return toast.error("Mark which is your lie");
    setLoading(true);
    try {
      await submitResponder({ matchId, guess, statements, lieIndex });
    } catch { toast.error("Failed to submit"); }
    finally { setLoading(false); }
  }

  async function handleGuess() {
    if (guess === null) return toast.error("Guess which is the lie");
    setLoading(true);
    try {
      await submitGuess({ matchId, guess });
    } catch { toast.error("Failed to submit guess"); }
    finally { setLoading(false); }
  }

  const theySrc = amInitiator ? otherProfile.photos[0] : (myProfile.photos[0]);
  const mySrc = amInitiator ? myProfile.photos[0] : otherProfile.photos[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 28 } }}
          exit={{ y: 40, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-[#0d0d1a] border border-white/10 rounded-3xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-black text-white text-sm">Two Truths One Lie</span>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {/* INTRO */}
            {step === "intro" && (
              <div className="text-center space-y-5">
                <div className="flex justify-center -space-x-2">
                  <img src={mySrc} className="w-14 h-14 rounded-full border-2 border-purple-500 object-cover" alt="" />
                  <img src={theySrc} className="w-14 h-14 rounded-full border-2 border-cyan-500 object-cover" alt="" />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg mb-1">Break the ice!</h3>
                  <p className="text-white/50 text-sm">
                    Each of you writes 2 truths and 1 lie. Try to guess each other's lie!
                  </p>
                </div>
                <button
                  onClick={handleStart}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                >
                  Start Icebreaker
                </button>
              </div>
            )}

            {/* WRITE YOUR STATEMENTS */}
            {(step === "write_statements" || step === "write_your_statements") && (
              <div className="space-y-4">
                <p className="text-white/50 text-sm text-center">
                  Write 2 truths and 1 lie. Then mark which is the lie.
                </p>
                {statements.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <button
                      onClick={() => setLieIndex(i)}
                      className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition-all cursor-pointer ${
                        lieIndex === i
                          ? "border-red-400 bg-red-400"
                          : "border-white/20 hover:border-white/50"
                      }`}
                    />
                    <input
                      value={s}
                      onChange={(e) => setStatements((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
                      placeholder={`Statement ${i + 1}${lieIndex === i ? " (LIE)" : ""}`}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-purple-500/50 transition-colors"
                    />
                  </div>
                ))}
                <p className="text-white/30 text-xs text-center">Click the circle to mark which is the lie</p>
                <button
                  onClick={step === "write_statements" ? handleSubmitInitiator : handleSubmitResponder}
                  disabled={loading || lieIndex === null}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                >
                  Submit
                </button>
              </div>
            )}

            {/* AWAITING */}
            {step === "awaiting_responder" && (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full overflow-hidden mx-auto border-2 border-white/10">
                  <img src={theySrc} className="w-full h-full object-cover" alt="" />
                </div>
                <div>
                  <p className="text-white font-bold">Waiting for {amInitiator ? otherProfile.name : myProfile.name}…</p>
                  <p className="text-white/40 text-sm mt-1">They'll write their statements soon.</p>
                </div>
              </div>
            )}

            {/* GUESS THEIR LIE + WRITE YOUR OWN */}
            {step === "guess_their_lie" && icebreaker?.initiatorStatements && (
              <div className="space-y-5">
                <div>
                  <p className="text-white/50 text-sm text-center mb-3">
                    Which of {amInitiator ? otherProfile.name : (amInitiator ? myProfile.name : otherProfile.name)}'s statements is the lie?
                  </p>
                  {icebreaker.initiatorStatements.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setGuess(i)}
                      className={`w-full text-left px-4 py-3 rounded-xl border mb-2 text-sm transition-all cursor-pointer ${
                        guess === i
                          ? "border-red-400/70 bg-red-500/10 text-white"
                          : "border-white/10 bg-white/5 text-white/70 hover:border-white/30"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="border-t border-white/5 pt-4 space-y-3">
                  <p className="text-white/50 text-sm text-center">Now write yours:</p>
                  {statements.map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <button
                        onClick={() => setLieIndex(i)}
                        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition-all cursor-pointer ${
                          lieIndex === i ? "border-red-400 bg-red-400" : "border-white/20 hover:border-white/50"
                        }`}
                      />
                      <input
                        value={s}
                        onChange={(e) => setStatements((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
                        placeholder={`Statement ${i + 1}${lieIndex === i ? " (LIE)" : ""}`}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-purple-500/50 transition-colors"
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSubmitResponder}
                  disabled={loading || guess === null || lieIndex === null}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                >
                  Submit My Turn
                </button>
              </div>
            )}

            {/* INITIATOR GUESSES */}
            {step === "awaiting_guess" && icebreaker?.responderStatements && (
              <div className="space-y-4">
                <p className="text-white/50 text-sm text-center mb-3">
                  {otherProfile.name} wrote their statements. Guess the lie!
                </p>
                {icebreaker.responderStatements.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setGuess(i)}
                    className={`w-full text-left px-4 py-3 rounded-xl border mb-2 text-sm transition-all cursor-pointer ${
                      guess === i
                        ? "border-red-400/70 bg-red-500/10 text-white"
                        : "border-white/10 bg-white/5 text-white/70 hover:border-white/30"
                    }`}
                  >
                    {s}
                  </button>
                ))}
                <button
                  onClick={handleGuess}
                  disabled={loading || guess === null}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                >
                  Submit My Guess
                </button>
              </div>
            )}

            {/* RESULTS */}
            {step === "results" && icebreaker && (
              <div className="space-y-5">
                <div className="text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <h3 className="text-white font-black text-lg">Icebreaker Complete!</h3>
                </div>

                {icebreaker.initiatorStatements && (
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-2">
                      {amInitiator ? "Your" : `${otherProfile.name}'s`} statements
                    </p>
                    {icebreaker.initiatorStatements.map((s, i) => (
                      <div
                        key={i}
                        className={`px-4 py-2.5 rounded-xl border mb-2 text-sm flex items-center justify-between ${
                          i === icebreaker.initiatorLieIndex
                            ? "border-red-400/50 bg-red-500/10 text-red-300"
                            : "border-white/10 bg-white/5 text-white/70"
                        }`}
                      >
                        <span>{s}</span>
                        {i === icebreaker.initiatorLieIndex && (
                          <span className="text-red-400 text-xs font-bold ml-2">LIE</span>
                        )}
                      </div>
                    ))}
                    {icebreaker.responderGuess !== undefined && (
                      <p className={`text-sm text-center mt-1 font-bold ${
                        icebreaker.responderGuess === icebreaker.initiatorLieIndex ? "text-emerald-400" : "text-red-400"
                      }`}>
                        {amInitiator ? otherProfile.name : "You"} guessed {icebreaker.responderGuess === icebreaker.initiatorLieIndex ? "correctly!" : "incorrectly"}
                      </p>
                    )}
                  </div>
                )}

                {icebreaker.responderStatements && (
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-2">
                      {!amInitiator ? "Your" : `${otherProfile.name}'s`} statements
                    </p>
                    {icebreaker.responderStatements.map((s, i) => (
                      <div
                        key={i}
                        className={`px-4 py-2.5 rounded-xl border mb-2 text-sm flex items-center justify-between ${
                          i === icebreaker.responderLieIndex
                            ? "border-red-400/50 bg-red-500/10 text-red-300"
                            : "border-white/10 bg-white/5 text-white/70"
                        }`}
                      >
                        <span>{s}</span>
                        {i === icebreaker.responderLieIndex && (
                          <span className="text-red-400 text-xs font-bold ml-2">LIE</span>
                        )}
                      </div>
                    ))}
                    {icebreaker.initiatorGuess !== undefined && (
                      <p className={`text-sm text-center mt-1 font-bold ${
                        icebreaker.initiatorGuess === icebreaker.responderLieIndex ? "text-emerald-400" : "text-red-400"
                      }`}>
                        {amInitiator ? "You" : otherProfile.name} guessed {icebreaker.initiatorGuess === icebreaker.responderLieIndex ? "correctly!" : "incorrectly"}
                      </p>
                    )}
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 font-medium hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  Back to Chat
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}