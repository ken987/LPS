import React from 'react';
import { useStore } from '../../store';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Home, Car, HeartPulse } from 'lucide-react';

export const Lifestyle: React.FC = () => {
    const store = useStore();
    const { settings } = store;

    const updateLifestyle = (key: keyof typeof settings.lifestyle, value: any) => {
        const newLifestyle = { ...settings.lifestyle, [key]: value };
        store.setSettings({ lifestyle: newLifestyle });
    };

    return (
        <div className="space-y-4">
            {/* Housing */}
            <div className="space-y-2">
                <Label className="flex items-center gap-2"><Home className="w-4 h-4" /> 住居形態</Label>
                <div className="flex gap-2">
                    {['Rent', 'OwnLoan', 'OwnPaid'].map((type) => (
                        <Button
                            key={type}
                            variant={settings.lifestyle.housingType === type ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => updateLifestyle('housingType', type)}
                        >
                            {type === 'Rent' ? '賃貸' : type === 'OwnLoan' ? '持家(ローン有)' : '持家(完済)'}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Car */}
            <div className="space-y-2">
                <Label className="flex items-center gap-2"><Car className="w-4 h-4" /> 車の所有台数</Label>
                <select
                    className="w-full p-2 border rounded text-sm bg-white"
                    value={settings.lifestyle.carCount}
                    onChange={(e) => updateLifestyle('carCount', Number(e.target.value))}
                >
                    <option value={0}>なし</option>
                    <option value={1}>1台</option>
                    <option value={2}>2台</option>
                    <option value={3}>3台以上</option>
                </select>
            </div>

            {/* Insurance */}
            <div className="flex items-center justify-between border p-3 rounded-lg bg-green-50/50">
                <Label className="flex items-center gap-2 cursor-pointer" htmlFor="ins-toggle">
                    <HeartPulse className="w-4 h-4 text-green-600" /> 保険加入 (生命・医療)
                </Label>
                <input
                    id="ins-toggle"
                    type="checkbox"
                    className="w-5 h-5 accent-green-600"
                    checked={settings.lifestyle.hasInsurance}
                    onChange={(e) => updateLifestyle('hasInsurance', e.target.checked)}
                />
            </div>
        </div>
    );
};
