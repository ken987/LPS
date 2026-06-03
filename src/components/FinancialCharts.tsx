import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ComposedChart, Bar, Line, Legend, ReferenceLine
} from 'recharts';
import type { YearlyResult } from '../types';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface Props {
    data: YearlyResult[];
    isPrinting?: boolean;
}

// 印刷時の固定チャートサイズ（A3横2列レイアウト）
// A3横 297mm≒788px(72dpi) - 余白(40mm)≒114px - タイトル40px - 行間16px = 約618px / 2行 - CardHeader55px ≈ 254px
// → 安全値として270pxに設定（96dpiでも1ページ収まる）
const PRINT_W = 700;
const PRINT_H = 270;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fmtNum = (val: any): number => Math.round(Number(val) || 0);

const formatYAxis = (value: number) => {
    const abs = Math.abs(value);
    if (abs >= 100000000) {
        // use 1 decimal place if needed (e.g. 1.5億), remove trailing zeros
        return `${(value / 100000000).toLocaleString(undefined, { maximumFractionDigits: 1 })}億`;
    }
    if (abs >= 10000) {
        // use 1 decimal place if needed (e.g. 1.5万), though usually not needed for larger numbers
        return `${(value / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })}万`;
    }
    return value.toLocaleString();
};

export const FinancialCharts: React.FC<Props> = ({ data, isPrinting }) => {
    const rcW = isPrinting ? PRINT_W : "100%";
    const rcH = isPrinting ? PRINT_H : "100%";
    return (
        <div className="space-y-8 print-charts-grid">
            {/* 2. PL CHART (COMPOSED) */}
            {(() => {
                // Outlier Clipping Logic for PL Chart
                // Collect all meaningful values
                let values: number[] = [];
                data.forEach(d => {
                    values.push(d.revenue);
                    values.push(d.expense);
                });
                values = values.filter(v => v > 0).sort((a, b) => a - b);

                let plDomainMax: number | 'auto' = 'auto';

                if (values.length > 0) {
                    // Logic: Use P95 (95th percentile) as a baseline for "normal max"
                    // Previously P90, which was too aggressive.
                    const p95Index = Math.floor(values.length * 0.95);
                    const p95Value = values[p95Index];

                    // Allow more headroom above P95 (e.g. +50%)
                    // Previously 1.2x, now 1.5x to be safer.
                    const smartLimit = p95Value * 1.5;

                    const trueMax = values[values.length - 1];

                    // If the True Max is significantly larger than Smart Limit (e.g. > 1.2x of the limit),
                    // we clamp to the Smart Limit.
                    if (trueMax > smartLimit * 1.2) {
                        plDomainMax = Math.ceil(smartLimit / 1000000) * 1000000; // Round to nearest Million
                    } else {
                        plDomainMax = 'auto';
                    }
                }

                return (
                    <Card className="border-l-4 border-l-blue-500 shadow-md">
                        <CardHeader className="bg-slate-50/50 border-b pb-3">
                            <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                <span className="w-3 h-8 bg-blue-500 rounded-sm inline-block mr-1"></span>
                                収入と支出(キャッシュフロー)
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="h-[380px] pt-6 print-chart-content">
                            <ResponsiveContainer width={rcW} height={rcH}>
                                <ComposedChart data={data} margin={{ top: 10, right: 50, left: 10, bottom: 5 }}>
                                    <XAxis dataKey="age" tick={{ fontSize: 11, fill: '#334155' }} interval={4} />
                                    <YAxis
                                        tickFormatter={formatYAxis}
                                        width={75}
                                        tick={{ fontSize: 11, fill: '#334155' }}
                                        domain={[0, plDomainMax]}
                                        allowDataOverflow={true}
                                    />

                                    <Tooltip
                                        formatter={(val) => fmtNum(val).toLocaleString()}
                                        contentStyle={{
                                            fontSize: '12px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />

                                    {/* Revenue as Bars */}
                                    <Bar dataKey="revenue" barSize={12} fill="#3b82f6" name="総収入" radius={[2, 2, 0, 0]} />

                                    {/* Expense as Line */}
                                    <Line
                                        type="monotone"
                                        dataKey="expense"
                                        stroke="#dc2626"
                                        strokeWidth={2}
                                        dot={{ r: 3, strokeWidth: 2 }}
                                        name="総支出"
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                );
            })()}

            {/* 1. BS CHART (AREA) */}
            < Card className="border-l-4 border-l-emerald-500 shadow-md" >
                <CardHeader className="bg-slate-50/50 border-b pb-3">
                    <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                        <span className="w-3 h-8 bg-emerald-500 rounded-sm inline-block mr-1"></span>
                        資産と負債の推移
                    </CardTitle>
                </CardHeader>

                <CardContent className="h-[380px] pt-6 print-chart-content">
                    <ResponsiveContainer width={rcW} height={rcH}>
                        <AreaChart data={data} margin={{ top: 10, right: 50, left: 10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="colorLiabilities" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="age" tick={{ fontSize: 11, fill: '#334155' }} interval={4} />
                            <YAxis
                                tickFormatter={formatYAxis}
                                width={75}
                                tick={{ fontSize: 11, fill: '#334155' }}
                            />

                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <Tooltip
                                formatter={(val) => fmtNum(val).toLocaleString()}
                                contentStyle={{
                                    fontSize: '12px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                            />

                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                            <Area
                                type="monotone"
                                dataKey="totalAssets"
                                stroke="#059669"
                                strokeWidth={2.5}
                                fill="url(#colorAssets)"
                                name="総資産"
                            />

                            <Area
                                type="monotone"
                                dataKey="totalLiabilities"
                                stroke="#dc2626"
                                strokeWidth={2.5}
                                fill="url(#colorLiabilities)"
                                name="負債総額"
                            />

                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card >

            {/* NEW: SAVINGS & INVESTMENT COMPOSITION CHART (BSの下) */}
            {(() => {
                // Constants for "Adaptive Synchronized Steps"
                // 1. Define Base Unit (Smallest granular step)
                const UNIT_AMOUNT = 1000000; // 100万単位
                const UNIT_RATE = 10;        // 10%単位

                // 2. Define Hard Limits (Visual Caps)
                const MAX_AMOUNT_CAP = 10000000; // +1000万
                const MIN_AMOUNT_CAP = -5000000; // -500万

                const MAX_RATE_CAP = 100; // +100%
                const MIN_RATE_CAP = -50; // -50%

                // 3. Calculate Raw Data Range
                let rawMaxLeft = 0, rawMinLeft = 0;
                let rawMaxRight = 0, rawMinRight = 0;

                data.forEach(d => {
                    // Amount
                    const pos = (d.annualInvestments > 0 ? d.annualInvestments : 0) + (d.annualSavings > 0 ? d.annualSavings : 0);
                    const neg = (d.annualInvestments < 0 ? d.annualInvestments : 0) + (d.annualSavings < 0 ? d.annualSavings : 0);
                    if (pos > rawMaxLeft) rawMaxLeft = pos;
                    if (neg < rawMinLeft) rawMinLeft = neg;

                    // Rate
                    if (d.savingsRate > rawMaxRight) rawMaxRight = d.savingsRate;
                    if (d.savingsRate < rawMinRight) rawMinRight = d.savingsRate;
                });

                // 4. Calculate "Needed Steps" based on Data
                // (Round up to nearest UNIT)
                let stepsUpLeft = Math.ceil(rawMaxLeft / UNIT_AMOUNT);
                let stepsDownLeft = Math.ceil(Math.abs(rawMinLeft) / UNIT_AMOUNT);

                let stepsUpRight = Math.ceil(rawMaxRight / UNIT_RATE);
                let stepsDownRight = Math.ceil(Math.abs(rawMinRight) / UNIT_RATE);

                // 5. Clamp Steps to Hard Limits
                // Convert Cap to Steps
                const maxStepsUpLeftCap = Math.floor(MAX_AMOUNT_CAP / UNIT_AMOUNT); // 10 steps
                const maxStepsDownLeftCap = Math.floor(Math.abs(MIN_AMOUNT_CAP) / UNIT_AMOUNT); // 5 steps

                const maxStepsUpRightCap = Math.floor(MAX_RATE_CAP / UNIT_RATE); // 10 steps
                const maxStepsDownRightCap = Math.floor(Math.abs(MIN_RATE_CAP) / UNIT_RATE); // 5 steps

                // Apply Caps
                // Note: We use Math.min to cap the VIEW. Data outliers will overflow.
                stepsUpLeft = Math.min(stepsUpLeft, maxStepsUpLeftCap);
                stepsDownLeft = Math.min(stepsDownLeft, maxStepsDownLeftCap);

                stepsUpRight = Math.min(stepsUpRight, maxStepsUpRightCap);
                stepsDownRight = Math.min(stepsDownRight, maxStepsDownRightCap);

                // 6. Ensure Minimum Display (Optional: e.g. at least 1 step if data is all 0?)
                // If data is [0,0], steps will be 0. Let's force at least 1 step up if everything is 0.
                if (stepsUpLeft === 0 && stepsDownLeft === 0) stepsUpLeft = 1;
                if (stepsUpRight === 0 && stepsDownRight === 0) stepsUpRight = 1;

                // 7. Synchronize Steps (Alignment Logic)
                // To match zero lines, "Steps Up" must be same for both, "Steps Down" must be same.
                // We take the MAX requirement of either axis.
                const finalStepsUp = Math.max(stepsUpLeft, stepsUpRight);
                const finalStepsDown = Math.max(stepsDownLeft, stepsDownRight);

                // 8. Generate Final Domains & Ticks
                const domainLeft = [-finalStepsDown * UNIT_AMOUNT, finalStepsUp * UNIT_AMOUNT];
                const domainRight = [-finalStepsDown * UNIT_RATE, finalStepsUp * UNIT_RATE];

                const ticksLeft: number[] = [];
                for (let i = -finalStepsDown; i <= finalStepsUp; i++) ticksLeft.push(i * UNIT_AMOUNT);

                const ticksRight: number[] = [];
                for (let i = -finalStepsDown; i <= finalStepsUp; i++) ticksRight.push(i * UNIT_RATE);

                return (
                    <Card className="border-l-4 border-l-orange-500 shadow-md">
                        <CardHeader className="bg-slate-50/50 border-b pb-3">
                            <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                <span className="w-3 h-8 bg-orange-500 rounded-sm inline-block mr-1"></span>
                                貯蓄額と貯蓄率
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="h-[380px] pt-6 print-chart-content">
                            <ResponsiveContainer width={rcW} height={rcH}>
                                {/* Use raw data, allow overflow via domain */}
                                <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                                    <XAxis dataKey="age" tick={{ fontSize: 12, fill: '#334155' }} />

                                    <YAxis
                                        yAxisId="left"
                                        tickFormatter={formatYAxis}
                                        width={80}
                                        tick={{ fontSize: 12, fill: '#334155' }}
                                        domain={domainLeft}
                                        ticks={ticksLeft}
                                        allowDataOverflow={true}
                                        interval={0}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        tickFormatter={(val) => `${val}%`}
                                        width={60}
                                        tick={{ fontSize: 12, fontWeight: 500, fill: '#ea580c' }}
                                        domain={domainRight}
                                        ticks={ticksRight}
                                        allowDataOverflow={true}
                                        interval={0}
                                    />

                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

                                    {/* Explicit Zero Reference Lines */}
                                    <ReferenceLine y={0} yAxisId="left" stroke="#94a3b8" strokeWidth={2} />

                                    <Tooltip
                                        formatter={(val, name) => {
                                            const n = fmtNum(val);
                                            if (name === '貯蓄率') return [`${Number(val).toFixed(1)}%`, name as string];
                                            return [n.toLocaleString(), name as string];
                                        }}
                                        contentStyle={{
                                            fontSize: '12px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                                    <Bar yAxisId="left" dataKey="annualInvestments" stackId="a" fill="#d97706" name="投資積立額" barSize={20} />
                                    <Bar yAxisId="left" dataKey="annualSavings" stackId="a" fill="#fbbf24" name="現金貯蓄" barSize={20} radius={[4, 4, 0, 0]} />

                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="savingsRate"
                                        stroke="#ea580c"
                                        strokeWidth={3}
                                        dot={{ r: 4, strokeWidth: 2 }}
                                        name="貯蓄率"
                                    />

                                </ComposedChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                );
            })()}

            {/* 3. NET WORTH CHART (ORIGINAL) */}
            < Card className="border-l-4 border-l-indigo-500 shadow-md" >
                <CardHeader className="bg-slate-50/50 border-b pb-3">
                    <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                        <span className="w-3 h-8 bg-indigo-500 rounded-sm inline-block mr-1"></span>
                        純資産の推移
                    </CardTitle>
                </CardHeader>

                <CardContent className="h-[300px] pt-6 print-chart-content">
                    <ResponsiveContainer width={rcW} height={rcH}>
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="colorInvestments" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="age" tick={{ fontSize: 12, fill: '#334155' }} />
                            <YAxis
                                tickFormatter={formatYAxis}
                                width={80}
                                tick={{ fontSize: 12, fill: '#334155' }}
                            />

                            <Tooltip
                                formatter={(val) => fmtNum(val).toLocaleString()}
                                contentStyle={{
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                            <Area
                                type="monotone"
                                dataKey="assetBreakdown.investments"
                                stackId="1"
                                stroke="#d97706"
                                strokeWidth={2}
                                fill="url(#colorInvestments)"
                                name="投資資産"
                            />
                            <Area
                                type="monotone"
                                dataKey="assetBreakdown.cash"
                                stackId="1"
                                stroke="#0284c7"
                                strokeWidth={2}
                                fill="url(#colorCash)"
                                name="現金資産"
                            />

                            <Line
                                type="monotone"
                                dataKey="netWorth"
                                stroke="#4f46e5"
                                strokeWidth={3}
                                dot={false}
                                name="純資産 (負債控除後)"
                            />

                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card >
        </div >
    );
};
