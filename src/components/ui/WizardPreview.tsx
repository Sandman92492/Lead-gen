import React from 'react';

interface WizardPreviewProps {
    businessName: string;
    offerTitle: string;
    offerBullets: string[];
}

const WizardPreview: React.FC<WizardPreviewProps> = ({ businessName, offerTitle, offerBullets }) => {
    return (
        <div className="relative mx-auto w-full max-w-[280px]">
            {/* Phone Shell */}
            <div className="relative h-[560px] w-full border-[6px] border-slate-800 bg-slate-800 rounded-[48px] shadow-2xl overflow-hidden group">
                {/* Screen */}
                <div className="h-full w-full bg-[#F8FAFC] rounded-[42px] overflow-hidden relative">

                    {/* Status Bar */}
                    <div className="h-7 w-full flex justify-between px-6 pt-2">
                        <span className="text-[10px] font-bold text-slate-500">9:41</span>
                        <div className="flex gap-1 items-center">
                            <div className="h-2 w-2 rounded-full border border-slate-300" />
                            <div className="h-2 w-3 rounded-sm border border-slate-300" />
                        </div>
                    </div>

                    <div className="px-4 py-6 text-center space-y-4">
                        {/* Header (Business Name) */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white font-black text-lg">
                                {businessName ? businessName.charAt(0).toUpperCase() : 'B'}
                            </div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                {businessName || 'Your Business'}
                            </p>
                        </div>

                        {/* Offer Title */}
                        <div className="space-y-1">
                            <h2 className="text-xl font-black text-slate-900 leading-[1.1]">
                                {offerTitle || 'Your Offer Here'}
                            </h2>
                            <p className="text-[9px] font-medium text-slate-500">
                                Takes 30 seconds. No spam.
                            </p>
                        </div>

                        {/* Form Mockup */}
                        <div className="rounded-[28px] border border-slate-100 bg-white p-4 shadow-sm space-y-2.5">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-8 w-full rounded-xl bg-slate-50 border border-slate-100" />
                            ))}
                            <div className="h-10 w-full rounded-xl bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-wider mt-2">
                                Get Offer
                            </div>
                        </div>

                        {/* Bullets */}
                        <div className="text-left space-y-2 px-1">
                            {offerBullets.filter(b => b.trim()).slice(0, 3).map((b, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <div className="mt-0.5 flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                                        <svg className="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-700 leading-tight">{b}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-24 bg-slate-800 rounded-b-2xl" />

                    {/* Home Indicator */}
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-20 bg-slate-200 rounded-full" />
                </div>
            </div>

            {/* Decorative Glow */}
            <div className="absolute -inset-10 -z-10 bg-indigo-500/10 blur-[100px] rounded-full" />
        </div>
    );
};

export default WizardPreview;
