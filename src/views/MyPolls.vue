<template>
  <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
    <h2>Lịch sử Poll của tôi</h2>

    <div v-if="isLoading" style="text-align: center; padding: 20px;">
      ⏳ Đang tải dữ liệu...
    </div>

    <div v-else-if="errorMessage" style="color: red; padding: 20px; background: #ffe0e0; border-radius: 8px;">
      ❌ {{ errorMessage }}
    </div>

    <div v-else-if="polls.length > 0">
      <PollCard 
        v-for="poll in polls" 
        :key="poll.id || poll._id || poll.code" 
        :poll="poll" 
      />
    </div>

    <div v-else style="padding: 20px; text-align: center; color: #666;">
      📝 Bạn chưa tạo Poll nào cả.
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
    errorMessage.value = 'Bạn chưa đăng nhập. Vui lòng đăng nhập để xem danh sách.';
    isLoading.value = false;
    // Redirect to login sau 2 giây
    setTimeout(() => router.push('/login'), 2000);
    return;
  }

  try {
    // 2. Gọi API qua pollApi.js (đã tự động xử lý token)
    console.log('📡 Gọi API: getMyPolls()');
    const data = await pollApi.getMyPolls();
    
    console.log('✅ Dữ liệu trả về:', data);
    polls.value = Array.isArray(data) ? data : (data.data || []);
    
    if (polls.value.length === 0) {
      console.log('ℹ️ Không có poll nào');
    }
  } catch (error) {
    console.error('❌ Lỗi lấy MyPolls:', error);
    
    // Kiểm tra nếu là lỗi 401 - Token hết hạn
    if (error.message.includes('401')) {
      localStorage.removeItem('token');
      errorMessage.value = '🔐 Token hết hạn. Vui lòng đăng nhập lại.';
      setTimeout(() => router.push('/login'), 2000);
    } else {
      errorMessage.value = `⚠️ Không thể tải danh sách Poll: ${error.message}. Vui lòng đăng nhập lại.`;
    }
  } finally {
    isLoading.value = false;
  }
});
</script>

Please confirm you want Copilot to make this change in the trittgcc220084/pollbuilder-frontend repository on the default branch.
