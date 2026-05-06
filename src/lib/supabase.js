import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// --- MOCK SYSTEM WITH LOCAL STORAGE PERSISTENCE ---
let authListener = null
let currentUser = null

const getStorageData = () => {
  const data = localStorage.getItem('finanzas_pro_mock_data')
  return data ? JSON.parse(data) : {
    services: [],
    payments: [],
    bank_accounts: [],
    profiles: []
  }
}

const saveStorageData = (data) => {
  localStorage.setItem('finanzas_pro_mock_data', JSON.stringify(data))
}

const mockClient = {
  auth: {
    getSession: async () => ({ data: { session: currentUser ? { user: currentUser } : null }, error: null }),
    onAuthStateChange: (cb) => {
      authListener = cb
      return { data: { subscription: { unsubscribe: () => { authListener = null } } } }
    },
    signInWithPassword: async ({ email }) => {
      const userId = btoa(email).substring(0, 10)
      currentUser = { id: userId, email: email }
      if (authListener) authListener('SIGNED_IN', { user: currentUser })
      return { data: { user: currentUser }, error: null }
    },
    signUp: async ({ email }) => {
      const userId = btoa(email).substring(0, 10)
      currentUser = { id: userId, email: email }
      if (authListener) authListener('SIGNED_IN', { user: currentUser })
      return { data: { user: currentUser }, error: null }
    },
    signOut: async () => {
      currentUser = null
      if (authListener) authListener('SIGNED_OUT', null)
      return { error: null }
    },
  },
  from: (table) => {
    let filters = []
    
    const executeQuery = () => {
      const data = getStorageData()
      let results = data[table] || []
      if (table !== 'profiles' && currentUser) {
        results = results.filter(item => item.user_id === currentUser.id)
      }
      filters.forEach(f => {
        if (f.col === 'active' && f.val === true) {
          results = results.filter(item => item.active !== false)
        } else {
          results = results.filter(item => item[f.col] == f.val)
        }
      })
      return results
    }

    const queryInterface = {
      select: () => queryInterface,
      eq: (col, val) => {
        filters.push({ col, val })
        return queryInterface
      },
      order: () => Promise.resolve({ data: executeQuery(), error: null }),
      then: (cb) => cb({ data: executeQuery(), error: null }),
      insert: (items) => {
        const data = getStorageData()
        const newItems = items.map(item => ({ 
          ...item, 
          id: Math.random().toString(36).substr(2, 9),
          user_id: currentUser?.id || 'mock-user',
          active: item.active ?? true,
          created_at: new Date().toISOString()
        }))
        data[table] = [...(data[table] || []), ...newItems]
        saveStorageData(data)
        return Promise.resolve({ data: newItems, error: null })
      },
      update: (payload) => ({
        eq: (col, val) => {
          const data = getStorageData()
          data[table] = data[table].map(item => item[col] === val ? { ...item, ...payload } : item)
          saveStorageData(data)
          return Promise.resolve({ data: payload, error: null })
        }
      }),
      delete: () => ({
        eq: (col, val) => {
          const data = getStorageData()
          data[table] = data[table].filter(item => item[col] !== val)
          saveStorageData(data)
          return Promise.resolve({ error: null })
        }
      }),
    }
    return queryInterface
  },
  storage: {
    from: () => ({
      upload: async () => ({ data: {}, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: 'https://placehold.co/600x400/8b5cf6/white?text=Comprobante+de+Pago' } })
    })
  }
}

export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_url') 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : mockClient
