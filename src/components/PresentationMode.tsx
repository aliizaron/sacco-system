import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  ShieldAlert, 
  Zap, 
  Target, 
  Users, 
  Lock, 
  CheckCircle,
  Sparkles,
  Presentation,
  ShieldCheck,
  TrendingUp,
  Brain,
  FileText,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  bg?: string;
}

interface PresentationModeProps {
  onClose: () => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      id: 0,
      title: "SACCO AI Loan Advisor",
      subtitle: "Intelligent Lending for Modern Finance",
      bg: "bg-neutral-900",
      icon: <ShieldAlert className="w-20 h-20 text-white" />,
      content: (
        <div className="text-center space-y-6">
          <p className="text-xl text-neutral-400">Revolutionizing risk assessment with Gemini AI</p>
          <div className="flex justify-center gap-4 pt-8">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium">Real-time Analysis</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
              <Brain className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium">Gemini 2.0 Powered</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 1,
      title: "The Problem",
      subtitle: "Traditional Lending Bottlenecks",
      bg: "bg-neutral-50",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl">
          <div className="space-y-6">
            {[
              "Manual paper-based risk assessment",
              "Slow turnaround times (days or weeks)",
              "Subjective decision making",
              "Difficulty in evaluating collateral value",
              "Fragmented data siloed in offices"
            ].map((item, i) => (
              <motion.div 
                key={item}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 text-lg text-neutral-600"
              >
                <div className="w-2 h-2 rounded-full bg-red-400" />
                {item}
              </motion.div>
            ))}
          </div>
          <div className="bg-neutral-200 rounded-3xl p-8 flex items-center justify-center border-4 border-dashed border-neutral-300">
             <span className="text-neutral-400 font-bold uppercase tracking-widest text-sm">Inefficient Manual Process</span>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "The AI Solution",
      subtitle: "Automated Intelligence",
      bg: "bg-white",
      icon: <Brain className="w-16 h-16 text-neutral-900" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Risk Analysis",
              desc: "Deep analysis of income, cashflow, and payment history.",
              icon: <Zap className="w-8 h-8 text-amber-500" />
            },
            {
              title: "Collateral Valuation",
              desc: "Automated assessment of collateral details for safety.",
              icon: <ShieldCheck className="w-8 h-8 text-green-500" />
            },
            {
              title: "Suggestions",
              desc: "Alternative qualified amounts when rejection is avoided.",
              icon: <Target className="w-8 h-8 text-blue-500" />
            }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="p-8 rounded-3xl bg-neutral-50 shadow-sm border border-neutral-100 space-y-4"
            >
              {feature.icon}
              <h4 className="text-xl font-bold">{feature.title}</h4>
              <p className="text-neutral-500">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      id: 3,
      title: "Trust & Safety",
      subtitle: "Human-in-the-Loop Safeguards",
      bg: "bg-amber-50",
      content: (
        <div className="max-w-3xl border-l-8 border-amber-400 pl-12 space-y-8 py-4">
          <div className="space-y-2">
            <h4 className="text-3xl font-bold text-amber-900 border-b border-amber-200 pb-4">Verification Threshold</h4>
            <p className="text-xl text-amber-700 leading-relaxed pt-4">
              All loans exceeding <span className="font-bold underline decoration-amber-400">10,000,000 UGX</span> are automatically flagged for manual Human Audit.
            </p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-200 flex-1">
                <p className="text-sm font-bold text-amber-800 uppercase tracking-tighter mb-2">Automated</p>
                <p className="text-xs text-neutral-500">Quick loans up to 10M UGX processed instantly by AI.</p>
             </div>
             <div className="bg-neutral-900 p-6 rounded-2xl shadow-lg flex-1 text-white">
                <p className="text-sm font-bold text-amber-400 uppercase tracking-tighter mb-2">Manual Verification</p>
                <p className="text-xs text-neutral-400">Officer audit required for large disbursements.</p>
             </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Transparency",
      subtitle: "No Black-Box Decisions",
      bg: "bg-neutral-50",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border-l-4 border-l-neutral-900">
               <h5 className="font-bold mb-2">Risk Justification</h5>
               <p className="text-sm text-neutral-600 italic">"Applicant shows consistent cash flow but collateral value is insufficient for current request. Suggested limit: UGX 10M."</p>
            </div>
            <p className="text-neutral-500 text-sm">
              The system provides specific reasons for every decision, including verification checks and alternative loan suggestions.
            </p>
          </div>
          <div className="space-y-4">
             {[
               "Auto-Qualified Badge",
               "Alternative Suggestions",
               "Verification Audit Log",
               "Collateral Assessment"
             ].map((check, i) => (
                <div key={check} className="flex items-center gap-3 bg-white p-4 rounded-xl border border-neutral-200">
                   <CheckCircle className="w-4 h-4 text-green-500" />
                   <span className="text-sm font-medium">{check}</span>
                </div>
             ))}
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "Enterprise Oversight",
      subtitle: "Dashboards for Every Role",
      bg: "bg-white",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
          <div className="p-6 rounded-2xl border border-neutral-100 bg-neutral-50 space-y-4">
             <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white">
                <Users className="w-5 h-5" />
             </div>
             <h6 className="font-bold">Client / Borrower</h6>
             <p className="text-xs text-neutral-500 leading-relaxed">Multi-step application flow, risk monitoring, automated AI advisor chat.</p>
          </div>
          <div className="p-6 rounded-2xl border border-neutral-100 bg-neutral-50 space-y-4">
             <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white">
                <FileText className="w-5 h-5" />
             </div>
             <h6 className="font-bold">Officer / Monitor</h6>
             <p className="text-xs text-neutral-500 leading-relaxed">Full member view, behavior monitoring, and manual loan verification capability.</p>
          </div>
          <div className="p-6 rounded-2xl border border-neutral-100 bg-neutral-50 space-y-4">
             <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white">
                <LayoutDashboard className="w-5 h-5" />
             </div>
             <h6 className="font-bold">Administrator</h6>
             <p className="text-xs text-neutral-500 leading-relaxed">Full system oversight, data management, and strategic control over risk thresholds.</p>
          </div>
        </div>
      )
    },
    {
      id: 6,
      title: "Intelligent Future",
      subtitle: "Safe, Fast, and Scalable",
      bg: "bg-neutral-900",
      icon: <ShieldCheck className="w-24 h-24 text-white" />,
      content: (
        <div className="text-center space-y-8">
          <div className="grid grid-cols-3 gap-12 max-w-2xl mx-auto">
             <div className="space-y-1">
                <p className="text-3xl font-bold text-white">90%</p>
                <p className="text-xs text-neutral-500 uppercase tracking-widest">Automation</p>
             </div>
             <div className="space-y-1">
                <p className="text-3xl font-bold text-white">24/7</p>
                <p className="text-xs text-neutral-500 uppercase tracking-widest">Advisor Availability</p>
             </div>
             <div className="space-y-1">
                <p className="text-3xl font-bold text-white">Zero</p>
                <p className="text-xs text-neutral-500 uppercase tracking-widest">Decision Bias</p>
             </div>
          </div>
          <p className="text-xl text-neutral-400">Ready to transform your SACCO today.</p>
          <Button onClick={onClose} variant="outline" className="text-white border-white/20 hover:bg-white hover:text-neutral-900 rounded-full px-8 h-12">
            Finish Presentation
          </Button>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[100] ${slide.bg} flex flex-col items-center justify-center p-8 overflow-hidden`}
    >
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 p-3 rounded-full bg-white/10 text-white/50 hover:text-white hover:bg-white/20 transition-all z-[110]"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full grid grid-cols-12 grid-rows-12 gap-px bg-white/10" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 100, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -100, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-6xl w-full flex flex-col items-center justify-center space-y-12 h-full py-20"
        >
          {slide.icon && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              {slide.icon}
            </motion.div>
          )}

          <div className="text-center space-y-4 max-w-4xl">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`text-6xl md:text-8xl font-black tracking-tighter ${slide.bg === 'bg-neutral-900' ? 'text-white' : 'text-neutral-900'}`}
            >
              {slide.title}
            </motion.h2>
            {slide.subtitle && (
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`text-xl md:text-2xl font-medium tracking-tight ${slide.bg === 'bg-neutral-900' ? 'text-neutral-400' : 'text-neutral-500'}`}
              >
                {slide.subtitle}
              </motion.p>
            )}
          </div>

          <div className={`flex-1 flex items-center justify-center w-full ${slide.bg === 'bg-neutral-900' ? 'text-white' : 'text-neutral-900'}`}>
            {slide.content}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-12 flex items-center gap-8 z-[110]">
        <button 
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`p-4 rounded-full border transition-all ${currentSlide === 0 ? 'opacity-0' : 'opacity-100'} ${slide.bg === 'bg-neutral-900' ? 'border-white/20 text-white hover:bg-white/10' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'}`}
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <div className="flex gap-3">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-500 ${i === currentSlide ? `w-12 ${slide.bg === 'bg-neutral-900' ? 'bg-white' : 'bg-neutral-900'}` : `w-3 ${slide.bg === 'bg-neutral-900' ? 'bg-white/20' : 'bg-neutral-200'}`}`} 
            />
          ))}
        </div>

        <button 
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className={`p-4 rounded-full border transition-all ${currentSlide === slides.length - 1 ? 'opacity-0' : 'opacity-100'} ${slide.bg === 'bg-neutral-900' ? 'border-white/20 text-white hover:bg-white/10' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'}`}
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      <div className="absolute bottom-12 right-12">
        <p className={`text-xs font-mono uppercase tracking-[0.3em] ${slide.bg === 'bg-neutral-900' ? 'text-neutral-500' : 'text-neutral-300'}`}>
          Slide {currentSlide + 1} of {slides.length}
        </p>
      </div>
    </motion.div>
  );
};
