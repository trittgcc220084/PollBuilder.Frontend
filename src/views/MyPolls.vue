<template>
  <div class="page">
    <div class="container" style="max-width: 720px;">
      <div class="eyebrow">Poll Builder</div>
      <h2 class="page-title">My Poll History</h2>

      <div class="tear-line"></div>

      <div v-if="isLoading" class="state-box">⏳ Loading data...</div>

      <div v-else-if="errorMessage" class="alert alert-error">
        <span class="alert-icon">!</span>
        <span>{{ errorMessage }}</span>
      </div>

      <div v-else-if="polls.length > 0" class="polls-list">
        <PollCard
          v-for="poll in polls"
          :key="poll.id || poll._id || poll.code"
          :poll="poll"
        />
      </div>

      <div v-else class="card state-box">📝 You haven't created any polls yet.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { pollApi } from '../api/pollApi';
import PollCard from '../components/PollCard.vue';

const polls = ref([]);
const isLoading = ref(true);
const errorMessage = ref('');
const router = useRouter();

onMounted(async () => {
  // 1. Lấy token từ localStorage
  const jwtToken = localStorage.getItem('token');

  console.log('🔍 Kiểm tra token:', jwtToken ? 'Token tồn tại' : '❌ Không có token');

  if (!jwtToken) {
    errorMessage.value = 'You are not logged in. Please log in to view your polls.';
    isLoading.value = false;
    // Redirect to login after 2 seconds
    setTimeout(() => router.push('/login'), 2000);
    return;
  }

  try {
// 2. Call the API via pollApi.js (token handling is automated)
  console.log('📡 Gọi API: getMyPolls()');
    const data = await pollApi.getMyPolls();

    console.log('✅ Dữ liệu trả về:', data);
    polls.value = Array.isArray(data) ? data : (data.data || []);

    if (polls.value.length === 0) {
      console.log('ℹ️ There are no polls.');
    }
  } catch (error) {
    console.error('❌ Error retrieving MyPolls:', error);

    if (error.message.includes('401')) {
      localStorage.removeItem('token');
      errorMessage.value = '🔐 Token has expired. Please log in again.';
      setTimeout(() => router.push('/login'), 2000);
    } else {
      errorMessage.value = `⚠️ Unable to load Poll list: ${error.message}. Please log in again.`;
    }
  } finally {
    isLoading.value = false;
  }
});
</script>