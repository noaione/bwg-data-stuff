<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { hostUrl, autoCheck, settingsOpen } from '../shared/settings';

// hostUrl/autoCheck/settingsOpen are plain (non-Vue) Store instances shared
// with the vanilla-TS geoblock injector (see shared/geoblock.ts) — bridge
// them into local refs via subscribe() so the template stays reactive.
const isOpen = ref(settingsOpen.value);
const draftHostUrl = ref(hostUrl.value);
const draftAutoCheck = ref(autoCheck.value);

let unsubscribe: (() => void) | undefined;

onMounted(() => {
  unsubscribe = settingsOpen.subscribe((open) => {
    isOpen.value = open;
    if (open) {
      draftHostUrl.value = hostUrl.value;
      draftAutoCheck.value = autoCheck.value;
    }
  });
});

onBeforeUnmount(() => {
  unsubscribe?.();
});

function save() {
  hostUrl.value = draftHostUrl.value.trim();
  autoCheck.value = draftAutoCheck.value;
  settingsOpen.value = false;
}

function cancel() {
  settingsOpen.value = false;
}
</script>

<template>
  <div v-if="isOpen" class="bwgstuff-overlay" @click.self="cancel">
    <div class="bwgstuff-modal">
      <h2>BWG Data Settings</h2>

      <label class="bwgstuff-field">
        <span>Host URL</span>
        <input v-model="draftHostUrl" type="text" placeholder="https://your-bwg-data-stuff-host" />
      </label>

      <label class="bwgstuff-checkbox">
        <input v-model="draftAutoCheck" type="checkbox" />
        <span>Enable auto geo-block check</span>
      </label>

      <div class="bwgstuff-actions">
        <button type="button" class="bwgstuff-btn bwgstuff-btn--ghost" @click="cancel">Cancel</button>
        <button type="button" class="bwgstuff-btn" @click="save">Save</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bwgstuff-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  font-family: system-ui, sans-serif;
}

.bwgstuff-modal {
  background: #fff;
  color: #1a1a1a;
  border-radius: 12px;
  padding: 1.5rem;
  width: min(420px, calc(100vw - 32px));
  display: grid;
  gap: 1rem;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
}

.bwgstuff-modal h2 {
  margin: 0;
  font-size: 1.1rem;
}

.bwgstuff-field,
.bwgstuff-checkbox {
  display: grid;
  gap: 0.35rem;
  font-size: 0.9rem;
}

.bwgstuff-checkbox {
  grid-auto-flow: column;
  justify-content: start;
  align-items: center;
  gap: 0.5rem;
}

.bwgstuff-field input[type='text'] {
  padding: 0.5rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font: inherit;
}

.bwgstuff-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.bwgstuff-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: #2563eb;
  color: #fff;
  font: inherit;
  cursor: pointer;
}

.bwgstuff-btn--ghost {
  background: transparent;
  color: #1a1a1a;
  border: 1px solid #ccc;
}
</style>
