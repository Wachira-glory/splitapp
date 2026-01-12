// "use client"

// import React, { useState, useEffect } from 'react';
// import { DollarSign, X, CheckCircle, Clock, Send, AlertCircle, RefreshCw } from 'lucide-react';
// import { createClient } from '@supabase/supabase-js';
// import { useRouter } from 'next/navigation';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bufdseweassfymorwyyc.supabase.co';
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1ZmRzZXdlYXNzZnltb3J3eXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3ODMyMjQsImV4cCI6MjA3NDM1OTIyNH0.SLSO8T3d1THeEv710c25Mq3TH_bgEc2lSxb75s9lqx0';
// const supabase = createClient(supabaseUrl, supabaseAnonKey);

// const undaSupabaseUrl = process.env.NEXT_PUBLIC_UNDA_SUPABASE_URL || 'https://zpmyjmzvgmohyqhprqmr.supabase.co';
// const undaAnonKey = process.env.NEXT_PUBLIC_UNDA_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbXlqbXp2Z21vaHlxaHBycW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNDE3MjAsImV4cCI6MjA2MjcxNzcyMH0.cn40M6H5wq2lthw8slqBwyEk7KJNWbvVFhGbUKhcdeg';

// const UNDA_API_USERNAME = process.env.NEXT_PUBLIC_UNDA_API_USERNAME || '23.e10862e4f96d41d6b68c5c08d988c9fd@unda.co';
// const UNDA_API_PASSWORD = process.env.NEXT_PUBLIC_UNDA_API_PASSWORD || 'fbca1d9e28b945f984b84560dea34edc';
// const PLATFORM_ID = 23;

// const validatePhoneNumber = (phone: string): boolean => {
//   return /^(2547\d{8}|25411\d{7}|07\d{8}|011\d{7})$/.test(phone);
// };

// const normalizePhoneNumber = (phone: string): string => {
//   if (phone.startsWith('07')) return '254' + phone.substring(1);
//   if (phone.startsWith('011')) return '25411' + phone.substring(3);
//   return phone;
// };

// const getUndaJWT = async (): Promise<string | null> => {
//   try {
//     const response = await fetch(`${undaSupabaseUrl}/auth/v1/token?grant_type=password`, {
//       method: "POST", 
//       headers: { "Content-Type": "application/json", "apikey": undaAnonKey },
//       body: JSON.stringify({ email: UNDA_API_USERNAME, password: UNDA_API_PASSWORD })
//     });
//     if (!response.ok) return null;
//     const data = await response.json();
//     return data.access_token;
//   } catch (error) {
//     console.error("Error getting JWT:", error);
//     return null;
//   }
// };

// const App = () => {
//   const [activeTab, setActiveTab] = useState('landing');
//   const [bills, setBills] = useState<any[]>([]);
//   const router = useRouter();

//   useEffect(() => {
//     if (activeTab === 'payments') fetchBills();
//   }, [activeTab]);

//   const fetchBills = async () => {
//     try {
//       const { data: billsData, error: billsError } = await supabase
//         .from('bills')
//         .select('*')
//         .order('created_at', { ascending: false });
      
//       if (billsError) throw billsError;

//       const billsWithParticipants = (billsData || []).map(bill => {
//         let participants: any[] = [];
//         try {
//           participants = bill.participants_info ? JSON.parse(bill.participants_info) : [];
//         } catch (e) {
//           console.error('Error parsing participants_info:', e);
//         }
//         return { ...bill, participants };
//       });

//       setBills(billsWithParticipants);
//     } catch (error) {
//       console.error('Error fetching bills:', error);
//     }
//   };

//   const LandingPage = () => (
//     <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
//       <div className="max-w-md w-full">
//         <div className="text-center mb-12">
//           <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-lg">
//             <DollarSign className="text-purple-600" size={40} />
//           </div>
//           <h1 className="text-5xl font-bold text-white mb-4">SplitBill</h1>
//           <p className="text-xl text-purple-100">Split bills effortlessly with friends and family</p>
//         </div>
//         <div className="space-y-4">
//           <button onClick={() => setActiveTab('create')} className="w-full bg-white text-purple-600 py-4 px-6 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
//             Create Payment
//           </button>
//           <button onClick={() => setActiveTab('payments')} className="w-full bg-purple-800 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-purple-900 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
//             View Payments
//           </button>
//         </div>
//       </div>
//     </div>
//   );

