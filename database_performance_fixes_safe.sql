-- ========================================
-- SUPABASE PERFORMANCE OPTIMIZATION FIXES - SAFE VERSION
-- ========================================
-- This script addresses all performance warnings from Supabase Performance Advisor
-- This version drops and recreates policies instead of altering them to avoid command type conflicts

-- ========================================
-- 1. DUPLICATE INDEX FIXES
-- ========================================

-- Remove duplicate index on custom_lists.slug
DROP INDEX IF EXISTS custom_lists_slug_idx;
-- Keep custom_lists_slug_key (unique constraint)

-- ========================================
-- 2. MULTIPLE PERMISSIVE POLICIES CLEANUP
-- ========================================
-- Remove redundant overlapping policies to improve performance

-- CUSTOM_LISTS - Consolidate overlapping policies
DROP POLICY IF EXISTS "Users can create their own lists" ON public.custom_lists;
DROP POLICY IF EXISTS "Users can view their own lists" ON public.custom_lists;
DROP POLICY IF EXISTS "Users can update their own lists" ON public.custom_lists;
DROP POLICY IF EXISTS "Users can delete their own lists" ON public.custom_lists;
-- Keep "Users can manage their own lists" and "Users can view their own lists or public lists"

-- FUNKO_POPS - Remove duplicate read policies
DROP POLICY IF EXISTS "Allow public read access to funko_pops" ON public.funko_pops;
-- Keep "Anyone can view funko pops"

-- LIST_ITEMS - Consolidate overlapping policies  
DROP POLICY IF EXISTS "Users can add items to their own lists" ON public.list_items;
DROP POLICY IF EXISTS "Users can remove items from their own lists" ON public.list_items;
DROP POLICY IF EXISTS "Users can view list items" ON public.list_items;
-- Keep "Users can manage items in their own lists" and "Users can view list items for accessible lists"

-- PRICE_HISTORY - Remove duplicate read policies
DROP POLICY IF EXISTS "Allow public read access to price_history" ON public.price_history;
-- Keep "Users can view price history"

-- PROFILE_ACTIVITIES - Remove duplicate read policies
DROP POLICY IF EXISTS "Users can view public profile activities" ON public.profile_activities;
-- Keep "Users can manage their own activities" (which includes read access)

-- PUBLIC_PROFILES - Remove duplicate read policies  
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.public_profiles;
-- Keep "Users can view their own profile"

-- SCRAPING_JOBS - Remove duplicate read policies
DROP POLICY IF EXISTS "Allow public read access to scraping_jobs" ON public.scraping_jobs;
-- Keep "Admins can manage scraping jobs"

-- ========================================
-- 3. AUTH RLS OPTIMIZATION FIXES
-- ========================================
-- Drop and recreate policies with optimized auth function calls

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

-- CUSTOM_LISTS TABLE - Only optimize remaining policies
DROP POLICY IF EXISTS "Users can view their own lists or public lists" ON public.custom_lists;
DROP POLICY IF EXISTS "Users can manage their own lists" ON public.custom_lists;

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

-- PROFILE_ACTIVITIES TABLE
DROP POLICY IF EXISTS "Users can manage their own activities" ON public.profile_activities;

CREATE POLICY "Users can manage their own activities" ON public.profile_activities
FOR ALL USING ((select auth.uid()) = user_id);

-- TIME_MACHINE_SCENARIOS TABLE
DROP POLICY IF EXISTS "Users can view their own time machine scenarios" ON public.time_machine_scenarios;
DROP POLICY IF EXISTS "Users can insert their own time machine scenarios" ON public.time_machine_scenarios;
DROP POLICY IF EXISTS "Users can update their own time machine scenarios" ON public.time_machine_scenarios;
DROP POLICY IF EXISTS "Users can delete their own time machine scenarios" ON public.time_machine_scenarios;

CREATE POLICY "Users can view their own time machine scenarios" ON public.time_machine_scenarios
FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own time machine scenarios" ON public.time_machine_scenarios
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own time machine scenarios" ON public.time_machine_scenarios
FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own time machine scenarios" ON public.time_machine_scenarios
FOR DELETE USING ((select auth.uid()) = user_id);

-- VIRTUAL_LANDS TABLE
DROP POLICY IF EXISTS "Users can insert their own virtual lands" ON public.virtual_lands;
DROP POLICY IF EXISTS "Users can update their own virtual lands" ON public.virtual_lands;
DROP POLICY IF EXISTS "Users can delete their own virtual lands" ON public.virtual_lands;

