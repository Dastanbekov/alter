"use client";

import * as React from "react";
import { useState, Suspense, lazy } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const Dithering = lazy(() =>
  import("@paper-design/shaders-react").then((mod) => ({ default: mod.Dithering }))
);

// --- Social Media Platform Icons ---
const IconX = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231L18.244 2.25zM17.03 19.75h1.866L7.156 4.25H5.16l11.874 15.5z" />
  </svg>
);

const IconLinkedIn = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0A66C2" />
  </svg>
);

const IconTelegram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.83.941z" fill="#229ED9" />
  </svg>
);

const IconInstagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FD5949" />
        <stop offset="50%" stopColor="#D6249F" />
        <stop offset="100%" stopColor="#285AEB" />
      </linearGradient>
    </defs>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" fill="url(#ig-grad)" />
  </svg>
);

const IconFacebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" />
  </svg>
);

const IconYouTube = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.582 6.186A2.482 2.482 0 0 0 19.82 4.42C18.1 4 12 4 12 4s-6.1 0-7.82.42c-.98.26-1.74.98-1.762 1.766C2 7.94 2 12 2 12s0 4.06.418 5.814c.022.786.782 1.506 1.762 1.766C6.1 20 12 20 12 20s6.1 0 7.82-.42c.98-.26 1.74-.98 1.762-1.766C22 16.06 22 12 22 12s0-4.06-.418-5.814zM9.75 15.5V8.5L15.75 12 9.75 15.5z" fill="#FF0000" />
  </svg>
);

const IconTikTok = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.99a8.16 8.16 0 0 0 4.77 1.52V7.04a4.85 4.85 0 0 1-1-.35z" />
  </svg>
);

const IconWhatsApp = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" fill="#25D366" />
  </svg>
);

const IconReddit = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" fill="#FF4500" />
  </svg>
);

const IconPinterest = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" fill="#BD081C" />
  </svg>
);

interface HeroIconData {
  id: number;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  className: string;
}

