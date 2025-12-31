import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '../utils/api';
import { Client, CaseTemplate, Reminder } from '../types';
import { getCurrentUser } from '../utils/firebase';

interface DataContextType {
  // Data
  clients: Client[];
  templates: CaseTemplate[];
  reminders: Reminder[];
  
  // Loading states
  loading: boolean;
  lastFetchTime: number | null;
  
  // Actions
  refreshClients: () => Promise<void>;
  refreshTemplates: () => Promise<void>;
  refreshReminders: () => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Cache control
  invalidateCache: () => void;
  isStale: (maxAge?: number) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Cache duration: 5 minutes (300000 ms)
const CACHE_DURATION = 5 * 60 * 1000;

export function DataProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [templates, setTemplates] = useState<CaseTemplate[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load all data once at startup
  const loadAllData = useCallback(async () => {
    try {
      const user = getCurrentUser();
      if (!user) {
        console.log('⚠️  User not authenticated, skipping data load');
        setLoading(false);
        return;
      }

      console.log('🔄 Loading all data from backend (one-time load)...');
      setLoading(true);

      // Load all data in parallel
      const [templatesData, clientsData, remindersData] = await Promise.all([
        api.getCaseTemplates(), // Load all templates
        api.getClients(), // Load all clients (or paginated if needed)
        api.getReminders(),
      ]);

      // Handle paginated responses
      const templates = Array.isArray(templatesData) ? templatesData : (templatesData.templates || []);
      const clients = Array.isArray(clientsData) ? clientsData : (clientsData.clients || []);

      setTemplates(templates);
      setClients(clients);
      setReminders(remindersData);
      setLastFetchTime(Date.now());
      
      console.log(`✅ Data loaded: ${templates.length} templates, ${clients.length} clients, ${remindersData.length} reminders`);
    } catch (error: any) {
      console.error('❌ Failed to load data:', error);
      // Don't clear data on error - keep existing cache
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load - only once when user is authenticated
  useEffect(() => {
    if (isInitialized) return;
    
    const checkUser = () => {
      const user = getCurrentUser();
      if (user) {
        loadAllData();
        setIsInitialized(true);
      }
    };
    
    // Check immediately
    checkUser();
    
    // Also listen for auth changes (in case user logs in after app loads)
    const interval = setInterval(() => {
      if (!isInitialized) {
        checkUser();
      } else {
        clearInterval(interval);
      }
    }, 1000); // Check every second until initialized
    
    return () => clearInterval(interval);
  }, [isInitialized, loadAllData]);

  // Refresh clients only - load ALL clients (no pagination)
  const refreshClients = useCallback(async () => {
    try {
      // Load all clients without pagination
      const data = await api.getClients();
      const clients = Array.isArray(data) ? data : (data.clients || []);
      setClients(clients);
      setLastFetchTime(Date.now());
      console.log(`✅ Clients refreshed: ${clients.length} clients`);
    } catch (error) {
      console.error('❌ Failed to refresh clients:', error);
    }
  }, []);

  // Refresh templates only - load ALL templates (no pagination)
  const refreshTemplates = useCallback(async () => {
    try {
      // Load all templates without pagination
      const data = await api.getCaseTemplates();
      const templates = Array.isArray(data) ? data : (data.templates || []);
      setTemplates(templates);
      setLastFetchTime(Date.now());
      console.log(`✅ Templates refreshed: ${templates.length} templates`);
    } catch (error) {
      console.error('❌ Failed to refresh templates:', error);
    }
  }, []);

  // Refresh reminders only
  const refreshReminders = useCallback(async () => {
    try {
      const data = await api.getReminders();
      setReminders(data);
      setLastFetchTime(Date.now());
      console.log('✅ Reminders refreshed');
    } catch (error) {
      console.error('❌ Failed to refresh reminders:', error);
    }
  }, []);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  // Invalidate cache (force refresh on next access)
  const invalidateCache = useCallback(() => {
    setLastFetchTime(null);
  }, []);

  // Check if cache is stale
  const isStale = useCallback((maxAge: number = CACHE_DURATION) => {
    if (!lastFetchTime) return true;
    return Date.now() - lastFetchTime > maxAge;
  }, [lastFetchTime]);

  // Auto-refresh if cache is stale (every 5 minutes)
  useEffect(() => {
    if (!isInitialized || !lastFetchTime) return;

    const checkInterval = setInterval(() => {
      if (isStale()) {
        console.log('🔄 Cache is stale, refreshing data...');
        loadAllData();
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkInterval);
  }, [isInitialized, lastFetchTime, isStale, loadAllData]);

  const value: DataContextType = {
    clients,
    templates,
    reminders,
    loading,
    lastFetchTime,
    refreshClients,
    refreshTemplates,
    refreshReminders,
    refreshAll,
    invalidateCache,
    isStale,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

