//create-payment/page.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Send, RefreshCw, ArrowLeft, Users, DollarSign } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// --- CONFIGURATION ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bufdseweassfymorwyyc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1ZmRzZXdlYXNzZnltb3J3eXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3ODMyMjQsImV4cCI6MjA3NDM1OTIyNH0.SLSO8T3d1THeEv710c25Mq3TH_bgEc2lSxb75s9lqx0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const undaSupabaseUrl = process.env.NEXT_PUBLIC_UNDA_SUPABASE_URL || 'https://zpmyjmzvgmohyqhprqmr.supabase.co';
const undaAnonKey = process.env.NEXT_PUBLIC_UNDA_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6InpwbXlqbXp2Z21vaHlxaHBycW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNDE3MjAsImV4cCI6MjA2MjcxNzcyMH0.cn40M6H5wq2lthw8slqBwyEk7KJNWbvVFhGbUKhcdeg';

const UNDA_API_USERNAME = process.env.NEXT_PUBLIC_UNDA_API_USERNAME || '23.e10862e4f96d41d6b68c5c08d988c9fd@unda.co';
const UNDA_API_PASSWORD = process.env.NEXT_PUBLIC_UNDA_API_PASSWORD || 'fbca1d9e28b945f984b84560dea34edc';

// --- UTILITY ---
const normalizePhoneNumber = (phone: string): string => {
    if (phone.startsWith('07')) return '254' + phone.substring(1);
    if (phone.startsWith('011')) return '25411' + phone.substring(3);
    return phone;
};

const getUndaJWT = async (): Promise<string | null> => {
    try {
        const response = await fetch(`${undaSupabaseUrl}/auth/v1/token?grant_type=password`, {
            method: "POST", 
            headers: { "Content-Type": "application/json", "apikey": undaAnonKey },
            body: JSON.stringify({ email: UNDA_API_USERNAME, password: UNDA_API_PASSWORD })
        });
        const data = await response.json();
        return data.access_token;
    } catch (error) { return null; }
};