//   const CreatePayment = () => {
//     const [billName, setBillName] = useState('');
//     const [totalAmount, setTotalAmount] = useState('');
//     const [paybill, setPaybill] = useState('');
//     const [reference, setReference] = useState('');
//     const [numberOfPeople, setNumberOfPeople] = useState('');
//     const [phoneNumbers, setPhoneNumbers] = useState([{ id: 1, number: '', name: '', amount: '' }]);
//     const [showConfirmation, setShowConfirmation] = useState(false);
//     const [generatedBill, setGeneratedBill] = useState<any>(null);
//     const [errors, setErrors] = useState<any>({});
//     const [sendingStatus, setSendingStatus] = useState<{ [key: string]: 'idle' | 'sending' | 'sent' | 'failed' }>({});
//     const [billSaved, setBillSaved] = useState(false);

//     useEffect(() => {
//       const count = parseInt(numberOfPeople);
//       if (!count || count <= 0) return;
//       setPhoneNumbers((prev) => {
//         if (prev.length === count) return prev;
//         if (prev.length < count) {
//           const missing = Array.from({ length: count - prev.length }).map(() => ({
//             id: Date.now() + Math.random(), number: '', name: '', amount: ''
//           }));
//           return [...prev, ...missing];
//         }
//         return prev.slice(0, count);
//       });
//     }, [numberOfPeople]);

//     useEffect(() => {
//       if (!showConfirmation || !generatedBill || billSaved) return;
//       const saveBill = async () => {
//         try {
//           const { data: billData, error: billError } = await supabase.from('bills').insert({
//             id: generatedBill.id, bill_name: generatedBill.bill_name, total_amount: generatedBill.total_amount,
//             paybill: generatedBill.paybill, reference: generatedBill.reference, number_of_people: generatedBill.number_of_people,
//             participants_info: JSON.stringify(generatedBill.participants)
//           }).select().single();
//           if (billError) { console.error("Error saving bill:", billError); alert(`Failed to save bill: ${billError.message}`); return; }
//           console.log("✅ Bill saved:", billData); setBillSaved(true);
//         } catch (error: any) { console.error("❌ Error:", error); alert(`Failed to save bill: ${error.message}`); }
//       };
//       saveBill();
//     }, [showConfirmation, generatedBill, billSaved]);

//     const updatePhoneNumber = (id: number, field: string, value: string) => {
//       setPhoneNumbers(phoneNumbers.map(p => p.id === id ? { ...p, [field]: value } : p));
//     };

//     const handleCreatePayment = () => {
//       const newErrors: any = {};
//       if (!billName) newErrors.billName = 'Bill name is required';
//       if (!totalAmount) newErrors.totalAmount = 'Total amount is required';
//       if (!paybill) newErrors.paybill = 'Paybill number is required';
//       if (!numberOfPeople) newErrors.numberOfPeople = 'Number of people is required';
//       const numPeople = parseInt(numberOfPeople);
//       const total = parseFloat(totalAmount);
//       if (total < numPeople) newErrors.totalAmount = `Amount too small! Need at least KES ${numPeople}`;
//       const validPhones = phoneNumbers.filter(p => p.number && p.name && p.amount);
//       if (validPhones.length === 0) { newErrors.phones = 'Add at least one person with all details filled'; }
//       else { validPhones.forEach((p, idx) => { if (!validatePhoneNumber(p.number)) newErrors[`phone_${idx}`] = `Invalid phone: ${p.number}`; if (!p.amount || Number(p.amount) <= 0) newErrors[`amount_${idx}`] = `Valid amount required`; }); }
//       const totalParticipantAmount = validPhones.reduce((sum, p) => sum + Number(p.amount), 0);
//       if (Math.abs(totalParticipantAmount - total) > 0.01) { newErrors.totalAmount = `Participant amounts (${totalParticipantAmount}) must equal total (${total})`; }
//       if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
//       setErrors({});
//       const participants = validPhones.map((p) => ({ name: p.name, phone: normalizePhoneNumber(p.number), amount: Number(p.amount) || 0, status: 'pending', unda_txn_id: null, unda_public_id: null, updated_at: null }));
//       const billId = 'bill-' + Date.now();
//       const newBill = { id: billId, bill_name: billName, total_amount: total, paybill: paybill, reference: reference || billId, number_of_people: numPeople, participants: participants, created_at: new Date().toISOString() };
//       setGeneratedBill(newBill); setShowConfirmation(true);
//     };

