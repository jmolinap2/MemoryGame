
document.addEventListener('DOMContentLoaded', () => {
    const questionText = document.querySelector('.question');
    const answersContainer = document.querySelector('.answers');
    const nextButton = document.getElementById('next-btn');

    let currentQuestionIndex = 0;

    function showQuestion() {
        const question = triviaQuestions[currentQuestionIndex];
        questionText.textContent = question.question;
        answersContainer.innerHTML = '';

        question.answers.forEach(answer => {
            const answerElement = document.createElement('button');
            answerElement.classList.add('answer');
            answerElement.textContent = answer;
            answerElement.addEventListener('click', () => handleAnswer(answer, question.correct));
            answersContainer.appendChild(answerElement);
        });
    }

    function handleAnswer(selectedAnswer, correctAnswer) {
        const buttons = answersContainer.querySelectorAll('.answer');
        buttons.forEach(button => {
            if (button.textContent === correctAnswer) {
                button.style.backgroundColor = 'var(--color-secondary)';
            } else if (button.textContent === selectedAnswer) {
                button.style.backgroundColor = 'var(--color-accent)';
            }
            button.disabled = true;
        });
        nextButton.style.display = 'block';
    }

    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex >= triviaQuestions.length) {
            currentQuestionIndex = 0; // Reinicia al final
        }
        showQuestion();
        nextButton.style.display = 'none';
    }

    nextButton.addEventListener('click', nextQuestion);

    // Cargar preguntas y empezar
    const script = document.createElement('script');
    script.src = 'games/trivia/questions.js';
    script.onload = () => {
        showQuestion();
        nextButton.style.display = 'none';
    };
    document.body.appendChild(script);
});