const CreatePaymentPage = () => {
    const router = useRouter();
    const [billName, setBillName] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [paybill, setPaybill] = useState('');
    const [numberOfPeople, setNumberOfPeople] = useState('');
    const [phoneNumbers, setPhoneNumbers] = useState([{ id: 1, number: '', name: '', amount: '' }]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [generatedBill, setGeneratedBill] = useState<any>(null);
    const [sendingStatus, setSendingStatus] = useState<{ [key: string]: 'idle' | 'sending' | 'sent' | 'failed' }>({});
    const [loading, setLoading] = useState(false);

    // --- AUTO POLLER ---
    const startAutomaticPoll = (undaId: any, phone: string, participant: any) => {
        const poll = setInterval(async () => {
            try {
                const res = await fetch('/api/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: String(undaId) }),
                });
                const result = await res.json();
                const paymentInfo = result.data?.[0];
                if (!paymentInfo) return;

                const rawStatus = (paymentInfo.status || "").toLowerCase();

                if (['completed', 'success', 'paid'].includes(rawStatus)) {
                    clearInterval(poll);
                    handleCompletePayment(phone, participant.amount);
                } else if (['failed', 'cancelled', 'expired', 'rejected'].includes(rawStatus)) {
                    clearInterval(poll);
                    setSendingStatus(prev => ({ ...prev, [phone]: 'failed' }));
                }
            } catch (err) { console.error(err); }
        }, 4000);
    };

    const handleCompletePayment = async (phone: string, amount: number) => {
        // 1. Settle to Restaurant
        await fetch('/api/settle-to-restaurant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount,
                destination_shortcode: generatedBill.paybill,
                bill_id: generatedBill.id,
                restaurant_name: generatedBill.bill_name
            }),
        });

        // 2. Update UI
        setGeneratedBill((prev: any) => ({
            ...prev,
            participants: prev.participants.map((p: any) => 
                p.phone === phone ? { ...p, status: 'completed' } : p
            )
        }));

        // 3. Update DB
        await supabase.from('participants').update({ status: 'paid' }).eq('bill_id', generatedBill.id).eq('phone_number', phone);
    };

    const handleSendIndividualSTK = async (participant: any) => {
        const phoneToUse = participant.phone;
        setSendingStatus(prev => ({ ...prev, [phoneToUse]: 'sending' }));

        try {
            const jwtToken = await getUndaJWT(); 
            const response = await fetch('/api/send-stk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: phoneToUse, amount: participant.amount,
                    reference: generatedBill.id, paybill: generatedBill.paybill, jwtToken
                })
            });
            const result = await response.json();

            if (result.success) {
                const undaId = result.data?.id || result.data?.public_id || result.data?.checkout_id;
                await supabase.from('participants').update({ unda_public_id: undaId }).eq('bill_id', generatedBill.id).eq('phone_number', phoneToUse);
                setSendingStatus(prev => ({ ...prev, [phoneToUse]: 'sent' }));
                startAutomaticPoll(undaId, phoneToUse, participant);
            } else { setSendingStatus(prev => ({ ...prev, [phoneToUse]: 'failed' })); }
        } catch (error) { setSendingStatus(prev => ({ ...prev, [phoneToUse]: 'failed' })); }
    };

    const handleCreatePayment = async () => {
        const validPhones = phoneNumbers.filter(p => p.number && p.name && p.amount);
        if (validPhones.length === 0) return;
        
        const billId = 'bill-' + Date.now();
        setLoading(true);
        try {
            await supabase.from('bills').insert({ id: billId, bill_name: billName, total_amount: parseFloat(totalAmount), paybill, reference: billId, number_of_people: validPhones.length });
            await supabase.from('participants').insert(validPhones.map(p => ({ bill_id: billId, name: p.name, phone_number: normalizePhoneNumber(p.number), amount: Number(p.amount), status: 'pending' })));
            setGeneratedBill({ id: billId, bill_name: billName, total_amount: parseFloat(totalAmount), paybill, participants: validPhones.map(p => ({ name: p.name, phone: normalizePhoneNumber(p.number), amount: Number(p.amount), status: 'pending' })) }); 
            setShowConfirmation(true);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => {
        const count = parseInt(numberOfPeople);
        if (count > 0) setPhoneNumbers(prev => prev.length === count ? prev : (prev.length < count ? [...prev, ...Array.from({length: count - prev.length}).map(() => ({id: Math.random(), number:'', name:'', amount:''}))] : prev.slice(0, count)));
    }, [numberOfPeople]);

    // --- RENDER CONFIRMATION SCREEN ---
    if (showConfirmation && generatedBill) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-3xl mx-auto">
                    {/* BACK BUTTON */}
                    <button 
                        onClick={() => setShowConfirmation(false)} 
                        className="flex items-center gap-2 text-purple-600 font-bold mb-6 hover:translate-x-1 transition-transform"
                    >
                        <ArrowLeft size={20} /> Back to Participants
                    </button>

                    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white">
                        <div className="bg-purple-600 p-8 text-white">
                            <h2 className="text-3xl font-black mb-1">{generatedBill.bill_name}</h2>
                            <p className="opacity-80 font-medium">Paybill: {generatedBill.paybill}</p>
                            <div className="mt-6 flex justify-between items-end">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest opacity-70">Total Amount</p>
                                    <p className="text-4xl font-black">KES {generatedBill.total_amount}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black uppercase tracking-widest opacity-70">Participants</p>
                                    <p className="text-xl font-bold">{generatedBill.participants.length} People</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 space-y-4">
                            {generatedBill.participants.map((p: any, idx: number) => {
                                const status = sendingStatus[p.phone] || 'idle';
                                const isPaid = p.status === 'completed';
                                const isFailed = status === 'failed';

                                return (
                                    <div key={idx} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-purple-100 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black ${isPaid ? 'bg-green-100 text-green-600' : 'bg-white text-gray-400'}`}>
                                                {isPaid ? <CheckCircle size={24} /> : p.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{p.name}</p>
                                                <p className="text-sm text-gray-500 font-medium">{p.phone}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <p className="text-lg font-black text-gray-800">KES {p.amount}</p>
                                            
                                            {isPaid ? (
                                                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest">Paid</div>
                                            ) : isFailed ? (
                                                <button onClick={() => handleSendIndividualSTK(p)} className="bg-red-600 text-white px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-red-700 shadow-lg shadow-red-100 transition-all active:scale-95">
                                                    <RefreshCw size={16} /> Retry
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleSendIndividualSTK(p)} 
                                                    disabled={status === 'sending' || status === 'sent'} 
                                                    className={`px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg ${status === 'sent' ? 'bg-blue-50 text-blue-600 shadow-none' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-100'}`}
                                                >
                                                    {status === 'sending' ? <RefreshCw size={16} className="animate-spin" /> : status === 'sent' ? <Clock size={16} className="animate-pulse" /> : <Send size={16} />}
                                                    {status === 'sending' ? 'Sending...' : status === 'sent' ? 'Waiting PIN' : 'Send STK'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-8 bg-gray-50 border-t flex gap-4">
                            <button onClick={() => router.push(`/dashboard/tracking/${generatedBill.id}`)} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all">Live Tracking</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER FORM SCREEN ---
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => router.push('/dashboard')} className="mb-6 text-gray-500 flex items-center gap-2 font-bold hover:text-purple-600 transition-colors">
                    <ArrowLeft size={18} /> Dashboard
                </button>
                <div className="bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 border border-white">
                    <h2 className="text-4xl font-black text-gray-900 mb-8 tracking-tight">Create Payment</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Bill Details</label>
                                <input type="text" value={billName} onChange={(e) => setBillName(e.target.value)} placeholder="e.g. Java House Lunch" className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-2xl transition-all outline-none font-bold text-gray-800" />
                            </div>
                            <input type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="Total Amount (KES)" className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-2xl transition-all outline-none font-black text-2xl text-purple-600" />
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Destination</label>
                                <input type="text" value={paybill} onChange={(e) => setPaybill(e.target.value)} placeholder="Restaurant Paybill" className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-2xl transition-all outline-none font-bold text-gray-800" />
                            </div>
                            <input type="number" value={numberOfPeople} onChange={(e) => setNumberOfPeople(e.target.value)} placeholder="Number of People" className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-2xl transition-all outline-none font-bold text-gray-800" />
                        </div>
                    </div>

                    <div className="space-y-4 mb-10">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Users size={16} /> Participant List</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {phoneNumbers.map((person) => (
                                <div key={person.id} className="p-6 bg-gray-50 rounded-[1.5rem] border-2 border-transparent hover:border-gray-200 transition-all space-y-3">
                                    <input type="text" value={person.name} onChange={(e) => setPhoneNumbers(phoneNumbers.map(p => p.id === person.id ? {...p, name: e.target.value} : p))} placeholder="Name" className="w-full bg-transparent border-b-2 border-gray-200 py-1 outline-none focus:border-purple-500 font-bold text-gray-800" />
                                    <input type="tel" value={person.number} onChange={(e) => setPhoneNumbers(phoneNumbers.map(p => p.id === person.id ? {...p, number: e.target.value} : p))} placeholder="Phone" className="w-full bg-transparent border-b-2 border-gray-200 py-1 outline-none focus:border-purple-500 font-medium text-gray-600" />
                                    <input type="number" value={person.amount} onChange={(e) => setPhoneNumbers(phoneNumbers.map(p => p.id === person.id ? {...p, amount: e.target.value} : p))} placeholder="Amount" className="w-full bg-transparent py-1 outline-none font-black text-purple-600 text-xl" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <button onClick={handleCreatePayment} className="w-full py-6 bg-purple-600 text-white rounded-[1.5rem] font-black text-xl shadow-xl hover:bg-purple-700 transform hover:-translate-y-1 transition-all active:scale-95 shadow-purple-100">
                        {loading ? <RefreshCw className="animate-spin mx-auto" /> : "GENERATE PAYMENT"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePaymentPage;

