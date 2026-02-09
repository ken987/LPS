import React, { useState } from 'react';
import { useStore } from '../../store';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { FamilyMember } from '../../types';

export const BasicSettings: React.FC = () => {
    const store = useStore();
    const { settings } = store;

    // State for Global Settings Edit
    const [isEditingGlobal, setIsEditingGlobal] = useState(false);
    const [globalValues, setGlobalValues] = useState({
        currentYear: settings.currentYear,
        currentAge: settings.currentAge,
        deathAge: settings.deathAge
    });

    // State for Family Member Edit
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
    const [editMember, setEditMember] = useState<Partial<FamilyMember> | null>(null);

    // Collapsible Add State
    const [isAddingMember, setIsAddingMember] = useState(false);

    // Initial logic to sync global edit state
    const startGlobalEdit = () => {
        setGlobalValues({
            currentYear: settings.currentYear,
            currentAge: settings.currentAge,
            deathAge: settings.deathAge
        });
        setIsEditingGlobal(true);
    };

    const saveGlobal_ = () => {
        store.setSettings({
            currentYear: globalValues.currentYear,
            currentAge: globalValues.currentAge,
            deathAge: globalValues.deathAge
        });
        setIsEditingGlobal(false);
    };

    const startMemberEdit = (m: FamilyMember) => {
        setEditingMemberId(m.id);
        setEditMember({ ...m });
        setIsAddingMember(false);
    };

    const saveMember_ = () => {
        if (!editingMemberId || !editMember) return;
        store.updateFamilyMember(editingMemberId, editMember);
        setEditingMemberId(null);
        setEditMember(null);
    };

    const addMember_ = (relation: 'Spouse' | 'Child' | 'Other') => {
        const name = relation === 'Spouse' ? 'Partner' : relation === 'Child' ? 'Child' : 'Other';
        const age = relation === 'Child' ? 0 : settings.currentAge;
        store.addFamilyMember({ id: crypto.randomUUID(), name, relation, age });
        setIsAddingMember(false);
    };

    return (
        <div className="space-y-6">
            {/* Global Settings (Age, Life Expectancy) */}
            <div className="bg-slate-50 border rounded-lg p-3 relative group">
                <Label className="text-sm font-bold text-slate-500 mb-2 block">あなたの基本情報</Label>
                {isEditingGlobal ? (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs text-slate-400">西暦 (試算開始年)</Label>
                                <Input
                                    type="number"
                                    className="h-9 bg-white text-sm"
                                    value={globalValues.currentYear}
                                    onChange={e => setGlobalValues({ ...globalValues, currentYear: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-slate-400">試算開始年齢</Label>
                                <Input
                                    type="number"
                                    className="h-9 bg-white text-sm"
                                    value={globalValues.currentAge}
                                    onChange={e => setGlobalValues({ ...globalValues, currentAge: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-slate-400">試算終わり (終了年齢)</Label>
                                <Input
                                    type="number"
                                    className="h-9 bg-white text-sm"
                                    value={globalValues.deathAge}
                                    onChange={e => setGlobalValues({ ...globalValues, deathAge: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setIsEditingGlobal(false)} className="h-8 text-xs">キャンセル</Button>
                            <Button size="sm" onClick={saveGlobal_} className="h-8 text-xs bg-blue-600 hover:bg-blue-700">保存</Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                            <div>
                                <div className="text-xs text-slate-400">西暦</div>
                                <div className="text-xl font-bold text-slate-700">{settings.currentYear}年</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400">試算開始年齢</div>
                                <div className="text-xl font-bold text-slate-700">{settings.currentAge}歳</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400">試算終わり</div>
                                <div className="text-xl font-bold text-slate-700">{settings.deathAge}歳</div>
                            </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={startGlobalEdit}>
                                <Pencil className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Family Members */}
            <div>
                <Label className="text-sm font-bold mb-2 block text-slate-600">家族構成</Label>
                <div className="space-y-2">
                    {/* Self */}
                    <div className="flex items-center justify-between text-base p-2 bg-slate-100/50 border rounded text-slate-500">
                        <div className="flex items-center gap-2">
                            <span className="font-bold">あなた</span>
                        </div>
                        <span className="font-mono">{settings.currentAge}歳</span>
                    </div>

                    {settings.family.map(m => (
                        <div key={m.id} className="bg-white border rounded p-2 shadow-sm relative group">
                            {editingMemberId === m.id && editMember ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <select
                                            className="h-9 text-sm border rounded px-1 bg-slate-50"
                                            value={editMember.relation}
                                            onChange={e => setEditMember({ ...editMember, relation: e.target.value as any })}
                                        >
                                            <option value="Spouse">パートナー</option>
                                            <option value="Child">子供</option>
                                            <option value="Other">その他</option>
                                        </select>
                                        <Input
                                            className="h-9 text-sm flex-1"
                                            value={editMember.name}
                                            onChange={e => setEditMember({ ...editMember, name: e.target.value })}
                                            placeholder="名前"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                className="w-20 h-8 text-right text-sm"
                                                value={editMember.age}
                                                onChange={e => setEditMember({ ...editMember, age: Number(e.target.value) })}
                                            />
                                            <span className="text-sm">歳</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button size="sm" variant="ghost" onClick={() => setEditingMemberId(null)} className="h-8 text-xs">キャンセル</Button>
                                            <Button size="sm" onClick={saveMember_} className="h-8 text-xs bg-blue-600 hover:bg-blue-700">保存</Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center px-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${m.relation === 'Spouse' ? 'bg-pink-100 text-pink-700' :
                                            m.relation === 'Child' ? 'bg-green-100 text-green-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                            {m.relation === 'Spouse' ? 'パートナー' : m.relation === 'Child' ? '子供' : 'その他'}
                                        </span>
                                        <span className="text-base font-medium text-slate-700">{m.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-base font-bold text-slate-700">{m.age}歳</span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => startMemberEdit(m)}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => store.removeFamilyMember(m.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add Buttons */}
                {!editingMemberId && (
                    <>
                        {isAddingMember ? (
                            <div className="border border-dashed border-slate-300 rounded p-2 mt-3 bg-slate-50">
                                <div className="text-xs text-slate-500 mb-2 font-bold text-center">追加する家族のタイプを選択</div>
                                <div className="grid grid-cols-3 gap-2">
                                    <Button variant="outline" size="sm" className="text-xs h-9 border-dashed text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50" onClick={() => addMember_('Spouse')}>
                                        <Plus className="w-4 h-4 mr-1" /> パートナー
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-xs h-9 border-dashed text-slate-500 hover:text-green-600 hover:border-green-300 hover:bg-green-50" onClick={() => addMember_('Child')}>
                                        <Plus className="w-4 h-4 mr-1" /> 子供
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-xs h-9 border-dashed text-slate-500 hover:text-slate-800 hover:border-slate-400 hover:bg-slate-50" onClick={() => addMember_('Other')}>
                                        <Plus className="w-4 h-4 mr-1" /> その他
                                    </Button>
                                </div>
                                <Button size="sm" variant="ghost" className="w-full mt-2 text-xs h-8 text-slate-400 hover:text-slate-600" onClick={() => setIsAddingMember(false)}>
                                    キャンセル
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                className="w-full mt-3 border-dashed border-slate-300 text-slate-500 hover:text-slate-700 hover:border-slate-400 hover:bg-slate-50 h-9"
                                onClick={() => setIsAddingMember(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" /> 家族を追加
                            </Button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