const FloatingIcon = ({
  mouseX,
  mouseY,
  iconData,
  index,
}: {
  mouseX: React.MutableRefObject<number>;
  mouseY: React.MutableRefObject<number>;
  iconData: HeroIconData;
  index: number;
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  React.useEffect(() => {
    const handleMouseMove = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const distance = Math.sqrt(
          Math.pow(mouseX.current - (rect.left + rect.width / 2), 2) +
            Math.pow(mouseY.current - (rect.top + rect.height / 2), 2)
        );
        if (distance < 150) {
          const angle = Math.atan2(
            mouseY.current - (rect.top + rect.height / 2),
            mouseX.current - (rect.left + rect.width / 2)
          );
          const force = (1 - distance / 150) * 50;
          x.set(-Math.cos(angle) * force);
          y.set(-Math.sin(angle) * force);
        } else {
          x.set(0);
          y.set(0);
        }
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y, mouseX, mouseY]);

  const floatDuration = React.useMemo(() => 5 + (index % 5), [index]);

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute ${iconData.className}`}
    >
      <motion.div
        className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 p-3 rounded-2xl shadow-lg bg-white/8 backdrop-blur-md border border-white/10"
        animate={{ y: [0, -7, 0, 7, 0], rotate: [0, 4, 0, -4, 0] }}
        transition={{ duration: floatDuration, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      >
        <iconData.icon className="w-7 h-7 md:w-8 md:h-8" />
      </motion.div>
    </motion.div>
  );
};

const heroIcons: HeroIconData[] = [
  { id: 1, icon: IconX, className: "top-[12%] left-[8%]" },
  { id: 2, icon: IconLinkedIn, className: "top-[20%] right-[7%]" },
  { id: 3, icon: IconTelegram, className: "top-[75%] left-[6%]" },
  { id: 4, icon: IconInstagram, className: "bottom-[12%] right-[8%]" },
  { id: 5, icon: IconFacebook, className: "top-[5%] left-[28%]" },
  { id: 6, icon: IconYouTube, className: "top-[5%] right-[28%]" },
  { id: 7, icon: IconTikTok, className: "bottom-[8%] left-[22%]" },
  { id: 8, icon: IconWhatsApp, className: "top-[42%] left-[3%]" },
  { id: 9, icon: IconReddit, className: "top-[65%] right-[22%]" },
  { id: 10, icon: IconPinterest, className: "top-[88%] left-[65%]" },
];

export function HeroSection() {
  const mouseX = React.useRef(0);
  const mouseY = React.useRef(0);
  const [hovered, setHovered] = useState(false);

  return (
    <section
      className="relative overflow-hidden min-h-screen"
      style={{
        background: "linear-gradient(135deg, #f8f6f0 0%, #ede8df 40%, #e8f4f0 100%)",
      }}
      onMouseMove={(e) => {
        mouseX.current = e.clientX;
        mouseY.current = e.clientY;
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Dithering shader background */}
      <Suspense fallback={null}>
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 mix-blend-multiply">
          <Dithering
            colorBack="#00000000"
            colorFront="#1a7352"
            shape="warp"
            type="4x4"
            speed={hovered ? 0.5 : 0.15}
            className="size-full"
            minPixelRatio={1}
          />
        </div>
      </Suspense>
      {/* Floating social icons background */}
      <div className="absolute inset-0 w-full h-full hidden md:block pointer-events-none">
        {heroIcons.map((icon, index) => (
          <FloatingIcon key={icon.id} mouseX={mouseX} mouseY={mouseY} iconData={icon} index={index} />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-stretch min-h-screen">
        {/* Text column */}
        <div className="flex items-center justify-center w-full lg:w-7/12 lg:order-2 pt-[100px] pb-10 px-6 sm:px-10 lg:pt-[120px] lg:pb-[60px] lg:px-8">
          <div className="max-w-xl bg-white/60 backdrop-blur-[6px] rounded-[28px] px-7 py-8 sm:px-10 sm:py-10 border border-white/80 shadow-[0_4px_32px_rgba(255,255,255,0.4)]">
            <h1 className="font-['Outfit'] text-[clamp(36px,8vw,68px)] font-extrabold leading-[1.1] text-[#1a1a1a] mb-6">
              Publish everywhere.{" "}
              <span className="bg-gradient-to-br from-[#1a7352] to-[#2d9e6f] text-transparent bg-clip-text">
                Effortlessly.
              </span>
            </h1>

            <p className="text-[16px] sm:text-[18px] text-[#4a5568] leading-[1.6] sm:leading-[1.75] mb-8 sm:mb-10">
              Just tell Alter what happened. Our AI crafts perfect posts for LinkedIn, X, Telegram, Instagram and more — then schedules them automatically. One message, every platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10 sm:mb-12">
              <a
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#1a7352] hover:bg-[#155f43] text-white rounded-lg text-[15px] font-bold no-underline transition-all duration-200 shadow-[0_4px_20px_rgba(26,115,82,0.3)] w-full sm:w-auto"
              >
                Start for free →
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent border-2 border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white rounded-lg text-[15px] font-semibold no-underline transition-all duration-200 w-full sm:w-auto"
              >
                See how it works
              </a>
            </div>

            <div className="pt-8 border-t-2 border-[rgba(26,26,26,0.12)] flex items-center justify-between flex-wrap gap-4">
              <p className="font-bold text-[15px] text-[#1a1a1a]">Supported platforms</p>
              <div className="flex gap-2.5 flex-wrap">
                {[IconX, IconLinkedIn, IconTelegram, IconInstagram, IconFacebook].map((Icon, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 bg-white rounded-[10px] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.08)] shrink-0"
                  >
                    <Icon width={20} height={20} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative w-full lg:w-5/12 lg:order-1 flex items-center justify-center pb-12 pt-6 lg:py-0 overflow-hidden">
          <div className="relative w-full max-w-[280px] lg:max-w-[340px] flex items-center justify-center hover:scale-105 transition-transform duration-700 ease-out lg:translate-x-6">
            <img 
              src="/hero-mockup.png" 
              alt="Alter Mobile Mockup" 
              className="w-full h-auto object-contain drop-shadow-[0_32px_64px_rgba(0,0,0,0.15)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
