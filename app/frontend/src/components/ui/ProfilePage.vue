<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <BaseText
          variant="h1"
          size="4xl"
          color="blood-500"
          family="horror"
          align="center"
          class="mb-4"
        >
          Your Profile
        </BaseText>
        <BaseText
          variant="p"
          size="lg"
          color="night-300"
          align="center"
        >
          Manage your account and view statistics
        </BaseText>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Profile Information -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Basic Info -->
          <div class="bg-night-900/50 backdrop-blur-sm rounded-lg border border-night-700 p-6">
            <BaseText
              variant="h2"
              size="2xl"
              color="white"
              class="mb-6"
            >
              Basic Information
            </BaseText>
            
            <form @submit.prevent="_updateProfile" class="space-y-4">
              <BaseInput
                v-model="profileData.username"
                type="text"
                label="Username"
                placeholder="Enter username"
                required
              />
              
              <BaseInput
                v-model="profileData.email"
                type="email"
                label="Email"
                placeholder="Enter email"
                required
              />
              
              <div>
                <label for="bio" class="block text-sm font-medium text-night-300 mb-2">Bio</label>
                <textarea
                  id="bio"
                  v-model="profileData.bio"
                  rows="3"
                  class="w-full px-4 py-3 bg-night-700 border border-night-600 rounded-lg 
                         text-white placeholder-night-400 focus:outline-none focus:ring-2 
                         focus:ring-blood-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                ></textarea>
              </div>
              
              <div class="flex items-center space-x-4">
                <BaseButton
                  @click="_updateProfile"
                  variant="blood"
                  size="md"
                  :loading="isUpdating"
                  :disabled="isUpdating"
                >
                  {{ isUpdating ? 'Updating...' : 'Update Profile' }}
                </BaseButton>
                
                <BaseButton
                  @click="_resetForm"
                  variant="ghost"
                  size="md"
                  :disabled="isUpdating"
                >
                  Reset
                </BaseButton>
              </div>
            </form>
          </div>

          <!-- Change Password -->
          <div class="bg-night-900/50 backdrop-blur-sm rounded-lg border border-night-700 p-6">
            <BaseText
              variant="h2"
              size="2xl"
              color="white"
              class="mb-6"
            >
              Change Password
            </BaseText>
            
            <form @submit.prevent="_changePassword" class="space-y-4">
              <BaseInput
                v-model="passwordData.currentPassword"
                type="password"
                label="Current Password"
                placeholder="Enter current password"
                required
              />
              
              <BaseInput
                v-model="passwordData.newPassword"
                type="password"
                label="New Password"
                placeholder="Enter new password"
                required
              />
              
              <BaseInput
                v-model="passwordData.confirmPassword"
                type="password"
                label="Confirm New Password"
                placeholder="Confirm new password"
                required
              />
              
              <BaseButton
                @click="_changePassword"
                variant="blood"
                size="md"
                :loading="isChangingPassword"
                :disabled="isChangingPassword"
              >
                {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
              </BaseButton>
            </form>
          </div>
        </div>

        <!-- Statistics -->
        <div class="space-y-6">
          <!-- User Stats -->
          <div class="bg-night-900/50 backdrop-blur-sm rounded-lg border border-night-700 p-6">
            <BaseText
              variant="h2"
              size="2xl"
              color="white"
              class="mb-6"
            >
              Your Statistics
            </BaseText>
            
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <BaseText variant="p" color="night-300">Games Played</BaseText>
                <BaseText variant="p" color="white" class="font-semibold">{{ stats.gamesPlayed }}</BaseText>
              </div>
              
              <div class="flex justify-between items-center">
                <BaseText variant="p" color="night-300">Games Won</BaseText>
                <BaseText variant="p" color="white" class="font-semibold">{{ stats.gamesWon }}</BaseText>
              </div>
              
              <div class="flex justify-between items-center">
                <BaseText variant="p" color="night-300">Games Directed</BaseText>
                <BaseText variant="p" color="white" class="font-semibold">{{ stats.gamesDirected }}</BaseText>
              </div>
              
              <div class="flex justify-between items-center">
                <BaseText variant="p" color="night-300">Survival Rate</BaseText>
                <BaseText variant="p" color="white" class="font-semibold">{{ stats.survivalRate }}%</BaseText>
              </div>
              
              <div class="flex justify-between items-center">
                <BaseText variant="p" color="night-300">Best Score</BaseText>
                <BaseText variant="p" color="white" class="font-semibold">{{ stats.bestScore }}</BaseText>
              </div>
            </div>
          </div>

          <!-- Account Actions -->
          <div class="bg-night-900/50 backdrop-blur-sm rounded-lg border border-night-700 p-6">
            <BaseText
              variant="h2"
              size="2xl"
              color="white"
              class="mb-6"
            >
              Account Actions
            </BaseText>
            
            <div class="space-y-4">
              <BaseButton
                @click="_handleLogout"
                variant="blood"
                size="md"
              >
                Logout
              </BaseButton>
              
              <BaseButton
                @click="_deleteAccount"
                variant="ghost"
                size="md"
              >
                Delete Account
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue';
import BaseButton from '@/components/ui/design-system/atoms/BaseButton.vue';
import BaseInput from '@/components/ui/design-system/atoms/BaseInput.vue';
import BaseText from '@/components/ui/design-system/atoms/BaseText.vue';
import { useAuthStore } from '@/stores/auth';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();

// Profile state
const profileData = ref({
  username: '',
  email: '',
  bio: '',
});

const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const isUpdating = ref(false);
const isChangingPassword = ref(false);

// Statistics
const stats = ref({
  gamesPlayed: 0,
  gamesWon: 0,
  gamesDirected: 0,
  survivalRate: 0,
  bestScore: 0,
});

const _updateProfile = async () => {
  isUpdating.value = true;
  try {
    // TODO: Implement profile update API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Profile updated successfully
  } catch (error) {
    console.error('Failed to update profile:', error);
  } finally {
    isUpdating.value = false;
  }
};

const _changePassword = async () => {
  if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
    console.error('Passwords do not match');
    return;
  }

  isChangingPassword.value = true;
  try {
    // TODO: Implement password change API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Password changed successfully
    passwordData.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  } catch (error) {
    console.error('Failed to change password:', error);
  } finally {
    isChangingPassword.value = false;
  }
};

const _resetForm = () => {
  // Reset to original values
  profileData.value = {
    username: authStore.user?.username || '',
    email: authStore.user?.email || '',
    bio: authStore.user?.bio || '',
  };
};

const _handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

const _deleteAccount = async () => {
  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    try {
      // TODO: Implement account deletion API call
      await authStore.logout();
      router.push('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  }
};

const loadProfile = async () => {
  try {
    // TODO: Implement profile fetch API call
    // Mock data
    profileData.value = {
      username: authStore.user?.username || 'Unknown',
      email: authStore.user?.email || 'unknown@example.com',
      bio: 'A horror game enthusiast',
    };

    stats.value = {
      gamesPlayed: 15,
      gamesWon: 8,
      gamesDirected: 3,
      survivalRate: 53,
      bestScore: 12,
    };
  } catch (error) {
    console.error('Failed to load profile:', error);
  }
};

onMounted(() => {
  loadProfile();
});
</script>

<style scoped>
.toggle {
  @apply w-6 h-6 bg-night-600 border border-night-500 rounded focus:ring-2 focus:ring-blood-500;
}
</style> 