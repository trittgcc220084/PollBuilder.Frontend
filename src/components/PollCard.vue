<template>
  <div class="card poll-card">
    <div class="poll-card-header">
      <h3 class="poll-card-question">{{ poll.question }}</h3>
      <span :class="['badge', poll.status === 'closed' ? 'badge-danger' : 'badge-success']">
        {{ poll.status === 'closed' ? 'Closed' : 'Open' }}
      </span>
    </div>

    <div class="poll-card-actions">
      <button @click="goToRealtime" class="btn btn-secondary btn-sm">
        📊 View Realtime
      </button>

      <button @click="copyLink" class="btn btn-secondary btn-sm">
        🔗 Copy Link
      </button>

      <button v-if="poll.status !== 'closed'" @click="closePoll" class="btn btn-danger btn-sm">
        🔒 Close Poll
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
  router.push(`/poll/${props.poll.code}/results`);
};

// 2. Copy Link Vote
const copyLink = () => {
  const url = `${window.location.origin}/poll/${props.poll.code}`;
  navigator.clipboard.writeText(url);
  alert('Link copied! Send it to friends to vote.');
};

// 3. Đóng Poll
const closePoll = async () => {
  if (!confirm('Are you sure you want to close this poll? Others will no longer be able to vote.')) return;

  try {
    await axios.patch(`https://pollbuildergateway.onrender.com/api/polls/${props.poll.code}/close`, {}, {
      headers: { Authorization: `Bearer ${token.value}` }
    });
    alert('Poll closed successfully!');
    window.location.reload();
  } catch (error) {
    alert('An error occurred while closing the poll.');
  }
};
</script>