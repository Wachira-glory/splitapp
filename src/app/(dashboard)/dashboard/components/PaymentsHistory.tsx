
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, CheckCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bufdseweassfymorwyyc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1ZmRzZXdlYXNzZnltb3J3eXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3ODMyMjQsImV4cCI6MjA3NDM1OTIyNH0.SLSO8T3d1THeEv710c25Mq3TH_bgEc2lSxb75s9lqx0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- HELPER FUNCTIONS ---

const getPaidCount = (participants: any[]) => participants.filter(p => p.status === 'paid').length;
const getStatus = (participants: any[]) => {
  const paidCount = getPaidCount(participants);
  if (paidCount === participants.length) return 'settled';
  if (paidCount > 0) return 'partial';
  return 'pending';
};


interface PaymentsHistoryProps {
    setActiveView: (view: 'payments' | 'landing') => void;
    isVisible: boolean;
}

const PaymentsHistory = ({ setActiveView, isVisible }: PaymentsHistoryProps) => {
    const [bills, setBills] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const fetchBills = useCallback(async () => {
      setIsLoading(true);
      try {
        const { data: billsData, error: billsError } = await supabase
          .from('bills')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (billsError) throw billsError;

        const billsWithParticipants = (billsData || []).map(bill => {
          let participants: any[] = [];
          try {
            participants = bill.participants_info ? JSON.parse(bill.participants_info) : [];
          } catch (e) {
            console.error('Error parsing participants_info:', e);
          }
          return { ...bill, participants };
        });

        setBills(billsWithParticipants);
      } catch (error) {
        console.error('Error fetching bills:', error);
      } finally {
        setIsLoading(false);
      }
    }, []);
    
    // Load bills only when this component is visible (isVisible === true)
    useEffect(() => {
      if (isVisible) {
        fetchBills();
      }
    }, [isVisible, fetchBills]);


    if (!isVisible) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <button onClick={() => setActiveView('landing')} className="mb-6 text-purple-600 hover:text-purple-700 font-medium">← Back</button>
          <div className="mb-6"><h2 className="text-3xl font-bold text-gray-800 mb-2">Payment History</h2><p className="text-gray-600">View all your split bills</p></div>
          
          {isLoading ? (
            <div className="text-center p-12 text-gray-500">Loading payments...</div>
          ) : (
            <div className="space-y-4">
              {bills.map((bill: any) => {
                const status = getStatus(bill.participants || []);
                const paidCount = getPaidCount(bill.participants || []);
                return (
                  <div key={bill.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-1">{bill.bill_name}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>📅 {new Date(bill.created_at).toLocaleDateString()}</span>
                            <span>👥 {bill.number_of_people} people</span>
                            <span>🏦 {bill.paybill}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-purple-600">KES {bill.total_amount}</p>
                          {status === 'settled' && <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Settled</span>}
                          {status === 'partial' && <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{paidCount}/{bill.participants?.length || 0} Paid</span>}
                          {status === 'pending' && <span className="inline-block mt-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Pending</span>}
                        </div>
                      </div>
                      {bill.participants && bill.participants.length > 0 && (
                        <div className="space-y-2 mb-4">
                          {bill.participants.slice(0, 3).map((participant: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-sm">{participant.name.charAt(0)}</div>
                                <div><p className="font-medium text-gray-800 text-sm">{participant.name}</p></div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-800 text-sm">KES {participant.amount}</p>
                                {participant.status === 'paid' ? (<span className="inline-flex items-center gap-1 text-xs text-green-600"><CheckCircle size={12} /> Paid</span>) : (<span className="inline-flex items-center gap-1 text-xs text-orange-600"><Clock size={12} /> Pending</span>)}
                              </div>
                            </div>
                          ))}
                          {bill.participants.length > 3 && (<p className="text-center text-sm text-gray-500">+{bill.participants.length - 3} more participants</p>)}
                        </div>
                      )}
                      <button onClick={() => router.push(`/dashboard/tracking/${bill.id}`)} className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">View Payment Tracking</button>
                    </div>
                  </div>
                );
              })}
              {bills.length === 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <DollarSign className="mx-auto text-gray-300 mb-4" size={64} />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No payments yet</h3>
                  <p className="text-gray-600 mb-6">Create your first payment to get started</p>
                  <button onClick={() => router.push('/dashboard/create-payment')} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors">Create Payment</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
};

export default PaymentsHistory;