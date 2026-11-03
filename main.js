import { animateText } from './node_modules/rand-alph-animation/src/index.js';

const { createApp, nextTick, onMounted, onUnmounted, reactive, computed, ref } = Vue;
const appBaseUrl = new URL('.', import.meta.url);
const categoryOrder = [
  'MixedTenseFlow',
  'NegativeQuestions',
  'Conditionals',
  'ReportedSpeech',
  'MixedTensePassive',
  'RelativeClauses',
  'RelativePronouns'
];
const subcategoryOrder = {
  MixedTenseFlow: ['PastSimpleVsPresentPerfect', 'PastSimpleVsPastContinuous', 'PastPerfectAndSequence', 'FutureForms', 'Mix'],
  NegativeQuestions: ['BeDoHave', 'ModalVerbs', 'MeaningAndAnswers', 'NegativeQuestions'],
  Conditionals: ['ZeroConditional', 'FirstConditional', 'SecondConditional', 'ThirdConditional', 'FirstSecondThirdConditionals', 'MixedConditionals', 'UnlessOrAsLongAs', 'Forms'],
  ReportedSpeech: ['ReportedYesNoQuestions', 'ReportedWhQuestions', 'ReportedRequestsAndOrders', 'SayAndTell', 'TenseAndTimeChanges', 'MixedTenseReportedStatements'],
  MixedTensePassive: ['PassiveWithTwoObjects', 'PassiveInSubordinateClauses', 'ModalAndFuturePassive', 'ActiveVsPassive', 'PassiveWithMixedTenses'],
  RelativeClauses: ['GeneralRelativeClauses', 'WhereOrThat', 'DroppingTheRelativePronoun'],
  RelativePronouns: ['WhichOrThat', 'WhoOrWhom', 'RelativePronounOrInterrogative', 'CompoundRelativePronouns']
};

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

