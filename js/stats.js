// ===== 統計ページのスクリプト =====

let allQuestions = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadQuestions();
    displayStats();
    setupEventListeners();
});

// 問題データを読み込む
async function loadQuestions() {
    try {
        const response = await fetch('data/questions.json');
        allQuestions = await response.json();
    } catch (error) {
        console.error('問題データの読み込みエラー:', error);
        notificationManager.error('問題データの読み込みに失敗しました');
    }
}

// 統計を表示
function displayStats() {
    const stats = dataManager.getStats();
    
    // 全体統計
    displayOverallStats(stats);
    
    // 年度別統計
    displayYearStats();
    
    // 分野別統計
    displayCategoryStats();
    
    // 重要度別統計
    displayDifficultyStats();
    
    // 苦手分野
    displayWeakAreas();
}

// 全体統計を表示
function displayOverallStats(stats) {
    document.getElementById('totalAnswered').textContent = stats.totalAnswered;
    document.getElementById('totalCorrect').textContent = stats.totalCorrect;
    document.getElementById('totalIncorrect').textContent = stats.totalIncorrect;
    document.getElementById('maxStreak').textContent = stats.maxStreak;
    document.getElementById('currentStreak').textContent = stats.currentStreak;
    
    // 正答率
    const accuracyText = `正答率: ${stats.accuracy}%`;
    document.getElementById('accuracyRate').textContent = accuracyText;
    
    // 不正解率
    const incorrectRate = stats.totalAnswered > 0 
        ? Math.round((stats.totalIncorrect / stats.totalAnswered) * 100)
        : 0;
    document.getElementById('incorrectRate').textContent = `${incorrectRate}%`;
}

// 年度別統計を表示
function displayYearStats() {
    const yearStats = dataManager.getYearStats(allQuestions);
    const container = document.getElementById('yearStats');
    container.innerHTML = '';
    
    const years = ['r06', 'r05', 'r04', 'r03', 'r02'];
    
    years.forEach(year => {
        const stat = yearStats[year];
        if (!stat) return;
        
        const accuracy = stat.answered > 0 
            ? Math.round((stat.correct / stat.answered) * 100) 
            : 0;
        
        const progressPercent = stat.total > 0
            ? Math.round((stat.answered / stat.total) * 100)
            : 0;
        
        const statItem = document.createElement('div');
        statItem.className = 'stat-item';
        statItem.style.cssText = `
            background: var(--bg-color);
            padding: 20px 25px;
            border-radius: var(--radius-md);
            margin-bottom: 15px;
            border-left: 4px solid var(--primary-color);
        `;
        
        statItem.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h4 style="font-size: 1.1rem; color: var(--text-primary);">${utils.formatYear(year)}</h4>
                <span style="font-size: 0.9rem; color: var(--text-secondary);">
                    ${stat.answered} / ${stat.total} 問解答済み
                </span>
            </div>
            <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 5px;">
                    <span>進捗: ${progressPercent}%</span>
                    <span>正答率: ${accuracy}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%;"></div>
                </div>
            </div>
            <div style="display: flex; gap: 20px; font-size: 0.9rem;">
                <span style="color: var(--success-color);">
                    <i class="fas fa-check-circle"></i> 正解: ${stat.correct}
                </span>
                <span style="color: var(--error-color);">
                    <i class="fas fa-times-circle"></i> 不正解: ${stat.answered - stat.correct}
                </span>
            </div>
        `;
        
        container.appendChild(statItem);
    });
}

// 分野別統計を表示
function displayCategoryStats() {
    const categoryStats = dataManager.getCategoryStats(allQuestions);
    const container = document.getElementById('categoryStats');
    container.innerHTML = '';
    
    const categories = Object.keys(categoryStats).sort();
    
    categories.forEach(category => {
        const stat = categoryStats[category];
        const accuracy = stat.answered > 0 
            ? Math.round((stat.correct / stat.answered) * 100) 
            : 0;
        
        const progressPercent = stat.total > 0
            ? Math.round((stat.answered / stat.total) * 100)
            : 0;
        
        // カテゴリアイコン
        const iconMap = {
            'earthwork': '🏗️',
            'concrete': '🧱',
            'planning': '📐',
            'law': '⚖️',
            'safety': '🛡️',
            'quality': '✅',
            'machinery': '🔧',
            'other': '📝'
        };
        
        const statItem = document.createElement('div');
        statItem.className = 'stat-item';
        statItem.style.cssText = `
            background: var(--bg-color);
            padding: 20px 25px;
            border-radius: var(--radius-md);
            margin-bottom: 15px;
            border-left: 4px solid var(--primary-light);
        `;
        
        statItem.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
                <span style="font-size: 1.5rem;">${iconMap[category] || '📚'}</span>
                <div style="flex: 1;">
                    <h4 style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 3px;">
                        ${utils.formatCategory(category)}
                    </h4>
                    <span style="font-size: 0.85rem; color: var(--text-secondary);">
                        ${stat.answered} / ${stat.total} 問解答済み
                    </span>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 1.8rem; font-weight: 700; color: ${accuracy >= 80 ? 'var(--success-color)' : accuracy >= 60 ? 'var(--warning-color)' : 'var(--error-color)'};">
                        ${accuracy}%
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">正答率</div>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill ${accuracy >= 80 ? 'accuracy-fill' : ''}" style="width: ${accuracy}%;"></div>
            </div>
        `;
        
        container.appendChild(statItem);
    });
}

