// components/ui/payment-confirmation-modal.tsx
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, Mail, MessageCircle, CheckCircle } from 'lucide-react'
import { useState } from 'react'

interface PaymentData {
  paymentMethod: 'M-pesa' | 'Bank'
  customerName: string
  phoneNumber?: string
  bankName?: string
  accountNumber?: string
  amount: string
  purpose: string
}

interface GeneratedData {
  billId: string
  mpesaTill?: string
  paymentLink: string
}

interface PaymentConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  formData: PaymentData
  generatedData: GeneratedData
}

export function PaymentConfirmationModal({ 
  isOpen, 
  onClose, 
  formData, 
  generatedData 
}: PaymentConfirmationModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedData.paymentLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Payment Link Created</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          {/* Form Data Display */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Bill ID</Label>
                <Input value={generatedData.billId} readOnly className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Customer Name</Label>
                <Input value={formData.customerName} readOnly className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Purpose of Bill</Label>
                <Input value={formData.purpose} readOnly className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Amount</Label>
                <Input value={`Ksh ${formData.amount}`} readOnly className="mt-1" />
              </div>
            </div>

            {formData.paymentMethod === 'M-pesa' && generatedData.mpesaTill && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Mpesa Till :</Label>
                <Input value={generatedData.mpesaTill} readOnly className="mt-1" />
              </div>
            )}

            {formData.paymentMethod === 'Bank' && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Account Number</Label>
                <Input value={formData.accountNumber} readOnly className="mt-1" />
              </div>
            )}
          </div>

          {/* Share Message */}
          <div className="text-center text-sm text-gray-600 py-2">
            Your unique link has been created ! You can copy it or hare it via Gmail or WhatsApp
          </div>

          {/* Payment Link */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Payment Link:</div>
            <div className="text-sm font-mono break-all text-gray-700">
              {generatedData.paymentLink}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleCopy}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Gmail
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 pt-4">
            Powered by Mulaflow
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}