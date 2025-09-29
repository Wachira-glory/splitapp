export interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

export interface Transaction {
  id: string
  transactionId: string
  accountName: string
  date: string
  amount: number
  referenceId: string
  status: "Active" | "Pending" | "Failed"
  paymentChannel: "M-pesa" | "Visa Card" | "Bank Transfer"
  customerName?: string
}

export interface PayLink {
  id: string
  purpose: string
  linkUrl: string
  paymentChannel: "M-pesa" | "Visa Card" | "Bank Transfer"
  customerName: string
  transactionId: string
  amount: number
}

export interface DashboardStats {
  totalInflow: number
  totalInflowChange: number
  successfulTransactions: number
  successfulTransactionsChange: number
  pendingTransactions: number
  pendingTransactionsChange: number
  failedTransactions: number
  failedTransactionsChange: number
}

export interface ChartData {
  month: string
  value: number
}

export interface PaymentData {
  paymentMethod: 'M-pesa' | 'Bank'
  customerName: string
  phoneNumber?: string
  bankName?: string
  accountNumber?: string
  amount: string
  purpose: string
}

export interface GeneratedData {
  billId: string
  mpesaTill?: string
  paymentLink: string
}
