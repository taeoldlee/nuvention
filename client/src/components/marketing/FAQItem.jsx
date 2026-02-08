import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className="glass-panel gradient-border flex w-full flex-col gap-3 rounded-2xl p-5 text-left transition-all"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base text-white sm:text-lg">
          {question}
        </h3>
        <ChevronDown
          className={`h-4 w-4 text-slate-300/80 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </div>
      {open && <p className="text-sm text-slate-300/80">{answer}</p>}
    </button>
  );
}
