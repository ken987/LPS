import React, { useState } from 'react';
import { useStore } from '../../store';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { CurrencyInput } from '../ui/CurrencyInput';
import { X, Plus, Pencil, Trash2 } from 'lucide-react';
import type { LifeEvent } from '../../types';

export const LifeEvents: React.FC = () => {
    const store = useStore();
    const { events, settings } = store;

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Partial<LifeEvent> | null>(null);

    const [isAdding, setIsAdding] = useState(false);

    const [newEvent, setNewEvent] = useState<Partial<LifeEvent>>({
        age: settings.currentAge,
        amount: 0,
        name: '',
        duration: undefined,
        interval: undefined
    });

    const startEdit = (ev: LifeEvent) => {
        setEditingId(ev.id);
        setEditValues({
            ...ev,
            duration: ev.duration ? { ...ev.duration } : undefined
        });
        setIsAdding(false);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditValues(null);
    };

    const saveEdit = () => {
        if (!editingId || !editValues || !editValues.name) return;
        store.updateEvent(editingId, editValues);
        cancelEdit();
    };

    // Helper to toggle Duration Mode
    const toggleDuration = (
        values: Partial<LifeEvent>,
        setValues: (val: Partial<LifeEvent>) => void
    ) => {
        if (values.duration) {
            setValues({ ...values, duration: undefined });
        } else {
            setValues({
                ...values,
                duration: {
                    startAge: values.age || settings.currentAge,
                    endAge: (values.age || settings.currentAge) + 1
                }
            });
        }
    };

    const renderForm = (
        values: Partial<LifeEvent>,
        setValues: (val: Partial<LifeEvent>) => void,
        isEdit: boolean
    ) => (
        <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
                <Input
                    className="h-9 text-sm bg-white"
                    placeholder="イベント名 (結婚, 旅行...)"
                    value={values.name}
                    onChange={e => setValues({ ...values, name: e.target.value })}
                />
                <div className="flex gap-2">
                    <CurrencyInput
                        value={values.amount || 0}
                        onChange={(v) => setValues({ ...values, amount: v })}
                        placeholder="予算"
                        className="flex-1 h-9 text-sm bg-white"
                    />
                </div>
            </div>

            {/* Duration / Interval Settings */}
            <div className="bg-slate-50 border rounded p-2 flex flex-col gap-2">
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                            type="radio"
                            checked={!values.duration}
                            onChange={() => setValues({ ...values, duration: undefined })}
                            className="accent-blue-600"
                        />
                        単発
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                            type="radio"
                            checked={!!values.duration}
                            onChange={() => toggleDuration(values, setValues)}
                            className="accent-blue-600"
                        />
                        期間指定
                    </label>
                </div>

                {!values.duration ? (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">年齢:</span>
                        <Input
                            className="h-8 w-16 text-center text-sm bg-white"
                            type="number"
                            value={values.age}
                            onChange={e => setValues({ ...values, age: Number(e.target.value) })}
                        />
                        <span className="text-sm text-slate-500">歳</span>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <Input
                                type="number"
                                className="w-14 h-8 text-center text-sm bg-white px-1"
                                value={values.duration.startAge}
                                onChange={e => setValues({
                                    ...values,
                                    duration: { ...values.duration!, startAge: Number(e.target.value) }
                                })}
                            />
                            <span className="text-xs">〜</span>
                            <Input
                                type="number"
                                className="w-14 h-8 text-center text-sm bg-white px-1"
                                value={values.duration.endAge}
                                onChange={e => setValues({
                                    ...values,
                                    duration: { ...values.duration!, endAge: Number(e.target.value) }
                                })}
                            />
                            <span className="text-xs">歳</span>
                        </div>
                        <div className="flex items-center gap-2 border-t pt-2 border-slate-200">
                            <span className="text-xs font-bold text-slate-500">周期:</span>
                            <Input
                                type="number"
                                className="w-12 h-8 text-center text-sm bg-white px-1"
                                placeholder="1"
                                value={values.interval || ''}
                                onChange={e => setValues({ ...values, interval: Number(e.target.value) })}
                            />
                            <span className="text-xs text-slate-400">年ごと (空欄=毎年)</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-2 justify-end">
                {isEdit ? (
                    <>
                        <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-8 text-xs">キャンセル</Button>
                        <Button size="sm" onClick={saveEdit} className="h-8 text-xs bg-blue-600 hover:bg-blue-700">保存</Button>
                    </>
                ) : (
                    <>
                        <Button className="h-8 text-xs" size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
                            キャンセル
                        </Button>
                        <Button className="h-8 text-xs bg-blue-600 hover:bg-blue-700" size="sm" onClick={() => {
                            if (!newEvent.name) return;
                            store.addEvent({ ...newEvent, id: crypto.randomUUID() } as LifeEvent);
                            setNewEvent({ age: settings.currentAge, amount: 0, name: '', duration: undefined, interval: undefined });
                            setIsAdding(false);
                        }}>
                            追加
                        </Button>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            {events.map(ev => (
                <div key={ev.id} className="border-b py-2 relative group">
                    {editingId === ev.id && editValues ? (
                        renderForm(editValues, setEditValues as any, true)
                    ) : (
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-bold text-sm text-slate-800">{ev.name}</div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                    {ev.duration ? (
                                        <span>
                                            {ev.duration.startAge}〜{ev.duration.endAge}歳
                                            {ev.interval && ev.interval > 1 ? ` (${ev.interval}年ごと)` : ' (毎年)'}
                                        </span>
                                    ) : (
                                        <span>{ev.age}歳時</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-700">¥{ev.amount.toLocaleString()}</span>
                                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600" onClick={() => startEdit(ev)}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-500" onClick={() => store.removeEvent(ev.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {!editingId && (
                <>
                    {isAdding ? (
                        <div className="bg-slate-50 rounded p-3 border border-dashed border-slate-300">
                            <div className="text-xs font-bold text-slate-500 mb-2">新規イベント</div>
                            {renderForm(newEvent, setNewEvent, false)}
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            className="w-full border-dashed border-slate-300 text-slate-500 hover:text-slate-700 hover:border-slate-400 hover:bg-slate-50 h-9 text-xs"
                            onClick={() => setIsAdding(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" /> イベントを追加
                        </Button>
                    )}
                </>
            )}
        </div>
    );
};
