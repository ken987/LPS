import { Dashboard } from './components/Dashboard';
import { useStore } from './store';
import { Button } from './components/ui/button';
import { Trash2, Upload } from 'lucide-react';
import { DataImportModal } from './components/DataImportModal';
import { ScenarioSelector } from './components/ScenarioSelector';
import { useState } from 'react';

function App() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent">
      <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-50">
        <div className="w-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight">ライフプランシミュレーション</h1>
            <ScenarioSelector />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 text-primary bg-white hover:bg-white/90"
              title="支出管理表のデータをインポートします"
            >
              <Upload className="h-4 w-4" />
              インポート
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (window.confirm('入力データを全て削除しますか？\nこの操作は取り消せません。')) {
                  useStore.getState().reset();
                }
              }}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              リセット
            </Button>
          </div>
        </div>
      </header>
      <main className="py-6">
        <Dashboard />
      </main>
      <DataImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}

export default App;