//     const sendUndaSTKPush = async (phone: string, amount: number, reference: string, id: number, name: string) => {
//       try {
//         const jwtToken = await getUndaJWT();
//         if (!jwtToken) return { success: false, error: "Failed to authenticate" };
//         const validAmount = Math.floor(Math.abs(amount));
//         console.log(`📤 Sending STK: phone=${phone}, amount=${validAmount}, reference=${reference}`);
//          const response = await fetch('/api/send-stk', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           phone, amount: validAmount, reference, id, jwtToken
//         })
//       });

//          const result = await response.json();
//       console.log("📥 API Response:", result);
//       console.log("🔍 Full result.data:", JSON.stringify(result.data, null, 2));

//        if (!response.ok) { console.error("❌ API request failed:", result); return { success: false, error: result?.error || result?.message || "Payment failed" }; }
      
//       // Check for both possible ID fields from Unda response
//       const publicId = result.data?.public_id || result.data?.id;
//       const txnId = result.data?.txn_id;
//       if (result?.success && publicId) {
//         const initialStatus = result.data.status || "PENDING";
//         console.log(`✅ Payment created for ${name} with public_id: ${publicId}, txn_id: ${txnId}, status: ${initialStatus}`);
//         return { 
//           success: true, 
//           data: { 
//             public_id: publicId,
//             txn_id: txnId,
//             status: initialStatus, 
//             id, 
//             amount: validAmount, 
//             reference, 
//             name 
//           } 
//         };
//       }
//         console.error("⚠️ Unexpected response structure:", result);
//         return { success: false, error: "Invalid response from payment service. Check logs." };
//       } catch (error: any) { console.error("🔥 Error in sendUndaSTKPush:", error); return { success: false, error: error.message }; }
//     };

// const 
//  = async (participant: any) => {
//       if (!generatedBill) return;
//       const { phone, amount, name } = participant;
//       setSendingStatus(prev => ({ ...prev, [phone]: 'sending' }));
//       const result = await sendUndaSTKPush(phone, amount, generatedBill.reference, PLATFORM_ID, name);
//       if (result.success) {
//         setSendingStatus(prev => ({ ...prev, [phone]: 'sent' }));
//         const updatedParticipants = generatedBill.participants.map(p => 
//           p.phone === phone ? { 
//             ...p, 
//             unda_public_id: result.data.public_id,
//             unda_txn_id: result.data.txn_id || null,
//             updated_at: new Date().toISOString() 
//           } : p
//         );
//         setGeneratedBill(prev => ({ ...prev, participants: updatedParticipants }));
//         await supabase.from('bills').update({ participants_info: JSON.stringify(updatedParticipants) }).eq('id', generatedBill.id);
//       } else { setSendingStatus(prev => ({ ...prev, [phone]: 'failed' })); alert(`Failed to send STK to ${name}: ${result.error}`); }
//     };

