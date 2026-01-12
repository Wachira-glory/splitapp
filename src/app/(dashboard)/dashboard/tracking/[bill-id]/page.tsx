    //tracking/[id]/page.tsx
    "use client";

    import { useEffect, useState, useRef, use } from "react";
    import { createClient } from "@supabase/supabase-js";
    import { CheckCircle, Clock, X, RefreshCw, Send, AlertCircle, ArrowLeft } from "lucide-react";
    import { useRouter } from "next/navigation";

    const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const UNDA_API_USERNAME = process.env.NEXT_PUBLIC_UNDA_API_USERNAME!;
    const UNDA_API_PASSWORD = process.env.NEXT_PUBLIC_UNDA_API_PASSWORD!;

    const mapUndaStatus = (undaStatus: string): string => {
    const statusMap: { [key: string]: string } = {
        'COMPLETED': 'paid',
        'SUCCESS': 'paid',
        'PROCESSING': 'pending',
        'PENDING': 'pending',
        'INITIATED': 'pending',
        'FAILED': 'failed',    
        'EXPIRED': 'failed',   
        'CANCELLED': 'failed'  
    };
    return statusMap[undaStatus?.toUpperCase()] || 'pending';
    };

    // --- THE COMPONENT ---
    // Fixed the params type to match your folder name [bill-id]
    export default function PaymentTrackingPage({ params }: { params: Promise<{ "bill-id": string }> }) {
    const resolvedParams = use(params);
    const billId = resolvedParams["bill-id"];
    const router = useRouter();

    const [bill, setBill] = useState<any>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryingId, setRetryingId] = useState<string | null>(null);

    const participantsRef = useRef<any[]>([]);
    useEffect(() => { participantsRef.current = participants; }, [participants]);

    const getUndaJWT = async (): Promise<string | null> => {
        try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_UNDA_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "apikey": process.env.NEXT_PUBLIC_UNDA_SUPABASE_ANON_KEY! },
            body: JSON.stringify({ email: UNDA_API_USERNAME, password: UNDA_API_PASSWORD })
        });
        const data = await response.json();
        return data.access_token;
        } catch (error) { return null; }
    };

    const checkPaymentStatusViaAPI = async (undaId: string) => {
        try {
        const response = await fetch('/api/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: String(undaId) })
        });
        const result = await response.json();
        if (result.success && result.data?.[0]) return result.data[0].status;
        return null;
        } catch (err) { return null; }
    };

    const fetchBill = async () => {
        try {
        setLoading(true);
        const { data: billData } = await supabase.from("bills").select("*").eq("id", billId).single();
        const { data: participantsData } = await supabase.from("participants").select("*").eq("bill_id", billId);
        
        if (billData) setBill(billData);
        if (participantsData) {
            setParticipants(participantsData.map(p => ({ 
            ...p, 
            phone: p.phone_number, 
            name: p.name || 'Participant' 
            })));
        }
        } catch (err: any) { 
        setError(err.message); 
        } finally { 
        setLoading(false); 
        }
    };

    const pollPaymentStatuses = async () => {
        const currentList = participantsRef.current;
        if (!currentList.length) return;

        let hasChanged = false;
        const nextParticipants = [...currentList];

        await Promise.all(nextParticipants.map(async (p, idx) => {
        if (p.status === 'paid') return;
        const checkId = p.unda_checkout_id || p.unda_public_id;
        if (!checkId) return;

        const rawStatus = await checkPaymentStatusViaAPI(checkId);
        if (!rawStatus) return;

        const mappedStatus = mapUndaStatus(rawStatus);

        if (mappedStatus !== p.status) {
            nextParticipants[idx] = { ...p, status: mappedStatus };
            hasChanged = true;
            
            supabase.from('participants').update({ status: mappedStatus }).eq('id', p.id).then();
            
            if (mappedStatus === 'paid') {
                fetch('/api/settle-to-restaurant', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: p.amount,
                        destination_shortcode: bill.paybill,
                        bill_id: bill.id,
                        restaurant_name: bill.bill_name
                    }),
                }).then(() => console.log(`✅ Settled ${p.amount} to ${bill.bill_name}`));
            }
        }
        }));

        if (hasChanged) setParticipants(nextParticipants);
    };

    const handleRetry = async (participant: any) => {
        setRetryingId(participant.id);
        try {
        const jwtToken = await getUndaJWT();
        const res = await fetch('/api/send-stk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            phone: participant.phone_number,
            amount: participant.amount,
            reference: billId,
            paybill: bill.paybill,
            jwtToken
            })
        });
        
        const result = await res.json();
        if (result.success) {
            const newUndaId = result.data?.id || result.data?.public_id || result.data?.checkout_id;
            setParticipants(prev => prev.map(p => 
            p.id === participant.id ? { ...p, status: 'pending', unda_public_id: newUndaId } : p
            ));
            await supabase.from('participants').update({ unda_public_id: newUndaId, status: 'pending' }).eq('id', participant.id);
        }
        } catch (error) {
        console.error("Retry failed", error);
        } finally {
        setRetryingId(null);
        }
    };

    useEffect(() => {
        if (billId) fetchBill();
    }, [billId]);

    useEffect(() => {
        if (!bill) return;
        const interval = setInterval(pollPaymentStatuses, 3000); 
        return () => clearInterval(interval);
    }, [bill]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <RefreshCw className="animate-spin text-purple-600 mb-4" size={48} />
            <p className="text-gray-500 font-bold">Synchronizing Payment Tracker...</p>
        </div>
    );

    if (!bill) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle size={64} className="text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-800">Bill Not Found</h2>
            <button onClick={() => router.push('/dashboard')} className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-xl font-bold">Return to Dashboard</button>
        </div>
    );

    const paidCount = participants.filter(p => p.status === "paid").length;
    const failedCount = participants.filter(p => p.status === "failed").length;
    const pendingCount = participants.filter(p => p.status === "pending").length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto pt-8">
            
            <button 
                onClick={() => router.push('/dashboard')} 
                className="flex items-center gap-2 text-purple-600 font-bold mb-6 hover:-translate-x-1 transition-transform"
            >
                <ArrowLeft size={20} /> Back to All Payments
            </button>

            <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 border border-white">
            <div className="flex justify-between items-start">
                <div>
                <h2 className="text-3xl font-black text-gray-800 mb-1">{bill.bill_name}</h2>
                <p className="text-gray-400 font-medium tracking-tight">PAYBILL: {bill.paybill}</p>
                </div>
                <div className="text-right">
                <p className="text-4xl font-black text-purple-600 tracking-tight">KES {bill.total_amount}</p>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Goal Total</p>
                </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mt-8">
                <div className="bg-green-50 p-4 rounded-2xl border border-green-100 shadow-sm">
                    <p className="text-[10px] text-green-600 font-black uppercase tracking-wider mb-1">Paid</p>
                    <p className="text-2xl font-black text-green-700">{paidCount}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 shadow-sm">
                    <p className="text-[10px] text-amber-600 font-black uppercase tracking-wider mb-1">Pending</p>
                    <p className="text-2xl font-black text-amber-700">{pendingCount}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 shadow-sm">
                    <p className="text-[10px] text-red-600 font-black uppercase tracking-wider mb-1">Failed</p>
                    <p className="text-2xl font-black text-red-700">{failedCount}</p>
                </div>
            </div>
            </div>

            <div className="space-y-3">
            {participants.map((p, idx) => {
                const isRetrying = retryingId === p.id;
                
                return (
                    <div key={idx} className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between border border-white hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                        {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                        <h3 className="font-bold text-gray-800 text-lg">{p.name}</h3>
                        <p className="text-sm text-gray-500 font-medium">{p.phone}</p>
                        </div>
                    </div>

                    <div className="text-right flex items-center gap-6">
                        <p className="text-2xl font-black text-gray-800 tracking-tight">KES {p.amount}</p>
                        <div className="w-32 flex justify-end">
                        {p.status === 'paid' ? (
                            <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-xl font-bold text-sm flex items-center gap-1.5 shadow-sm">
                                <CheckCircle size={16}/> Paid
                            </span>
                        ) : p.status === 'failed' ? (
                            <button 
                                onClick={() => handleRetry(p)} 
                                disabled={isRetrying}
                                className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-red-700 shadow-lg shadow-red-100 transition-all"
                            >
                                <RefreshCw size={14} className={isRetrying ? "animate-spin" : ""}/> 
                                {isRetrying ? "..." : "Retry"}
                            </button>
                        ) : (
                            <span className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl font-bold text-sm flex items-center gap-1.5 border border-amber-100">
                                <Clock size={16} className="animate-pulse"/> Pending
                            </span>
                        )}
                        </div>
                    </div>
                    </div>
                );
            })}
            </div>
        </div>
        </div>
    );
    }