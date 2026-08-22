<template>
  <div class="poll-card" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
    <h3>{{ poll.question }}</h3>
    <p>Trạng thái: <strong>{{ poll.isClosed ? '🔴 Đã đóng' : '🟢 Đang mở' }}</strong></p>
    
    <div style="display: flex; gap: 10px; margin-top: 15px;">
      <button @click="goToRealtime" style="background: #3b82f6; color: white; padding: 5px 10px; border: none; border-radius: 4px;">
        📊 Xem Realtime
      </button>
      
      <button @click="copyLink" style="background: #10b981; color: white; padding: 5px 10px; border: none; border-radius: 4px;">
        🔗 Copy Link
      </button>

      <button v-if="!poll.isClosed" @click="closePoll" style="background: #ef4444; color: white; padding: 5px 10px; border: none; border-radius: 4px;">
        🔒 Đóng Poll
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAuth } from '../composables/useAuth';

const props = defineProps(['poll']);
const router = useRouter();
const { token } = useAuth();

// 1. Xem Realtime
const goToRealtime = () => {
  router.push(`/${props.poll.code}/results`);
};

// 2. Copy Link Vote
const copyLink = () => {
  const url = `${window.location.origin}/${props.poll.code}`;
  navigator.clipboard.writeText(url);
  alert('Đã copy link! Hãy gửi cho bạn bè để vote.');
};

// 3. Đóng Poll
const closePoll = async () => {
  if (!confirm('Bạn có chắc chắn muốn đóng Poll này? Người khác sẽ không thể vote được nữa.')) return;
  
  try {
    // Lưu ý: Thay đổi URL Gateway của bạn nếu cần
    await axios.patch(`https://pollbuilder-gateway.onrender.com/api/polls/${props.poll.code}/close`, {}, {
      headers: { Authorization: `Bearer ${token.value}` }
    });
    alert('Đã đóng Poll thành công!');
    window.location.reload();
  } catch (error) {
    alert('Có lỗi xảy ra khi đóng poll.');
  }
};
</script>
