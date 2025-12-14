// ===== 個別問題ページのスクリプト =====

let currentQuestion = null;
let allQuestions = [];
let selectedChoice = null;
let isAnswered = false;

document.addEventListener('DOMContentLoaded', async () => {
    await loadQuestions();
    const questionId = getQuestionIdFromUrl();
    if (questionId) {
        await loadQuestion(questionId);
        setupEventListeners();
    } else {
        notificationManager.error('問題IDが指定されていません');
        setTimeout(() => {
            window.location.href = 'questions.html';
        }, 2000);
    }
});

// URLから問題IDを取得
function getQuestionIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// 全問題データを読み込む
async function loadQuestions() {
    try {
        const response = await fetch('data/questions.json');
        allQuestions = await response.json();
    } catch (error) {
        console.error('問題データの読み込みエラー:', error);
        notificationManager.error('問題データの読み込みに失敗しました');
    }
}

// 問題を読み込んで表示
async function loadQuestion(questionId) {
    currentQuestion = allQuestions.find(q => q.id === questionId);
    
    if (!currentQuestion) {
        notificationManager.error('問題が見つかりませんでした');
        setTimeout(() => {
            window.location.href = 'questions.html';
        }, 2000);
        return;
    }

    displayQuestion();
    updateProgress();
    
    // 既に回答済みかチェック
    const answer = dataManager.getAnswerStatus(questionId);
    if (answer) {
        isAnswered = true;
        selectedChoice = answer.userAnswer;
        showExplanation(selectedChoice, currentQuestion.correctAnswer);
    }
}

// 問題を表示
function displayQuestion() {
    const q = currentQuestion;
    
    // ヘッダー情報
    document.getElementById('questionTitle').textContent = `問題 ${q.number}`;
    document.getElementById('yearBadge').textContent = utils.formatYear(q.year);
    document.getElementById('categoryBadge').textContent = utils.formatCategory(q.category);
    document.getElementById('difficultyBadge').textContent = utils.formatDifficulty(q.difficulty);
    
    // 問題番号
    const currentIndex = allQuestions.findIndex(item => item.id === q.id);
    document.getElementById('questionNumber').textContent = 
        `問題 ${currentIndex + 1} / ${allQuestions.length}`;
    
    // 問題タイトルと本文
    document.getElementById('questionTitleText').innerHTML = q.title;
    document.getElementById('questionText').innerHTML = q.text;
    
    // 問題図
    const questionImage = document.getElementById('questionImage');
    if (q.image && q.image.trim()) {
        questionImage.innerHTML = q.image;
        questionImage.style.display = 'block';
    } else {
        questionImage.style.display = 'none';
    }
    
    // 選択肢を表示
    displayChoices();
}

// 選択肢を表示
function displayChoices() {
    const container = document.getElementById('choicesContainer');
    container.innerHTML = '';
    
    currentQuestion.choices.forEach((choice, index) => {
        const choiceNum = index + 1;
        const choiceItem = document.createElement('div');
        choiceItem.className = 'choice-item';
        choiceItem.dataset.choice = choiceNum;
        
        choiceItem.innerHTML = `
            <label class="choice-label">
                <span class="choice-number">${choiceNum}.</span>
                <span class="choice-text">${choice}</span>
            </label>
        `;
        
        // 回答済みの場合は選択状態を復元
        if (selectedChoice === choiceNum) {
            choiceItem.classList.add('selected');
        }
        
        // 未回答の場合のみクリック可能
        if (!isAnswered) {
            choiceItem.addEventListener('click', () => selectChoice(choiceNum));
        }
        
        container.appendChild(choiceItem);
    });
}

// 選択肢を選択
function selectChoice(choiceNum) {
    if (isAnswered) return;
    
    selectedChoice = choiceNum;
    
    // 全ての選択肢からselectedクラスを削除
    document.querySelectorAll('.choice-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // 選択した選択肢にselectedクラスを追加
    const choiceItem = document.querySelector(`.choice-item[data-choice="${choiceNum}"]`);
    if (choiceItem) {
        choiceItem.classList.add('selected');
    }
    
    // 回答ボタンを有効化
    document.getElementById('submitAnswer').disabled = false;
}

// イベントリスナーをセットアップ
function setupEventListeners() {
    const submitBtn = document.getElementById('submitAnswer');
    const prevBtn = document.getElementById('prevQuestion');
    const nextBtn = document.getElementById('nextQuestion');
    
    if (submitBtn) {
        submitBtn.addEventListener('click', submitAnswer);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', goToPrevQuestion);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', goToNextQuestion);
    }
}

// 回答を送信
function submitAnswer() {
    if (!selectedChoice || isAnswered) return;
    
    const correctAnswer = currentQuestion.correctAnswer;
    const isCorrect = selectedChoice === correctAnswer;
    
    // 回答を保存
    dataManager.saveAnswer(currentQuestion.id, selectedChoice, isCorrect);
    
    isAnswered = true;
    
    // 解説を表示
    showExplanation(selectedChoice, correctAnswer);
    
    // 通知を表示
    if (isCorrect) {
        notificationManager.success('正解です！素晴らしい！', 3000);
    } else {
        notificationManager.error('不正解です。解説を確認しましょう。', 3000);
    }
    
    // 回答ボタンを非表示
    document.getElementById('submitButtonContainer').style.display = 'none';
}

