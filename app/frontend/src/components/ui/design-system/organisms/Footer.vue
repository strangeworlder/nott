<template>
  <footer :class="_footerClasses">
    <div class="footer-container">
      <!-- Main Footer Content -->
      <div class="footer-main">
        <div class="footer-brand">
          <BaseText variant="h2" family="horror" size="xl" class="text-glow">
            NotT
          </BaseText>
          <p class="footer-tagline">
            The horror awaits...
          </p>
        </div>

        <div class="footer-links">
          <div class="footer-section">
            <h3 class="footer-section-title">Game</h3>
            <ul class="footer-section-list">
              <li><a href="#" class="footer-link">How to Play</a></li>
              <li><a href="#" class="footer-link">Rules</a></li>
              <li><a href="#" class="footer-link">Characters</a></li>
              <li><a href="#" class="footer-link">Scenarios</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h3 class="footer-section-title">Community</h3>
            <ul class="footer-section-list">
              <li><a href="#" class="footer-link">Forums</a></li>
              <li><a href="#" class="footer-link">Discord</a></li>
              <li><a href="#" class="footer-link">Events</a></li>
              <li><a href="#" class="footer-link">Leaderboard</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h3 class="footer-section-title">Support</h3>
            <ul class="footer-section-list">
              <li><a href="#" class="footer-link">Help Center</a></li>
              <li><a href="#" class="footer-link">Contact</a></li>
              <li><a href="#" class="footer-link">Bug Report</a></li>
              <li><a href="#" class="footer-link">Feedback</a></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <div class="footer-copyright">
          <p>&copy; {{ _currentYear }} NotT. All rights reserved.</p>
        </div>

        <div class="footer-social">
          <a href="#" class="social-link" aria-label="Discord">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </a>
          <a href="#" class="social-link" aria-label="GitHub">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          <a href="#" class="social-link" aria-label="Twitter">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseText from '../atoms/BaseText.vue';

interface FooterProps {
  variant?: 'default' | 'horror' | 'blood';
}

const props = withDefaults(defineProps<FooterProps>(), {
  variant: 'default',
});

const _currentYear = computed(() => new Date().getFullYear());

const _footerClasses = computed(() => {
  const baseClasses = ['footer', 'bg-night-900/90 backdrop-blur-sm border-t border-night-700'];

  const variantClasses = {
    default: '',
    horror: 'border-horror-600 shadow-glow-soft',
    blood: 'border-blood-600 shadow-glow-blood',
  };

  return [...baseClasses, variantClasses[props.variant]].filter(Boolean);
});
</script>

<style scoped>
.footer-container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12;
}

.footer-main {
  @apply grid grid-cols-1 md:grid-cols-4 gap-8 mb-8;
}

.footer-brand {
  @apply col-span-1 md:col-span-1;
}

.footer-tagline {
  @apply text-night-400 text-sm mt-2;
}

.footer-links {
  @apply col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8;
}

.footer-section-title {
  @apply text-white font-semibold mb-4 text-sm uppercase tracking-wider;
}

.footer-section-list {
  @apply space-y-2;
}

.footer-link {
  @apply text-night-400 hover:text-white transition-colors duration-200 text-sm;
}

.footer-bottom {
  @apply flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-night-700;
}

.footer-copyright {
  @apply text-night-400 text-sm mb-4 sm:mb-0;
}

.footer-social {
  @apply flex space-x-4;
}

.social-link {
  @apply text-night-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-night-800;
}
</style> 