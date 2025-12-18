
import React, { useState, useCallback, useEffect } from 'react';
import { Visitor, Delivery } from './types.ts';
import { supabase } from './lib/supabase.ts';

import BottomNav from './components/BottomNav.tsx';
import DeliveriesView from './components/views/DeliveriesView.tsx';
import VisitorsView from './components/views/VisitorsView.tsx';
import ExitView from './components/views/ExitView.tsx';
import ReportsView from './components/views/ReportsView.tsx';
import DashboardView from './components/views/DashboardView.tsx';
import Auth from './components/Auth.tsx';
import { BuildingIcon, LogoutIcon } from './components/icons.tsx';
import Toast from './components/Toast.tsx';
import ConfirmationModal from './components/ConfirmationModal.tsx';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [activeTab, setActiveTab] = useState<'Painel' | 'Entregas' | 'Visitantes' | 'Saida' | 'Relatorios'>('Painel');
  const [reportType, setReportType] = useState<'visitors' | 'deliveries'>('visitors');
  const [toast, setToast] = useState<{ message: string, show: boolean, type?: 'success' | 'error' }>({ message: '', show: false });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

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

  const fetchData = useCallback(async () => {
    if (!session) return;
    
    try {
      const { data: vData, error: vError } = await supabase
        .from('visitors')
        .select('*')
        .order('entry_time', { ascending: false });
      
      if (!vError && vData) {
        setVisitors(vData.map(v => ({
          ...v,
          entryTime: new Date(v.entry_time),
          exitTime: v.exit_time ? new Date(v.exit_time) : undefined,
          epi: { helmet: v.helmet, boots: v.boots, glasses: v.glasses },
          vehicle: { model: v.vehicle_model, color: v.vehicle_color, plate: v.vehicle_plate },
          visitReason: v.visit_reason,
          personVisited: v.person_visited
        })));
      }

      const { data: dData, error: dError } = await supabase
        .from('deliveries')
        .select('*')
        .order('entry_time', { ascending: false });
      
      if (!dError && dData) {
        setDeliveries(dData.map(d => ({
          ...d,
          entryTime: new Date(d.entry_time),
          exitTime: d.exit_time ? new Date(d.exit_time) : undefined,
          invoicePhoto: d.invoice_photo,
          platePhoto: d.plate_photo,
          driverName: d.driver_name,
          driverDocument: d.driver_document,
          invoiceNumber: d.invoice_number,
          licensePlate: d.license_plate
        })));
      }
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    }
  }, [session]);

  useEffect(() => {
    if (session) fetchData();
  }, [session, fetchData]);
  
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, show: true, type });
  };
  
  const handleLogout = async () => {
    setConfirmationModal({
        isOpen: true,
        title: 'Sair do Sistema',
        message: 'Deseja realmente encerrar sua sessão?',
        onConfirm: async () => {
            await supabase.auth.signOut();
            setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }
    });
  };

  const addVisitor = useCallback(async (visitorData: Omit<Visitor, 'id' | 'entryTime' | 'exitTime'>): Promise<boolean> => {
    const { error } = await supabase.from('visitors').insert([{
      name: visitorData.name,
      document: visitorData.document,
      company: visitorData.company,
      visit_reason: visitorData.visitReason,
      person_visited: visitorData.personVisited,
      photo: visitorData.photo,
      helmet: visitorData.epi.helmet,
      boots: visitorData.epi.boots,
      glasses: visitorData.epi.glasses,
      vehicle_model: visitorData.vehicle.model,
      vehicle_color: visitorData.vehicle.color,
      vehicle_plate: visitorData.vehicle.plate,
      user_id: session?.user?.id
    }]);

    if (error) {
      console.error("Erro Supabase:", error);
      showToast('Erro ao salvar visitante: ' + error.message, 'error');
      return false;
    }

    await fetchData();
    showToast('Visitante registrado com sucesso!');
    return true;
  }, [session, fetchData]);

  const addDelivery = useCallback(async (deliveryData: Omit<Delivery, 'id' | 'entryTime' | 'exitTime'>): Promise<boolean> => {
    const { error } = await supabase.from('deliveries').insert([{
      supplier: deliveryData.supplier,
      driver_name: deliveryData.driverName,
      driver_document: deliveryData.driverDocument,
      invoice_number: deliveryData.invoiceNumber,
      license_plate: deliveryData.licensePlate,
      invoice_photo: deliveryData.invoicePhoto,
      plate_photo: deliveryData.platePhoto,
      user_id: session?.user?.id
    }]);

    if (error) {
      console.error("Erro Supabase:", error);
      showToast('Erro ao salvar entrega: ' + error.message, 'error');
      return false;
    }

    await fetchData();
    showToast('Entrega registrada com sucesso!');
    return true;
  }, [session, fetchData]);

  const markExit = useCallback(async (type: 'visitor' | 'delivery', id: number) => {
    const table = type === 'visitor' ? 'visitors' : 'deliveries';
    const { error } = await supabase
      .from(table)
      .update({ exit_time: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      showToast('Erro ao registrar saída: ' + error.message, 'error');
    } else {
      await fetchData();
      showToast("Saída registrada!");
    }
  }, [fetchData]);

  const navigateToReports = (type: 'visitors' | 'deliveries') => {
    setReportType(type);
    setActiveTab('Relatorios');
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-brand-charcoal">
        <div className="text-brand-amber animate-pulse font-bold tracking-widest">INICIALIZANDO SISTEMA...</div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans">
      <Toast message={toast.message} show={toast.show} type={toast.type} onClose={() => setToast({ message: '', show: false })} />
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
      />
      <header className="bg-brand-charcoal shadow-lg p-4 flex justify-between items-center border-b border-brand-steel flex-shrink-0 z-20">
        <div className="flex items-center">
            <BuildingIcon className="h-8 w-8 mr-3 text-brand-amber" />
            <div className="flex flex-col">
              <h1 className="text-lg font-black text-brand-text uppercase leading-none">Canteiro Seguro</h1>
              <span className="text-[10px] text-brand-text-muted font-bold tracking-tighter">CONTROLE DE PORTARIA</span>
            </div>
        </div>
        <button onClick={handleLogout} className="p-2 text-brand-text-muted hover:text-feedback-error transition-colors"><LogoutIcon className="h-6 w-6" /></button>
      </header>

      <main className="flex-grow overflow-y-auto pb-24 bg-brand-charcoal">
        {activeTab === 'Painel' && (
          <DashboardView 
            visitors={visitors} 
            deliveries={deliveries} 
            onMarkExitRequest={(t, i) => markExit(t, i)}
            onNavigateToReports={navigateToReports}
          />
        )}
        {activeTab === 'Entregas' && <DeliveriesView addDelivery={addDelivery} />}
        {activeTab === 'Visitantes' && <VisitorsView addVisitor={addVisitor} />}
        {activeTab === 'Saida' && <ExitView visitors={visitors} deliveries={deliveries} onMarkExitRequest={(t, i) => markExit(t, i)} />}
        {activeTab === 'Relatorios' && (
          <ReportsView 
            visitors={visitors} 
            deliveries={deliveries} 
            activeReportType={reportType} 
            onReportTypeChange={setReportType}
          />
        )}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