// 解説を表示
function showExplanation(userAnswer, correctAnswer) {
    const isCorrect = userAnswer === correctAnswer;
    
    // 選択肢に正誤を表示
    document.querySelectorAll('.choice-item').forEach((item, index) => {
        const choiceNum = index + 1;
        item.style.pointerEvents = 'none';
        
        if (choiceNum === correctAnswer) {
            item.classList.add('correct');
        } else if (choiceNum === userAnswer) {
            item.classList.add('incorrect');
        }
    });
    
    // 結果バナー
    const resultBanner = document.getElementById('resultBanner');
    const resultIcon = document.getElementById('resultIcon');
    const resultText = document.getElementById('resultText');
    
    if (isCorrect) {
        resultBanner.classList.add('correct');
        resultIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        resultText.textContent = '正解です！';
    } else {
        resultBanner.classList.add('incorrect');
        resultIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
        resultText.textContent = '不正解です';
    }
    
    // メイン解説
    document.getElementById('mainExplanation').innerHTML = currentQuestion.explanation.main;
    
    // 各選択肢の解説
    const choicesExplanation = document.getElementById('choicesExplanation');
    choicesExplanation.innerHTML = '';
    
    currentQuestion.explanation.choices.forEach((exp, index) => {
        const choiceNum = index + 1;
        const expItem = document.createElement('div');
        expItem.className = 'choice-explanation-item';
        if (choiceNum === correctAnswer) {
            expItem.classList.add('correct');
        } else {
            expItem.classList.add('incorrect');
        }
        
        expItem.innerHTML = `
            <div style="display: flex; gap: 10px;">
                <strong>${choiceNum}.</strong>
                <div class="choice-explanation-text">${exp}</div>
            </div>
        `;
        
        choicesExplanation.appendChild(expItem);
    });
    
    // 参考図
    if (currentQuestion.referenceImages && currentQuestion.referenceImages.length > 0) {
        const refImagesArea = document.getElementById('referenceImagesArea');
        const refImages = document.getElementById('referenceImages');
        refImagesArea.style.display = 'block';
        refImages.innerHTML = '';
        
        currentQuestion.referenceImages.forEach(img => {
            const imgDiv = document.createElement('div');
            imgDiv.style.marginBottom = '15px';
            imgDiv.innerHTML = `
                ${img.content}
                <p style="text-align: center; margin-top: 10px; color: var(--text-secondary); font-size: 0.9rem;">
                    ${img.caption}
                </p>
            `;
            refImages.appendChild(imgDiv);
        });
    }
    
    // 法令参照
    if (currentQuestion.lawReferences && currentQuestion.lawReferences.length > 0) {
        const lawRefArea = document.getElementById('lawReferencesArea');
        const lawRefs = document.getElementById('lawReferences');
        lawRefArea.style.display = 'block';
        lawRefs.innerHTML = '';
        
        currentQuestion.lawReferences.forEach(law => {
            const lawDiv = document.createElement('div');
            lawDiv.style.marginBottom = '10px';
            lawDiv.style.padding = '15px';
            lawDiv.style.background = 'var(--bg-color)';
            lawDiv.style.borderRadius = 'var(--radius-md)';
            lawDiv.innerHTML = `
                <strong>${law.name}</strong><br>
                <span class="law-content" style="color: var(--text-secondary); font-size: 0.95rem;">${law.content}</span>
            `;
            lawRefs.appendChild(lawDiv);
        });
    }
    
    // 学習のコツ
    if (currentQuestion.tip) {
        const tipArea = document.getElementById('tipArea');
        const tipContent = document.getElementById('tipContent');
        tipArea.style.display = 'block';
        tipContent.textContent = currentQuestion.tip;
    }
    
    // 解説エリアを表示
    const explanationArea = document.getElementById('explanationArea');
    explanationArea.style.display = 'block';
    
    // スムーズにスクロール
    setTimeout(() => {
        explanationArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 300);
}

// 前の問題へ
function goToPrevQuestion() {
    const currentIndex = allQuestions.findIndex(q => q.id === currentQuestion.id);
    if (currentIndex > 0) {
        const prevQuestion = allQuestions[currentIndex - 1];
        window.location.href = `question.html?id=${prevQuestion.id}`;
    } else {
        notificationManager.info('これが最初の問題です');
    }
}

// 次の問題へ
function goToNextQuestion() {
    const currentIndex = allQuestions.findIndex(q => q.id === currentQuestion.id);
    if (currentIndex < allQuestions.length - 1) {
        const nextQuestion = allQuestions[currentIndex + 1];
        window.location.href = `question.html?id=${nextQuestion.id}`;
    } else {
        notificationManager.success('全ての問題が終了しました！お疲れ様でした！', 4000);
        setTimeout(() => {
            window.location.href = 'stats.html';
        }, 2000);
    }
}

// 進捗を更新
function updateProgress() {
    const stats = dataManager.getStats();
    const percentage = utils.calculatePercentage(stats.totalAnswered, 250);
    
    document.getElementById('progressPercent').textContent = `${percentage}%`;
    document.getElementById('progressBar').style.width = `${percentage}%`;
}
