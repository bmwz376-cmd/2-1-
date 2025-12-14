// ===== トップページ（index.html）のスクリプト =====

document.addEventListener('DOMContentLoaded', () => {
    // 統計情報を表示
    displayStats();
    
    // アニメーション効果を追加
    addAnimations();
});

// 統計情報を表示
function displayStats() {
    const stats = dataManager.getStats();
    
    // 解答済み問題数
    const answeredCount = document.getElementById('answeredCount');
    if (answeredCount) {
        animateNumber(answeredCount, 0, stats.totalAnswered, 1000);
    }
    
    // 正答率
    const accuracy = document.getElementById('accuracy');
    if (accuracy) {
        animateNumber(accuracy, 0, stats.accuracy, 1000);
    }
    
    // 連続正解数
    const streak = document.getElementById('streak');
    if (streak) {
        animateNumber(streak, 0, stats.currentStreak, 800);
    }
    
    // プログレスバー
    const answeredProgress = document.getElementById('answeredProgress');
    if (answeredProgress) {
        setTimeout(() => {
            const percentage = utils.calculatePercentage(stats.totalAnswered, 250);
            answeredProgress.style.width = percentage + '%';
        }, 300);
    }
    
    const accuracyProgress = document.getElementById('accuracyProgress');
    if (accuracyProgress) {
        setTimeout(() => {
            accuracyProgress.style.width = stats.accuracy + '%';
        }, 500);
    }
}

// 数値をアニメーション表示
function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // イージング関数（ease-out）
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        const current = Math.floor(start + (end - start) * easeProgress);
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = end;
        }
    }
    
    requestAnimationFrame(update);
}

// アニメーション効果を追加
function addAnimations() {
    // 特徴カードにスタッガーアニメーション
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 + (index * 100));
    });
    
    // 統計カードにアニメーション
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.4s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
        }, 400 + (index * 150));
    });
    
    // 分野別カテゴリにアニメーション
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.4s ease-out';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, 600 + (index * 80));
    });
}

// ページ読み込み完了時のウェルカムメッセージ
window.addEventListener('load', () => {
    const stats = dataManager.getStats();
    
    // 初回訪問時のみウェルカムメッセージを表示
    const hasVisited = localStorage.getItem('civil_engineer_visited');
    if (!hasVisited) {
        setTimeout(() => {
            notificationManager.info('2級土木施工管理技士 第一次検定の過去問学習サイトへようこそ！', 5000);
            localStorage.setItem('civil_engineer_visited', 'true');
        }, 1000);
    }
    
    // 学習進捗に応じたメッセージ
    if (stats.totalAnswered > 0 && stats.totalAnswered < 250) {
        const percentage = utils.calculatePercentage(stats.totalAnswered, 250);
        if (percentage === 50) {
            setTimeout(() => {
                notificationManager.success('🎉 学習進捗が50%に達しました！頑張っていますね！', 4000);
            }, 1500);
        } else if (percentage === 100) {
            setTimeout(() => {
                notificationManager.success('🎊 全問題を解答しました！素晴らしいです！', 5000);
            }, 1500);
        }
    }
    
    // 高い正答率の場合
    if (stats.totalAnswered >= 50 && stats.accuracy >= 80) {
        setTimeout(() => {
            notificationManager.success(`✨ 正答率${stats.accuracy}%、素晴らしい成績です！`, 4000);
        }, 2000);
    }
});
