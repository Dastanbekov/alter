import { useState } from "react";
import { Zap, Check, CreditCard } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  onSuccess: () => void;
}

export function BillingView({ onSuccess }: Props) {
  const [postsAmount, setPostsAmount] = useState(50);
  const [loading, setLoading] = useState(false);

  // Pricing logic — must match /api/user/billing/buy and PricingSection
  const getPrice = (posts: number) => {
    if (posts <= 10) return 3.0;
    if (posts <= 50) return 10.0;
    if (posts <= 100) return 18.0;
    if (posts <= 200) return 32.0;
    return (posts / 500) * 69.0;
  };

  const handleBuy = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/billing/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: postsAmount }),
      });

      if (!res.ok) throw new Error("Purchase failed");

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to DodoPayments checkout
      } else {
        toast.error("Failed to generate checkout link");
      }
    } catch (e) {
      toast.error("Failed to buy credits");
    } finally {
      setLoading(false);
    }
  };

  const price = getPrice(postsAmount);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 overflow-y-auto bg-[var(--surface-0)] fade-in">
      <div className="max-w-[600px] w-full bg-[var(--surface-1)] rounded-[24px] p-6 md:p-10 border border-[var(--border)] shadow-[0_20px_40px_rgba(0,0,0,0.05)] text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#ef4444] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_rgba(245,158,11,0.3)]">
          <Zap size={32} color="white" />
        </div>

        <h1 className="font-['Outfit'] text-[28px] md:text-[32px] font-extrabold text-[var(--text-primary)] mb-3">
          Unlock PRO Features
        </h1>
        <p className="text-[var(--text-secondary)] text-[15px] md:text-[16px] mb-8 leading-[1.6]">
          Top up your balance to get more posts and permanently unlock the <b>Auto-posting & Scheduling</b> calendar.
        </p>

        {/* Benefits */}
        <div className="flex flex-col gap-3 items-start mx-auto mb-8 max-w-[300px] text-left">
          {[
            "Unlock Kanban scheduling board",
            "Generate for multiple platforms at once",
            "Advanced AI Models (GPT-4o)",
            "Credits never expire",
          ].map((benefit) => (
            <div key={benefit} className="flex items-center gap-2.5">
              <div className="bg-[rgba(16,185,129,0.1)] p-1 rounded-full shrink-0">
                <Check size={14} color="#10b981" />
              </div>
              <span className="text-[14px] md:text-[15px] text-[var(--text-primary)] font-medium leading-tight">
                {benefit}
              </span>
            </div>
          ))}
        </div>

        {/* Slider */}
        <div className="bg-[var(--surface-2)] p-4 md:p-6 rounded-[16px] mb-8">
          <div className="flex justify-between mb-4">
            <span className="font-semibold text-[var(--text-primary)]">{postsAmount} Posts</span>
            <span className="font-extrabold text-[var(--text-primary)] text-[20px]">${price.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={postsAmount}
            onChange={(e) => setPostsAmount(Number(e.target.value))}
            className="w-full accent-[#1a7352]"
          />
          <div className="flex justify-between mt-2 text-[12px] text-[var(--text-muted)]">
            <span>10 posts</span>
            <span>500 posts</span>
          </div>
        </div>

        <button
          onClick={handleBuy}
          disabled={loading}
          className={`w-full p-4 rounded-xl bg-gradient-to-br from-[#1a7352] to-[#2d9e6f] text-white border-none text-[16px] font-bold cursor-pointer flex items-center justify-center gap-2.5 shadow-[0_8px_24px_rgba(67,56,255,0.3)] transition-transform duration-200 hover:-translate-y-0.5
            ${loading ? 'opacity-70 cursor-not-allowed hover:translate-y-0' : ''}`}
        >
          {loading ? (
            <div className="spinner w-5 h-5 border-[rgba(255,255,255,0.3)] border-t-white" />
          ) : (
            <CreditCard size={20} />
          )}
          {loading ? "Processing..." : `Pay $${price.toFixed(2)}`}
        </button>
        <p className="text-[12px] text-[var(--text-muted)] mt-4">
          This is a simulated payment. No real card is charged.
        </p>
      </div>
    </div>
  );
}
