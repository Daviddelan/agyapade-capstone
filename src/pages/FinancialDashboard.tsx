import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Search, Loader2, FileText, Calendar, User, CheckCircle, Settings, History, X } from 'lucide-react';
import { useRole } from '../hooks/useRole';
import { useAuthStore } from '../store/useAuthStore';
import { format } from 'date-fns';
import { DocumentViewer } from '../components/financial/DocumentViewer';

interface DocumentResult {
  id: string;
  docHash: string;
  ownerName: string;    // changed from verifiedBy to ownerName
  timestamp: number;
  status: string;
  comments?: string;
  documentUrl?: string;
}

interface SearchHistoryItem {
  id: string;
  timestamp: number;
  found: boolean;
}

export default function FinancialDashboard() {
  const { role, loading: roleLoading } = useRole();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<DocumentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.displayName || user?.email?.split('@')[0] || 'there';

    if (hour >= 5 && hour < 12) {
      return `Good morning, ${name} ☀️`;
    } else if (hour >= 12 && hour < 17) {
      return `Good afternoon, ${name} 👋`;
    } else {
      return `Good evening, ${name} 🌙`;
    }
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-golden-500" />
      </div>
    );
  }

  if (role !== 'financial') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    setSearchResult(null);

    try {
      const response = await fetch(`http://localhost:4000/api/view/${searchQuery.trim()}`);
      const found = response.ok;
      const data = found ? await response.json() : null;

      setSearchHistory(prev => [{
        id: searchQuery.trim(),
        timestamp: Date.now(),
        found
      }, ...prev].slice(0, 10));

      if (!found) {
        throw new Error('Document not found');
      }

      setSearchResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch document');
    } finally {
      setIsSearching(false);
    }
  };

  const handleHistoryItemClick = async (query: string) => {
    setSearchQuery(query);
    setShowHistory(false);

    const fakeEvent = {
      preventDefault: () => {},
    } as React.FormEvent;

    await handleSearch(fakeEvent);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="text-xl font-semibold text-golden-600">Document Verification</div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 text-gray-500 hover:text-gray-700 relative"
              title="Search History"
            >
              <History className="h-5 w-5" />
              {searchHistory.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-golden-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {searchHistory.length}
                </span>
              )}
            </button>
            <button
              onClick={() => window.location.href = '/dashboard/settings'}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            <div className="text-sm text-gray-600">
              {user?.email}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {getGreeting()}
          </h1>
          <p className="text-gray-600 mb-8">Search for verified documents below</p>

          <form onSubmit={handleSearch} className="w-full max-w-2xl relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter document ID"
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-full focus:outline-none focus:border-golden-500 pr-12"
              />
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <Loader2 className="h-6 w-6 animate-spin text-golden-500" />
                ) : (
                  <Search className="h-6 w-6 text-gray-500" />
                )}
              </button>
            </div>

            {/* Search History Dropdown */}
            {showHistory && searchHistory.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-10">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="font-semibold">Recent Searches</h3>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {searchHistory.map((item, index) => (
                    <button
                      key={`${item.id}-${index}`}
                      onClick={() => handleHistoryItemClick(item.id)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <Search className="h-4 w-4 text-gray-400 mr-3" />
                        <span>{item.id}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500">{format(item.timestamp, 'MMM d, HH:mm')}</span>
                        {item.found ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-8 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Search Result */}
          {searchResult && (
            <div className="mt-12 w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-golden-500" />
                  <div>
                    <h2 className="text-xl font-semibold">Document Details</h2>
                    <p className="text-gray-500">ID: {searchResult.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">{searchResult.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Owner</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <p>{searchResult.ownerName}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Verification Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p>{format(searchResult.timestamp, 'PPP')}</p>
                  </div>
                </div>

                <div className="col-span-2 space-y-1">
                  <p className="text-sm text-gray-500">Document Hash</p>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded">{searchResult.docHash}</p>
                </div>

                {searchResult.comments && (
                  <div className="col-span-2 space-y-1">
                    <p className="text-sm text-gray-500">Comments</p>
                    <p className="text-gray-700">{searchResult.comments}</p>
                  </div>
                )}

                {searchResult.documentUrl && (
                  <div className="col-span-2">
                    <DocumentViewer url={searchResult.documentUrl} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
