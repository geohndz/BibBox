import { useState } from 'react';
import { Home } from './components/Home';
import { RaceForm } from './components/RaceForm';
import { RaceDetail } from './components/RaceDetail';
import { useRaceEntries } from './hooks/useRaceEntries';

function App() {
  const { addEntry, updateEntry } = useRaceEntries();
  const [currentView, setCurrentView] = useState('home');
  const [selectedEntryId, setSelectedEntryId] = useState(null);

  const handleAddRace = () => {
    setSelectedEntryId(null);
    setCurrentView('form');
  };

  const handleViewRace = (entryId) => {
    setSelectedEntryId(entryId);
    setCurrentView('detail');
  };

  const handleEditRace = (entryId) => {
    setSelectedEntryId(entryId);
    setCurrentView('form');
  };

  const handleCloseForm = () => {
    setCurrentView('home');
    setSelectedEntryId(null);
  };

  const handleCloseDetail = () => {
    setCurrentView('home');
    setSelectedEntryId(null);
  };

  const handleSaveRace = async (formData) => {
    if (selectedEntryId) {
      await updateEntry(selectedEntryId, formData);
    } else {
      await addEntry(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'home' && (
        <Home
          onAddRace={handleAddRace}
          onViewRace={handleViewRace}
        />
      )}
      
      {currentView === 'form' && (
        <RaceForm
          entryId={selectedEntryId}
          onClose={handleCloseForm}
          onSave={handleSaveRace}
        />
      )}
      
      {currentView === 'detail' && selectedEntryId && (
        <RaceDetail
          entryId={selectedEntryId}
          onClose={handleCloseDetail}
          onEdit={handleEditRace}
        />
      )}
    </div>
  );
}

export default App;