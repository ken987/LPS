import React, { useState } from 'react';
import { useStore } from '../../store';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { CurrencyInput } from '../ui/CurrencyInput';
import { X, Plus, Pencil } from 'lucide-react';
import type { InvestmentFlow } from '../../types';

export const InvestmentFlowSection: React.FC = () => {
    const store = useStore();
    const { investmentFlows, settings } = store;

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Partial<InvestmentFlow> | null>(null);

    // Collapsible Add State
    const [isAdding, setIsAdding] = useState(false);

    // Default New Flow State
    const [newFlow, setNewFlow] = useState<Partial<InvestmentFlow>>({
        name: '',
        amount: 0,
        type: 'NISA',
        startAge: settings.currentAge,
        endAge: 65,
        applyGrowth: true
    });

    const addFlow = () => {
        if (!newFlow.name || !newFlow.amount) return;
        store.addInvestmentFlow({
            ...newFlow,
            id: crypto.randomUUID(),
            amount: newFlow.amount!
        } as InvestmentFlow);
        setNewFlow({ name: '', amount: 0, type: 'NISA', startAge: settings.currentAge, endAge: 65, applyGrowth: true });
        setIsAdding(false);
    };

    const startEdit = (flow: InvestmentFlow) => {
        setEditingId(flow.id);
        setEditValues({ ...flow });
        setIsAdding(false);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditValues(null);
    };

    const saveEdit = () => {
        if (!editingId || !editValues || !editValues.name || !editValues.amount) return;
        store.updateInvestmentFlow(editingId, editValues);
        setEditingId(null);
        setEditValues(null);
    };

    // Helper to render form inputs
    const renderFormInputs = (
        values: Partial<InvestmentFlow>,
        setValues: (val: Partial<InvestmentFlow>) => void,
        isEdit: boolean
    ) => (
        <div className="space-y-3">
            <div className="flex gap-2">
                <Input
                    placeholder="項目名 (例: 現金貯蓄、投資)"
                    className="text-sm h-9 bg-white"
                    value={values.name}
                    onChange={e => setValues({ ...values, name: e.target.value })}
                />
                <div className="w-32">
                    <CurrencyInput
                        value={values.amount || 0}
                        onChange={v => setValues({ ...values, amount: v })}
                        placeholder="年積立額"
                        className="h-9 bg-white text-sm"
                    />
                </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={values.applyGrowth}
                    onChange={e => setValues({ ...values, applyGrowth: e.target.checked })}
                    className="accent-indigo-600 w-4 h-4"
                />
                <span>運用利回り有</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex items-center border rounded px-2 bg-slate-50 gap-1">
                    <Input
                        type="number"
                        className="w-12 h-8 p-0 text-center border-0 bg-transparent text-sm"
                        value={values.startAge}
                        onChange={e => setValues({ ...values, startAge: Number(e.target.value) })}
                    />
                    <span className="text-sm mx-1">➜</span>
                    <Input
                        type="number"
                        className="w-12 h-8 p-0 text-center border-0 bg-transparent text-sm"
                        value={values.endAge}
                        onChange={e => setValues({ ...values, endAge: Number(e.target.value) })}
                    />
                    <span className="text-sm ml-1">歳</span>
                </div>
                {isEdit ? (
                    <div className="ml-auto flex gap-1">
                        <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-8 text-xs">キャンセル</Button>
                        <Button size="sm" onClick={saveEdit} className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700">保存</Button>
                    </div>
                ) : (
                    <div className="ml-auto flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)} className="h-8 text-xs">キャンセル</Button>
                        <Button size="sm" className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700" onClick={addFlow}>
                            <Plus className="w-4 h-4 mr-1" /> 追加
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="text-xs text-slate-500 mb-2">
                収入から生活費を引いたお金の一部を、特定の資産形成に割り当てます。<br />
                チェックを入れた項目は「投資」扱いとなり、試算条件の利回りで運用益が加算されます。
            </div>



            {investmentFlows.map(flow => (
                <div key={flow.id} className="bg-indigo-50 border border-indigo-100 rounded p-2 text-sm relative group">
                    {editingId === flow.id && editValues ? (
                        renderFormInputs(editValues, setEditValues as any, true)
                    ) : (
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-bold text-base text-indigo-900">{flow.name}</div>
                                <div className="text-sm flex items-center gap-2 mt-1">
                                    <span className="bg-white px-2 py-0.5 border rounded text-slate-500 text-xs">{flow.startAge} 〜 {flow.endAge}歳</span>
                                    <span className="text-indigo-600 font-bold">年 {flow.amount.toLocaleString()}円</span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${flow.applyGrowth ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                                        {flow.applyGrowth ? '運用あり' : '運用なし(現金)'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-300 hover:text-indigo-600" onClick={() => startEdit(flow)}>
                                    <Pencil className="w-5 h-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-300 hover:text-red-500" onClick={() => store.removeInvestmentFlow(flow.id)}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {/* New Flow Input */}
            {!editingId && (
                <>
                    {isAdding ? (
                        <div className="border border-dashed border-indigo-200 rounded p-3 bg-white">
                            <div className="text-sm font-bold text-slate-400 mb-2">新規追加</div>
                            {renderFormInputs(newFlow, setNewFlow, false)}
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            className="w-full border-dashed border-indigo-200 text-indigo-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 h-9"
                            onClick={() => setIsAdding(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" /> 新しい投資フローを追加
                        </Button>
                    )}
                </>
            )}
            {/* Surplus Allocation Setting */}
            <div className="bg-white border rounded p-3 mt-4 space-y-2">
                <div className="text-sm font-bold text-slate-700">家計余剰金（黒字）の振替先</div>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="surplusAllocation"
                            value="Save"
                            checked={settings.surplusAllocation === 'Save' || !settings.surplusAllocation}
                            onChange={() => store.setSettings({ surplusAllocation: 'Save' })}
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-sm text-slate-700">貯金へ回す</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="surplusAllocation"
                            value="Invest"
                            checked={settings.surplusAllocation === 'Invest'}
                            onChange={() => store.setSettings({ surplusAllocation: 'Invest' })}
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-sm text-slate-700">投資資産へ回す</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="surplusAllocation"
                            value="Spend"
                            checked={settings.surplusAllocation === 'Spend'}
                            onChange={() => store.setSettings({ surplusAllocation: 'Spend' })}
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-sm text-slate-700">消費（貯蓄しない）</span>
                    </label>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                    ※ マイナス（赤字）時は、常に「現金 → 投資」の順で取り崩されます。
                </div>
            </div>
        </div>
    );
};
