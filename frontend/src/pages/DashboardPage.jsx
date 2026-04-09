import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore, applyTokensToCSS } from '../store';
import Sidebar from '../components/layout/Sidebar';
import ColorEditor from '../components/editor/ColorEditor';
import TypographyEditor from '../components/editor/TypographyEditor';
import SpacingEditor from '../components/editor/SpacingEditor';
import ComponentPreview from '../components/preview/ComponentPreview';
import ExportPanel from '../components/editor/ExportPanel';
import VersionHistory from '../components/editor/VersionHistory';
import TopBar from '../components/layout/TopBar';

const TABS = ['Colors', 'Typography', 'Spacing', 'Preview', 'Export', 'History'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { tokens, currentSite, tokenId } = useStore();
  const [activeTab, setActiveTab] = useState('Colors');

  useEffect(() => {
    if (!tokens || !tokenId) { navigate('/'); return; }
    applyTokensToCSS(tokens);
  }, [tokens, tokenId]);

  if (!tokens) return null;

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col">
      <TopBar site={currentSite} activeTab={activeTab} setActiveTab={setActiveTab} tabs={TABS} />
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 57px)' }}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'Colors' && <ColorEditor />}
            {activeTab === 'Typography' && <TypographyEditor />}
            {activeTab === 'Spacing' && <SpacingEditor />}
            {activeTab === 'Preview' && <ComponentPreview />}
            {activeTab === 'Export' && <ExportPanel />}
            {activeTab === 'History' && <VersionHistory />}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