fetchJson(new URL('catalog.json', appBaseUrl))
  .then(catalogData => {
    if (!Array.isArray(catalogData.categories) || catalogData.categories.length === 0) {
      throw new Error('The exercise catalog is empty.');
    }

    createApp({
      setup() {
        const categories = catalogData.categories.map(category => ({
          ...category,
          exercises: Array.isArray(category.exercises) ? category.exercises : [],
          subcategories: Array.isArray(category.subcategories) ? category.subcategories : []
        }));
        const favoriteError = ref('');
        const favoriteCategoryIds = ref(readFavoriteCategoryIds());
        const completedError = ref('');
        const completed = ref(readCompletedSubcategoryIds());
        const copyrightYear = new Date().getFullYear();
        const categorySort = ref('custom');
        const sortedCategories = computed(() => [...categories].sort((left, right) => {
          if (categorySort.value === 'custom') {
            const leftIndex = categoryOrder.indexOf(left.id);
            const rightIndex = categoryOrder.indexOf(right.id);
            if (leftIndex !== -1 && rightIndex !== -1) return leftIndex - rightIndex;
            if (leftIndex !== -1) return -1;
            if (rightIndex !== -1) return 1;
            const difference = Date.parse(left.created_at) - Date.parse(right.created_at);
            return difference || left.title.localeCompare(right.title);
          }
          if (categorySort.value === 'name') return left.title.localeCompare(right.title);
          return Date.parse(left.created_at) - Date.parse(right.created_at);
        }));
        const sortedSubcategories = computed(() => {
          const order = subcategoryOrder[selectedCategoryId.value] || [];
          return [...(selectedCategory.value?.subcategories || [])].sort((left, right) => {
            const leftIndex = order.indexOf(left.id);
            const rightIndex = order.indexOf(right.id);
            if (leftIndex !== -1 && rightIndex !== -1) return leftIndex - rightIndex;
            if (leftIndex !== -1) return -1;
            if (rightIndex !== -1) return 1;
            return left.title.localeCompare(right.title);
          });
        });
        const exercise = reactive({});
        const maskOrder = reactive([]);
        const answers = reactive({});
        const status = reactive({});
        const inputRefs = {};
        const page = ref('categories');
        const selectedCategoryId = ref('');
        const selectedSubcategoryId = ref('');
        const selectedExerciseId = ref('');
        const selectedDifficulty = ref('');
        const extraInfoExpanded = ref(false);
        const loading = ref(false);
        const loadError = ref('');
        const catalogError = ref('');
        const elapsedTime = ref(0);
        const categoryTitleElement = ref(null);
        const practiceTitleElement = ref(null);
        const selectedCategory = computed(() => categories.find(category => category.id === selectedCategoryId.value));
        const selectedSubcategory = computed(() => selectedCategory.value?.subcategories?.find(subcategory => subcategory.id === selectedSubcategoryId.value));
        const exerciseCatalog = computed(() => selectedSubcategory.value?.exercises || selectedCategory.value?.exercises || []);
        const filteredExerciseCatalog = computed(() => selectedDifficulty.value
          ? exerciseCatalog.value.filter(entry => entry.difficulty === selectedDifficulty.value)
          : exerciseCatalog.value);
        const selectedCategoryTitle = computed(() => selectedCategory.value?.title || '');
        const selectedSubcategoryTitle = computed(() => selectedSubcategory.value?.title || '');
        const selectedExerciseTitle = computed(() => exerciseCatalog.value.find(entry => entry.id === selectedExerciseId.value)?.title || '');
        const selectedCategoryPath = computed(() => selectedCategory.value ? `#/${encodeURIComponent(selectedCategory.value.id)}` : '#');
        const selectedSubcategoryPath = computed(() => selectedCategory.value && selectedSubcategory.value
          ? `#/${encodeURIComponent(selectedCategory.value.id)}/${encodeURIComponent(selectedSubcategory.value.id)}`
          : selectedCategoryPath.value);
        let activeExerciseId = '';
        let loadSequence = 0;
        let timerStartedAt = 0;
        let timerInterval = null;
        let titleAnimation = null;

        function readFavoriteCategoryIds() {
          try {
            const stored = localStorage.getItem('blr07-favorites');
            if (stored !== null) {
              const ids = JSON.parse(stored);
              if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string')) {
                throw new TypeError('Favorite categories must be stored as an array of IDs.');
              }
              removeLegacyFavoriteCookie();
              return ids.filter(id => categories.some(category => category.id === id));
            }

            const cookiePrefix = 'blr07-favorites=';
            const cookie = document.cookie.split('; ').find(item => item.startsWith(cookiePrefix));
            if (!cookie) return [];
            const ids = JSON.parse(decodeURIComponent(cookie.slice(cookiePrefix.length)));
            if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string')) {
              throw new TypeError('Legacy favorite cookie must contain an array of category IDs.');
            }
            const validIds = ids.filter(id => categories.some(category => category.id === id));
            saveFavoriteCategoryIds(validIds);
            removeLegacyFavoriteCookie();
            return validIds;
          } catch (error) {
            console.error('Unable to read or migrate favorite categories in local storage.', error);
            favoriteError.value = '無法讀取收藏設定，請檢查瀏覽器的網站儲存設定。';
            return [];
          }
        }

        function removeLegacyFavoriteCookie() {
          const secure = window.location.protocol === 'https:' ? '; Secure' : '';
          document.cookie = `blr07-favorites=; Path=${appBaseUrl.pathname}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secure}`;
        }

        function saveFavoriteCategoryIds(ids) {
          const value = JSON.stringify(ids);
          localStorage.setItem('blr07-favorites', value);
          if (localStorage.getItem('blr07-favorites') !== value) {
            throw new Error('The browser did not save favorite categories.');
          }
        }

        function isFavorite(categoryId) {
          return favoriteCategoryIds.value.includes(categoryId);
        }

        function toggleFavorite(categoryId) {
          const nextIds = isFavorite(categoryId)
            ? favoriteCategoryIds.value.filter(id => id !== categoryId)
            : [...favoriteCategoryIds.value, categoryId];

          try {
            saveFavoriteCategoryIds(nextIds);
            favoriteCategoryIds.value = nextIds;
            favoriteError.value = '';
          } catch (error) {
            console.error('Unable to save favorite categories to local storage.', error);
            favoriteError.value = '無法儲存收藏，請檢查瀏覽器的網站儲存設定。';
          }
        }

        function subcategoryCompletionId(subcategoryId) {
          return `${selectedCategoryId.value}/${subcategoryId}`;
        }

        function readCompletedSubcategoryIds() {
          try {
            const stored = localStorage.getItem('blr07-completed');
            if (stored === null) return [];
            const ids = JSON.parse(stored);
            if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string')) {
              throw new TypeError('Completed units must be stored as an array of IDs.');
            }
            return ids.filter(id => categories.some(category =>
              category.subcategories.some(subcategory => `${category.id}/${subcategory.id}` === id)
            ));
          } catch (error) {
            console.error('Unable to read completed units from local storage.', error);
            completedError.value = '無法讀取單元完成紀錄，請檢查瀏覽器的網站儲存設定。';
            return [];
          }
        }

        function isCompleted(subcategoryId) {
          return completed.value.includes(subcategoryCompletionId(subcategoryId));
        }

        function toggleCompleted(subcategoryId) {
          const id = subcategoryCompletionId(subcategoryId);
          const nextCompleted = isCompleted(subcategoryId)
            ? completed.value.filter(item => item !== id)
            : [...completed.value, id];

          try {
            const value = JSON.stringify(nextCompleted);
            localStorage.setItem('blr07-completed', value);
            if (localStorage.getItem('blr07-completed') !== value) {
              throw new Error('The browser did not save completed units.');
            }
            completed.value = nextCompleted;
            completedError.value = '';
          } catch (error) {
            console.error('Unable to save completed units to local storage.', error);
            completedError.value = '無法儲存單元完成紀錄，請檢查瀏覽器的網站儲存設定。';
          }
        }

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
        const formattedElapsedTime = computed(() => {
          const totalMilliseconds = elapsedTime.value;
          const hours = Math.floor(totalMilliseconds / 3600000);
          const minutes = Math.floor((totalMilliseconds % 3600000) / 60000);
          const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
          const milliseconds = totalMilliseconds % 1000;
          return [hours, minutes, seconds].map(value => String(value).padStart(2, '0')).join(':')
            + `:${String(milliseconds).padStart(3, '0')}`;
        });
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

        function startPracticeTimer() {
          stopPracticeTimer();
          elapsedTime.value = 0;
          timerStartedAt = Date.now();
          timerInterval = window.setInterval(() => {
            elapsedTime.value = Date.now() - timerStartedAt;
          }, 10);
        }

        function stopPracticeTimer() {
          if (timerInterval !== null) {
            window.clearInterval(timerInterval);
            timerInterval = null;
          }
        }

        function stopTitleAnimation() {
          titleAnimation?.destroy();
          titleAnimation = null;
        }

        function animateTitle(element) {
          if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !element) return;
          stopTitleAnimation();
          titleAnimation = animateText(element, {
            groups: 3,
            stagger: 100,
            steps: 8,
            stepInterval: 100,
          });
        }

        function routeForExercise(categoryId, subcategoryId, entry) {
          const sequence = entry.file.match(/-(\d+)\.json$/)?.[1];
          const parts = [categoryId];
          if (subcategoryId) parts.push(subcategoryId);
          if (sequence) parts.push(sequence);
          return `#/${parts.map(encodeURIComponent).join('/')}`;
        }

        async function loadExercise(id, updateHistory = true) {
          const entry = exerciseCatalog.value.find(item => item.id === id);
          if (!entry) return;

          const request = ++loadSequence;
          loading.value = true;
          loadError.value = '';
          startPracticeTimer();

          try {
            const exercisePath = [selectedCategoryId.value, selectedSubcategoryId.value, entry.file]
              .filter(Boolean)
              .map(part => encodeURIComponent(part))
              .join('/');
            const nextExercise = await fetchJson(new URL(`data/${exercisePath}`, appBaseUrl));
            if (request !== loadSequence) return;

            for (const key of Object.keys(exercise)) delete exercise[key];
            Object.assign(exercise, nextExercise);
            extraInfoExpanded.value = false;
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
            stopTitleAnimation();
            page.value = 'practice';
            if (updateHistory) {
              const nextPath = routeForExercise(selectedCategoryId.value, selectedSubcategoryId.value, entry);
              if (window.location.hash !== nextPath) window.history.pushState(null, '', nextPath);
            }
            await nextTick();
            animateTitle(practiceTitleElement.value);
            focusMask(maskOrder[0]);
          } catch {
            if (request !== loadSequence) return;
            stopPracticeTimer();
            selectedExerciseId.value = activeExerciseId;
            loadError.value = `無法載入「${entry.title}」，請確認對應的 JSON 檔案存在且格式正確。`;
          } finally {
            if (request === loadSequence) loading.value = false;
          }
        }

        function selectCategory(category, updateHistory = true) {
          ++loadSequence;
          stopPracticeTimer();
          stopTitleAnimation();
          loading.value = false;
          selectedCategoryId.value = category.id;
          selectedSubcategoryId.value = '';
          selectedExerciseId.value = '';
          selectedDifficulty.value = '';
          const nextPage = category.subcategories.length ? 'subcategories' : 'exercises';
          page.value = nextPage;
          loadError.value = '';
          activeExerciseId = '';
          nextTick(() => {
            if (page.value === nextPage) animateTitle(categoryTitleElement.value);
          });
          if (updateHistory) {
            const nextPath = `#/${encodeURIComponent(category.id)}`;
            if (window.location.hash !== nextPath) window.history.pushState(null, '', nextPath);
          }
        }

        function selectSubcategory(subcategory, updateHistory = true) {
          const category = selectedCategory.value;
          if (!category || !category.subcategories.some(item => item.id === subcategory.id)) return;
          ++loadSequence;
          stopPracticeTimer();
          stopTitleAnimation();
          loading.value = false;
          selectedCategoryId.value = category.id;
          selectedSubcategoryId.value = subcategory.id;
          selectedExerciseId.value = '';
          selectedDifficulty.value = '';
          page.value = 'exercises';
          loadError.value = '';
          activeExerciseId = '';
          nextTick(() => {
            if (page.value === 'exercises' && selectedSubcategoryId.value === subcategory.id) animateTitle(categoryTitleElement.value);
          });
          if (updateHistory) {
            const nextPath = `#/${encodeURIComponent(category.id)}/${encodeURIComponent(subcategory.id)}`;
            if (window.location.hash !== nextPath) window.history.pushState(null, '', nextPath);
          }
        }

        function backToCategories() {
          if (window.location.hash) window.history.pushState(null, '', `${window.location.pathname}${window.location.search}`);
          applyRoute('/');
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
            stopPracticeTimer();
            stopTitleAnimation();
            loading.value = false;
            page.value = 'categories';
            selectedCategoryId.value = '';
            selectedSubcategoryId.value = '';
            selectedExerciseId.value = '';
            activeExerciseId = '';
            loadError.value = '';
            return;
          }

          const category = categories.find(item => item.id === parts[0]);
          if (!category) {
            window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
            await applyRoute('/');
            return;
          }

          selectCategory(category, false);
          if (parts.length === 1) return;

          if (category.subcategories.length) {
            if (/^\d+$/.test(parts[1])) {
              const match = category.subcategories
                .map(subcategory => ({
                  subcategory,
                  entry: subcategory.exercises.find(item => item.file.match(/-(\d+)\.json$/)?.[1] === parts[1])
                }))
                .find(item => item.entry);
              if (match && parts.length === 2) {
                selectSubcategory(match.subcategory, false);
                selectedExerciseId.value = match.entry.id;
                window.history.replaceState(null, '', routeForExercise(category.id, match.subcategory.id, match.entry));
                await loadExercise(match.entry.id, false);
                return;
              }
            }
            const subcategory = category.subcategories.find(item => item.id === parts[1]);
            if (!subcategory) {
              window.history.replaceState(null, '', `#/${encodeURIComponent(category.id)}`);
              return;
            }
            selectSubcategory(subcategory, false);
            if (parts.length === 2) return;
            const entry = subcategory.exercises.find(item => item.file.match(/-(\d+)\.json$/)?.[1] === parts[2]);
            if (parts.length !== 3 || !entry) {
              window.history.replaceState(null, '', `#/${encodeURIComponent(category.id)}/${encodeURIComponent(subcategory.id)}`);
              return;
            }
            selectedExerciseId.value = entry.id;
            await loadExercise(entry.id, false);
            return;
          }

          const entry = category.exercises.find(item => item.file.match(/-(\d+)\.json$/)?.[1] === parts[1]);
          if (parts.length !== 2 || !entry) {
            window.history.replaceState(null, '', `#/${encodeURIComponent(category.id)}`);
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

          selectCategory(category, true);
        }

        function navigateToSubcategory(id) {
          const category = selectedCategory.value;
          const subcategory = category?.subcategories.find(item => item.id === id);
          if (subcategory) selectSubcategory(subcategory, true);
        }

        function handlePopState() {
          applyRoute(window.location.hash ? window.location.hash.slice(1) : '/');
        }

        function normalizeAnswer(answer) {
          return answer.trim().toLocaleLowerCase().replace(/\.$/, '').trim();
        }

        function submitAnswer(mask) {
          const maskData = exercise.masks[mask];
          const variants = maskData.acceptable_variants || maskData.variants || [];
          const acceptedAnswers = [maskData.target, ...variants];
          const answer = normalizeAnswer(answers[mask]);
          status[mask] = acceptedAnswers.some(value => normalizeAnswer(value) === answer) ? 'correct' : 'wrong';
          const nextMask = maskOrder[maskOrder.indexOf(mask) + 1];
          if (nextMask) nextTick(() => focusMask(nextMask));
        }

        function resetPractice() {
          for (const mask of maskOrder) {
            answers[mask] = '';
            status[mask] = null;
          }
          startPracticeTimer();
          nextTick(() => focusMask(maskOrder[0]));
        }

        function inputWidth(mask) {
          const { target, hint } = exercise.masks[mask];
          const characters = Math.min(60, Math.max(16, target.length, hint.length) + 2);
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
          applyRoute(window.location.hash ? window.location.hash.slice(1) : '/');
          nextTick(() => focusMask(maskOrder[0]));
        });

        onUnmounted(() => {
          window.removeEventListener('popstate', handlePopState);
          stopPracticeTimer();
          stopTitleAnimation();
        });

        return {
          categories,
          categorySort,
          sortedCategories,
          sortedSubcategories,
          copyrightYear,
          page,
          selectedCategoryTitle,
          selectedSubcategoryTitle,
          categoryTitleElement,
          practiceTitleElement,
          selectedCategoryPath,
          selectedSubcategoryPath,
          selectedCategoryId,
          selectedSubcategoryId,
          exerciseCatalog,
          filteredExerciseCatalog,
          selectedExerciseId,
          selectedDifficulty,
          extraInfoExpanded,
          selectedExerciseTitle,
          loading,
          loadError,
          catalogError,
          favoriteError,
          isFavorite,
          toggleFavorite,
          completedError,
          isCompleted,
          toggleCompleted,
          exercise,
          maskOrder,
          answers,
          status,
          renderedParagraphs,
          correctCount,
          correctPercentage,
          formattedElapsedTime,
          award,
          setInputRef,
          loadExercise,
          navigateToExercise,
          navigateToCategory,
          selectCategory,
          selectSubcategory,
          navigateToSubcategory,
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
    appRoot.innerHTML = '<main class="mx-auto flex min-h-screen max-w-3xl items-center px-6"><p class="zh-tw rounded-lg border border-rose-500/40 bg-rose-500/10 p-5 text-rose-200">無法載入練習分類。若剛更新過練習資料夾，請重新啟動 npm run dev 後重新整理本頁。</p></main>';
  });
