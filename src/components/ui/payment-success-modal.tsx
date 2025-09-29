// components/ui/payment-success-modal.tsx
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle, Download } from 'lucide-react'

interface PaymentSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  amount: string
}

export function PaymentSuccessModal({ 
  isOpen, 
  onClose, 
  amount 
}: PaymentSuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">Payment Successful</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 text-center">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <p className="text-gray-700">
              Thank you for your payment. We have received your KES {amount} for Quikk Api.
            </p>
          </div>

          {/* Download Button */}
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}