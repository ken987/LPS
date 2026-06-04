import React, { useState } from 'react';
import { useStore } from '../../store';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { CurrencyInput } from '../ui/CurrencyInput';
import { Label } from '../ui/label';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import type { Asset, Liability } from '../../types';

export const CurrentStock: React.FC = () => {
    const store = useStore();
    const { settings, assets, liabilities } = store;

    // Split assets into Investments (Global Rate) and Other (Individual Rate)
    const investmentAssets = assets.filter(a => a.type === 'Investment');
    const otherAssets = assets.filter(a => a.type !== 'Investment' && a.type !== 'Cash');

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editAsset, setEditAsset] = useState<Partial<Asset> | null>(null);
    const [editLiability, setEditLiability] = useState<Partial<Liability> | null>(null);

    // Adding States
    const [isAddingInvestment, setIsAddingInvestment] = useState(false);
    const [isAddingOther, setIsAddingOther] = useState(false);
    const [isAddingLiability, setIsAddingLiability] = useState(false);

    // Edit Cash State
    const [isEditingCash, setIsEditingCash] = useState(false);
    const [tempCash, setTempCash] = useState(0);
    const [tempCashName, setTempCashName] = useState('');

    // New Items State
    const [newInvestment, setNewInvestment] = useState<Partial<Asset>>({ name: '', amount: 0, type: 'Investment' });
    const [newOtherAsset, setNewOtherAsset] = useState<Partial<Asset>>({ name: '', amount: 0, returnRate: 0, type: 'Other' });
    const [newLiability, setNewLiability] = useState<Partial<Liability>>({ name: '', principal: 0, interestRate: 1.5, remainingYears: 30 });

    // --- Actions ---
    const startEditAsset = (item: Asset) => {
        setEditingId(item.id);
        setEditAsset({ ...item });
        setEditLiability(null);
        setIsEditingCash(false);
        // Close others
        setIsAddingInvestment(false);
        setIsAddingOther(false);
        setIsAddingLiability(false);
    };

    const startEditLiability = (item: Liability) => {
        setEditingId(item.id);
        setEditLiability({ ...item });
        setEditAsset(null);
        setIsEditingCash(false);
        // Close others
        setIsAddingInvestment(false);
        setIsAddingOther(false);
        setIsAddingLiability(false);
    };

    const startEditCash = () => {
        setTempCash(settings.cashReserve);
        setTempCashName(settings.cashName ?? '貯蓄');
        setIsEditingCash(true);
        setEditingId(null);
        setEditAsset(null);
        setEditLiability(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditAsset(null);
        setEditLiability(null);
        setIsEditingCash(false);
    };

    const saveAsset = () => {
        if (!editingId || !editAsset) return;
        store.updateAsset(editingId, editAsset);
        cancelEdit();
    };

    const saveLiability = () => {
        if (!editingId || !editLiability) return;
        store.updateLiability(editingId, editLiability);
        cancelEdit();
    };

    const saveCash = () => {
        store.setSettings({ cashReserve: tempCash, cashName: tempCashName });
        setIsEditingCash(false);
    };

    return (
        <div className="space-y-6">
            {/* 1. Cash */}
            <div>
                <Label className="text-sm font-bold mb-2 block text-blue-800 bg-blue-50 p-1 w-fit px-2 rounded">現金</Label>
                <div className="bg-white border rounded p-2 shadow-sm relative group border-blue-100">
                    {isEditingCash ? (
                        <div className="flex gap-2 items-center">
                            <Input
                                value={tempCashName}
                                onChange={e => setTempCashName(e.target.value)}
                                className="h-9 text-sm flex-1 bg-white font-bold text-slate-600"
                                placeholder="項目名 (例: 貯蓄)"
                            />
                            <CurrencyInput
                                value={tempCash}
                                onChange={v => setTempCash(v)}
                                className="h-9 text-sm w-32 bg-white"
                                placeholder="現在の貯蓄額"
                            />
                            <Button size="icon" variant="ghost" onClick={cancelEdit} className="h-9 w-9"><X className="w-5 h-5" /></Button>
                            <Button size="icon" onClick={saveCash} className="h-9 w-9 bg-blue-600 hover:bg-blue-700"><Pencil className="w-4 h-4" /></Button>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center px-1">
                            <span className="text-base font-medium text-slate-700">{settings.cashName ?? '貯蓄'}</span>
                            <div className="flex items-center gap-3">
                                <span className="text-base font-bold text-blue-700">¥{settings.cashReserve.toLocaleString()}</span>
                                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={startEditCash}>
                                        <Pencil className="w-5 h-5" />
                                    </Button>
                                    {/* No trash for cash reserve as it's a setting */}
                                    <div className="w-8"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Investments */}
            <div>
                <Label className="text-sm font-bold mb-2 block text-blue-800 bg-blue-50 p-1 w-fit px-2 rounded">投資資産 (有価証券など)</Label>
                <div className="space-y-2">
                    {investmentAssets.map(a => (
                        <div key={a.id} className="bg-white border rounded p-2 shadow-sm relative group border-blue-100">
                            {editingId === a.id && editAsset ? (
                                <div className="flex gap-2 items-center">
                                    <Input
                                        value={editAsset.name}
                                        onChange={e => setEditAsset({ ...editAsset, name: e.target.value })}
                                        className="h-9 text-sm flex-1"
                                    />
                                    <CurrencyInput
                                        value={editAsset.amount ?? 0}
                                        onChange={v => setEditAsset({ ...editAsset, amount: v })}
                                        className="h-9 text-sm w-32"
                                    />
                                    <Button size="icon" variant="ghost" onClick={cancelEdit} className="h-9 w-9"><X className="w-5 h-5" /></Button>
                                    <Button size="icon" onClick={saveAsset} className="h-9 w-9 bg-blue-600 hover:bg-blue-700"><Pencil className="w-4 h-4" /></Button>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-base font-medium text-slate-700">{a.name}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-base font-bold text-blue-700">¥{a.amount.toLocaleString()}</span>
                                        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => startEditAsset(a)}>
                                                <Pencil className="w-5 h-5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => store.removeAsset(a.id)}>
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {!editingId && !isEditingCash && (
                        <>
                            {isAddingInvestment ? (
                                <div className="flex gap-2 mt-2 items-center border border-dashed border-blue-200 p-2 rounded bg-blue-50/30">
                                    <Input className="flex-1 text-sm h-9 bg-white" placeholder="項目名(例: 有価証券)" value={newInvestment.name} onChange={e => setNewInvestment({ ...newInvestment, name: e.target.value })} />
                                    <CurrencyInput className="w-28 text-sm h-9 bg-white" value={newInvestment.amount || 0} onChange={v => setNewInvestment({ ...newInvestment, amount: v })} placeholder="残高" />
                                    <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setIsAddingInvestment(false)}><X className="w-5 h-5" /></Button>
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-9" onClick={() => {
                                        if (!newInvestment.name) return;
                                        store.addAsset({ ...newInvestment, id: crypto.randomUUID(), returnRate: 0, type: 'Investment' } as Asset);
                                        setNewInvestment({ type: 'Investment', amount: 0, name: '' });
                                        setIsAddingInvestment(false); // Close form
                                    }}><Plus className="w-5 h-5" /></Button>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="w-full border-dashed border-blue-200 text-blue-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 h-9"
                                    onClick={() => setIsAddingInvestment(true)}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> 投資資産を追加
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* 3. Other Assets */}
            <div>
                <Label className="text-sm font-bold mb-2 block text-blue-800 bg-blue-50 p-1 w-fit px-2 rounded">実物資産 (不動産、貴金属など)</Label>
                <div className="space-y-2">
                    {otherAssets.map(a => (
                        <div key={a.id} className="bg-white border rounded p-2 shadow-sm relative group border-blue-100">
                            {editingId === a.id && editAsset ? (
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Input
                                            value={editAsset.name}
                                            onChange={e => setEditAsset({ ...editAsset, name: e.target.value })}
                                            className="h-9 text-sm flex-1"
                                        />
                                        <CurrencyInput
                                            value={editAsset.amount ?? 0}
                                            onChange={v => setEditAsset({ ...editAsset, amount: v })}
                                            className="h-9 text-sm w-32"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm text-slate-500">利回り:</span>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                className="h-8 w-20 text-right text-sm"
                                                value={editAsset.returnRate ?? 0}
                                                onChange={e => setEditAsset({ ...editAsset, returnRate: Number(e.target.value) })}
                                            />
                                            <span className="text-sm">%</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-8">キャンセル</Button>
                                            <Button size="sm" onClick={saveAsset} className="h-8 bg-blue-600 hover:bg-blue-700">保存</Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center px-1">
                                    <div>
                                        <div className="text-base font-medium text-slate-700">{a.name}</div>
                                        <div className="text-xs text-slate-500">
                                            利回り: {a.returnRate}%
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-base font-bold text-blue-700">¥{a.amount.toLocaleString()}</span>
                                        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => startEditAsset(a)}>
                                                <Pencil className="w-5 h-5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => store.removeAsset(a.id)}>
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {!editingId && !isEditingCash && (
                        <>
                            {isAddingOther ? (
                                <div className="mt-2 border border-dashed border-blue-200 p-2 rounded bg-blue-50/30">
                                    <div className="flex gap-2 mb-2">
                                        <Input className="flex-1 text-sm h-9 bg-white" placeholder="項目名" value={newOtherAsset.name} onChange={e => setNewOtherAsset({ ...newOtherAsset, name: e.target.value })} />
                                        <CurrencyInput className="w-28 text-sm h-9 bg-white" value={newOtherAsset.amount || 0} onChange={v => setNewOtherAsset({ ...newOtherAsset, amount: v })} placeholder="評価額" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 w-28">
                                            <Input
                                                type="number"
                                                step="0.1"
                                                className="text-sm text-right h-8 px-1 bg-white"
                                                value={newOtherAsset.returnRate}
                                                onChange={e => setNewOtherAsset({ ...newOtherAsset, returnRate: Number(e.target.value) })}
                                                placeholder="%"
                                            />
                                            <span className="text-xs">%成長</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button size="sm" variant="ghost" className="h-8" onClick={() => setIsAddingOther(false)}>キャンセル</Button>
                                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8" onClick={() => {
                                                if (!newOtherAsset.name) return;
                                                store.addAsset({ ...newOtherAsset, id: crypto.randomUUID(), type: 'Other' } as Asset);
                                                setNewOtherAsset({ type: 'Other', amount: 0, name: '', returnRate: 0 });
                                                setIsAddingOther(false);
                                            }}><Plus className="w-4 h-4" /> 追加</Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="w-full border-dashed border-blue-200 text-blue-500 hover:text-blue-700 hover:border-blue-400 hover:bg-blue-50 h-9"
                                    onClick={() => setIsAddingOther(true)}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> 実物資産を追加
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* 4. Liabilities */}
            <div>
                <Label className="text-sm font-bold mb-2 block text-red-700 bg-red-50 p-1 w-fit px-2 rounded">負債・ローン残高</Label>

                {(isAddingLiability || editLiability) && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-800 space-y-1">
                        <p className="font-bold">※毎月のローン返済額は『D. 支出計画』に入力してください。</p>
                        <p>※ここで入力したローン残高は『資産と負債の推移グラフ』にのみ反映され、毎年の収支（キャッシュフロー）からは二重で引き落とされません。</p>
                    </div>
                )}

                <div className="space-y-2">
                    {liabilities.map(l => (
                        <div key={l.id} className="bg-white border rounded p-2 shadow-sm relative group">
                            {editingId === l.id && editLiability ? (
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Input
                                            value={editLiability.name}
                                            onChange={e => setEditLiability({ ...editLiability, name: e.target.value })}
                                            className="h-9 text-sm flex-1 font-bold text-red-900"
                                        />
                                        <CurrencyInput
                                            value={editLiability.principal ?? 0}
                                            onChange={v => setEditLiability({ ...editLiability, principal: v })}
                                            className="h-9 text-sm w-32"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="whitespace-nowrap">残り</span>
                                        <Input
                                            type="number"
                                            className="w-16 h-8 text-right"
                                            value={editLiability.remainingYears ?? 0}
                                            onChange={e => setEditLiability({ ...editLiability, remainingYears: Number(e.target.value) })}
                                        />
                                        <span>年</span>
                                        <span className="ml-2 whitespace-nowrap">金利</span>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            className="w-16 h-8 text-right"
                                            value={editLiability.interestRate ?? 0}
                                            onChange={e => setEditLiability({ ...editLiability, interestRate: Number(e.target.value) })}
                                        />
                                        <span>%</span>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-8 text-xs">キャンセル</Button>
                                        <Button size="sm" onClick={saveLiability} className="h-8 text-sm bg-red-600 hover:bg-red-700">保存</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center px-1">
                                    <div className="flex-1">
                                        <div className="text-base font-bold text-red-900">{l.name}</div>
                                        <div className="text-xs text-red-600 flex gap-2 mt-0.5">
                                            <span>金利 {l.interestRate}%</span>
                                            <span>残り {l.remainingYears}年</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-base font-bold text-red-700">¥{l.principal.toLocaleString()}</span>
                                        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => startEditLiability(l)}>
                                                <Pencil className="w-5 h-5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => store.removeLiability(l.id)}>
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {!editingId && !isEditingCash && (
                        <>
                            {isAddingLiability ? (
                                <div className="mt-2 text-slate-500 border border-dashed border-red-200 p-2 rounded bg-red-50/30">
                                    <div className="flex gap-2 mb-2">
                                        <Input className="flex-1 text-sm h-9 bg-white" placeholder="項目名" value={newLiability.name} onChange={e => setNewLiability({ ...newLiability, name: e.target.value })} />
                                        <CurrencyInput className="w-28 text-sm h-9 bg-white" value={newLiability.principal || 0} onChange={v => setNewLiability({ ...newLiability, principal: v })} placeholder="残高" />
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span>残り</span>
                                        <Input
                                            type="number"
                                            className="w-14 h-8 text-right bg-white px-1"
                                            value={newLiability.remainingYears}
                                            onChange={e => setNewLiability({ ...newLiability, remainingYears: Number(e.target.value) })}
                                        />
                                        <span>年</span>
                                        <span className="ml-2">金利</span>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            className="w-14 h-8 text-right bg-white px-1"
                                            value={newLiability.interestRate}
                                            onChange={e => setNewLiability({ ...newLiability, interestRate: Number(e.target.value) })}
                                        />
                                        <span>%</span>
                                        <Button size="sm" variant="ghost" className="ml-auto h-8" onClick={() => setIsAddingLiability(false)}>キャンセル</Button>
                                        <Button size="sm" variant="destructive" className="h-8" onClick={() => {
                                            if (!newLiability.name) return;
                                            store.addLiability({ ...newLiability, id: crypto.randomUUID() } as Liability);
                                            setNewLiability({ principal: 0, interestRate: 1.5, remainingYears: 30, name: '' });
                                            setIsAddingLiability(false);
                                        }}><Plus className="w-4 h-4" /> 追加</Button>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="w-full border-dashed border-red-200 text-red-500 hover:text-red-700 hover:border-red-400 hover:bg-red-50 h-9"
                                    onClick={() => setIsAddingLiability(true)}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> 負債を追加
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