//     if (showConfirmation && generatedBill) {
//       const allSent = generatedBill.participants.every((p: any) => sendingStatus[p.phone] === 'sent');
//       return (
//         <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
//           <div className="max-w-3xl mx-auto pt-8">
//             <button onClick={() => { setShowConfirmation(false); setGeneratedBill(null); setBillSaved(false); setSendingStatus({}); setActiveTab('payments'); }} className="mb-6 text-purple-600 hover:text-purple-700 font-medium">← Back</button>
//             <div className="bg-white rounded-2xl shadow-xl p-6">
//               <div className="text-center mb-6">
//                 <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4"><CheckCircle className="text-green-600" size={32} /></div>
//                 <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Ready!</h2>
//                 <p className="text-gray-600">{generatedBill.bill_name}</p>
//               </div>
//               <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
//                 <div className="grid grid-cols-2 gap-4 text-sm">
//                   <div><p className="text-gray-600">Total Amount</p><p className="text-2xl font-bold text-purple-600">KES {generatedBill.total_amount}</p></div>
//                   <div><p className="text-gray-600">Paybill</p><p className="text-2xl font-bold text-gray-800">{generatedBill.paybill}</p></div>
//                 </div>
//               </div>
//               <div className="mb-6">
//                 <h3 className="font-semibold text-gray-800 mb-3 text-lg">STK Push Recipients</h3>
//                 <div className="space-y-2">
//                   {generatedBill.participants.map((p: any, idx: number) => {
//                     const status = sendingStatus[p.phone] || 'idle';
//                     return (
//                       <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
//                         <div className="flex-1"><p className="font-bold text-gray-800">{p.name}</p><p className="text-sm text-gray-600">{p.phone}</p></div>
//                         <div className="text-right mr-3"><p className="text-lg font-bold text-purple-600">KES {p.amount}</p></div>
//                         <button onClick={() => handleSendIndividualSTK(p)} disabled={status === 'sending' || status === 'sent' || !billSaved} className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap flex items-center gap-2 transition-all ${status === 'sent' ? 'bg-green-100 text-green-700 cursor-not-allowed' : status === 'sending' ? 'bg-gray-400 text-white cursor-not-allowed' : status === 'failed' ? 'bg-red-600 text-white hover:bg-red-700' : !billSaved ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'}`}>
//                           {status === 'sending' && (<><RefreshCw size={14} className="animate-spin" />Sending</>)}
//                           {status === 'sent' && (<><CheckCircle size={14} />Sent</>)}
//                           {status === 'failed' && (<><Send size={14} />Retry</>)}
//                           {status === 'idle' && (<><Send size={14} />Send STK</>)}
//                         </button>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//               {allSent && (<div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-4"><p className="text-green-700 font-semibold text-center">All STK pushes sent successfully! You can now view payment tracking.</p></div>)}
//               <div className="flex gap-3">
//                 <button onClick={() => { setShowConfirmation(false); setGeneratedBill(null); setBillSaved(false); setSendingStatus({}); setActiveTab('payments'); }} className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-colors">Done</button>
//                 {allSent && (<button onClick={() => { router.push(`/dashboard/tracking/${generatedBill.id}`); }} className="flex-1 bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 font-semibold shadow-lg transition-colors">View Tracking</button>)}
//               </div>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     return (
//       <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
//         <div className="max-w-4xl mx-auto pt-8">
//           <button onClick={() => setActiveTab('landing')} className="mb-6 text-purple-600 hover:text-purple-700 font-medium">← Back</button>
//           <div className="bg-white rounded-2xl shadow-xl p-6">
//             <h2 className="text-3xl font-bold text-gray-800 mb-6">Create New Payment</h2>
//             <div className="space-y-5">
//               <div><label className="block text-sm font-semibold text-gray-800 mb-2">Bill Name <span className="text-red-500">*</span></label><input type="text" value={billName} onChange={(e) => setBillName(e.target.value)} placeholder="Dinner at Java" className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 ${errors.billName ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'}`} />{errors.billName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.billName}</p>}</div>
//               <div><label className="block text-sm font-semibold text-gray-800 mb-2">Total Amount (KES) <span className="text-red-500">*</span></label><input type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="1000" className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg font-semibold text-gray-900 placeholder:text-gray-400 ${errors.totalAmount ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'}`} />{errors.totalAmount && <p className="text-red-500 text-xs mt-1 font-medium">{errors.totalAmount}</p>}</div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div><label className="block text-sm font-semibold text-gray-800 mb-2">Paybill <span className="text-red-500">*</span></label><input type="text" value={paybill} onChange={(e) => setPaybill(e.target.value)} placeholder="123456" className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 ${errors.paybill ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'}`} /></div>
//                 <div><label className="block text-sm font-semibold text-gray-800 mb-2">Number of People <span className="text-red-500">*</span></label><input type="number" value={numberOfPeople} onChange={(e) => setNumberOfPeople(e.target.value)} placeholder="2" className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 ${errors.numberOfPeople ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'}`} /></div>
//               </div>
//               {phoneNumbers.length > 0 && (
//                 <div>
//                   <div className="flex justify-between mb-3"><label className="text-sm font-semibold text-gray-800">Participant Details</label></div>
//                   <div className="space-y-3">
//                     {phoneNumbers.map((person, idx) => (
//                       <div key={person.id} className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
//                         <p className="text-xs font-semibold text-gray-600 mb-2">Person {idx + 1}</p>
//                         <div className="space-y-2">
//                           <input type="text" value={person.name} onChange={(e) => updatePhoneNumber(person.id, 'name', e.target.value)} placeholder="Name" className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" />
//                           <input type="tel" value={person.number} onChange={(e) => updatePhoneNumber(person.id, 'number', e.target.value)} placeholder="254712345678" className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono" />
//                           <input type="number" value={person.amount} onChange={(e) => updatePhoneNumber(person.id, 'amount', e.target.value)} placeholder="Amount (KES)" className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold" />
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                   {errors.phones && <p className="text-red-500 text-xs mt-2">{errors.phones}</p>}
//                 </div>
//               )}
//               <button onClick={handleCreatePayment} className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">Create Payment</button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const PaymentsHistory = () => {
//     const getPaidCount = (participants: any[]) => participants.filter(p => p.status === 'paid').length;
//     const getStatus = (participants: any[]) => {
//       const paidCount = getPaidCount(participants);
//       if (paidCount === participants.length) return 'settled';
//       if (paidCount > 0) return 'partial';
//       return 'pending';
//     };

