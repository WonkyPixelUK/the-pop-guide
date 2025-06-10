-- ========================================
-- SUPABASE PERFORMANCE OPTIMIZATION FIXES - MINIMAL VERSION
-- ========================================
-- This script addresses core performance warnings from Supabase Performance Advisor
-- Focuses only on tables that definitely exist

-- ========================================
-- 1. DUPLICATE INDEX FIXES
-- ========================================

-- Remove duplicate index on custom_lists.slug
DROP INDEX IF EXISTS custom_lists_slug_idx;

-- ========================================
-- 2. CORE TABLE POLICY OPTIMIZATIONS
-- ========================================

-- PROFILES TABLE
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles 
FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "Users can update their own profile" ON public.profiles 
FOR UPDATE USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles 
FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- USER_COLLECTIONS TABLE
DROP POLICY IF EXISTS "Users can view their own collection" ON public.user_collections;
DROP POLICY IF EXISTS "Users can insert to their own collection" ON public.user_collections;
DROP POLICY IF EXISTS "Users can update their own collection" ON public.user_collections;
DROP POLICY IF EXISTS "Users can delete from their own collection" ON public.user_collections;

CREATE POLICY "Users can view their own collection" ON public.user_collections
FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert to their own collection" ON public.user_collections
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own collection" ON public.user_collections
FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete from their own collection" ON public.user_collections
FOR DELETE USING ((select auth.uid()) = user_id);

-- WISHLISTS TABLE
DROP POLICY IF EXISTS "Users can manage their own wishlist" ON public.wishlists;

CREATE POLICY "Users can manage their own wishlist" ON public.wishlists
FOR ALL USING ((select auth.uid()) = user_id);

-- CUSTOM_LISTS TABLE
DROP POLICY IF EXISTS "Users can view their own lists or public lists" ON public.custom_lists;
DROP POLICY IF EXISTS "Users can manage their own lists" ON public.custom_lists;
DROP POLICY IF EXISTS "Users can create their own lists" ON public.custom_lists;
DROP POLICY IF EXISTS "Users can view their own lists" ON public.custom_lists;
DROP POLICY IF EXISTS "Users can update their own lists" ON public.custom_lists;
DROP POLICY IF EXISTS "Users can delete their own lists" ON public.custom_lists;

CREATE POLICY "Users can view their own lists or public lists" ON public.custom_lists
FOR SELECT USING (is_public = true OR (select auth.uid()) = user_id);

CREATE POLICY "Users can manage their own lists" ON public.custom_lists
FOR ALL USING ((select auth.uid()) = user_id);

-- PUBLIC_PROFILES TABLE
DROP POLICY IF EXISTS "Users can view their own profile" ON public.public_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.public_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.public_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.public_profiles;

CREATE POLICY "Users can view their own profile" ON public.public_profiles
FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "Users can create their own profile" ON public.public_profiles
FOR INSERT WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update their own profile" ON public.public_profiles
FOR UPDATE USING ((select auth.uid()) = id);

CREATE POLICY "Users can delete their own profile" ON public.public_profiles
FOR DELETE USING ((select auth.uid()) = id);

-- ========================================
-- 3. CLEANUP REDUNDANT POLICIES
-- ========================================

-- Remove duplicate read policies
DROP POLICY IF EXISTS "Allow public read access to funko_pops" ON public.funko_pops;
DROP POLICY IF EXISTS "Allow public read access to price_history" ON public.price_history;
DROP POLICY IF EXISTS "Users can view public profile activities" ON public.profile_activities;
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.public_profiles;
DROP POLICY IF EXISTS "Allow public read access to scraping_jobs" ON public.scraping_jobs;

-- Remove redundant list item policies
DROP POLICY IF EXISTS "Users can add items to their own lists" ON public.list_items;
DROP POLICY IF EXISTS "Users can remove items from their own lists" ON public.list_items;
DROP POLICY IF EXISTS "Users can view list items" ON public.list_items;

-- ========================================
-- 4. VERIFICATION
-- ========================================

-- Check remaining policies
SELECT schemaname, tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'user_collections', 'wishlists', 'custom_lists', 'public_profiles')
ORDER BY tablename, cmd;

-- Check indexes on custom_lists
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename = 'custom_lists'
ORDER BY tablename; 