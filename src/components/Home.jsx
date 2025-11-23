import { useRaceEntries } from '../hooks/useRaceEntries';
import { useViewMode } from '../hooks/useViewMode';
import { EmptyState } from './EmptyState';
import { ViewToggle } from './ViewToggle';
import { FloatingActionButton } from './FloatingActionButton';
import { format } from 'date-fns';

/**
 * Home screen component displaying all race entries
 */
export function Home({ onAddRace, onViewRace }) {
  const { entries, loading } = useRaceEntries();
  const { viewMode, setViewMode, VIEW_MODES } = useViewMode();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (entries.length === 0) {
    return <EmptyState onAddRace={onAddRace} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">BibBox</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Your racing journal
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ViewToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                VIEW_MODES={VIEW_MODES}
              />
              <button
                onClick={onAddRace}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Race
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {viewMode === VIEW_MODES.GRID && (
          <GridView entries={entries} onViewRace={onViewRace} />
        )}
        {viewMode === VIEW_MODES.LIST && (
          <ListView entries={entries} onViewRace={onViewRace} />
        )}
        {viewMode === VIEW_MODES.COLUMN && (
          <ColumnView entries={entries} onViewRace={onViewRace} />
        )}
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={onAddRace} />
    </div>
  );
}

/**
 * Grid view component (masonry-style)
 */
function GridView({ entries, onViewRace }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {entries.map((entry) => (
        <RaceCard key={entry.id} entry={entry} onViewRace={onViewRace} />
      ))}
    </div>
  );
}

/**
 * List view component
 */
function ListView({ entries, onViewRace }) {
  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div
          key={entry.id}
          onClick={() => onViewRace(entry.id)}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4"
        >
          {entry.bibPhoto && (
            <img
              src={
                entry.bibPhoto.useProcessed
                  ? entry.bibPhoto.processed
                  : entry.bibPhoto.original
              }
              alt={`Bib for ${entry.raceName}`}
              className="w-24 h-24 object-contain rounded bg-gray-50 flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {entry.raceName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {entry.raceType} • {entry.location}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {entry.date && format(new Date(entry.date), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Column view component
 */
function ColumnView({ entries, onViewRace }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {entries.map((entry) => (
        <div
          key={entry.id}
          onClick={() => onViewRace(entry.id)}
          className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
        >
          {entry.bibPhoto && (
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <img
                src={
                  entry.bibPhoto.useProcessed
                    ? entry.bibPhoto.processed
                    : entry.bibPhoto.original
                }
                alt={`Bib for ${entry.raceName}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {entry.raceName}
            </h3>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
              <span>{entry.raceType}</span>
              <span>•</span>
              <span>{entry.location}</span>
              <span>•</span>
              <span>{entry.date && format(new Date(entry.date), 'MMM d, yyyy')}</span>
            </div>
            {entry.results?.finishTime && (
              <div className="text-sm text-gray-700">
                Finish Time: {entry.results.finishTime}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Race card component for grid view
 */
function RaceCard({ entry, onViewRace }) {
  return (
    <div
      onClick={() => onViewRace(entry.id)}
      className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    >
      {entry.bibPhoto ? (
        <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
          <img
            src={
              entry.bibPhoto.useProcessed
                ? entry.bibPhoto.processed
                : entry.bibPhoto.original
            }
            alt={`Bib for ${entry.raceName}`}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      ) : (
        <div className="aspect-square bg-gray-100 flex items-center justify-center">
          <svg
            className="w-16 h-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate mb-1">
          {entry.raceName}
        </h3>
        <p className="text-sm text-gray-500 truncate mb-1">
          {entry.raceType}
        </p>
        <p className="text-xs text-gray-400">
          {entry.date && format(new Date(entry.date), 'MMM d, yyyy')}
        </p>
      </div>
    </div>
  );
}
