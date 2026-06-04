import React, { useState } from 'react';
import { useStore } from '../store';
import { useScenarioStore, type ScenarioData } from '../stores/scenarioStore';
import { Button } from './ui/button';
import { Save, Plus, Trash2, Check } from 'lucide-react';

export const ScenarioSelector: React.FC = () => {
    // Main Store (Active Data)
    const {
        settings, incomes, events, assets, liabilities, recurringExpenses, investmentFlows,
    } = useStore();

    // Scenario Store (Saved Data)
    const { scenarios, currentScenarioId, saveScenario, updateScenario, loadScenario, deleteScenario, setCurrentScenarioId } = useScenarioStore();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNamingMode, setIsNamingMode] = useState(false);
    const [newScenarioName, setNewScenarioName] = useState('');

    const currentScenario = scenarios.find(s => s.id === currentScenarioId);

    // Helper to extract current data
    const getCurrentData = (): ScenarioData => ({
        settings, incomes, events, assets, liabilities, recurringExpenses, investmentFlows
    });

    const handleSaveNew = () => {
        if (!newScenarioName.trim()) return;
        saveScenario(newScenarioName, getCurrentData());
        setIsNamingMode(false);
        setNewScenarioName('');
        setIsMenuOpen(false);
    };

    const handleOverwrite = () => {
        if (currentScenarioId) {
            if (confirm(`「${currentScenario?.name}」を現在のアクティブなデータで上書きしますか？`)) {
                updateScenario(currentScenarioId, getCurrentData());
            }
        }
    };

    const handleLoad = (id: string) => {
        const data = loadScenario(id);
        if (data) {
            // Hydrate logic: explicitly set all stores
            // Since useStore doesn't expose a bulk 'setAll', we might need to rely on the fact that persistence might pick it up if we force it, 
            // OR we update `useStore` to support hydration. 
            // For now, we manually set each part.
            // Wait, useStore.setState is available on the store hook if we use the vanilla api, but inside component we have selectors.

            // We can use the exposed setters or just useStore.setState if we import the store instance directly?
            // define hydration in the component by setting each slice.
            useStore.setState({
                settings: data.settings,
                incomes: data.incomes,
                events: data.events,
                assets: data.assets,
                liabilities: data.liabilities,
                recurringExpenses: data.recurringExpenses,
                investmentFlows: data.investmentFlows
            });

            setIsMenuOpen(false);
        }
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('このシナリオを削除しますか？')) {
            deleteScenario(id);
        }
    };

    return (
        <div className="relative inline-block text-left">
            <div className="flex items-center gap-2 bg-white/10 rounded-md p-1">
                {/* Selector Trigger */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10 rounded transition-colors"
                >
                    <span className="opacity-70 text-xs">Scenario:</span>
                    <span>{currentScenario ? currentScenario.name : '(未保存)'}</span>
                    <span className="text-[10px] opacity-50">▼</span>
                </button>

                {/* Overwrite Button */}
                {currentScenario && (
                    <button
                        onClick={handleOverwrite}
                        title="現在の内容で上書き保存"
                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded"
                    >
                        <Save className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Dropdown Menu */}
            {isMenuOpen && (
                <div className="absolute left-0 mt-2 w-64 origin-top-left bg-white text-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="p-2 border-b border-slate-100">
                        {isNamingMode ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 text-sm border rounded px-2 py-1 outline-none focus:border-indigo-500"
                                    placeholder="プラン名 (例: A案)"
                                    autoFocus
                                    value={newScenarioName}
                                    onChange={e => setNewScenarioName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSaveNew()}
                                />
                                <Button size="sm" className="h-8 px-2" onClick={handleSaveNew}>
                                    <Check className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsNamingMode(true)}
                                className="flex items-center w-full px-2 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                新しいプランとして保存
                            </button>
                        )}
                    </div>

                    <div className="py-1 max-h-[300px] overflow-auto">
                        <div className="px-3 py-1 text-xs font-bold text-slate-400">保存済みリスト</div>
                        {scenarios.length === 0 && (
                            <div className="px-3 py-2 text-sm text-slate-400 italic">なし</div>
                        )}
                        {scenarios.map(s => (
                            <div
                                key={s.id}
                                onClick={() => handleLoad(s.id)}
                                className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 ${s.id === currentScenarioId ? 'bg-indigo-50 text-indigo-700 font-bold' : ''}`}
                            >
                                <span className="truncate flex-1">{s.name}</span>
                                <button
                                    onClick={(e) => handleDelete(e, s.id)}
                                    className="text-slate-300 hover:text-red-500 p-1"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {currentScenarioId && (
                        <div className="border-t border-slate-100 p-1">
                            <button
                                onClick={() => { setCurrentScenarioId(null); setIsMenuOpen(false); }}
                                className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-50 rounded"
                            >
                                選択解除 (新規プラン扱いにする)
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Click Outside Overlay */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => { setIsMenuOpen(false); setIsNamingMode(false); }}
                />
            )}
        </div>
    );
};
