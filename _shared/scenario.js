/* =========================================================================
   SCENARIO.JS — Comportement du scénario interactif (étape 4)
   Sélectionne un choix → affiche le feedback associé.
   Compatible avec markStepDone() exposé par chaque module.
   ========================================================================= */
(function() {
  'use strict';

  function init() {
    document.querySelectorAll('[data-scenario]').forEach(function(scenario) {
      if (scenario.dataset.bound === '1') return;
      scenario.dataset.bound = '1';

      var choices = scenario.querySelectorAll('.scenario-choice');
      var feedback = scenario.querySelector('.scenario-feedback');

      choices.forEach(function(choice) {
        choice.addEventListener('click', function() {
          choices.forEach(function(c) {
            c.classList.remove('correct', 'incorrect');
          });

          var isCorrect = choice.dataset.correct === 'true';
          choice.classList.add(isCorrect ? 'correct' : 'incorrect');

          if (feedback) {
            feedback.innerHTML = choice.dataset.feedback || '';
            feedback.className = 'scenario-feedback visible ' + (isCorrect ? 'correct' : 'incorrect');
          }

          if (isCorrect && typeof window.markStepDone === 'function') {
            try { window.markStepDone(); } catch (e) {}
          }
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
