import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Calculator } from 'lucide-react';
import { useStore } from '../store';
import { Label } from './ui/label';

import { BasicSettings } from './sidebar/BasicSettings';
import { Lifestyle } from './sidebar/Lifestyle';
import { IncomeParams } from './sidebar/IncomeParams';
import { FixedExpenses, IrregularExpenses } from './sidebar/Expenses';
import { LifeEvents } from './sidebar/LifeEvents';
import { InvestmentFlowSection } from './sidebar/InvestmentFlow';
import { CurrentStock } from './sidebar/CurrentStock';
import { Assumptions } from './sidebar/Assumptions';

export const InputSection: React.FC = () => {
    const store = useStore();
    const { settings, incomes, recurringExpenses, assets, liabilities } = store;

    // Calculate Totals for Header Display (First Year)
    const currentAge = settings.currentAge;

    // C. Income Total (Active at Start)
    const totalIncome = incomes
        .filter(i => currentAge >= i.startAge && currentAge <= i.endAge)
        .reduce((sum, i) => sum + i.amount, 0);

    // D. Expense Total (Fixed + Irregular + Base Living)
    const totalFixed = settings.baseLivingCost + recurringExpenses
        .filter(e => e.isMonthly && (!e.duration || (currentAge >= e.duration.startAge && currentAge <= e.duration.endAge)))
        .reduce((sum, e) => sum + e.amount, 0);

    const totalIrregular = recurringExpenses
        .filter(e => !e.isMonthly && (!e.duration || (currentAge >= e.duration.startAge && currentAge <= e.duration.endAge)))
        .reduce((sum, e) => sum + e.amount, 0);

    const totalExpense = totalFixed + totalIrregular;

    // F. Investment Total (Active at Start)
    const totalInvestment = store.investmentFlows
        .filter(f => currentAge >= f.startAge && currentAge <= f.endAge)
        .reduce((sum, f) => sum + f.amount, 0);

    // G. Assets & Liabilities Total
    const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0) + settings.cashReserve;
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.principal, 0);

    // Common style for accordion items 
    const itemClass = "border border-slate-300 rounded-lg mb-4 shadow-sm bg-white overflow-hidden";
    const triggerClass = "px-4 py-3 hover:bg-slate-50 data-[state=open]:bg-slate-50/80 data-[state=open]:border-b border-slate-100 flex items-center justify-between w-full"; // justify-between for content spread
    const headerWrapperClass = "flex items-center gap-2";
    const headerTextClass = "font-bold text-sm text-slate-800";
    const totalTextClass = "text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full ml-auto"; // ml-auto to push right
    const contentClass = "px-4 py-5 bg-white";

    return (
        <div className="w-full h-full">
            {/* Header Title - Now standalone without card wrapper */}
            <div className="flex items-center gap-2 mb-4 px-1 py-1">
                <Calculator className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-800">試算条件</h2>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* LEFT COLUMN: A - D */}
                <div className="w-full flex flex-col">
                    <Accordion type="multiple" defaultValue={['basic']} className="w-full border-none">
                        {/* SECTION A: Basic Profile */}
                        <AccordionItem value="basic" className={itemClass}>
                            <AccordionTrigger className={triggerClass}>
                                <div className={headerWrapperClass}>
                                    <span className={headerTextClass}>A. 基本設定</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className={contentClass}>
                                <BasicSettings />
                            </AccordionContent>
                        </AccordionItem>

                        {/* SECTION B: Lifestyle */}
                        <AccordionItem value="lifestyle" className={itemClass}>
                            <AccordionTrigger className={triggerClass}>
                                <div className={headerWrapperClass}>
                                    <span className={headerTextClass}>B. 生活様式</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className={contentClass}>
                                <Lifestyle />
                            </AccordionContent>
                        </AccordionItem>

                        {/* SECTION C: Income */}
                        <AccordionItem value="income" className={itemClass}>
                            <AccordionTrigger className={triggerClass}>
                                <div className={headerWrapperClass}>
                                    <span className={headerTextClass}>C. 収入計画</span>
                                </div>
                                <span className={totalTextClass}>初年度合計: ¥{Math.round(totalIncome / 10000).toLocaleString()}万</span>
                            </AccordionTrigger>
                            <AccordionContent className={contentClass}>
                                <IncomeParams />
                            </AccordionContent>
                        </AccordionItem>

                        {/* SECTION D: Expenses (Combined structured Trigger) */}
                        <AccordionItem value="expenses" className={itemClass}>
                            <AccordionTrigger className={triggerClass}>
                                <div className="w-full text-left">
                                    {/* Main Header Row */}
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={headerWrapperClass}>
                                            <span className={headerTextClass}>D. 支出計画</span>
                                        </div>
                                        <span className={totalTextClass}>初年度合計: ¥{Math.round(totalExpense / 10000).toLocaleString()}万</span>
                                    </div>

                                    {/* Summary Rows (D-1/D-2) - Visible in Collapsed State via Trigger */}
                                    <div className="pl-4 space-y-1">
                                        <div className="flex items-center justify-between text-xs text-slate-600">
                                            <span className="font-semibold">D-1. 固定費 (基本生活費・保険・サブスクなど) [年額]</span>
                                            <span className="text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full ml-auto">
                                                計 ¥{Math.round(totalFixed / 10000).toLocaleString()}万
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-600">
                                            <span className="font-semibold">D-2. 特別費 (不定期・イベント費)</span>
                                            <span className="text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full ml-auto">
                                                計 ¥{Math.round(totalIrregular / 10000).toLocaleString()}万
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className={contentClass}>
                                {/* D-1. Fixed Expenses Edit */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-slate-700 mb-3 pb-1 border-b">D-1. 固定費詳細設定</h3>
                                    <FixedExpenses />
                                </div>

                                {/* D-2. Special Expenses Edit */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-700 mb-3 pb-1 border-b">D-2. 特別費詳細設定</h3>
                                    <IrregularExpenses />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                {/* RIGHT COLUMN: E - H */}
                <div className="w-full flex flex-col">
                    <Accordion type="multiple" defaultValue={['events', 'investments']} className="w-full border-none">
                        {/* SECTION E: Life Events */}
                        <AccordionItem value="events" className={itemClass}>
                            <AccordionTrigger className={triggerClass}>
                                <div className={headerWrapperClass}>
                                    <span className={headerTextClass}>E. ライフイベント</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className={contentClass}>
                                <LifeEvents />
                            </AccordionContent>
                        </AccordionItem>

                        {/* SECTION F: Investment Flow */}
                        <AccordionItem value="investments" className={itemClass}>
                            <AccordionTrigger className={triggerClass}>
                                <div className={headerWrapperClass}>
                                    <span className={headerTextClass}>F. 資産形成(貯金・投資)</span>
                                </div>
                                <span className={totalTextClass}>年間積立: ¥{Math.round(totalInvestment / 10000).toLocaleString()}万</span>
                            </AccordionTrigger>
                            <AccordionContent className={contentClass}>
                                <InvestmentFlowSection />
                            </AccordionContent>
                        </AccordionItem>

                        {/* SECTION G: Current Stock */}
                        <AccordionItem value="stock" className={itemClass}>
                            <AccordionTrigger className={triggerClass}>
                                <div className={headerWrapperClass}>
                                    <span className={headerTextClass}>G. いまの資産と負債</span>
                                </div>
                                <span className={totalTextClass}>初年度合計: ¥{Math.round(totalAssets / 10000).toLocaleString()}万</span>
                            </AccordionTrigger>
                            <AccordionContent className={contentClass}>
                                <CurrentStock />
                            </AccordionContent>
                        </AccordionItem>

                        {/* SECTION H: General Settings */}
                        <AccordionItem value="general" className={itemClass}>
                            <AccordionTrigger className={triggerClass}>
                                <div className={headerWrapperClass}>
                                    <span className={headerTextClass}>H. 試算条件</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className={contentClass}>
                                <Assumptions />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

            </div>
        </div>
    );
};
