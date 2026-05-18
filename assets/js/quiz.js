/* ===== QUIZ.JS: Universal quiz engine ===== */
(function () {
  'use strict';

  function initQuiz(container) {
    const chapterId = container.dataset.chapter || '00';
    const questions = container.querySelectorAll('.quiz-question');
    let answered = 0;
    let correct = 0;

    questions.forEach((qEl, qi) => {
      const options = qEl.querySelectorAll('.quiz-option');
      const result = qEl.querySelector('.quiz-result');
      const correctIndex = parseInt(qEl.dataset.correct, 10);

      options.forEach((opt, oi) => {
        opt.addEventListener('click', () => {
          // Already answered this question?
          if (qEl.dataset.answered) return;
          qEl.dataset.answered = '1';
          answered++;

          options.forEach(o => o.classList.add('answered'));

          if (oi === correctIndex) {
            opt.classList.add('correct');
            correct++;
            if (result) {
              result.textContent = '✓ 正确！' + (qEl.dataset.explain || '');
              result.className = 'quiz-result show correct-msg';
            }
          } else {
            opt.classList.add('wrong');
            options[correctIndex]?.classList.add('correct');
            if (result) {
              result.textContent = '✗ 再想想：' + (qEl.dataset.explain || '');
              result.className = 'quiz-result show wrong-msg';
            }
          }

          // Show score when all answered
          if (answered === questions.length) {
            const scoreEl = container.querySelector('.quiz-score');
            if (scoreEl) {
              const pct = Math.round((correct / questions.length) * 100);
              scoreEl.innerHTML = `
                本章得分：<strong>${correct} / ${questions.length}</strong>
                &nbsp;（${pct}%）
                ${pct === 100 ? ' 🎉 完美！' : pct >= 60 ? ' 加油！' : ' 继续复习~'}
              `;
              scoreEl.classList.add('show');
            }
            // Persist score
            if (window.usstock?.saveQuizScore) {
              window.usstock.saveQuizScore(chapterId, correct, questions.length);
            }
          }
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.quiz-section[data-chapter]').forEach(initQuiz);
  });
})();