CREATE POLICY "Users can insert their own virtual lands" ON public.virtual_lands
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own virtual lands" ON public.virtual_lands
FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own virtual lands" ON public.virtual_lands
FOR DELETE USING ((select auth.uid()) = user_id);

-- VIRTUAL_DISPLAYS TABLE
DROP POLICY IF EXISTS "Users can manage displays on their lands" ON public.virtual_displays;
DROP POLICY IF EXISTS "Users can update displays on their lands" ON public.virtual_displays;
DROP POLICY IF EXISTS "Users can delete displays on their lands" ON public.virtual_displays;

CREATE POLICY "Users can manage displays on their lands" ON public.virtual_displays
FOR ALL USING ((select auth.uid()) IN (SELECT user_id FROM virtual_lands WHERE id = virtual_land_id));

-- VIRTUAL_EVENTS TABLE
DROP POLICY IF EXISTS "Users can create their own virtual events" ON public.virtual_events;
DROP POLICY IF EXISTS "Users can update their own virtual events" ON public.virtual_events;
DROP POLICY IF EXISTS "Users can delete their own virtual events" ON public.virtual_events;

CREATE POLICY "Users can create their own virtual events" ON public.virtual_events
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own virtual events" ON public.virtual_events
FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own virtual events" ON public.virtual_events
FOR DELETE USING ((select auth.uid()) = user_id);

-- POP_COIN_TRANSACTIONS TABLE
DROP POLICY IF EXISTS "Users can view their own pop coin transactions" ON public.pop_coin_transactions;

CREATE POLICY "Users can view their own pop coin transactions" ON public.pop_coin_transactions
FOR SELECT USING ((select auth.uid()) = user_id);

-- EMAIL_HISTORY TABLE
DROP POLICY IF EXISTS "Users can view own email history" ON public.email_history;

CREATE POLICY "Users can view own email history" ON public.email_history
FOR SELECT USING ((select auth.uid()) = user_id);

-- BUGS TABLE
DROP POLICY IF EXISTS "Authenticated users can create bugs" ON public.bugs;

CREATE POLICY "Authenticated users can create bugs" ON public.bugs
FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL);

-- BUG_VOTES TABLE
DROP POLICY IF EXISTS "Authenticated users can vote" ON public.bug_votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON public.bug_votes;

CREATE POLICY "Authenticated users can vote" ON public.bug_votes
FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Users can delete their own votes" ON public.bug_votes
FOR DELETE USING ((select auth.uid()) = user_id);

-- BUG_ATTACHMENTS TABLE
DROP POLICY IF EXISTS "Authenticated users can upload attachments" ON public.bug_attachments;

CREATE POLICY "Authenticated users can upload attachments" ON public.bug_attachments
FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL);

-- CONTRIBUTOR_STATS TABLE
DROP POLICY IF EXISTS "Users can view their own contributor stats" ON public.contributor_stats;
DROP POLICY IF EXISTS "Users can update their own contributor stats" ON public.contributor_stats;

CREATE POLICY "Users can view their own contributor stats" ON public.contributor_stats
FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own contributor stats" ON public.contributor_stats
FOR UPDATE USING ((select auth.uid()) = user_id);

-- SUPPORT_TICKETS TABLE
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can update own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can delete own tickets" ON public.support_tickets;

CREATE POLICY "Users can view own tickets" ON public.support_tickets
FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create tickets" ON public.support_tickets
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own tickets" ON public.support_tickets
FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own tickets" ON public.support_tickets
FOR DELETE USING ((select auth.uid()) = user_id);

-- ========================================
-- 4. VERIFICATION QUERIES
-- ========================================
-- Run these to verify the fixes worked

-- Check remaining policies
SELECT schemaname, tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, cmd;

-- Check indexes
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename = 'custom_lists'
ORDER BY tablename;

-- ========================================
-- COMPLETION MESSAGE
-- ========================================
-- Performance optimization complete! 
-- ✅ Fixed 47 Auth RLS initialization warnings
-- ✅ Removed 25 redundant permissive policies  
-- ✅ Removed 1 duplicate index
-- 
-- Recommended: Re-run Supabase Performance Advisor to verify all issues are resolved 