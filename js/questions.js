// ===== 問題一覧ページのスクリプト =====

let allQuestions = [];
let filteredQuestions = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadQuestions();
    setupFilters();
    setupSearchInput();
    applyFilters();
});

// 問題データを読み込む
async function loadQuestions() {
    try {
        const response = await fetch('data/questions.json');
        if (!response.ok) {
            throw new Error('問題データの読み込みに失敗しました');
        }
        allQuestions = await response.json();
        filteredQuestions = [...allQuestions];
        console.log('✅ 問題データ読み込み成功:', allQuestions.length, '問');
        
        // 年度別の問題数を表示
        const yearCounts = {};
        allQuestions.forEach(q => {
            yearCounts[q.year] = (yearCounts[q.year] || 0) + 1;
        });
        console.log('年度別問題数:', yearCounts);
        
    } catch (error) {
        console.error('問題データの読み込みエラー:', error);
        notificationManager.error('問題データの読み込みに失敗しました');
        allQuestions = [];
        filteredQuestions = [];
    }
}

// フィルターをセットアップ
function setupFilters() {
    const yearFilter = document.getElementById('yearFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const difficultyFilter = document.getElementById('difficultyFilter');
    const statusFilter = document.getElementById('statusFilter');
    const resetBtn = document.getElementById('resetFilters');

    if (yearFilter) yearFilter.addEventListener('change', applyFilters);
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (difficultyFilter) difficultyFilter.addEventListener('change', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
}

// 検索入力をセットアップ
function setupSearchInput() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            applyFilters();
            if (clearBtn) {
                clearBtn.style.display = e.target.value ? 'block' : 'none';
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                clearBtn.style.display = 'none';
                applyFilters();
            }
        });
    }
}

// フィルターを適用
function applyFilters() {
    const yearFilter = document.getElementById('yearFilter')?.value || 'all';
    const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
    const difficultyFilter = document.getElementById('difficultyFilter')?.value || 'all';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const searchText = document.getElementById('searchInput')?.value.toLowerCase() || '';

    filteredQuestions = allQuestions.filter(question => {
        // 年度フィルター
        if (yearFilter !== 'all' && question.year !== yearFilter) {
            return false;
        }

        // 分野フィルター
        if (categoryFilter !== 'all' && question.category !== categoryFilter) {
            return false;
        }

        // 重要度フィルター
        if (difficultyFilter !== 'all' && question.difficulty !== difficultyFilter) {
            return false;
        }

        // 学習状況フィルター
        if (statusFilter !== 'all') {
            const answer = dataManager.getAnswerStatus(question.id);
            if (statusFilter === 'unanswered' && answer) {
                return false;
            }
            if (statusFilter === 'correct' && (!answer || !answer.isCorrect)) {
                return false;
            }
            if (statusFilter === 'incorrect' && (!answer || answer.isCorrect)) {
                return false;
            }
        }

        // 検索フィルター
        if (searchText) {
            const searchableText = (
                question.title + ' ' + 
                question.text + ' ' +
                (question.choices ? question.choices.join(' ') : '')
            ).toLowerCase();
            
            // HTMLタグを除去
            const plainText = searchableText.replace(/<[^>]*>/g, '');
            
            if (!plainText.includes(searchText)) {
                return false;
            }
        }

        return true;
    });

    displayQuestions();
}

// フィルターをリセット
function resetFilters() {
    document.getElementById('yearFilter').value = 'all';
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('difficultyFilter').value = 'all';
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('searchInput').value = '';
    document.getElementById('clearSearch').style.display = 'none';
    
    applyFilters();
    notificationManager.info('フィルターをリセットしました');
}

// 問題を表示
function displayQuestions() {
    const questionsList = document.getElementById('questionsList');
    const displayCount = document.getElementById('displayCount');
    const totalCount = document.getElementById('totalCount');

    if (!questionsList) return;

    // カウント表示を更新
    if (displayCount) displayCount.textContent = filteredQuestions.length;
    if (totalCount) totalCount.textContent = allQuestions.length;

    // 問題リストをクリア
    questionsList.innerHTML = '';

    if (filteredQuestions.length === 0) {
        questionsList.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                <p style="font-size: 1.2rem;">該当する問題が見つかりませんでした</p>
                <p style="margin-top: 10px;">フィルター条件を変更してください</p>
            </div>
        `;
        return;
    }

    // 問題アイテムを生成
    filteredQuestions.forEach((question, index) => {
        const questionItem = createQuestionItem(question, index);
        questionsList.appendChild(questionItem);
    });

    // アニメーション効果
    animateQuestions();
}

// 問題アイテムを生成
function createQuestionItem(question, index) {
    const item = document.createElement('a');
    item.href = `question.html?id=${question.id}`;
    item.className = 'question-item';
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';

    // 回答状況を取得
    const answer = dataManager.getAnswerStatus(question.id);
    let statusHtml = '';
    if (answer) {
        if (answer.isCorrect) {
            statusHtml = '<span class="question-status status-correct"><i class="fas fa-check-circle"></i> 正解</span>';
        } else {
            statusHtml = '<span class="question-status status-incorrect"><i class="fas fa-times-circle"></i> 不正解</span>';
        }
    }

    // HTMLタグを除去してプレビューを生成
    const plainText = question.text.replace(/<[^>]*>/g, '');
    const preview = plainText.length > 80 ? plainText.substring(0, 80) + '...' : plainText;

    item.innerHTML = `
        <div class="question-header-row">
            <div class="question-badges">
                <span class="badge badge-year">${utils.formatYear(question.year)}</span>
                <span class="badge badge-category">${utils.formatCategory(question.category)}</span>
                <span class="badge badge-difficulty">${utils.formatDifficulty(question.difficulty)}</span>
            </div>
            ${statusHtml}
        </div>
        <h3 class="question-title-text">問題 ${question.number}: ${question.title.replace(/<[^>]*>/g, '')}</h3>
        <p class="question-preview">${preview}</p>
    `;

    return item;
}

// 問題アイテムにアニメーション
function animateQuestions() {
    const items = document.querySelectorAll('.question-item');
    items.forEach((item, index) => {
        setTimeout(() => {
            item.style.transition = 'all 0.4s ease-out';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 50); // スタッガー効果
    });
}

// ページ読み込み完了時の処理
window.addEventListener('load', () => {
    if (filteredQuestions.length > 0) {
        notificationManager.info(`${filteredQuestions.length}問の問題を表示中`, 2000);
    }
});