//     return (
//       <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
//         <div className="max-w-4xl mx-auto pt-8">
//           <button onClick={() => setActiveTab('landing')} className="mb-6 text-purple-600 hover:text-purple-700 font-medium">← Back</button>
//           <div className="mb-6"><h2 className="text-3xl font-bold text-gray-800 mb-2">Payment History</h2><p className="text-gray-600">View all your split bills</p></div>
//           <div className="space-y-4">
//             {bills.map((bill) => {
//               const status = getStatus(bill.participants || []);
//               const paidCount = getPaidCount(bill.participants || []);
//               return (
//                 <div key={bill.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
//                   <div className="p-6">
//                     <div className="flex items-start justify-between mb-4">
//                       <div className="flex-1">
//                         <h3 className="text-xl font-bold text-gray-800 mb-1">{bill.bill_name}</h3>
//                         <div className="flex items-center gap-3 text-sm text-gray-500">
//                           <span>📅 {new Date(bill.created_at).toLocaleDateString()}</span>
//                           <span>👥 {bill.number_of_people} people</span>
//                           <span>🏦 {bill.paybill}</span>
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <p className="text-3xl font-bold text-purple-600">KES {bill.total_amount}</p>
//                         {status === 'settled' && <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Settled</span>}
//                         {status === 'partial' && <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{paidCount}/{bill.participants?.length || 0} Paid</span>}
//                         {status === 'pending' && <span className="inline-block mt-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Pending</span>}
//                       </div>
//                     </div>
//                     {bill.participants && bill.participants.length > 0 && (
//                       <div className="space-y-2 mb-4">
//                         {bill.participants.slice(0, 3).map((participant: any, idx: number) => (
//                           <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
//                             <div className="flex items-center gap-3">
//                               <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-sm">{participant.name.charAt(0)}</div>
//                               <div><p className="font-medium text-gray-800 text-sm">{participant.name}</p></div>
//                             </div>
//                             <div className="text-right">
//                               <p className="font-bold text-gray-800 text-sm">KES {participant.amount}</p>
//                               {participant.status === 'paid' ? (<span className="inline-flex items-center gap-1 text-xs text-green-600"><CheckCircle size={12} /> Paid</span>) : (<span className="inline-flex items-center gap-1 text-xs text-orange-600"><Clock size={12} /> Pending</span>)}
//                             </div>
//                           </div>
//                         ))}
//                         {bill.participants.length > 3 && (<p className="text-center text-sm text-gray-500">+{bill.participants.length - 3} more participants</p>)}
//                       </div>
//                     )}
//                     <button onClick={() => router.push(`/dashboard/tracking/${bill.id}`)} className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">View Payment Tracking</button>
//                   </div>
//                 </div>
//               );
//             })}
//             {bills.length === 0 && (
//               <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
//                 <DollarSign className="mx-auto text-gray-300 mb-4" size={64} />
//                 <h3 className="text-xl font-bold text-gray-800 mb-2">No payments yet</h3>
//                 <p className="text-gray-600 mb-6">Create your first payment to get started</p>
//                 <button onClick={() => setActiveTab('create')} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors">Create Payment</button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <>
//       {activeTab === 'landing' && <LandingPage />}
//       {activeTab === 'create' && <CreatePayment />}
//       {activeTab === 'payments' && <PaymentsHistory />}
//     </>
//   );
// };

// export default App;
// app/(dashboard)/dashboard/page.tsx

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