// 重要度別統計を表示
function displayDifficultyStats() {
    const container = document.getElementById('difficultyStats');
    container.innerHTML = '';
    
    const difficulties = ['A', 'B', 'C'];
    const difficultyLabels = {
        'A': '頻出問題',
        'B': '標準問題',
        'C': '難問'
    };
    
    const difficultyColors = {
        'A': '#22c55e',
        'B': '#f59e0b',
        'C': '#ef4444'
    };
    
    difficulties.forEach(difficulty => {
        const questions = allQuestions.filter(q => q.difficulty === difficulty);
        const answers = dataManager.getAllAnswers();
        
        let answered = 0;
        let correct = 0;
        
        questions.forEach(q => {
            const answer = answers[q.id];
            if (answer) {
                answered++;
                if (answer.isCorrect) correct++;
            }
        });
        
        const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
        const progressPercent = questions.length > 0 ? Math.round((answered / questions.length) * 100) : 0;
        
        const statItem = document.createElement('div');
        statItem.className = 'stat-item';
        statItem.style.cssText = `
            background: var(--bg-color);
            padding: 20px 25px;
            border-radius: var(--radius-md);
            margin-bottom: 15px;
            border-left: 4px solid ${difficultyColors[difficulty]};
        `;
        
        statItem.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h4 style="font-size: 1.1rem; color: var(--text-primary);">
                    <span style="color: ${difficultyColors[difficulty]}; font-weight: 700;">${difficulty}</span>: ${difficultyLabels[difficulty]}
                </h4>
                <span style="font-size: 0.9rem; color: var(--text-secondary);">
                    ${answered} / ${questions.length} 問
                </span>
            </div>
            <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 5px;">
                    <span>解答済み: ${progressPercent}%</span>
                    <span>正答率: ${accuracy}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${accuracy}%; background: linear-gradient(90deg, ${difficultyColors[difficulty]}, ${difficultyColors[difficulty]}dd);"></div>
                </div>
            </div>
        `;
        
        container.appendChild(statItem);
    });
}

// 苦手分野を表示
function displayWeakAreas() {
    const container = document.getElementById('weakAreas');
    container.innerHTML = '';
    
    const answers = dataManager.getAllAnswers();
    const incorrectQuestions = allQuestions.filter(q => {
        const answer = answers[q.id];
        return answer && !answer.isCorrect;
    });
    
    if (incorrectQuestions.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="fas fa-trophy" style="font-size: 3rem; color: var(--success-color); margin-bottom: 15px;"></i>
                <p style="font-size: 1.1rem;">間違えた問題はありません！</p>
                <p style="margin-top: 10px;">素晴らしい成績です！</p>
            </div>
        `;
        return;
    }
    
    const listHtml = incorrectQuestions.slice(0, 10).map(q => `
        <a href="question.html?id=${q.id}" style="display: block; text-decoration: none; color: inherit; background: var(--bg-color); padding: 15px 20px; border-radius: var(--radius-md); margin-bottom: 10px; border-left: 3px solid var(--error-color); transition: all 0.2s;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-redo" style="color: var(--error-color);"></i>
                <div style="flex: 1;">
                    <strong>問題 ${q.number}</strong>: ${q.title.replace(/<[^>]*>/g, '')}
                </div>
                <span style="font-size: 0.85rem; color: var(--text-secondary);">${utils.formatCategory(q.category)}</span>
            </div>
        </a>
    `).join('');
    
    container.innerHTML = `
        <p style="color: var(--text-secondary); margin-bottom: 15px;">
            間違えた問題: ${incorrectQuestions.length}問
            ${incorrectQuestions.length > 10 ? '（上位10問を表示）' : ''}
        </p>
        ${listHtml}
    `;
}

// イベントリスナーをセットアップ
function setupEventListeners() {
    const reviewBtn = document.getElementById('reviewIncorrect');
    const resetBtn = document.getElementById('resetProgress');
    
    if (reviewBtn) {
        reviewBtn.addEventListener('click', () => {
            const answers = dataManager.getAllAnswers();
            const incorrectQuestions = allQuestions.filter(q => {
                const answer = answers[q.id];
                return answer && !answer.isCorrect;
            });
            
            if (incorrectQuestions.length > 0) {
                window.location.href = `question.html?id=${incorrectQuestions[0].id}`;
            } else {
                notificationManager.info('復習が必要な問題はありません');
            }
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            dataManager.resetProgress();
        });
    }
}

// ページ読み込み完了時の処理
window.addEventListener('load', () => {
    const stats = dataManager.getStats();
    
    if (stats.totalAnswered > 0) {
        notificationManager.info(`学習統計を表示中（解答済み: ${stats.totalAnswered}問）`, 2000);
    } else {
        notificationManager.info('まだ問題を解答していません。学習を開始しましょう！', 3000);
    }
});
