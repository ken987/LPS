import React, { useState } from 'react';
import { useStore } from '../../store';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Lock } from 'lucide-react';
import { Button } from '../ui/button';

export const Assumptions: React.FC = () => {
    const store = useStore();
    const { settings } = store;

    // State to unlock inflation edit
    const [isEditingInflation, setIsEditingInflation] = useState(false);

    return (
        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label>投資資産の運用利回り</Label>
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        step="0.1"
                        className="text-right"
                        value={settings.defaultReturnRate ?? 3.0} // Fallback if undefined/migration lag
                        onChange={e => store.setSettings({ defaultReturnRate: Number(e.target.value) })}
                    />
                    <span>%</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">※投資資産の平均リターン</p>
            </div>
            <div>
                <Label>インフレ率</Label>
                <div className="flex items-center gap-2 relative">
                    <Input
                        type="number"
                        step="0.1"
                        className={`text-right ${!isEditingInflation ? 'bg-slate-100 text-slate-500' : ''}`}
                        value={settings.inflationRate}
                        onChange={e => store.setSettings({ inflationRate: Number(e.target.value) })}
                        readOnly={!isEditingInflation}
                    />
                    <span>%</span>

                    {!isEditingInflation && (
                        <div
                            className="absolute inset-0 flex items-center justify-center bg-transparent cursor-pointer"
                            onClick={() => setIsEditingInflation(true)}
                            title="クリックして編集"
                        >
                            <Lock className="w-3 h-3 text-slate-400 absolute right-8" />
                        </div>
                    )}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">※基本は変更不要</p>
            </div>
        </div>
    );
};
