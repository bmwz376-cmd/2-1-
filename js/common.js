// ===== 共通ユーティリティ関数 =====

// データ管理マネージャー
const dataManager = {
    // LocalStorageのキー
    STORAGE_KEYS: {
        ANSWERS: 'civil_engineer_answers',
        STATS: 'civil_engineer_stats',
        SETTINGS: 'civil_engineer_settings'
    },

    // 回答データを保存
    saveAnswer(questionId, userAnswer, isCorrect) {
        const answers = this.getAllAnswers();
        answers[questionId] = {
            userAnswer: userAnswer,
            isCorrect: isCorrect,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(this.STORAGE_KEYS.ANSWERS, JSON.stringify(answers));
        this.updateStats();
    },

    // 全ての回答データを取得
    getAllAnswers() {
        const data = localStorage.getItem(this.STORAGE_KEYS.ANSWERS);
        return data ? JSON.parse(data) : {};
    },

    // 特定の問題の回答状況を取得
    getAnswerStatus(questionId) {
        const answers = this.getAllAnswers();
        return answers[questionId] || null;
    },

    // 統計情報を更新
    updateStats() {
        const answers = this.getAllAnswers();
        const answeredQuestions = Object.keys(answers);
        const correctAnswers = answeredQuestions.filter(id => answers[id].isCorrect);
        
        const stats = {
            totalAnswered: answeredQuestions.length,
            totalCorrect: correctAnswers.length,
            totalIncorrect: answeredQuestions.length - correctAnswers.length,
            accuracy: answeredQuestions.length > 0 
                ? Math.round((correctAnswers.length / answeredQuestions.length) * 100) 
                : 0,
            lastUpdated: new Date().toISOString()
        };

        // 連続正解数を計算
        stats.currentStreak = this.calculateCurrentStreak();
        stats.maxStreak = this.calculateMaxStreak();

        localStorage.setItem(this.STORAGE_KEYS.STATS, JSON.stringify(stats));
        return stats;
    },

    // 統計情報を取得
    getStats() {
        const data = localStorage.getItem(this.STORAGE_KEYS.STATS);
        if (data) {
            return JSON.parse(data);
        }
        return {
            totalAnswered: 0,
            totalCorrect: 0,
            totalIncorrect: 0,
            accuracy: 0,
            currentStreak: 0,
            maxStreak: 0
        };
    },

    // 現在の連続正解数を計算
    calculateCurrentStreak() {
        const answers = this.getAllAnswers();
        const sortedAnswers = Object.entries(answers).sort((a, b) => 
            new Date(b[1].timestamp) - new Date(a[1].timestamp)
        );

        let streak = 0;
        for (const [, answer] of sortedAnswers) {
            if (answer.isCorrect) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    },

    // 最大連続正解数を計算
    calculateMaxStreak() {
        const answers = this.getAllAnswers();
        const sortedAnswers = Object.entries(answers).sort((a, b) => 
            new Date(a[1].timestamp) - new Date(b[1].timestamp)
        );

        let maxStreak = 0;
        let currentStreak = 0;

        for (const [, answer] of sortedAnswers) {
            if (answer.isCorrect) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        }
        return maxStreak;
    },

    // 学習履歴をリセット
    resetProgress() {
        if (confirm('本当に学習履歴をリセットしますか？この操作は取り消せません。')) {
            localStorage.removeItem(this.STORAGE_KEYS.ANSWERS);
            localStorage.removeItem(this.STORAGE_KEYS.STATS);
            location.reload();
        }
    },

    // 年度別の正答率を取得
    getYearStats(questions) {
        const answers = this.getAllAnswers();
        const yearStats = {};

        questions.forEach(q => {
            if (!yearStats[q.year]) {
                yearStats[q.year] = {
                    total: 0,
                    answered: 0,
                    correct: 0
                };
            }
            yearStats[q.year].total++;
            
            const answer = answers[q.id];
            if (answer) {
                yearStats[q.year].answered++;
                if (answer.isCorrect) {
                    yearStats[q.year].correct++;
                }
            }
        });

        return yearStats;
    },

    // 分野別の正答率を取得
    getCategoryStats(questions) {
        const answers = this.getAllAnswers();
        const categoryStats = {};

        questions.forEach(q => {
            if (!categoryStats[q.category]) {
                categoryStats[q.category] = {
                    total: 0,
                    answered: 0,
                    correct: 0
                };
            }
            categoryStats[q.category].total++;
            
            const answer = answers[q.id];
            if (answer) {
                categoryStats[q.category].answered++;
                if (answer.isCorrect) {
                    categoryStats[q.category].correct++;
                }
            }
        });

        return categoryStats;
    }
};

// 通知マネージャー
const notificationManager = {
    show(message, type = 'info', duration = 3000) {
        const container = document.getElementById('notification') || this.createContainer();
        
        const notification = document.createElement('div');
        notification.className = `notification-item ${type}`;
        
        const icon = this.getIcon(type);
        
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
            ${duration > 0 ? '<div class="notification-progress"><div class="notification-progress-bar"></div></div>' : ''}
        `;

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.hide(notification));

        container.appendChild(notification);
        
        // アニメーション後に表示
        setTimeout(() => notification.classList.add('show'), 10);

        // 自動で非表示
        if (duration > 0) {
            setTimeout(() => this.hide(notification), duration);
        }

        return notification;
    },

    hide(notification) {
        notification.classList.add('hiding');
        setTimeout(() => notification.remove(), 300);
    },

    createContainer() {
        const container = document.createElement('div');
        container.id = 'notification';
        container.className = 'notification';
        document.body.appendChild(container);
        return container;
    },

    getIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    },

    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    },

    error(message, duration = 3000) {
        return this.show(message, 'error', duration);
    },

    warning(message, duration = 3000) {
        return this.show(message, 'warning', duration);
    },

    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }
};

// ユーティリティ関数
const utils = {
    // 年度を日本語表記に変換
    formatYear(year) {
        const yearMap = {
            'r06': '令和6年度（2024年）',
            'r05': '令和5年度（2023年）',
            'r04': '令和4年度（2022年）',
            'r03': '令和3年度（2021年）',
            'r02': '令和2年度（2020年）'
        };
        return yearMap[year] || year;
    },

    // 分野を日本語表記に変換
    formatCategory(category) {
        const categoryMap = {
            'earthwork': '土工',
            'concrete': 'コンクリート工',
            'planning': '施工計画',
            'law': '法規',
            'safety': '安全管理',
            'quality': '品質管理',
            'machinery': '建設機械',
            'other': 'その他'
        };
        return categoryMap[category] || category;
    },

    // 重要度を表記に変換
    formatDifficulty(difficulty) {
        const difficultyMap = {
            'A': 'A: 頻出',
            'B': 'B: 標準',
            'C': 'C: 難問'
        };
        return difficultyMap[difficulty] || difficulty;
    },

    // HTMLをエスケープ
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // 配列をシャッフル
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    },

    // パーセンテージを計算
    calculatePercentage(value, total) {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    }
};

// ページ読み込み時の共通処理
document.addEventListener('DOMContentLoaded', () => {
    // フェードインアニメーション
    document.body.classList.add('fade-in');
    
    // 統計情報を更新（トップページ用）
    if (document.getElementById('answeredCount')) {
        updateHomePageStats();
    }
});

// ホームページの統計を更新
function updateHomePageStats() {
    const stats = dataManager.getStats();
    
    const answeredCount = document.getElementById('answeredCount');
    const accuracy = document.getElementById('accuracy');
    const streak = document.getElementById('streak');
    const answeredProgress = document.getElementById('answeredProgress');
    const accuracyProgress = document.getElementById('accuracyProgress');

    if (answeredCount) {
        answeredCount.textContent = stats.totalAnswered;
        if (answeredProgress) {
            const percentage = utils.calculatePercentage(stats.totalAnswered, 250);
            answeredProgress.style.width = percentage + '%';
        }
    }

    if (accuracy) {
        accuracy.textContent = stats.accuracy;
        if (accuracyProgress) {
            accuracyProgress.style.width = stats.accuracy + '%';
        }
    }

    if (streak) {
        streak.textContent = stats.currentStreak;
    }
}

// グローバルに公開
window.dataManager = dataManager;
window.notificationManager = notificationManager;
window.utils = utils;
