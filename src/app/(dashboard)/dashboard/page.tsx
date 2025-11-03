"use client"

import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, X, CheckCircle, Clock, Share2, Send, Users, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
// Your Supabase (for bills metadata)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bufdseweassfymorwyyc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1ZmRzZXdlYXNzZnltb3J3eXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3ODMyMjQsImV4cCI6MjA3NDM1OTIyNH0.SLSO8T3d1THeEv710c25Mq3TH_bgEc2lSxb75s9lqx0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Unda Supabase (for payments)
const undaSupabaseUrl = process.env.NEXT_PUBLIC_UNDA_SUPABASE_URL || 'https://zpmyjmzvgmohyqhprqmr.supabase.co';
const undaAnonKey = process.env.NEXT_PUBLIC_UNDA_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbXlqbXp2Z21vaHlxaHBycW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNDE3MjAsImV4cCI6MjA2MjcxNzcyMH0.cn40M6H5wq2lthw8slqBwyEk7KJNWbvVFhGbUKhcdeg';
const undaSupabase = createClient(undaSupabaseUrl, undaAnonKey);



const UNDA_API_USERNAME = process.env.NEXT_PUBLIC_UNDA_API_USERNAME || '18.ac3356009b7c486e9058a383d15697ed@unda.co';
const UNDA_API_PASSWORD = process.env.NEXT_PUBLIC_UNDA_API_PASSWORD || 'b46ceded2e1c45fe9c5012b96172a833';
const UNDA_MPESA_CHARGE_URL = `${undaSupabaseUrl}/functions/v1/mpesa-charge`;
const PROXY_URL = "https://bufdseweassfymorwyyc.supabase.co/functions/v1/proxy-charge";
const UNDA_API_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Calculate split with whole numbers
const calculateSplit = (totalAmount: number, numberOfPeople: number): number[] => {
  // Ensure minimum amount is 1 KES per person
  if (totalAmount < numberOfPeople) {
    // If amount is less than number of people, give 1 to first N people
    const amounts = new Array(numberOfPeople).fill(0);
    for (let i = 0; i < totalAmount; i++) {
      amounts[i] = 1;
    }
    return amounts;
  }
  
  const baseAmount = Math.floor(totalAmount / numberOfPeople);
  const remainder = totalAmount - (baseAmount * numberOfPeople);
  const amounts = new Array(numberOfPeople).fill(baseAmount);
  
  // Distribute remainder starting from first person
  for (let i = 0; i < remainder; i++) {
    amounts[i] += 1;
  }
  return amounts;
};

// Validate phone number
const validatePhoneNumber = (phone: string): boolean => {
  return /^(2547\d{8}|25411\d{7}|07\d{8}|011\d{7})$/.test(phone);
};

// Normalize phone number to 254 format
const normalizePhoneNumber = (phone: string): string => {
  if (phone.startsWith('07')) {
    return '254' + phone.substring(1);
  } else if (phone.startsWith('011')) {
    return '25411' + phone.substring(3);
  }
  return phone;
};

// Map Unda status to SplitBill status
const mapUndaStatus = (undaStatus: string): string => {
  const statusMap: { [key: string]: string } = {
    'SUCCESS': 'paid',
    'PENDING': 'pending',
    'FAILED': 'cancelled',
    'PROCESSING': 'pending',
    'INITIATED': 'pending'
  };
  return statusMap[undaStatus?.toUpperCase()] || 'pending';
};

