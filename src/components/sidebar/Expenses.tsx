import React, { useState } from 'react';
import { useStore } from '../../store';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { CurrencyInput } from '../ui/CurrencyInput';
import { Label } from '../ui/label';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';

// --- Shared Helpers ---

const DurationInputs = ({ values, setValues }: { values: any, setValues: (v: any) => void }) => (
    <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
        <input
            type="checkbox"
            checked={values.hasDuration}
            onChange={e => setValues({ ...values, hasDuration: e.target.checked })}
            className="accent-blue-600 w-4 h-4"
        />
        <span>期間指定</span>
        {values.hasDuration && (
            <div className="flex items-center gap-1 ml-2">
                <div className="flex items-center bg-white border rounded px-1">
                    <Input
                        type="number"
                        className="w-12 h-8 text-center text-sm p-0 border-0"
                        value={values.startAge}
                        onChange={e => setValues({ ...values, startAge: Number(e.target.value) })}
                    />
                    <span className="text-xs text-slate-400">歳</span>
                </div>
                <span>〜</span>
                <div className="flex items-center bg-white border rounded px-1">
                    <Input
                        type="number"
                        className="w-12 h-8 text-center text-sm p-0 border-0"
                        value={values.endAge}
                        onChange={e => setValues({ ...values, endAge: Number(e.target.value) })}
                    />
                    <span className="text-xs text-slate-400">歳</span>
                </div>
            </div>
        )}
    </div>
);

const ExpenseEditForm = ({
    editValues,
    setEditValues,
    saveEdit,
    cancelEdit,
    isIrregular
}: {
    editValues: any,
    setEditValues: (v: any) => void,
    saveEdit: () => void,
    cancelEdit: () => void,
    isIrregular: boolean
}) => (
    <div className="space-y-3">
        <div className="flex gap-2">
            <Input
                value={editValues.name}
                onChange={e => setEditValues({ ...editValues, name: e.target.value })}
                className="text-sm h-9 bg-white flex-1"
                placeholder="項目名"
            />
            <div className="w-32">
                <CurrencyInput
                    value={editValues.amount ?? 0}
                    onChange={v => setEditValues({ ...editValues, amount: v })}
                    className="h-9 bg-white text-sm"
                    placeholder="年額"
                />
            </div>
        </div>

        <DurationInputs values={editValues} setValues={setEditValues} />

        {isIrregular && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
                <input
                    type="checkbox"
                    checked={editValues.hasInterval}
                    onChange={e => setEditValues({ ...editValues, hasInterval: e.target.checked })}
                    className="accent-blue-600 w-4 h-4"
                />
                <span>周期設定</span>
                {editValues.hasInterval && (
                    <div className="flex items-center gap-1 ml-2 bg-white border rounded px-1">
                        <Input
                            type="number"
                            min="2"
                            className="w-12 h-8 text-center text-sm p-0 border-0"
                            value={editValues.interval}
                            onChange={e => setEditValues({ ...editValues, interval: Number(e.target.value) })}
                        />
                        <span className="text-xs text-slate-400">年ごと</span>
                    </div>
                )}
            </div>
        )}

        <div className="flex justify-end gap-2 mt-2">
            <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-8 text-xs">キャンセル</Button>
            <Button size="sm" onClick={saveEdit} className="h-8 text-xs bg-blue-600 hover:bg-blue-700">保存</Button>
        </div>
    </div>
);

// --- Components ---

export const Expenses: React.FC = () => {
    // Legacy export just in case
    return <div>use FixedExpenses or IrregularExpenses</div>;
};

