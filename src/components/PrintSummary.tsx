import React from 'react';
import { useStore } from '../store';

const fmt = (v: number) => `¥${Math.round(v / 10000).toLocaleString()}万`;
const fmtRate = (v: number) => `${v}%`;

export const PrintSummary: React.FC = () => {
    const { settings, incomes, recurringExpenses, events, investmentFlows, assets, liabilities } = useStore();
    const { currentAge, deathAge, currentYear, baseLivingCost, inflationRate, defaultReturnRate, cashReserve, cashName, surplusAllocation, family } = settings;

    const allocationLabel = surplusAllocation === 'Invest' ? '投資へ回す' : surplusAllocation === 'Spend' ? '消費する' : '貯金へ回す';
    const fixedExpenses = recurringExpenses.filter(e => e.isMonthly);
    const irregularExpenses = recurringExpenses.filter(e => !e.isMonthly);

    return (
        <div className="print-summary-page hidden">
            <h2 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-800">
                試算条件サマリー
            </h2>

            <div className="print-summary-grid">
                {/* ===== 左列：A / C / E / F / G / H ===== */}
                <div className="print-summary-left-col">
                    <section className="print-summary-section">
                        <h3 className="print-summary-heading">A. 基本設定</h3>
                        <table className="print-summary-table">
                            <tbody>
                                <tr><td>試算開始</td><td>{currentYear}年 / {currentAge}歳</td></tr>
                                <tr><td>試算終了</td><td>{deathAge}歳</td></tr>
                                {family.map(m => (
                                    <tr key={m.id}>
                                        <td>{m.relation === 'Spouse' ? 'パートナー' : m.relation === 'Child' ? '子供' : 'その他'}</td>
                                        <td>{m.name}（{m.age}歳）</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    <section className="print-summary-section">
                        <h3 className="print-summary-heading">C. 収入計画</h3>
                        <table className="print-summary-table">
                            <tbody>
                                {incomes.map(i => (
                                    <tr key={i.id}>
                                        <td>{i.name}</td>
                                        <td>{fmt(i.amount)}/年　{i.startAge}〜{i.endAge}歳{i.growthRate ? `　昇給${fmtRate(i.growthRate)}` : ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    {events.length > 0 && (
                        <section className="print-summary-section">
                            <h3 className="print-summary-heading">E. ライフイベント</h3>
                            <table className="print-summary-table">
                                <tbody>
                                    {events.map(e => (
                                        <tr key={e.id}>
                                            <td>{e.name}</td>
                                            <td>{fmt(e.amount)}　{e.age}歳時</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                    )}

                    <section className="print-summary-section">
                        <h3 className="print-summary-heading">F. 資産形成（積立・投資）</h3>
                        <table className="print-summary-table">
                            <tbody>
                                {investmentFlows.map(f => (
                                    <tr key={f.id}>
                                        <td>{f.name}</td>
                                        <td>{fmt(f.amount)}/年　{f.startAge}〜{f.endAge}歳　{f.applyGrowth ? '運用あり' : '現金'}</td>
                                    </tr>
                                ))}
                                <tr><td>余剰金振替先</td><td>{allocationLabel}</td></tr>
                            </tbody>
                        </table>
                    </section>

                    <section className="print-summary-section">
                        <h3 className="print-summary-heading">G. 資産・負債</h3>
                        <table className="print-summary-table">
                            <tbody>
                                <tr><td>{cashName || '貯蓄'}</td><td>{fmt(cashReserve)}</td></tr>
                                {assets.map(a => (
                                    <tr key={a.id}>
                                        <td>{a.name}</td>
                                        <td>{fmt(a.amount)}　利回り{fmtRate(a.returnRate)}</td>
                                    </tr>
                                ))}
                                {liabilities.map(l => (
                                    <tr key={l.id}>
                                        <td>{l.name}（負債）</td>
                                        <td>残{fmt(l.principal)}　金利{fmtRate(l.interestRate)}　残{l.remainingYears}年</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    <section className="print-summary-section">
                        <h3 className="print-summary-heading">H. 試算条件（前提）</h3>
                        <table className="print-summary-table">
                            <tbody>
                                <tr><td>インフレ率</td><td>{fmtRate(inflationRate)}</td></tr>
                                <tr><td>デフォルト運用利回り</td><td>{fmtRate(defaultReturnRate)}</td></tr>
                            </tbody>
                        </table>
                    </section>
                </div>

                {/* ===== 中列：D-1 固定費 ===== */}
                <div className="print-summary-mid-col">
                    <section className="print-summary-section">
                        <h3 className="print-summary-heading">D. 支出計画（固定費）</h3>
                        <table className="print-summary-table">
                            <tbody>
                                <tr><td>基本生活費</td><td>{fmt(baseLivingCost)}/年</td></tr>
                                {fixedExpenses.map(e => (
                                    <tr key={e.id}>
                                        <td>{e.name}</td>
                                        <td>{fmt(e.amount)}/年{e.duration ? `　${e.duration.startAge}〜${e.duration.endAge}歳` : ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </div>

                {/* ===== 右列：D-2 特別費 ===== */}
                <div className="print-summary-right-col">
                    <section className="print-summary-section">
                        <h3 className="print-summary-heading">D. 支出計画（特別費）</h3>
                        <table className="print-summary-table">
                            <tbody>
                                {irregularExpenses.map(e => (
                                    <tr key={e.id}>
                                        <td>{e.name}</td>
                                        <td>{fmt(e.amount)}{e.interval && e.interval > 1 ? `　${e.interval}年ごと` : ''}{e.duration ? `　${e.duration.startAge}〜${e.duration.endAge}歳` : ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </div>
            </div>
        </div>
    );
};
