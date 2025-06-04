import { useState } from 'react';
import { Button } from '@/components/ui/button';
import EnhancedAddItemDialog from '@/components/EnhancedAddItemDialog';
import { useRewardProgress, useContributorStats } from '@/hooks/useRewardSystem';
import { useAuth } from '@/hooks/useAuth';
import { Trophy, Plus, Star, Gift } from 'lucide-react';

const TestEnhancedCollection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const rewardProgress = useRewardProgress();
  const { data: stats } = useContributorStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          🎯 Enhanced Collection Test Page
        </h1>

        {user ? (
          <>
            {/* Reward System Status */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-orange-400" />
                Your Contributor Status
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-400">{rewardProgress.approved}</div>
                  <div className="text-sm text-gray-300">Approved Submissions</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{rewardProgress.total}</div>
                  <div className="text-sm text-gray-300">Total Submissions</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{rewardProgress.itemsUntilFreeMonth}</div>
                  <div className="text-sm text-gray-300">Until Free Month</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>Progress to Free Month</span>
                  <span>{rewardProgress.approved}/75</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${rewardProgress.progressToFreeMonth}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-4">
                {rewardProgress.hasRecognitionBadge && (
                  <div className="flex items-center gap-2 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                    <Star className="w-4 h-4" />
                    Recognition Badge
                  </div>
                )}
                {rewardProgress.hasActiveFreeMonth && (
                  <div className="flex items-center gap-2 bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                    <Gift className="w-4 h-4" />
                    Free Month Active
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Add Collection Button */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8 text-center">
              <h2 className="text-2xl font-semibold mb-4">Test Enhanced Collection</h2>
              <p className="text-gray-300 mb-6">
                Click the button below to open the enhanced "Add to Collection" modal with all the new fields:
                UPC-A, EAN-13, Amazon ASIN, Country of Registration, Brand, Model #, Size, Color, Weight, 
                Product Dimensions, and complete database classification.
              </p>
              
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-3"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add to Collection (Enhanced)
              </Button>
            </div>

            {/* Feature List */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">✨ Enhanced Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-orange-400 mb-2">📋 Extended Fields</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• UPC-A & EAN-13 codes</li>
                    <li>• Amazon ASIN</li>
                    <li>• Country of Registration</li>
                    <li>• Brand & Model #</li>
                    <li>• Size, Color, Weight</li>
                    <li>• Product Dimensions</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-orange-400 mb-2">🏆 Reward System</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• 10+ submissions = Recognition Badge</li>
                    <li>• 75+ submissions = FREE MONTH</li>
                    <li>• Real-time progress tracking</li>
                    <li>• Milestone notifications</li>
                    <li>• Contributor leaderboard</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-orange-400 mb-2">📸 Image Upload</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Supabase Storage integration</li>
                    <li>• Drag & drop file upload</li>
                    <li>• Real-time image preview</li>
                    <li>• 5MB file size limit</li>
                    <li>• Automatic file validation</li>
                    <li>• Secure cloud storage</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-orange-400 mb-2">👤 Profile Pictures</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Dedicated profile-images bucket</li>
                    <li>• Automatic avatar updates</li>
                    <li>• File type validation</li>
                    <li>• Optimized for web display</li>
                    <li>• Cross-platform compatibility</li>
                    <li>• Privacy-focused storage</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">🔒 Sign In Required</h2>
            <p className="text-gray-300 mb-6">
              Please sign in to test the enhanced collection functionality and reward system.
            </p>
            <Button className="bg-orange-500 hover:bg-orange-600">
              Sign In
            </Button>
          </div>
        )}

        <EnhancedAddItemDialog 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen} 
        />
      </div>
    </div>
  );
};

export default TestEnhancedCollection; 