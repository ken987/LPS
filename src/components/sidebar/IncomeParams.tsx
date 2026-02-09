import React, { useState } from 'react';
import { useStore } from '../../store';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { CurrencyInput } from '../ui/CurrencyInput';
import { Pencil, Trash2, Plus } from 'lucide-react';
import type { IncomeSource } from '../../types';

export const IncomeParams: React.FC = () => {
    const store = useStore();
    const { settings, incomes } = store;

    // Local state for editing/adding
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<any>(null);

    // Collapsible Add State
    const [isAdding, setIsAdding] = useState(false);

    // Default Owner is "self"
    // New Income State
    const [newIncome, setNewIncome] = useState<Partial<IncomeSource>>({
        type: 'Labor',
        startAge: settings.currentAge,
        endAge: 60,
        amount: 0,
        name: '',
        ownerId: 'self'
    });

    const startEdit = (item: IncomeSource) => {
        setEditingId(item.id);
        setEditValues({
            ...item,
            ownerId: item.ownerId || 'self',
            growthRate: item.growthRate ?? 0
        });
        setIsAdding(false);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditValues(null);
    };

    const saveEdit = () => {
        if (!editingId || !editValues) return;
        store.updateIncome(editingId, editValues);
        cancelEdit();
    };

    const getOwnerName = (ownerId?: string) => {
        if (!ownerId || ownerId === 'self') return 'あなた';
        const member = settings.family.find(f => f.id === ownerId);
        return member ? member.name : '不明';
    };

    const getOwnerAgeDiff = (ownerId?: string) => {
        if (!ownerId || ownerId === 'self') return 0;
        const member = settings.family.find(f => f.id === ownerId);
        if (!member) return 0;
        return settings.currentAge - member.age;
    };

    const addIncome = () => {
        if (!newIncome.name || !newIncome.amount) return;
        store.addIncome({ ...newIncome, id: crypto.randomUUID() } as IncomeSource);
        setNewIncome({
            type: 'Labor',
            startAge: settings.currentAge,
            endAge: 60,
            amount: 0,
            name: '',
            ownerId: 'self',
            growthRate: 0
        });
        setIsAdding(false);
    };

    // Helper to get type label in Japanese
    const getTypeLabel = (type: string) => {
        const map: Record<string, string> = {
            Labor: '給与',
            Pension: '年金',
            Business: '副業/事業',
            Asset: '配当',
            Other: 'その他'
        };
        return map[type] || type;
    };

    const renderAgeInput = (
        field: 'startAge' | 'endAge',
        values: any,
        setter: (val: any) => void
    ) => {
        const currentSimAgeVal = values[field];
        const diff = getOwnerAgeDiff(values.ownerId);
        const personAge = currentSimAgeVal - diff;
        const ownerName = getOwnerName(values.ownerId);

        return (
            <div className="flex flex-col items-center">
                <Input
                    type="number"
                    className="w-16 px-1 text-center h-10 text-sm"
                    value={personAge}
                    onChange={e => {
                        const newPersonAge = Number(e.target.value);
                        setter({ ...values, [field]: newPersonAge + diff });
                    }}
                />
                <span className="text-xs text-slate-400 whitespace-nowrap mt-1">
                    ({ownerName} {personAge}歳)
                </span>
            </div>
        );
    };

    const renderGrowthEndAgeInput = (
        values: any,
        setter: (val: any) => void
    ) => {
        const diff = getOwnerAgeDiff(values.ownerId);
        const currentVal = values.growthEndAge;
        const personAge = currentVal ? currentVal - diff : '';

        return (
            <div className="flex items-center gap-1">
                <span className="text-sm text-slate-500">昇給停止:</span>
                <Input
                    type="number"
                    className="w-14 h-8 text-center text-sm px-0"
                    placeholder="終了"
                    value={personAge}
                    onChange={e => {
                        const val = e.target.value;
                        if (val === '') {
                            setter({ ...values, growthEndAge: undefined });
                        } else {
                            setter({ ...values, growthEndAge: Number(val) + diff });
                        }
                    }}
                />
                <span className="text-xs text-slate-400">歳</span>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {incomes.map(inc => {
                const diff = getOwnerAgeDiff(inc.ownerId);
                const startAgePerson = inc.startAge - diff;
                const endAgePerson = inc.endAge - diff;
                const growthEndAgePerson = inc.growthEndAge ? inc.growthEndAge - diff : null;

                return (
                    <div key={inc.id} className="border rounded-lg p-3 relative bg-white shadow-sm group">
                        {editingId === inc.id ? (
                            <div className="space-y-3">
                                {/* Edit Mode */}
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        value={editValues.name}
                                        onChange={e => setEditValues({ ...editValues, name: e.target.value })}
                                        placeholder="名称"
                                        className="h-10 text-sm"
                                    />
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-1">
                                            <CurrencyInput
                                                value={editValues.amount}
                                                onChange={(v) => setEditValues({ ...editValues, amount: v })}
                                                placeholder="年額"
                                                className="flex-1 h-10 text-sm"
                                            />
                                            <div className="flex items-center w-24">
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    className="h-10 px-1 text-right text-sm"
                                                    value={editValues.growthRate ?? 0}
                                                    onChange={e => setEditValues({ ...editValues, growthRate: Number(e.target.value) })}
                                                />
                                                <span className="text-xs text-slate-500 ml-1 whitespace-nowrap">%昇給</span>
                                            </div>
                                        </div>
                                        {/* Growth Stop Age Input */}
                                        <div className="flex justify-end">
                                            {renderGrowthEndAgeInput(editValues, setEditValues)}
                                        </div>
                                    </div>
                                </div>

                                {/* Type & Owner */}
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        className="w-full p-2 border rounded text-sm h-10 bg-white"
                                        value={editValues.type}
                                        onChange={(e) => setEditValues({ ...editValues, type: e.target.value })}
                                    >
                                        <option value="Labor">給与</option>
                                        <option value="Pension">年金</option>
                                        <option value="Business">副業/事業</option>
                                        <option value="Asset">配当</option>
                                        <option value="Other">その他</option>
                                    </select>
                                    <select
                                        className="w-full p-2 border rounded text-sm h-10 bg-white"
                                        value={editValues.ownerId || 'self'}
                                        onChange={(e) => setEditValues({ ...editValues, ownerId: e.target.value })}
                                    >
                                        <option value="self">あなた</option>
                                        {settings.family.map(m => (
                                            <option key={m.id} value={m.id}>{m.name} ({m.relation === 'Spouse' ? '配偶者' : '家族'})</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Age Range */}
                                <div className="flex items-center justify-center gap-2 text-sm bg-slate-50 p-2 rounded">
                                    {renderAgeInput('startAge', editValues, setEditValues)}
                                    <span className="mb-4 text-lg">➜</span>
                                    {renderAgeInput('endAge', editValues, setEditValues)}
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-9 text-xs">キャンセル</Button>
                                    <Button size="sm" onClick={saveEdit} className="h-9 text-xs">保存</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center">
                                <div className="flex-1">
                                    <div className="font-bold text-base flex items-center gap-2 text-slate-800">
                                        {inc.name}
                                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-normal">
                                            {getOwnerName(inc.ownerId)}
                                        </span>
                                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-normal">
                                            {getTypeLabel(inc.type)}
                                        </span>
                                        <span className="text-sm font-normal text-slate-500">
                                            {startAgePerson} ~ {endAgePerson}歳
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="font-mono font-bold text-blue-700 text-lg">
                                            ¥{inc.amount.toLocaleString()}
                                        </span>
                                        <div className="flex flex-col text-xs text-slate-500 leading-4">
                                            <span>(昇給 {inc.growthRate ?? 0}%)</span>
                                            {growthEndAgePerson && <span>{growthEndAgePerson}歳で停止</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => startEdit(inc)}><Pencil className="w-5 h-5" /></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => store.removeIncome(inc.id)}><Trash2 className="w-5 h-5" /></Button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* New Income Form */}
            {!editingId && (
                <>
                    {isAdding ? (
                        <div className="bg-slate-50 rounded-lg p-3 border border-dashed border-slate-300">
                            <div className="text-sm font-bold text-slate-500 mb-2">新規追加</div>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        placeholder="名称"
                                        value={newIncome.name}
                                        onChange={e => setNewIncome({ ...newIncome, name: e.target.value })}
                                        className="bg-white h-10 text-sm"
                                    />
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1">
                                            <CurrencyInput
                                                value={newIncome.amount || 0}
                                                onChange={(v) => setNewIncome({ ...newIncome, amount: v })}
                                                placeholder="金額"
                                                className="bg-white flex-1 h-10 text-sm"
                                            />
                                            <div className="flex items-center w-24">
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    className="h-10 px-1 text-right text-sm"
                                                    placeholder="昇給"
                                                    value={newIncome.growthRate ?? 0}
                                                    onChange={e => setNewIncome({ ...newIncome, growthRate: Number(e.target.value) })}
                                                />
                                                <span className="text-xs text-slate-500 ml-1 whitespace-nowrap">%昇給</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            {renderGrowthEndAgeInput(newIncome, setNewIncome)}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        className="w-full p-2 border rounded text-sm bg-white h-10"
                                        value={newIncome.type}
                                        onChange={(e) => setNewIncome({ ...newIncome, type: e.target.value as any })}
                                    >
                                        <option value="Labor">給与</option>
                                        <option value="Pension">年金</option>
                                        <option value="Business">副業</option>
                                        <option value="Asset">配当</option>
                                        <option value="Other">その他</option>
                                    </select>
                                    <select
                                        className="w-full p-2 border rounded text-sm bg-white h-10"
                                        value={newIncome.ownerId || 'self'}
                                        onChange={(e) => setNewIncome({ ...newIncome, ownerId: e.target.value })}
                                    >
                                        <option value="self">あなた</option>
                                        {settings.family.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-sm">
                                    {renderAgeInput('startAge', newIncome, setNewIncome)}
                                    <span className="mb-4 text-lg">➜</span>
                                    {renderAgeInput('endAge', newIncome, setNewIncome)}
                                </div>
                                <div className="flex gap-2">
                                    <Button className="flex-1 h-10 text-sm" size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
                                        キャンセル
                                    </Button>
                                    <Button className="flex-1 h-10 text-sm" size="sm" onClick={addIncome} disabled={!newIncome.name || !newIncome.amount}>
                                        <Plus className="w-5 h-5 mr-2" /> 追加
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            className="w-full border-dashed border-slate-300 text-slate-500 hover:text-slate-700 hover:border-slate-400 hover:bg-slate-50 h-10"
                            onClick={() => setIsAdding(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" /> 収入源を追加
                        </Button>
                    )}
                </>
            )}
        </div>
    );
};