export const FixedExpenses: React.FC = () => {
    const store = useStore();
    const { settings, recurringExpenses } = store;
    const fixedCosts = recurringExpenses.filter(e => e.isMonthly);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<any | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newFixed, setNewFixed] = useState({ name: '', amount: 0, hasDuration: false, startAge: settings.currentAge, endAge: 60 });

    const startEdit = (item: any) => {
        setEditingId(item.id);
        setEditValues({
            ...item,
            hasDuration: !!item.duration,
            startAge: item.duration?.startAge ?? settings.currentAge,
            endAge: item.duration?.endAge ?? 60,
            hasInterval: !!item.interval && item.interval > 1,
            interval: item.interval ?? 1
        });
        setIsAdding(false);
    };

    const saveEdit = () => {
        if (!editingId || !editValues) return;
        store.updateRecurringExpense(editingId, {
            name: editValues.name,
            amount: editValues.amount,
            duration: editValues.hasDuration ? { startAge: editValues.startAge, endAge: editValues.endAge } : undefined,
            interval: editValues.hasInterval ? editValues.interval : undefined
        });
        setEditingId(null);
        setEditValues(null);
    };

    const addFixedCost = () => {
        if (!newFixed.name) return;
        store.addRecurringExpense({
            id: crypto.randomUUID(),
            name: newFixed.name,
            amount: newFixed.amount,
            type: 'Living',
            isMonthly: true,
            duration: newFixed.hasDuration ? { startAge: newFixed.startAge, endAge: newFixed.endAge } : undefined
        });
        setNewFixed({ name: '', amount: 0, hasDuration: false, startAge: settings.currentAge, endAge: 60 });
        setIsAdding(false);
    };

    return (
        <div className="space-y-4">
            {/* Base Living Cost (Fixed) */}
            <div className="bg-blue-50/50 p-3 rounded border border-blue-100 mb-4">
                <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-bold text-blue-800">基本生活費 (ベース)</Label>
                    <span className="text-xs text-slate-500">
                        月換算: {Math.round(settings.baseLivingCost / 12 / 1000).toLocaleString()}k
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <CurrencyInput
                        value={settings.baseLivingCost}
                        onChange={(v) => store.setSettings({ baseLivingCost: v })}
                        placeholder="年額"
                        className="bg-white h-10 text-lg"
                    />
                </div>
            </div>

            <div className="space-y-3">
                {fixedCosts.map(exp => (
                    <div key={exp.id} className="bg-white border rounded p-3 shadow-sm relative group">
                        {editingId === exp.id ? (
                            <ExpenseEditForm
                                editValues={editValues}
                                setEditValues={setEditValues}
                                saveEdit={saveEdit}
                                cancelEdit={() => setEditingId(null)}
                                isIrregular={false}
                            />
                        ) : (
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-base font-medium text-slate-700">{exp.name}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm font-bold text-slate-600">¥{exp.amount.toLocaleString()}</span>
                                        {exp.duration && (
                                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                                                {exp.duration.startAge}-{exp.duration.endAge}歳
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => startEdit(exp)}>
                                        <Pencil className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => store.removeRecurringExpense(exp.id)}>
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {!editingId && (
                <>
                    {isAdding ? (
                        <div className="bg-slate-50 p-3 rounded border border-dashed text-slate-500 mt-3">
                            <div className="flex gap-2 mb-2">
                                <Input
                                    placeholder="項目名"
                                    value={newFixed.name}
                                    onChange={e => setNewFixed({ ...newFixed, name: e.target.value })}
                                    className="text-sm h-9 bg-white"
                                />
                                <div className="w-32">
                                    <CurrencyInput
                                        value={newFixed.amount}
                                        onChange={v => setNewFixed({ ...newFixed, amount: v })}
                                        placeholder="年額"
                                        className="h-9 bg-white text-sm"
                                    />
                                </div>
                                <Button size="sm" className="h-9 w-9 p-0 bg-blue-600 hover:bg-blue-700" onClick={addFixedCost} disabled={!newFixed.name}>
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </div>
                            <DurationInputs values={newFixed} setValues={setNewFixed} />
                            <div className="flex justify-end mt-2">
                                <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)} className="h-8 text-xs">キャンセル</Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            className="w-full mt-3 border-dashed border-blue-200 text-blue-500 hover:text-blue-700 hover:border-blue-400 hover:bg-blue-50 h-9"
                            onClick={() => setIsAdding(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" /> 固定費を追加
                        </Button>
                    )}
                </>
            )}
        </div>
    );
};

export const IrregularExpenses: React.FC = () => {
    const store = useStore();
    const { settings, recurringExpenses } = store;
    const irregularExpenses = recurringExpenses.filter(e => !e.isMonthly);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<any | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newIrregular, setNewIrregular] = useState({ name: '', amount: 0, hasDuration: false, startAge: settings.currentAge, endAge: 60, hasInterval: false, interval: 2 });

    const startEdit = (item: any) => {
        setEditingId(item.id);
        setEditValues({
            ...item,
            hasDuration: !!item.duration,
            startAge: item.duration?.startAge ?? settings.currentAge,
            endAge: item.duration?.endAge ?? 60,
            hasInterval: !!item.interval && item.interval > 1,
            interval: item.interval ?? 1
        });
        setIsAdding(false);
    };

    const saveEdit = () => {
        if (!editingId || !editValues) return;
        store.updateRecurringExpense(editingId, {
            name: editValues.name,
            amount: editValues.amount,
            duration: editValues.hasDuration ? { startAge: editValues.startAge, endAge: editValues.endAge } : undefined,
            interval: editValues.hasInterval ? editValues.interval : undefined
        });
        setEditingId(null);
        setEditValues(null);
    };

    const addIrregular = () => {
        if (!newIrregular.name) return;
        store.addRecurringExpense({
            id: crypto.randomUUID(),
            name: newIrregular.name,
            amount: newIrregular.amount,
            type: 'Other',
            isMonthly: false,
            duration: newIrregular.hasDuration ? { startAge: newIrregular.startAge, endAge: newIrregular.endAge } : undefined,
            interval: newIrregular.hasInterval ? newIrregular.interval : undefined
        });
        setNewIrregular({ name: '', amount: 0, hasDuration: false, startAge: settings.currentAge, endAge: 60, hasInterval: false, interval: 2 });
        setIsAdding(false);
    };

    return (
        <div className="space-y-3">
            {irregularExpenses.map(exp => (
                <div key={exp.id} className="bg-white border rounded p-3 shadow-sm relative group">
                    {editingId === exp.id ? (
                        <ExpenseEditForm
                            editValues={editValues}
                            setEditValues={setEditValues}
                            saveEdit={saveEdit}
                            cancelEdit={() => setEditingId(null)}
                            isIrregular={true}
                        />
                    ) : (
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-base font-medium text-slate-700">{exp.name}</div>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span className="text-sm font-bold text-slate-600">¥{exp.amount.toLocaleString()}</span>
                                    {exp.duration && (
                                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                                            {exp.duration.startAge}-{exp.duration.endAge}歳
                                        </span>
                                    )}
                                    {exp.interval && exp.interval > 1 && (
                                        <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-100">
                                            {exp.interval}年毎
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => startEdit(exp)}>
                                    <Pencil className="w-5 h-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => store.removeRecurringExpense(exp.id)}>
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {!editingId && (
                <>
                    {isAdding ? (
                        <div className="bg-slate-50 p-3 rounded border border-dashed text-slate-500 mt-3">
                            <div className="flex gap-2 mb-2">
                                <Input
                                    placeholder="項目名"
                                    value={newIrregular.name}
                                    onChange={e => setNewIrregular({ ...newIrregular, name: e.target.value })}
                                    className="text-sm h-9 bg-white"
                                />
                                <div className="w-32">
                                    <CurrencyInput
                                        value={newIrregular.amount}
                                        onChange={v => setNewIrregular({ ...newIrregular, amount: v })}
                                        placeholder="年額"
                                        className="h-9 bg-white text-sm"
                                    />
                                </div>
                                <Button size="sm" className="h-9 w-9 p-0 bg-amber-600 hover:bg-amber-700" onClick={addIrregular} disabled={!newIrregular.name}>
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </div>
                            <DurationInputs values={newIrregular} setValues={setNewIrregular} />
                            <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
                                <input
                                    type="checkbox"
                                    checked={newIrregular.hasInterval}
                                    onChange={e => setNewIrregular({ ...newIrregular, hasInterval: e.target.checked })}
                                    className="accent-blue-600 w-4 h-4"
                                />
                                <span>周期設定</span>
                                {newIrregular.hasInterval && (
                                    <div className="flex items-center gap-1 ml-2 bg-white border rounded px-1">
                                        <Input
                                            type="number"
                                            min="2"
                                            className="w-12 h-8 text-center text-sm p-0 border-0"
                                            value={newIrregular.interval}
                                            onChange={e => setNewIrregular({ ...newIrregular, interval: Number(e.target.value) })}
                                        />
                                        <span className="text-xs text-slate-400">年ごと</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end mt-2">
                                <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)} className="h-8 text-xs">キャンセル</Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            className="w-full mt-3 border-dashed border-amber-200 text-amber-500 hover:text-amber-700 hover:border-amber-400 hover:bg-amber-50 h-9"
                            onClick={() => setIsAdding(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" /> 特別費を追加
                        </Button>
                    )}
                </>
            )}
        </div>
    );
};
