import { useEffect } from 'react';
import { RotateCcw, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';
import toast from 'react-hot-toast';

export default function VersionHistory() {
  const { versionHistory, fetchVersionHistory, restoreVersion } = useStore();

  useEffect(() => { fetchVersionHistory(); }, []);

  const handleRestore = async (v) => {
    if (!confirm(`Restore to Version ${v.version_number}? Current changes will be saved as a new version.`)) return;
    await restoreVersion(v.id);
    toast.success(`Restored to Version ${v.version_number}`);
  };

  if (!versionHistory.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Clock size={40} className="text-ink-700 mb-4" />
      <p className="text-ink-500 text-sm">No version history yet.</p>
      <p className="text-ink-700 text-xs mt-1">Edit tokens to start building history.</p>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-white text-xl font-display mb-1">Version History</h2>
        <p className="text-ink-500 text-sm">Every token edit is saved. Restore any previous version.</p>
      </div>

      <div className="space-y-3 max-w-2xl">
        {versionHistory.map((v, i) => (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="token-card flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-electric text-white' : 'bg-ink-800 text-ink-400'}`}>
                  {v.version_number}
                </div>
                {i < versionHistory.length - 1 && <div className="w-px h-4 bg-ink-800 mt-1" />}
              </div>
              <div>
                <p className="text-white text-sm font-medium">
                  {v.change_description || `Version ${v.version_number}`}
                  {i === 0 && <span className="ml-2 text-xs bg-electric/20 text-electric px-2 py-0.5 rounded-full">Current</span>}
                </p>
                <p className="text-ink-600 text-xs font-mono">
                  {new Date(v.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            {i > 0 && (
              <button
                onClick={() => handleRestore(v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 bg-ink-800 hover:bg-ink-700 text-ink-300 hover:text-white text-xs transition-all"
              >
                <RotateCcw size={12} />
                Restore
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
