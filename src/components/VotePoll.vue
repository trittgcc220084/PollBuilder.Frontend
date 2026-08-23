<template>
  <div class="page vote-page">
    <div class="container" style="max-width: 560px; padding: 0 20px;">
      <div v-if="loading" class="state-box">Đang tải...</div>

      <div v-else-if="error" class="alert alert-error">
        <span class="alert-icon">!</span>
        <span>{{ error }}</span>
      </div>

      <div v-else-if="poll" class="card vote-card fade-in">
        <div class="eyebrow">Poll Builder</div>
        <h2 class="vote-question">{{ poll.question }}</h2>

        <!-- Chuyển status về chữ thường để so sánh chính xác -->
        <div v-if="poll.status?.toLowerCase() === 'closed'" class="alert alert-error poll-closed-banner">
          <span class="alert-icon">!</span>
          <span>Poll đã đóng, không thể vote.</span>
        </div>

        <div v-else>
          <div class="vote-options">
            <label
              v-for="opt in poll.options"
              :key="opt.index"
              :class="['vote-option', { 'is-selected': selected === opt.index }]"
            >
              <input type="radio" :value="opt.index" v-model="selected" />
              <span class="vote-option-text">{{ opt.text }}</span>
            </label>
          </div>

          <button :disabled="selected === null || voting" @click="submitVote" class="btn btn-primary btn-block">
            <span v-if="voting" class="btn-loader"></span>
            {{ voting ? 'Đang gửi...' : 'Gửi vote' }}
          </button>
        </div>

        <div v-if="voted" class="alert alert-success" style="margin-top:16px;">
          <span class="alert-icon">✓</span>
          <span>Bạn đã vote thành công!</span>
        </div>
        <div v-if="voteError" class="alert alert-error" style="margin-top:16px;">
          <span class="alert-icon">!</span>
          <span>{{ voteError }}</span>
        </div>

        <router-link :to="`/poll/${code}/results`" class="realtime-link">
          Xem kết quả realtime →
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { pollApi } from '../api/pollApi'

const route = useRoute()
const code = route.params.code

const poll = ref(null)
const loading = ref(true)
const error = ref('')
const selected = ref(null)
const voting = ref(false)
const voted = ref(false)
const voteError = ref('')

onMounted(async () => {
  console.log('VOTE POLL MOUNTED')
  try {
    poll.value = await pollApi.get(code)
  } catch (e) {
    error.value = e.message || 'Không thể tải thông tin bình chọn'
  } finally {
    loading.value = false
  }
})

async function submitVote() {
  if (selected.value === null) return

  voting.value = true
  voteError.value = ''
  try {
    await pollApi.vote(code, selected.value)
    voted.value = true
  } catch (e) {
    voteError.value = e.message || 'Lỗi khi gửi bình chọn'
  } finally {
    voting.value = false
  }
}
</script>