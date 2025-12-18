
import React, { useState, useCallback, useEffect } from 'react';
import { Visitor, Delivery, UserProfile, UserRole } from './types.ts';
import { supabase } from './lib/supabase.ts';

import BottomNav from './components/BottomNav.tsx';
import DeliveriesView from './components/views/DeliveriesView.tsx';
import VisitorsView from './components/views/VisitorsView.tsx';
import ExitView from './components/views/ExitView.tsx';
import ReportsView from './components/views/ReportsView.tsx';
import DashboardView from './components/views/DashboardView.tsx';
import AdminView from './components/views/AdminView.tsx';
import Auth from './components/Auth.tsx';
import { BuildingIcon, LogoutIcon } from './components/icons.tsx';
import Toast from './components/Toast.tsx';
import ConfirmationModal from './components/ConfirmationModal.tsx';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [activeTab, setActiveTab] = useState<'Painel' | 'Entregas' | 'Visitantes' | 'Saida' | 'Relatorios' | 'Gestao'>('Painel');
  const [reportType, setReportType] = useState<'visitors' | 'deliveries'>('visitors');
  const [toast, setToast] = useState<{ message: string, show: boolean, type?: 'success' | 'error' }>({ message: '', show: false });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Buscar perfil do usuário após o login
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('perfis')
      .select('*, obras(nome)')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile({
        id: data.id,
        fullName: data.nome_completo,
        role: data.cargo,
        workId: data.obra_id
      });
    } else {
      // Se não houver perfil, assumimos porteiro sem obra até ser configurado pelo admin
      setProfile({
        id: userId,
        fullName: 'Novo Usuário',
        role: 'porteiro'
      });
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = useCallback(async () => {
    if (!session || !profile) return;
    
    try {
      // Query base filtrada por obra (a menos que seja admin global)
      let vQuery = supabase.from('visitors').select('*');
      let dQuery = supabase.from('deliveries').select('*');

      if (profile.role !== 'admin' && profile.workId) {
        vQuery = vQuery.eq('obra_id', profile.workId);
        dQuery = dQuery.eq('obra_id', profile.workId);
      }

      const { data: vData } = await vQuery.order('entry_time', { ascending: false });
      const { data: dData } = await dQuery.order('entry_time', { ascending: false });
      
      if (vData) {
        setVisitors(vData.map(v => ({
          ...v,
          workId: v.obra_id,
          entryTime: new Date(v.entry_time),
          exitTime: v.exit_time ? new Date(v.exit_time) : undefined,
          epi: { helmet: v.helmet, boots: v.boots, glasses: v.glasses },
          vehicle: { model: v.vehicle_model, color: v.vehicle_color, plate: v.vehicle_plate },
          visitReason: v.visit_reason,
          personVisited: v.person_visited
        })));
      }

      if (dData) {
        setDeliveries(dData.map(d => ({
          ...d,
          workId: d.obra_id,
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
  }, [session, profile]);

  useEffect(() => {
    if (session && profile) fetchData();
  }, [session, profile, fetchData]);
  
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

  const addVisitor = useCallback(async (visitorData: Omit<Visitor, 'id' | 'entryTime' | 'exitTime' | 'workId'>): Promise<boolean> => {
    if (!profile?.workId && profile?.role !== 'admin') {
      showToast('Usuário sem obra vinculada. Contate o administrador.', 'error');
      return false;
    }

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
      user_id: session?.user?.id,
      obra_id: profile?.workId
    }]);

    if (error) {
      showToast('Erro ao salvar visitante: ' + error.message, 'error');
      return false;
    }

    await fetchData();
    showToast('Visitante registrado com sucesso!');
    return true;
  }, [session, profile, fetchData]);

  const addDelivery = useCallback(async (deliveryData: Omit<Delivery, 'id' | 'entryTime' | 'exitTime' | 'workId'>): Promise<boolean> => {
    if (!profile?.workId && profile?.role !== 'admin') {
      showToast('Usuário sem obra vinculada.', 'error');
      return false;
    }

    const { error } = await supabase.from('deliveries').insert([{
      supplier: deliveryData.supplier,
      driver_name: deliveryData.driverName,
      driver_document: deliveryData.driverDocument,
      invoice_number: deliveryData.invoiceNumber,
      license_plate: deliveryData.licensePlate,
      invoice_photo: deliveryData.invoicePhoto,
      plate_photo: deliveryData.platePhoto,
      user_id: session?.user?.id,
      obra_id: profile?.workId
    }]);

    if (error) {
      showToast('Erro ao salvar entrega: ' + error.message, 'error');
      return false;
    }

    await fetchData();
    showToast('Entrega registrada com sucesso!');
    return true;
  }, [session, profile, fetchData]);

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
        <div className="text-brand-amber animate-pulse font-bold tracking-widest text-xs uppercase">Sincronizando Perfil...</div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  // Filtrar abas permitidas por cargo
  const canSeeOperational = profile?.role === 'admin' || profile?.role === 'porteiro';
  const canSeeReports = profile?.role === 'admin' || profile?.role === 'gestor';
  const isAdmin = profile?.role === 'admin';

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
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[8px] bg-brand-amber/20 text-brand-amber px-1.5 py-0.5 rounded font-black uppercase tracking-widest">{profile?.role}</span>
                <span className="text-[9px] text-brand-text-muted font-bold uppercase truncate max-w-[120px]">
                  {profile?.workId ? `Obra ID: ${profile.workId}` : 'Aguardando Vínculo'}
                </span>
              </div>
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
        {activeTab === 'Entregas' && canSeeOperational && <DeliveriesView addDelivery={addDelivery} />}
        {activeTab === 'Visitantes' && canSeeOperational && <VisitorsView addVisitor={addVisitor} />}
        {activeTab === 'Saida' && canSeeOperational && <ExitView visitors={visitors} deliveries={deliveries} onMarkExitRequest={(t, i) => markExit(t, i)} />}
        {activeTab === 'Relatorios' && canSeeReports && (
          <ReportsView 
            visitors={visitors} 
            deliveries={deliveries} 
            activeReportType={reportType} 
            onReportTypeChange={setReportType}
          />
        )}
        {activeTab === 'Gestao' && isAdmin && (
          <AdminView onRefresh={() => fetchData()} />
        )}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} userRole={profile?.role || 'porteiro'} />
    </div>
  );
};

export default App;
