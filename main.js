const { createApp, nextTick, onMounted, onUnmounted, reactive, computed, ref } = Vue;

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

fetchJson('/api/exercises')
  .then(catalogData => {
    if (!Array.isArray(catalogData.categories) || catalogData.categories.length === 0) {
      throw new Error('The exercise catalog is empty.');
    }

    createApp({
      setup() {
        const categories = catalogData.categories;
        const copyrightYear = new Date().getFullYear();
        const exercise = reactive({});
        const maskOrder = reactive([]);
        const answers = reactive({});
        const status = reactive({});
        const inputRefs = {};
        const page = ref('categories');
        const selectedCategoryId = ref('');
        const selectedExerciseId = ref('');
        const loading = ref(false);
        const loadError = ref('');
        const catalogError = ref('');
        const selectedCategory = computed(() => categories.find(category => category.id === selectedCategoryId.value));
        const exerciseCatalog = computed(() => selectedCategory.value?.exercises || []);
        const selectedCategoryTitle = computed(() => selectedCategory.value?.title || '');
        const selectedExerciseTitle = computed(() => exerciseCatalog.value.find(entry => entry.id === selectedExerciseId.value)?.title || '');
        const selectedCategoryPath = computed(() => selectedCategory.value ? `/${encodeURIComponent(selectedCategory.value.id)}` : '/');
        let activeExerciseId = '';
        let loadSequence = 0;

        const renderedParagraphs = computed(() => (exercise.paragraphs || []).map(paragraph => {
          const segments = [];
          const maskPattern = /{{(mask_\d+|red:([^}]+))}}/g;
          let cursor = 0;
          let match;

          while ((match = maskPattern.exec(paragraph)) !== null) {
            if (match.index > cursor) {
              segments.push({ type: 'text', value: paragraph.slice(cursor, match.index) });
            }
            if (match[1].startsWith('red:')) {
              segments.push({ type: 'red', value: match[2] });
            } else if (exercise.masks[match[1]]) {
              segments.push({ type: 'mask', mask: match[1] });
            } else {
              segments.push({ type: 'text', value: match[0] });
            }
            cursor = match.index + match[0].length;
          }

          if (cursor < paragraph.length) {
            segments.push({ type: 'text', value: paragraph.slice(cursor) });
          }
          return segments;
        }));

        const correctCount = computed(() => maskOrder.filter(mask => status[mask] === 'correct').length);
        const correctPercentage = computed(() => maskOrder.length ? Math.round((correctCount.value / maskOrder.length) * 100) : 0);
        const award = computed(() => {
          if (correctPercentage.value >= 100) return { emoji: '🏆', label: '金色獎盃', silver: false };
          if (correctPercentage.value >= 80) return { emoji: '🏆', label: '銀色獎盃', silver: true };
          if (correctPercentage.value >= 60) return { emoji: '🥉', label: '銅牌', silver: false };
          return null;
        });

        function setInputRef(element, mask) {
          if (element) inputRefs[mask] = element;
          else delete inputRefs[mask];
        }

        function focusMask(mask) {
          if (mask && inputRefs[mask]) inputRefs[mask].focus();
        }

        function routeForExercise(categoryId, entry) {
          const sequence = entry.file.match(/-(\d+)\.json$/)?.[1];
          return sequence ? `/${encodeURIComponent(categoryId)}/${sequence}` : `/${encodeURIComponent(categoryId)}`;
        }

        async function loadExercise(id, updateHistory = true) {
          const entry = exerciseCatalog.value.find(item => item.id === id);
          if (!entry) return;

          const request = ++loadSequence;
          loading.value = true;
          loadError.value = '';

          try {
            const exercisePath = [selectedCategoryId.value, entry.file]
              .map(part => encodeURIComponent(part))
              .join('/');
            const nextExercise = await fetchJson(`/data/${exercisePath}`);
            if (request !== loadSequence) return;

            for (const key of Object.keys(exercise)) delete exercise[key];
            Object.assign(exercise, nextExercise);
            maskOrder.splice(0, maskOrder.length, ...Object.keys(exercise.masks));
            for (const mask of Object.keys(answers)) delete answers[mask];
            for (const mask of Object.keys(status)) delete status[mask];
            for (const mask of Object.keys(inputRefs)) delete inputRefs[mask];
            for (const mask of maskOrder) {
              answers[mask] = '';
              status[mask] = null;
            }

            activeExerciseId = id;
            selectedExerciseId.value = id;
            page.value = 'practice';
            if (updateHistory) {
              const nextPath = routeForExercise(selectedCategoryId.value, entry);
              if (window.location.pathname !== nextPath) window.history.pushState(null, '', nextPath);
            }
            await nextTick();
            focusMask(maskOrder[0]);
          } catch {
            if (request !== loadSequence) return;
            selectedExerciseId.value = activeExerciseId;
            loadError.value = `無法載入「${entry.title}」，請確認對應的 JSON 檔案存在且格式正確。`;
          } finally {
            if (request === loadSequence) loading.value = false;
          }
        }

        function selectCategory(category, updateHistory = true) {
          ++loadSequence;
          loading.value = false;
          selectedCategoryId.value = category.id;
          selectedExerciseId.value = '';
          page.value = 'exercises';
          loadError.value = '';
          activeExerciseId = '';
          if (updateHistory) {
            const nextPath = `/${encodeURIComponent(category.id)}`;
            if (window.location.pathname !== nextPath) window.history.pushState(null, '', nextPath);
          }
        }

        function backToCategories() {
          if (window.location.pathname !== '/') window.history.pushState(null, '', '/');
          applyRoute(window.location.pathname);
        }

        async function applyRoute(pathname) {
          const parts = pathname.split('/').filter(Boolean).map(part => {
            try {
              return decodeURIComponent(part);
            } catch {
              return '';
            }
          });

          if (parts.length === 0) {
            ++loadSequence;
            loading.value = false;
            page.value = 'categories';
            selectedCategoryId.value = '';
            selectedExerciseId.value = '';
            activeExerciseId = '';
            loadError.value = '';
            return;
          }

          const category = categories.find(item => item.id === parts[0]);
          if (!category) {
            window.history.replaceState(null, '', '/');
            await applyRoute('/');
            return;
          }

          selectCategory(category, false);
          if (parts.length === 1) return;

          const entry = category.exercises.find(item => item.file.match(/-(\d+)\.json$/)?.[1] === parts[1]);
          if (parts.length !== 2 || !entry) {
            window.history.replaceState(null, '', `/${encodeURIComponent(category.id)}`);
            return;
          }

          selectedExerciseId.value = entry.id;
          await loadExercise(entry.id, false);
        }

        function navigateToExercise(id) {
          if (id === activeExerciseId && page.value === 'practice') return;
          return loadExercise(id, true);
        }

        function navigateToCategory(id) {
          const category = categories.find(item => item.id === id);
          if (!category) return;

          const nextPath = `/${encodeURIComponent(category.id)}`;
          if (window.location.pathname !== nextPath) window.history.pushState(null, '', nextPath);
          applyRoute(nextPath);
        }

        function handlePopState() {
          applyRoute(window.location.pathname);
        }

        function submitAnswer(mask) {
          const maskData = exercise.masks[mask];
          const variants = maskData.acceptable_variants || maskData.variants || [];
          const acceptedAnswers = [maskData.target, ...variants];
          const answer = answers[mask].trim().toLocaleLowerCase();
          status[mask] = acceptedAnswers.some(value => value.trim().toLocaleLowerCase() === answer) ? 'correct' : 'wrong';
          const nextMask = maskOrder[maskOrder.indexOf(mask) + 1];
          if (nextMask) nextTick(() => focusMask(nextMask));
        }

        function resetPractice() {
          for (const mask of maskOrder) {
            answers[mask] = '';
            status[mask] = null;
          }
          nextTick(() => focusMask(maskOrder[0]));
        }

        function inputWidth(mask) {
          const { target, hint } = exercise.masks[mask];
          const characters = Math.min(32, Math.max(16, target.length, hint.length) + 2);
          return { width: `${characters}ch` };
        }

        function inputClasses(mask) {
          if (status[mask] === 'correct') return 'border-emerald-500 text-emerald-300 focus:border-emerald-400 focus:ring-emerald-400/20';
          if (status[mask] === 'wrong') return 'border-rose-500 text-rose-300 focus:border-rose-400 focus:ring-rose-400/20';
          return 'border-slate-700 text-slate-100 focus:border-cyan-400 focus:ring-cyan-400/20';
        }

        function maskPosition(mask) {
          return maskOrder.indexOf(mask) + 1;
        }

        onMounted(() => {
          window.addEventListener('popstate', handlePopState);
          applyRoute(window.location.pathname);
          nextTick(() => focusMask(maskOrder[0]));
        });

        onUnmounted(() => window.removeEventListener('popstate', handlePopState));

        return {
          categories,
          copyrightYear,
          page,
          selectedCategoryTitle,
          selectedCategoryPath,
          selectedCategoryId,
          exerciseCatalog,
          selectedExerciseId,
          selectedExerciseTitle,
          loading,
          loadError,
          catalogError,
          exercise,
          maskOrder,
          answers,
          status,
          renderedParagraphs,
          correctCount,
          correctPercentage,
          award,
          setInputRef,
          loadExercise,
          navigateToExercise,
          navigateToCategory,
          selectCategory,
          backToCategories,
          submitAnswer,
          resetPractice,
          inputWidth,
          inputClasses,
          maskPosition
        };
      }
    }).mount('#app');
  })
  .catch(() => {
    const appRoot = document.querySelector('#app');
    appRoot.removeAttribute('v-cloak');
    appRoot.innerHTML = '<main class="mx-auto flex min-h-screen max-w-3xl items-center px-6"><p class="zh-tw rounded-lg border border-rose-500/40 bg-rose-500/10 p-5 text-rose-200">無法載入練習分類。請從專案資料夾執行 npm run dev 後再開啟本頁。</p></main>';
  });
