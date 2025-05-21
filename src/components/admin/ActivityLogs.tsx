import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, startAfter, where, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: Timestamp;
  ipAddress?: string;
}

export function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const logsPerPage = 10;

  useEffect(() => {
    fetchLogs();
  }, [filter, dateFilter]);

  const fetchLogs = async (loadMore = false) => {
    try {
      setLoading(true);
      let q = query(
        collection(db, 'activityLogs'),
        orderBy('timestamp', 'desc'),
        limit(logsPerPage)
      );

      // Apply filters
      if (filter !== 'all') {
        q = query(q, where('action', '==', filter));
      }

      if (dateFilter) {
        const selectedDate = new Date(dateFilter);
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        q = query(
          q,
          where('timestamp', '>=', Timestamp.fromDate(selectedDate)),
          where('timestamp', '<', Timestamp.fromDate(nextDay))
        );
      }

      if (loadMore && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const newLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ActivityLog[];

      setLogs(prevLogs => loadMore ? [...prevLogs, ...newLogs] : newLogs);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === logsPerPage);
      setPage(loadMore ? page + 1 : 1);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchLogs(true);
    }
  };

  const handleExport = async () => {
    try {
      // Fetch all logs for export
      const exportQuery = query(
        collection(db, 'activityLogs'),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(exportQuery);
      const exportLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Convert to CSV
      const csvContent = [
        ['Timestamp', 'User', 'Action', 'Details', 'IP Address'].join(','),
        ...exportLogs.map(log => [
          format(log.timestamp.toDate(), 'yyyy-MM-dd HH:mm:ss'),
          log.userName,
          log.action,
          log.details,
          log.ipAddress || ''
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
      <h2 className="text-xl font-semibold">Activity Logs</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <select 
              className="rounded-md border-gray-300"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Activities</option>
              <option value="login">User Login</option>
              <option value="upload">Document Upload</option>
              <option value="system">System Changes</option>
            </select>
            <input 
              type="date" 
              className="rounded-md border-gray-300"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <button 
            onClick={handleExport}
            className="px-4 py-2 text-golden-600 border border-golden-600 rounded-lg hover:bg-golden-50"
          >
            Export Logs
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map(log => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(log.timestamp.toDate(), 'yyyy-MM-dd HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.userName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-golden-500" />
          </div>
        ) : hasMore ? (
          <div className="flex justify-center mt-4">
            <button
              onClick={handleLoadMore}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Load More
            </button>
          </div>
        ) : logs.length > 0 ? (
          <p className="text-center text-gray-500 text-sm">No more logs to load</p>
        ) : (
          <p className="text-center text-gray-500 text-sm">No activity logs found</p>
        )}
      </div>
    </div>
  );
}