import { useState } from "react";
import { Sparkles, CreditCard } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  onSuccess: () => void;
}

const OPTIONS = [10, 50, 100, 200, 500];
const PRICES = { 10: 3, 50: 10, 100: 18, 200: 32, 500: 69 };

export function BillingView({ onSuccess }: Props) {
  const [sliderIndex, setSliderIndex] = useState(1);
  const [loading, setLoading] = useState(false);

  const postsAmount = OPTIONS[sliderIndex];
  const price = PRICES[postsAmount as keyof typeof PRICES];
  
  const basePricePerPost = 0.30;
  const currentPricePerPost = price / postsAmount;
  const discount = Math.round(((basePricePerPost - currentPricePerPost) / basePricePerPost) * 100);

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

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 overflow-y-auto bg-[#F9FAFB] fade-in">
      <div className="max-w-[500px] w-full bg-white rounded-[24px] p-8 border border-[var(--border)] shadow-sm relative overflow-hidden text-left">
        
        {/* Top Tag */}
        <div className="absolute top-0 right-0 bg-[#ecfdf5] text-[#059669] px-4 py-2 rounded-bl-[16px] font-semibold text-[13px] flex items-center gap-1.5">
          <Sparkles size={14} color="#059669" /> Pay-as-you-go
        </div>

        <h1 className="font-['Outfit'] font-bold text-[24px] text-gray-900 mb-6">
          Calculate your credits
        </h1>

        {/* Big Price Area */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-[48px] font-extrabold text-gray-900 leading-none tracking-tight">
            ${price.toFixed(2)}
          </span>
          <span className="text-[16px] font-medium text-gray-400">
            for {postsAmount} posts
          </span>
        </div>

        {/* Subtitle / Discount */}
        <div className="flex items-center gap-3 mb-8">
          <span className="text-[15px] text-gray-600 font-medium">
            = <strong className="text-gray-900">${currentPricePerPost.toFixed(3)}</strong> per post
          </span>
          {discount > 0 && (
            <div className="bg-[#ecfdf5] text-[#059669] px-2.5 py-1 rounded-full text-[13px] font-bold">
              {discount}% cheaper
            </div>
          )}
        </div>

        {/* Slider Card */}
        <div className="bg-[#F9FAFB] border border-gray-100 rounded-[20px] p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-[18px] text-gray-900">{postsAmount} posts</span>
            <span className="font-bold text-[18px] text-[#059669]">${price.toFixed(2)}</span>
          </div>
          
          <div className="relative flex items-center h-2 bg-gray-200 rounded-lg">
            <div 
              className="absolute h-full bg-[#059669] rounded-lg"
              style={{ width: `${(sliderIndex / (OPTIONS.length - 1)) * 100}%` }}
            />
            <input
              type="range"
              min="0"
              max={OPTIONS.length - 1}
              step="1"
              value={sliderIndex}
              onChange={(e) => setSliderIndex(Number(e.target.value))}
              className="absolute w-full h-full opacity-0 cursor-pointer"
            />
            <div 
              className="absolute w-4 h-4 bg-[#059669] rounded-full shadow border-2 border-white pointer-events-none"
              style={{ left: `calc(${(sliderIndex / (OPTIONS.length - 1)) * 100}% - 8px)` }}
            />
          </div>
          
          <div className="flex justify-between mt-5 text-[13px] font-medium text-gray-400">
            <span>10 posts</span>
            <span>500 posts</span>
          </div>
        </div>

        {/* Quick Selection Buttons */}
        <div className="flex flex-wrap gap-2 mb-8">
          {OPTIONS.map((opt, i) => {
            const isSelected = i === sliderIndex;
            return (
              <button
                key={opt}
                onClick={() => setSliderIndex(i)}
                className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-colors border ${
                  isSelected 
                    ? 'bg-[#059669] text-white border-[#059669]' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {opt} &rarr; ${PRICES[opt as keyof typeof PRICES]}
              </button>
            );
          })}
        </div>

        {/* Buy Button */}
        <button
          onClick={handleBuy}
          disabled={loading}
          className={`w-full py-4 rounded-xl bg-gray-900 text-white border-none text-[16px] font-bold cursor-pointer flex items-center justify-center gap-2.5 transition-transform duration-200 hover:-translate-y-0.5
            ${loading ? 'opacity-70 cursor-not-allowed hover:translate-y-0' : ''}`}
        >
          {loading ? (
            <div className="spinner w-5 h-5 border-[rgba(255,255,255,0.3)] border-t-white" />
          ) : (
            <CreditCard size={20} />
          )}
          {loading ? "Processing..." : `Checkout • $${price.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}
