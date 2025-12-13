// API configuration and helper functions for connecting to Express backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://facturationback.onrender.com"

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Helper function to make authenticated API calls
async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = localStorage.getItem("token")

 const headers: Record<string, string> = {
  "Content-Type": "application/json",
  ...(options.headers as Record<string, string>), 
}

if (token) {
  headers["Authorization"] = `Bearer ${token}`
}



  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Une erreur est survenue",
      }
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    }
  } catch (error) {
    return {
      success: false,
      error: "Erreur de connexion au serveur",
    }
  }
}

// Authentication API calls
export const authApi = {
  login: async (email: string, password: string) => {
    return fetchApi<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },

  register: async (userData: { email: string; password: string; name: string }) => {
    return fetchApi<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  getCurrentUser: async () => {
    return fetchApi<User>("/auth/me")
  },

  logout: () => {
    localStorage.removeItem("token")
  },
}

// User management API calls (Admin only)
export const userApi = {
  getAll: async () => {
    return fetchApi<User[]>("/auth/users")
  },

  create: async (userData: Partial<User>) => {
    return fetchApi<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  update: async (id: string, userData: Partial<User>) => {
    return fetchApi<User>(`/auth/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  },

  delete: async (id: string) => {
    return fetchApi(`/auth/${id}`, {
      method: "DELETE",
    })
  },

  toggleStatus: async (id: string) => {
    return fetchApi<User>(`/auth/${id}/toggle-status`, {
      method: "PATCH",
    })
  },
}

// Client API calls
export const clientApi = {
  getAll: async () => {
    return fetchApi<Client[]>("/clients")
  },

  create: async (clientData: Partial<Client>) => {
    return fetchApi<Client>("/clients/creer", {
      method: "POST",
      body: JSON.stringify(clientData),
    })
  },

  update: async (id: string, clientData: Partial<Client>) => {
    return fetchApi<Client>(`/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(clientData),
    })
  },

  delete: async (id: string) => {
    return fetchApi(`/clients/${id}`, {
      method: "DELETE",
    })
  },
}

// Product/Service API calls
export const productApi = {
  getAll: async () => {
    return fetchApi<Product[]>("/produit")
  },

  create: async (productData: Partial<Product>) => {
    return fetchApi<Product>("/produit/creer", {
      method: "POST",
      body: JSON.stringify(productData),
    })
  },

  update: async (id: string, productData: Partial<Product>) => {
    return fetchApi<Product>(`/produit/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    })
  },

  delete: async (id: string) => {
    return fetchApi(`/produit/${id}`, {
      method: "DELETE",
    })
  },
}

// Invoice API calls
export const invoiceApi = {
  getAll: async () => {
    return fetchApi<Invoice[]>("/factures")
  },

  getById: async (id: string) => {
    return fetchApi<Invoice>(`/factures/${id}`)
  },

  create: async (invoiceData: Partial<Invoice>) => {
    return fetchApi<Invoice>("/factures/creer", {
      method: "POST",
      body: JSON.stringify(invoiceData),
    })
  },

  update: async (id: string, invoiceData: Partial<Invoice>) => {
    return fetchApi<Invoice>(`/factures/${id}`, {
      method: "PUT",
      body: JSON.stringify(invoiceData),
    })
  },

  delete: async (id: string) => {
    return fetchApi(`/factures/${id}`, {
      method: "DELETE",
    })
  },

  // changement de statut
  updateStatus: async (id: string, status: "draft" | "sent" | "paid") => {
    return fetchApi<Invoice>(`/factures/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  },

  downloadPdf: async (id: string) => {
    const token = localStorage.getItem("token")
    const response = await fetch(`${API_BASE_URL}/factures/${id}/pdf`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.blob()
  },
}


// Types
export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
  isActive: boolean
  createdAt: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  userId: string
  createdAt: string
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  userId: string
  createdAt: string
}

export interface InvoiceItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  clientId: string
  client?: Client
  userId: string
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  status: "draft" | "sent" | "paid"
  issueDate: string
  dueDate?: string
  notes?: string
  createdAt: string
}
