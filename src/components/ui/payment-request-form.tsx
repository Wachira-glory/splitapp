'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, ChevronLeft, Copy, Mail, MessageCircle } from 'lucide-react'
import { PaymentConfirmationModal } from './payment-confirmation-modal'
import { useRouter } from 'next/navigation'


interface PaymentData {
  paymentMethod: 'M-pesa' | 'Bank'
  customerName: string
  phoneNumber?: string
  bankName?: string
  accountNumber?: string
  amount: string
  purpose: string
}

interface PaymentRequestFormProps {
  onBack: () => void
}

export function PaymentRequestForm({ onBack }: PaymentRequestFormProps) {
   const router = useRouter()
  const [formData, setFormData] = useState<PaymentData>({
    paymentMethod: 'M-pesa',
    customerName: '',
    phoneNumber: '',
    bankName: '',
    accountNumber: '',
    amount: '',
    purpose: ''
  })
  
  const [showModal, setShowModal] = useState(false)
  const [generatedData, setGeneratedData] = useState<{
    billId: string
    mpesaTill?: string
    paymentLink: string
  } | null>(null)

  const handleInputChange = (field: keyof PaymentData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }


const handleSubmit = () => {
  const billId = `FT${Math.floor(Math.random() * 900000) + 100000}`

  const mockData = {
    billId,
    mpesaTill: formData.paymentMethod === 'M-pesa'
      ? String(Math.floor(Math.random() * 9000000) + 1000000)
      : undefined,
    paymentLink: `http://localhost:3000/payment-link/${billId}`
  }

  // Save the form data and generated link in localStorage using billId
  localStorage.setItem(
    `paymentData-${billId}`,
    JSON.stringify({ formData, generatedData: mockData })
  )

  setGeneratedData(mockData)
  setShowModal(true)
}


  const isFormValid = () => {
    const baseValid = formData.customerName && formData.amount && formData.purpose
    if (formData.paymentMethod === 'M-pesa') {
      return baseValid && formData.phoneNumber
    }
    return baseValid && formData.bankName && formData.accountNumber
  }

  return (

<div>
<div className="w-[1320px] h-[60px] bg-white flex items-center px-10 shadow-sm rounded-md -mt-6 mb-6 -ml-10  ">
  <div>
    <img
      src="/mulaflow-logo.png"
      alt="Mulaflow Logo"
      className="h-8 object-contain "
    />
  </div>
</div>
  
   
    <div className="min-h-screen bg-gray-50 p-4 -mt-8">
<div className="bg-white p-2 rounded-md w-fit mb-6 shadow-sm -ml-1">
  <Button
    variant="ghost"
    onClick={() => router.back()}
    className="p-0 h-auto font-normal text-gray-600 hover:text-gray-900 "
  >
    <ChevronLeft className="w-4 h-4 mr-2" />
    Back
  </Button>
</div>
      <div className="max-w-2xl mx-auto">
        {/* Header */}


        <div className="mb-6">
          
          
          <div className="mb-2">
            <h1 className="text-2xl font-semibold text-gray-900">Create Payment Link</h1>
            <p className="text-gray-600">
              Easily request payments with custom links you can send via email, WhatsApp, or anywhere online.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="w-full">
          <CardContent className="p-6">
            
            {/* Payment Method Tabs */}
            <Tabs 
              value={formData.paymentMethod} 
              onValueChange={(value) => handleInputChange('paymentMethod', value as 'M-pesa' | 'Bank')}
              className="w-full mb-6"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="M-pesa">M-pesa</TabsTrigger>
                <TabsTrigger value="Bank">Bank</TabsTrigger>
              </TabsList>

              <TabsContent value="M-pesa" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    placeholder="John Doe"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+254 2105158242"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    placeholder="40,000"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose of Bill (optional)</Label>
                  <Input
                    id="purpose"
                    placeholder="Enter purpose"
                    value={formData.purpose}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="Bank" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    placeholder="John Doe"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    placeholder="Equity"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="7862212012"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose of Bill (optional)</Label>
                  <Input
                    id="purpose"
                    placeholder="Enter purpose"
                    value={formData.purpose}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Generate Payment Link
            </Button>
          </CardContent>
        </Card>

        {/* Modal */}
        {showModal && generatedData && (
          <PaymentConfirmationModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            formData={formData}
            generatedData={generatedData}
          />
        )}
      </div>
    </div>
    </div>
  )
  
}