const App = () => {
  const [activeTab, setActiveTab] = useState('landing');
  const [bills, setBills] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'payments') {
      fetchBills();
    }
  }, [activeTab]);

  const fetchBills = async () => {
    try {
      const { data: billsData, error: billsError } = await supabase
        .from('bills')
        .select('*')
        .order('created_at', { ascending: false });

      if (billsError) throw billsError;

      const billsWithPayments = await Promise.all(
        (billsData || []).map(async (bill) => {
          const { data: paymentsData, error: paymentsError } = await undaSupabase
            .from('payments')
            .select('*')
            .eq('reference', bill.id);

          if (paymentsError) {
            console.error('Error fetching payments for bill:', bill.id, paymentsError);
            return { ...bill, participants: [] };
          }

          const participants = (paymentsData || []).map((payment: any) => ({
            name: payment.data?.name || payment.reference?.split('-')[1] || 'Customer',
            phone: payment.idata?.customer_no || payment.data?.phone || '',
            amount: Number(payment.amount),
            status: mapUndaStatus(payment.status),
            unda_txn_id: payment.txn_id,
            unda_public_id: payment.public_id
          }));

          return { ...bill, participants };
        })
      );

      setBills(billsWithPayments);
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const LandingPage = () => (
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
          <button
            onClick={() => setActiveTab('create')}
            className="w-full bg-white text-purple-600 py-4 px-6 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Create Payment
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className="w-full bg-purple-800 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-purple-900 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            View Payments
          </button>
        </div>
      </div>
    </div>
  );

  const CreatePayment = () => {
    const [billName, setBillName] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [paybill, setPaybill] = useState('');
    const [reference, setReference] = useState('');
    const [numberOfPeople, setNumberOfPeople] = useState('');
    const [phoneNumbers, setPhoneNumbers] = useState<Array<{ id: number; number: string; name: string }>>([{ id: 1, number: '', name: '' }]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [generatedBill, setGeneratedBill] = useState<any>(null);
    const [sendMethod, setSendMethod] = useState('stk');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const addPhoneNumber = () => {
      setPhoneNumbers([...phoneNumbers, { id: Date.now(), number: '', name: '' }]);
    };

    const removePhoneNumber = (id: number) => {
      if (phoneNumbers.length > 1) {
        setPhoneNumbers(phoneNumbers.filter(p => p.id !== id));
      }
    };

    const updatePhoneNumber = (id: number, field: string, value: string) => {
      setPhoneNumbers(phoneNumbers.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      ));
    };

    const handleCreatePayment = () => {
      const newErrors: any = {};
      if (!billName) newErrors.billName = 'Bill name is required';
      if (!totalAmount) newErrors.totalAmount = 'Total amount is required';
      if (!paybill) newErrors.paybill = 'Paybill number is required';
      if (!numberOfPeople) newErrors.numberOfPeople = 'Number of people is required';

      const validPhones = phoneNumbers.filter(p => p.number && p.name);
      
      if (sendMethod === 'stk') {
        if (validPhones.length === 0) {
          newErrors.phones = 'Add at least one person with phone number for STK Push';
        } else {
          validPhones.forEach((p, idx) => {
            if (!validatePhoneNumber(p.number)) {
              newErrors[`phone_${idx}`] = `Invalid phone format: ${p.number}`;
            }
          });
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setErrors({});

      const numPeople = parseInt(numberOfPeople);
      const total = parseFloat(totalAmount);
      const splitAmounts = calculateSplit(total, numPeople);

      const participants = validPhones.map((p, idx) => ({
        name: p.name,
        phone: normalizePhoneNumber(p.number),
        amount: splitAmounts[idx] ?? 0,
        status: 'pending'
      }));

      if (sendMethod === 'link' && participants.length === 0) {
        for (let i = 0; i < numPeople; i++) {
          participants.push({
            name: `Person ${i + 1}`,
            phone: 'Via Link',
            amount: splitAmounts[i] ?? 0,
            status: 'pending'
          });
        }
      }

      const billId = 'bill-' + Date.now();
      const newBill = {
        id: billId,
        bill_name: billName,
        total_amount: total,
        paybill: paybill,
        reference: reference || billId,
        number_of_people: numPeople,
        share_link: `${window.location.origin}/pay/${Date.now().toString(36)}`,
        participants: participants,
        created_at: new Date().toISOString()
      };

      setGeneratedBill(newBill);
      setShowConfirmation(true);
    };



    
// Add this function near the top of your component, after the constants
const getUndaJWT = async (): Promise<string | null> => {
  try {
    const response = await fetch(
      `${undaSupabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": undaAnonKey,
        },
        body: JSON.stringify({
          email: UNDA_API_USERNAME,
          password: UNDA_API_PASSWORD,
        }),
      }
    );

    if (!response.ok) {
      console.error("Failed to get JWT:", await response.text());
      return null;
    }

    const data = await response.json();
    console.log("✅ Fresh JWT obtained, expires at:", new Date(data.expires_at * 1000));
    return data.access_token;
  } catch (error) {
    console.error("❌ Error getting JWT:", error);
    return null;
  }
};

// Update your sendUndaSTKPush function
const sendUndaSTKPush = async (
  phone: string,
  amount: number,
  reference: string,
  uid: number,
  name: string
) => {
  try {
    // ✅ Get fresh JWT token
    const jwtToken = await getUndaJWT();
    if (!jwtToken) {
      return { success: false, error: "Failed to authenticate with Unda" };
    }

    const payload = {
      customer_no: phone,
      amount,
      reference,
    };

    console.log("📞 Sending STK to UNDA:", payload);

    const response = await fetch(
      `${undaSupabaseUrl}/functions/v1/api-channels-mpesa-charge-req?api_key=3f8fd65caca749218e4d2fe2f865b7ab`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`, // ✅ Use fresh JWT
          "apikey": undaAnonKey, // ✅ Anon key
          "x-platform-uid": uid.toString(),
        },
        body: JSON.stringify(payload),
      }
    );

    const responseText = await response.text();
    console.log("📊 Raw UNDA response:", responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      return { success: false, error: "Invalid JSON response from UNDA" };
    }

    console.log("✅ Parsed UNDA response:", result);

    if (response.ok && result?.data?.id) {
      return {
        success: true,
        data: {
          public_id: result.data.id,
          status: result.data.status ?? "processing",
          uid,
          amount,
          reference,
          name,
        },
      };
    }

    return { success: false, error: result?.message || result?.error || "Payment request failed" };
  } catch (error: any) {
    console.error("❌ UNDA API Error:", error);
    return { success: false, error: error.message || "Network error occurred" };
  }
};


 const handleConfirmPayment = async () => {
  if (!generatedBill) return;

  const jwtToken = await getUndaJWT();
  if (!jwtToken) {
    alert("Failed to authenticate with Unda");
    return;
  }

  setLoading(true);

  try {
    for (const participant of generatedBill.participants) {
      const result = await sendUndaSTKPush(
        participant.phone,
        participant.amount,
        generatedBill.reference.toString(),
        participant.uid ?? Date.now(),
        participant.name
      );

      if (result?.data) {
        console.log("✅ STK Push successful:", result.data);

        // ✅ Check if payment was auto-created by Unda API
        const checkResponse = await fetch(
          `${undaSupabaseUrl}/rest/v1/payments?public_id=eq.${result.data.public_id}&select=*`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${jwtToken}`,
              "apikey": undaAnonKey,
            },
          }
        );

        if (checkResponse.ok) {
          const existingPayments = await checkResponse.json();
          console.log("Payment already exists?", existingPayments);

          if (existingPayments && existingPayments.length > 0) {
            console.log("✅ Payment auto-created by Unda, skipping manual insert");
            continue; // Skip to next participant
          }
        }

        // ✅ Only insert if payment doesn't exist
        console.log("Payment not found, attempting manual insert...");
        const insertResponse = await fetch(
          `${undaSupabaseUrl}/rest/v1/payments`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${jwtToken}`,
              "apikey": undaAnonKey,
              "Prefer": "return=representation",
            },
            body: JSON.stringify({
              public_id: result.data.public_id,
              p_id: 18, // Platform ID
              channel_id: 1, // M-Pesa channel ID
              uid: result.data.uid || participant.uid?.toString() || null,
              amount: participant.amount,
              reference: generatedBill.reference.toString(),
              status: result.data.status ?? "processing",
              category: "charge",
              data: {
                phone: participant.phone,
                name: participant.name,
              },
            }),
          }
        );

        if (!insertResponse.ok) {
          const errorText = await insertResponse.text();
          console.error("❌ Error inserting payment:", errorText);
        } else {
          const insertedData = await insertResponse.json();
          console.log("✅ Payment manually inserted:", insertedData);
        }
      }
    }

    alert("Payment requests sent successfully!");
    setShowConfirmation(false);
    setGeneratedBill(null);
    fetchBills();
  } catch (error) {
    console.error("❌ Error in handleConfirmPayment:", error);
    alert("Failed to send payment requests");
  } finally {
    setLoading(false);
  }
};



    const handleShareWhatsApp = () => {
      const participantDetails = generatedBill.participants
        .map((p: any) => `${p.name}: KES ${p.amount}`)
        .join('\n');

      const message = `💸 *${generatedBill.bill_name}*\n\n📊 Total: KES ${generatedBill.total_amount}\n💰 Split Details:\n${participantDetails}\n\n🏦 Paybill: ${generatedBill.paybill}\n📝 Reference: ${generatedBill.reference}\n\n🔗 Pay here: ${generatedBill.share_link}`;
      
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    };

    if (showConfirmation && generatedBill) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 flex items-center justify-center">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Ready!</h2>
              <p className="text-gray-600">{generatedBill.bill_name}</p>
            </div>

            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-purple-600">KES {generatedBill.total_amount}</p>
                </div>
                <div>
                  <p className="text-gray-600">Paybill</p>
                  <p className="text-2xl font-bold text-gray-800">{generatedBill.paybill}</p>
                </div>
                <div>
                  <p className="text-gray-600">Reference</p>
                  <p className="text-lg font-bold text-gray-800">{generatedBill.reference}</p>
                </div>
                <div>
                  <p className="text-gray-600">People</p>
                  <p className="text-lg font-bold text-gray-800">{generatedBill.number_of_people}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Choose how to send:</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSendMethod('stk')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    sendMethod === 'stk'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Send className={`mx-auto mb-2 ${sendMethod === 'stk' ? 'text-purple-600' : 'text-gray-400'}`} size={24} />
                  <p className="font-medium text-sm">STK Push</p>
                  <p className="text-xs text-gray-500 mt-1">Direct to phones</p>
                </button>

                <button
                  onClick={() => setSendMethod('link')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    sendMethod === 'link'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Share2 className={`mx-auto mb-2 ${sendMethod === 'link' ? 'text-purple-600' : 'text-gray-400'}`} size={24} />
                  <p className="font-medium text-sm">Share Link</p>
                  <p className="text-xs text-gray-500 mt-1">Via WhatsApp</p>
                </button>
              </div>
            </div>

            {sendMethod === 'stk' && (
              <div className="mb-6 bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Users size={18} />
                  STK Push Recipients
                </h3>
                <div className="space-y-2">
                  {generatedBill.participants.map((p: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-medium text-gray-800">{p.name}</p>
                        <p className="text-sm text-gray-600">{p.phone}</p>
                      </div>
                      <span className="text-sm font-bold text-purple-600">KES {p.amount}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <AlertCircle size={16} className="inline mr-1" />
                    Recipients will receive payment prompts on their phones
                  </p>
                </div>
              </div>
            )}

            {sendMethod === 'link' && (
              <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-3">Payment Link</h3>
                <div className="bg-white p-3 rounded-lg mb-3 break-all text-sm text-gray-700 border border-gray-200">
                  {generatedBill.share_link}
                </div>
                <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Link includes:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Paybill: {generatedBill.paybill}</li>
                    <li>• Reference: {generatedBill.reference}</li>
                    <li>• Amount per person breakdown</li>
                  </ul>
                </div>
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 size={18} />
                  Share via WhatsApp
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setGeneratedBill(null);
                }}
                className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
              onClick={handleConfirmPayment}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <Send size={18} />
              Send STK Push
            </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <button
            onClick={() => setActiveTab('landing')}
            className="mb-6 text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
          >
            ← Back
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Create New Payment</h2>
            <p className="text-gray-600 mb-6">Split a bill with friends</p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bill Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={billName}
                  onChange={(e) => setBillName(e.target.value)}
                  placeholder="Dinner at Java House"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.billName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.billName && <p className="text-red-500 text-xs mt-1">{errors.billName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Amount (KES) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="3000"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg ${errors.totalAmount ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.totalAmount && <p className="text-red-500 text-xs mt-1">{errors.totalAmount}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paybill Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={paybill}
                    onChange={(e) => setPaybill(e.target.value)}
                    placeholder="123456"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.paybill ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.paybill && <p className="text-red-500 text-xs mt-1">{errors.paybill}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of People <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(e.target.value)}
                    placeholder="3"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.numberOfPeople ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.numberOfPeople && <p className="text-red-500 text-xs mt-1">{errors.numberOfPeople}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference (Optional)
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Optional reference"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {totalAmount && numberOfPeople && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-2">Split breakdown (whole numbers):</p>
                  <div className="flex flex-wrap gap-2">
                    {calculateSplit(parseFloat(totalAmount), parseInt(numberOfPeople)).map((amt, idx) => (
                      <span key={idx} className="bg-white px-3 py-1 rounded-full text-sm font-medium text-purple-600 border border-purple-200">
                        Person {idx + 1}: KES {amt}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Total: KES {calculateSplit(parseFloat(totalAmount), parseInt(numberOfPeople)).reduce((a, b) => a + b, 0)}
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Add People (for STK Push)
                  </label>
                  <button
                    onClick={addPhoneNumber}
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add Person
                  </button>
                </div>

                <div className="space-y-3">
                  {phoneNumbers.map((person, idx) => (
                    <div key={person.id} className="flex gap-2">
                      <input
                        type="text"
                        value={person.name}
                        onChange={(e) => updatePhoneNumber(person.id, 'name', e.target.value)}
                        placeholder="Name"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <input
                        type="tel"
                        value={person.number}
                        onChange={(e) => updatePhoneNumber(person.id, 'number', e.target.value)}
                        placeholder="254712345678"
                        className={`flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors[`phone_${idx}`] ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {totalAmount && numberOfPeople && (
                        <div className="flex items-center px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 min-w-[100px] justify-center">
                          KES {calculateSplit(parseFloat(totalAmount), parseInt(numberOfPeople))[idx] || calculateSplit(parseFloat(totalAmount), parseInt(numberOfPeople))[0]}
                        </div>
                      )}
                      {phoneNumbers.length > 1 && (
                        <button
                          onClick={() => removePhoneNumber(person.id)}
                          className="px-3 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.phones && <p className="text-red-500 text-xs mt-2">{errors.phones}</p>}
                <p className="text-xs text-gray-500 mt-2">
                  Format: 254712345678, 07XXXXXXXX, or 011XXXXXXX
                </p>
              </div>

              <button
                onClick={handleCreatePayment}
                className="w-full py-4 px-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold text-lg shadow-lg"
              >
                Create Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PaymentsHistory = () => {
    const getPaidCount = (participants: any[]) => {
      return participants.filter(p => p.status === 'paid').length;
    };

    const getStatus = (participants: any[]) => {
      const paidCount = getPaidCount(participants);
      if (paidCount === participants.length) return 'settled';
      if (paidCount > 0) return 'partial';
      return 'pending';
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <button
            onClick={() => setActiveTab('landing')}
            className="mb-6 text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
          >
            ← Back
          </button>

          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment History</h2>
            <p className="text-gray-600">View all your split bills (powered by Unda)</p>
          </div>

          <div className="space-y-4">
            {bills.map((bill) => {
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
                        {status === 'settled' && (
                          <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Settled
                          </span>
                        )}
                        {status === 'partial' && (
                          <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {paidCount}/{bill.participants?.length || 0} Paid
                          </span>
                        )}
                        {status === 'pending' && (
                          <span className="inline-block mt-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {bill.participants && bill.participants.length > 0 && (
                      <div className="space-y-2">
                        {bill.participants.map((participant: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                                {participant.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{participant.name}</p>
                                <p className="text-sm text-gray-500">{participant.phone}</p>
                                {participant.unda_txn_id && (
                                  <p className="text-xs text-gray-400">TXN: {participant.unda_txn_id}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-800">KES {participant.amount}</p>
                              {participant.status === 'paid' ? (
                                <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                                  <CheckCircle size={14} />
                                  Paid
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-orange-600 font-medium">
                                  <Clock size={14} />
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {(!bill.participants || bill.participants.length === 0) && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No payments recorded yet
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {bills.length === 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <DollarSign className="mx-auto text-gray-300 mb-4" size={64} />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No payments yet</h3>
                <p className="text-gray-600 mb-6">Create your first payment to get started</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
                >
                  Create Payment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {activeTab === 'landing' && <LandingPage />}
      {activeTab === 'create' && <CreatePayment />}
      {activeTab === 'payments' && <PaymentsHistory />}
    </>
  );
};

export default App;