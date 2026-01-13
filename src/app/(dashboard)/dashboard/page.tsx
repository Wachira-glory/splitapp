"use client"

import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
// Note: You can remove the Supabase imports if they are not used for anything other than config display.
// import { createClient } from '@supabase/supabase-js'; 

// IMPORT the new PaymentsHistory component
import PaymentsHistory from './components/PaymentsHistory'; 

// --- HELPER COMPONENTS: LandingPage (No changes needed) ---

const LandingPage = ({ setActiveView, router }: { setActiveView: (view: 'payments' | 'landing') => void, router: any }) => (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-lg">
            <DollarSign className="text-purple-600" size={40} />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">SplitBill</h1>
          <p className="text-xl text-purple-100">Split bills effortlessly with friends and family</p>
        </div>
        <div className="space-y-4">
          <button onClick={() => router.push('/dashboard/create-payment')} className="w-full bg-white text-purple-600 py-4 px-6 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Create Payment
          </button>
          <button onClick={() => setActiveView('payments')} className="w-full bg-purple-800 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-purple-900 transition-all shadow-lg hover:-translate-y-1">
            View Payments
          </button>
        </div>
      </div>
    </div>
);


// --- DEFAULT EXPORT: DashboardPage (The required React Component) ---

const DashboardPage = () => {
    const [activeView, setActiveView] = useState<'landing' | 'payments'>('landing');
    const router = useRouter();

    return (
      <>
        {/* Render LandingPage only when activeView is 'landing' */}
        {activeView === 'landing' && <LandingPage setActiveView={setActiveView} router={router} />}
        
        {/* Render PaymentsHistory, using the isVisible prop to trigger data fetching */}
        <PaymentsHistory 
          setActiveView={setActiveView} 
          isVisible={activeView === 'payments'} 
        />
      </>
    );
};

export default DashboardPage;