import React, { useState } from 'react';
import { ImportGuide } from './ImportGuide';
import { Button } from './ui/button';
import { X, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { parseImportData } from '../lib/parseImportData';

interface DataImportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DataImportModal: React.FC<DataImportModalProps> = ({ isOpen, onClose }) => {
    const [text, setText] = useState('');
    const [result, setResult] = useState<any>(null);

    if (!isOpen) return null;

    const handleParse = () => {
        const res = parseImportData(text);
        console.log('Parsed Result:', res);
        setResult(res);
        if (res.errors.length > 0) {
            console.error('Import Errors:', res.errors);
        }
    };

    const handleClose = () => {
        setResult(null);
        setText('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                        <Upload className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">支出管理表のデータインポート</h2>
                </div>

                {!result ? (
                    <>
                        <ImportGuide />
                        <p className="text-sm text-gray-600 mb-4">
                            ※ 支出管理表のB列〜G列を貼り付け
                        </p>

                        <textarea
                            className="w-full h-32 p-3 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                            placeholder="データ貼り付け"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />

                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline" onClick={handleClose}>
                                キャンセル
                            </Button>
                            <Button onClick={handleParse} disabled={!text.trim()}>
                                解析を実行 (Parse)
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-md">
                            <CheckCircle className="h-6 w-6" />
                            <div>
                                <h3 className="font-bold">インポート完了</h3>
                                <p className="text-sm">データを正常に解析・追加しました。</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-slate-50 p-3 rounded">
                                <span className="block text-gray-500">収入アイテム</span>
                                <span className="text-lg font-bold">{result.summary.count - result.events.length - result.expenses.length - result.investments.length} 件</span>
                                {/* Roughly calculated, or simpler: result.incomes.length */}
                                <span className="block text-xs text-gray-400">Total: ¥{result.summary.totalIncome.toLocaleString()}</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded">
                                <span className="block text-gray-500">支出・イベント</span>
                                <span className="text-lg font-bold">{result.expenses.length + result.events.length} 件</span>
                                <span className="block text-xs text-gray-400">Recurring: {result.expenses.length}, Events: {result.events.length}</span>
                            </div>
                        </div>

                        {result.errors.length > 0 && (
                            <div className="bg-red-50 p-3 rounded text-sm text-red-600">
                                <div className="flex items-center gap-2 font-bold mb-1">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>エラー ({result.errors.length})</span>
                                </div>
                                <ul className="list-disc pl-5 max-h-24 overflow-y-auto">
                                    {result.errors.map((e: string, i: number) => (
                                        <li key={i}>{e}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex justify-end mt-6">
                            <Button onClick={handleClose}>
                                閉じる
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
