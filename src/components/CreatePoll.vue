<template>
  <div class="page create-poll-page">
    <div class="container">
      <div class="create-poll-card card fade-in">

        <!-- Header -->
        <div class="create-poll-header">
          <div class="eyebrow">CREATE A NEW POLL</div>

          <h1 class="page-title">Poll Builder</h1>

          <p class="page-subtitle">
            Create a poll and share it with others in seconds.
          </p>
        </div>

        <!-- Question -->
        <div class="form-group">
          <label class="form-label">
            Question
          </label>

          <input
            v-model="question"
            placeholder="What is your favorite color?"
            class="input"
          />
        </div>

        <!-- Options -->
        <div class="form-group">
          <label class="form-label">
            Options
            <span class="form-hint">(2–6 options)</span>
          </label>

          <div class="options-list">
            <div
              v-for="(opt, i) in options"
              :key="i"
              class="option-row"
            >
              <div class="option-number">
                {{ i + 1 }}
              </div>

              <input
                v-model="options[i]"
                :placeholder="'Option ' + (i + 1)"
                class="input option-input"
              />

              <button
                v-if="options.length > 2"
                @click="options.splice(i,1)"
                class="remove-option-btn"
                title="Remove option"
              >
                ×
              </button>
            </div>
          </div>

          <button
            v-if="options.length < 6"
            @click="options.push('')"
            class="add-option-btn"
          >
            <span>+</span>
            Add Option
          </button>
        </div>

        <!-- Action -->
        <button
          @click="createPoll"
          :disabled="loading"
          class="btn btn-primary create-btn"
        >
          <span v-if="loading" class="btn-loader"></span>

          {{ loading ? 'Creating Poll...' : 'Create Poll' }}
        </button>

        <!-- Error -->
        <div v-if="error" class="error-message">
          <span class="error-icon">!</span>

          <span>{{ error }}</span>
        </div>

        <!-- Success -->
        <div
          v-if="created"
          class="success-card fade-in"
        >
          <div class="success-header">
            <div class="success-icon">
              ✓
            </div>

            <div>
              <h3>Poll Created Successfully!</h3>

              <p>
                Your poll is ready to be shared.
              </p>
            </div>
          </div>

          <div class="poll-info">

            <div class="poll-info-row">
              <span class="info-label">
                Poll Code
              </span>

              <strong class="poll-code-value">
                {{ created.code }}
              </strong>
            </div>

            <div class="poll-link-box">

              <span class="info-label">
                Voting Link
              </span>

              <router-link
                :to="'/poll/' + created.code"
                class="poll-link"
              >
                {{ origin }}/poll/{{ created.code }}
              </router-link>

            </div>

          </div>

          <router-link
            :to="'/poll/' + created.code"
            class="btn btn-primary vote-now-btn"
          >
            Vote Now
            <span>→</span>
          </router-link>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { pollApi } from '../api/pollApi' 

const question = ref('')
const options = ref(['', ''])
const loading = ref(false)
const error = ref('')
const created = ref(null)
const origin = window.location.origin

async function createPoll() {
  error.value = ''
  created.value = null
  loading.value = true

  try {
    const cleanOptions = options.value.map(o => o.trim()).filter(Boolean)

    if (!question.value.trim()) {
      throw new Error('Please enter a question')
    }
    if (cleanOptions.length < 2) {
      throw new Error('Please enter at least 2 options')
    }
    const uniqueOptions = new Set(cleanOptions.map(o => o.toLowerCase()))
    
    if (uniqueOptions.size !== cleanOptions.length) {
      throw new Error('Options must not be duplicated')
    }
    // Call API via ApiGateway (Port 5005)
    created.value = await pollApi.create(question.value.trim(), cleanOptions)
  } catch (e) {
    error.value = e.message || 'Error creating poll'
  } finally {
    loading.value = false
  }
}
</script>