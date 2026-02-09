import React, { useState } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { InputSection } from './InputSection';
import { FinancialCharts } from './FinancialCharts';
import { FinancialTable } from './FinancialTable';
import { LifeEventTimeline } from './LifeEventTimeline';
// Tabs removed

// Actually I installed @radix-ui/react-tabs? No I didn't. I'll just use simple state for tabs or stick to one view.
// Wait, I did NOT install tabs. I'll just use a simple state toggle.

export const Dashboard: React.FC = () => {
    const results = useSimulation();
    const [view, setView] = useState<'chart' | 'table'>('chart');

    return (
        <div className="w-full px-6 py-4 flex flex-col lg:flex-row gap-6">
            {/* LEFT COLUMN: INPUTS */}
            <div className="w-full lg:w-5/12 min-w-[350px]">
                <InputSection />
            </div>

            {/* RIGHT COLUMN: OUTPUTS */}
            <div className="w-full lg:w-7/12 space-y-4">
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded shadow-sm border border-l-4 border-l-slate-800">
                    <h2 className="text-2xl font-bold text-slate-800">シミュレーション結果</h2>
                    <div className="space-x-2">
                        <button
                            className={`px-4 py-2 rounded text-sm ${view === 'chart' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                            onClick={() => setView('chart')}
                        >
                            Charts
                        </button>
                        <button
                            className={`px-4 py-2 rounded text-sm ${view === 'table' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                            onClick={() => setView('table')}
                        >
                            Table
                        </button>
                    </div>
                </div>

                {/* Timeline Component - Moved to Top - Visible only in Chart View */}
                {view === 'chart' && (
                    <div className="bg-white p-1 rounded shadow-sm">
                        <LifeEventTimeline />
                    </div>
                )}

                <div className="bg-white p-4 rounded shadow-sm border min-h-[600px] flex flex-col gap-6">
                    {view === 'chart' ? (
                        <>
                            <FinancialCharts data={results} />

                        </>
                    ) : (
                        <FinancialTable data={results} />
                    )}
                </div>
            </div>
        </div>
    );
};
