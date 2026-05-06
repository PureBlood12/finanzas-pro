-- DATABASE SCHEMA FOR FINANZAS PRO

-- 1. Create Tables

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    currency TEXT DEFAULT 'ARS',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services / Recurring Expenses
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- Vivienda, Servicios, Suscripciones, Transporte, Tarjetas, Otro
    estimated_amount DECIMAL(12,2),
    due_day INTEGER CHECK (due_day >= 1 AND due_day <= 31),
    cbu TEXT,
    alias TEXT,
    notes TEXT,
    icon TEXT,
    color TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments (instances of services per month)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    service_id UUID REFERENCES public.services ON DELETE CASCADE NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    paid_amount DECIMAL(12,2),
    payment_date DATE,
    status TEXT DEFAULT 'pending', -- paid, pending, overdue
    notes TEXT,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(service_id, month, year)
);

-- Bank Accounts
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT, -- Banco, Billetera Virtual, Efectivo, etc.
    balance DECIMAL(12,2) DEFAULT 0,
    color TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT,
    UNIQUE(user_id, name)
);

-- Payment Tags (Join table)
CREATE TABLE IF NOT EXISTS public.payment_tags (
    payment_id UUID REFERENCES public.payments ON DELETE CASCADE NOT NULL,
    tag_id UUID REFERENCES public.tags ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (payment_id, tag_id)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_tags ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Profiles: Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Services: Users can only see and manage their own services
CREATE POLICY "Users can manage own services" ON public.services 
    FOR ALL USING (auth.uid() = user_id);

-- Payments: Users can only see and manage their own payments
CREATE POLICY "Users can manage own payments" ON public.payments 
    FOR ALL USING (auth.uid() = user_id);

-- Bank Accounts: Users can only see and manage their own accounts
CREATE POLICY "Users can manage own accounts" ON public.bank_accounts 
    FOR ALL USING (auth.uid() = user_id);

-- Tags: Users can only see and manage their own tags
CREATE POLICY "Users can manage own tags" ON public.tags 
    FOR ALL USING (auth.uid() = user_id);

-- Payment Tags
CREATE POLICY "Users can manage own payment tags" ON public.payment_tags 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.payments 
            WHERE payments.id = payment_tags.payment_id AND payments.user_id = auth.uid()
        )
    );

-- 4. Create Functions & Triggers

-- Automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage Buckets Setup (Instructions for user)
-- Create a bucket named 'receipts' and set it to public or with RLS
