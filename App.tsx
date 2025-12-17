
import React, { useState, useCallback, useEffect } from 'react';
import { Visitor, Delivery } from './types';
import { supabase } from './lib/supabase';

import BottomNav from './components/BottomNav';
import DeliveriesView from './components/views/DeliveriesView';
import VisitorsView from './components/views/VisitorsView';
import ExitView from './components/views/ExitView';
import ReportsView from './components/views/ReportsView';
import DashboardView from './components/views/DashboardView';
import Auth from './components/Auth';
import { BuildingIcon, LogoutIcon } from './components/icons';
import Toast from './components/Toast';
import ConfirmationModal from './components/ConfirmationModal';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [activeTab, setActiveTab] = useState<'Painel' | 'Entregas' | 'Visitantes' | 'Saida' | 'Relatorios'>('Painel');
  const [toast, setToast] = useState<{ message: string, show: boolean }>({ message: '', show: false });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Supabase Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load data from localStorage on initial render
  useEffect(() => {
    if (!session) return;
    try {
      const storedVisitors = localStorage.getItem('visitors');
      if (storedVisitors) {
        const parsedVisitors: Visitor[] = JSON.parse(storedVisitors).map((v: any) => ({
          ...v,
          entryTime: new Date(v.entryTime),
          exitTime: v.exitTime ? new Date(v.exitTime) : undefined,
        }));
        setVisitors(parsedVisitors);
      }
      const storedDeliveries = localStorage.getItem('deliveries');
      if (storedDeliveries) {
        const parsedDeliveries: Delivery[] = JSON.parse(storedDeliveries).map((d: any) => ({
          ...d,
          entryTime: new Date(d.entryTime),
          exitTime: d.exitTime ? new Date(d.exitTime) : undefined,
        }));
        setDeliveries(parsedDeliveries);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, [session]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!session) return;
    try {
      localStorage.setItem('visitors', JSON.stringify(visitors));
    } catch (error) {
      console.error("Failed to save visitors to localStorage", error);
    }
  }, [visitors, session]);

  useEffect(() => {
    if (!session) return;
    try {
      localStorage.setItem('deliveries', JSON.stringify(deliveries));
    } catch (error) {
      console.error("Failed to save deliveries to localStorage", error);
    }
  }, [deliveries, session]);
  
  const showToast = (message: string) => {
    setToast({ message, show: true });
  };
  
  const hideConfirmation = () => {
    setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  };
  
  const showConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmationModal({
        isOpen: true,
        title,
        message,
        onConfirm: () => {
            onConfirm();
            hideConfirmation();
        }
    });
  };

  const handleLogout = async () => {
    showConfirmation(
      'Encerrar Sessão',
      'Deseja realmente sair do sistema de controle?',
      async () => {
        await supabase.auth.signOut();
      }
    );
  };

  const addVisitor = useCallback((visitorData: Omit<Visitor, 'id' | 'entryTime' | 'exitTime'>) => {
    const newVisitor: Visitor = {
      ...visitorData,
      id: Date.now(),
      entryTime: new Date(),
    };
    setVisitors(prev => [newVisitor, ...prev]);
  }, []);

  const addDelivery = useCallback((deliveryData: Omit<Delivery, 'id' | 'entryTime' | 'exitTime'>) => {
    const newDelivery: Delivery = {
      ...deliveryData,
      id: Date.now(),
      entryTime: new Date(),
    };
    setDeliveries(prev => [newDelivery, ...prev]);
  }, []);

  const markExit = useCallback((type: 'visitor' | 'delivery', id: number) => {
    const now = new Date();
    if (type === 'visitor') {
      setVisitors(prev => prev.map(v => v.id === id ? { ...v, exitTime: now } : v));
    } else {
      setDeliveries(prev => prev.map(d => d.id === id ? { ...d, exitTime: now } : d));
    }
    showToast("Saída registrada com sucesso!");
  }, []);
  
  const handleMarkExitRequest = (type: 'visitor' | 'delivery', id: number, name: string) => {
    showConfirmation(
        `Confirmar Saída`,
        `Deseja realmente registrar a saída de ${name}? Esta ação não pode ser desfeita.`,
        () => markExit(type, id)
    );
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-brand-charcoal">
        <div className="text-brand-amber animate-pulse font-bold tracking-widest uppercase">Carregando Portaria...</div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'Painel':
        return <DashboardView visitors={visitors} deliveries={deliveries} onMarkExitRequest={handleMarkExitRequest} />;
      case 'Entregas':
        return <DeliveriesView addDelivery={addDelivery} showToast={showToast} />;
      case 'Visitantes':
        return <VisitorsView addVisitor={addVisitor} showToast={showToast} />;
      case 'Saida':
        return <ExitView visitors={visitors} deliveries={deliveries} onMarkExitRequest={handleMarkExitRequest} />;
      case 'Relatorios':
        return <ReportsView visitors={visitors} deliveries={deliveries} />;
      default:
        return <DashboardView visitors={visitors} deliveries={deliveries} onMarkExitRequest={handleMarkExitRequest} />;
    }
  };

  return (
    <>
      <Toast message={toast.message} show={toast.show} onClose={() => setToast({ message: '', show: false })} />
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={hideConfirmation}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
      />
      <header className="bg-brand-charcoal shadow-lg p-4 flex justify-between items-center relative border-b border-brand-steel">
        <div className="flex items-center">
            <BuildingIcon className="h-8 w-8 mr-3 text-brand-amber" />
            <h1 className="text-xl font-bold text-brand-text hidden sm:block">Controle de Portaria</h1>
            <h1 className="text-xl font-bold text-brand-text sm:hidden">Portaria</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 text-brand-text-muted hover:text-feedback-error transition-colors flex items-center gap-2"
          title="Sair"
        >
          <span className="text-xs font-bold uppercase hidden sm:inline">Sair</span>
          <LogoutIcon className="h-6 w-6" />
        </button>
      </header>

      <main className="flex-grow overflow-y-auto pb-24 bg-brand-charcoal">
        {renderContent()}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </>
  );
};

export default App;
