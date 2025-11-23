import { useState, useEffect } from 'react';
import { useRaceEntries } from '../hooks/useRaceEntries';
import { ImageToggle } from './ImageToggle';
import { RouteVisualization } from './RouteVisualization';
import { format } from 'date-fns';

/**
 * Race detail view component
 */
export function RaceDetail({ entryId, onClose, onEdit }) {
  const { getEntry, deleteEntry } = useRaceEntries();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadEntry();
  }, [entryId]);

  const loadEntry = async () => {
    try {
      const data = await getEntry(entryId);
      setEntry(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load entry:', error);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this race entry? This cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await deleteEntry(entryId);
      onClose();
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert('Failed to delete entry. Please try again.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Race entry not found</p>
          <button
            onClick={onClose}
            className="text-primary-600 hover:text-primary-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 overflow-y-auto z-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onEdit(entry.id)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Race Bib */}
          {entry.bibPhoto && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Race Bib</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <ImageToggle
                  original={entry.bibPhoto.original}
                  processed={entry.bibPhoto.processed}
                  useProcessed={entry.bibPhoto.useProcessed}
                  alt={`Bib for ${entry.raceName}`}
                />
              </div>
            </section>
          )}

          {/* Race Information */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Race Information</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Race Name</dt>
                  <dd className="mt-1 text-lg text-gray-900">{entry.raceName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Race Type</dt>
                  <dd className="mt-1 text-lg text-gray-900">{entry.raceType}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="mt-1 text-lg text-gray-900">{entry.location}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date</dt>
                  <dd className="mt-1 text-lg text-gray-900">
                    {entry.date && format(new Date(entry.date), 'MMMM d, yyyy')}
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          {/* Race Results */}
          {entry.results && (
            (entry.results.finishTime || entry.results.overallPlace || 
             entry.results.ageGroupPlace || entry.results.division) && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Race Results</h2>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {entry.results.finishTime && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Finish Time</dt>
                        <dd className="mt-1 text-lg text-gray-900">{entry.results.finishTime}</dd>
                      </div>
                    )}
                    {entry.results.overallPlace && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Overall Place</dt>
                        <dd className="mt-1 text-lg text-gray-900">{entry.results.overallPlace}</dd>
                      </div>
                    )}
                    {entry.results.ageGroupPlace && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Age Group Place</dt>
                        <dd className="mt-1 text-lg text-gray-900">{entry.results.ageGroupPlace}</dd>
                      </div>
                    )}
                    {entry.results.division && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Division</dt>
                        <dd className="mt-1 text-lg text-gray-900">{entry.results.division}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </section>
            )
          )}

          {/* Finisher Photo */}
          {entry.finisherPhoto && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Finisher Photo</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <img
                  src={entry.finisherPhoto}
                  alt={`Finisher photo for ${entry.raceName}`}
                  className="w-full h-auto rounded-lg shadow-sm max-w-2xl mx-auto"
                />
              </div>
            </section>
          )}

          {/* Medal Photo */}
          {entry.medalPhoto && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Medal</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="max-w-md mx-auto">
                  <ImageToggle
                    original={entry.medalPhoto.original}
                    processed={entry.medalPhoto.processed}
                    useProcessed={entry.medalPhoto.useProcessed}
                    alt={`Medal for ${entry.raceName}`}
                  />
                </div>
              </div>
            </section>
          )}

          {/* Route Visualization */}
          {entry.routeData && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Route</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <RouteVisualization routeData={entry.routeData} />
              </div>
            </section>
          )}

          {/* Notes */}
          {entry.notes && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-700 whitespace-pre-wrap">{entry.notes}</p>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
