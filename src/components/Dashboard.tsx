import React, { useState } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { InputSection } from './InputSection';
import { FinancialCharts } from './FinancialCharts';
import { FinancialTable } from './FinancialTable';
import { LifeEventTimeline } from './LifeEventTimeline';
import { PrintSummary } from './PrintSummary';
import { Printer } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const results = useSimulation();
    const [view, setView] = useState<'chart' | 'table'>('chart');
    const [isPrinting, setIsPrinting] = useState(false);

    const handlePrint = () => {
        setView('chart');
        setIsPrinting(true);
        // isPrinting=true でチャートが固定幅で再描画される時間を確保してから印刷
        setTimeout(() => {
            window.print();
            window.addEventListener('afterprint', () => {
                setIsPrinting(false);
            }, { once: true });
        }, 300);
    };

    return (
        <div className="w-full px-6 py-4 flex flex-col lg:flex-row gap-6">
            {/* LEFT COLUMN: INPUTS（印刷時は非表示・モバイルは下に） */}
            <div className="w-full lg:w-5/12 min-w-0 no-print order-2 lg:order-1">
                <InputSection />
            </div>

            {/* RIGHT COLUMN: OUTPUTS（モバイルは上に） */}
            <div className="w-full lg:w-7/12 space-y-4 print-results-col order-1 lg:order-2">
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded shadow-sm border border-l-4 border-l-slate-800 no-print">
                    <h2 className="text-2xl font-bold text-slate-800">シミュレーション結果</h2>
                    <div className="flex items-center gap-2">
                        <div className="space-x-2">
                            <button
                                className={`px-4 py-2 rounded text-sm ${view === 'chart' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                                onClick={() => setView('chart')}
                            >
                                グラフ
                            </button>
                            <button
                                className={`px-4 py-2 rounded text-sm ${view === 'table' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                                onClick={() => setView('table')}
                            >
                                表
                            </button>
                        </div>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-1.5 px-3 py-2 rounded text-sm bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
                            title="A3横でグラフを印刷"
                        >
                            <Printer className="h-4 w-4" />
                            印刷
                        </button>
                    </div>
                </div>

                {/* 印刷時のみ表示するタイトル */}
                <h2 className="print-only text-2xl font-bold text-slate-800 mb-1">ライフプランシミュレーション結果</h2>

                {/* Timeline（印刷時は非表示・スマホ幅では非表示） */}
                {view === 'chart' && (
                    <div className="hidden sm:block bg-white p-1 rounded shadow-sm no-print">
                        <LifeEventTimeline />
                    </div>
                )}

                <div className="bg-white p-4 rounded shadow-sm border min-h-[600px] flex flex-col gap-6 print-chart-wrapper">
                    {view === 'chart' ? (
                        <FinancialCharts data={results} isPrinting={isPrinting} />
                    ) : (
                        <FinancialTable data={results} />
                    )}
                </div>

                {/* 印刷時：明示的改ページ → サマリーページ */}
                <div className="print-page-break" />
                <PrintSummary />
            </div>
        </div>
    );
};
