import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import AuthModal from './components/AuthModal';
import BottomTab from './components/BottomTab';
import AudioInput from './components/AudioInput';
import TranscriptResult from './components/TranscriptResult';
import HistoryList from './components/HistoryList';
import { useTranscriber } from './hooks/useTranscriber';
import { apiFetch } from './lib/api';

function SpeechApp() {
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [transcripts, setTranscripts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [meta, setMeta] = useState({ sourceName: '', language: 'vietnamese', duration: null });
  const { status, progress, result, error, transcribe } = useTranscriber();

  const loadTranscripts = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setTranscripts([]);
      return;
    }
    try {
      const { data } = await apiFetch('/api/transcripts');
      if (data.success) setTranscripts(data.data);
    } catch (err) {
      console.error('Lỗi tải lịch sử transcript:', err);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    loadTranscripts();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setTranscripts([]);
  };

  const handleAudioReady = ({ audio, duration, sourceName, language }) => {
    setMeta({ sourceName, language, duration });
    transcribe(audio, language);
  };

  const filteredTranscripts = transcripts.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      (item.text || '').toLowerCase().includes(q) ||
      (item.sourceName || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(userData) => setUser(userData)}
      />

      <main className="max-w-4xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeTab === 'home' ? (
          <>
            <AudioInput
              disabled={status === 'loading' || status === 'transcribing'}
              onAudioReady={handleAudioReady}
            />
            <TranscriptResult
              user={user}
              status={status}
              progress={progress}
              result={result}
              error={error}
              sourceName={meta.sourceName}
              language={meta.language}
              duration={meta.duration}
              onSaved={loadTranscripts}
              onNeedLogin={() => setIsAuthOpen(true)}
            />
          </>
        ) : (
          <div className="md:col-span-2 space-y-4">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <HistoryList
              user={user}
              transcripts={filteredTranscripts}
              onReload={loadTranscripts}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          </div>
        )}
      </main>

      <BottomTab
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab === 'plus' ? 'home' : tab)}
      />
    </div>
  );
}

export default SpeechApp;
