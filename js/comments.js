/**
 * コメント機能の実装
 * ローカルストレージを使用してコメントを保存
 */

// コメントを読み込む関数
function loadComments(category, articleId) {
    const storageKey = `comments_${category}_${articleId}`;
    let comments = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    // コメントリストをクリアして再表示
    const commentsList = $('#commentsList');
    commentsList.empty();
    
    if (comments.length === 0) {
        commentsList.append('<p>まだコメントはありません。最初のコメントを投稿しましょう！</p>');
        return;
    }
    
    // コメントを表示
    comments.forEach(function(comment, index) {
        const commentHTML = `
        <div class="comment" data-index="${index}">
            <div class="comment-header">
                <strong>${escapeHTML(comment.name || '匿名の実験者')}</strong>
                <span>${formatDate(comment.timestamp)}</span>
            </div>
            <div class="comment-body">
                ${formatComment(comment.text)}
            </div>
        </div>
        `;
        commentsList.append(commentHTML);
    });
}

// コメントをサニタイズして表示用にフォーマット
function formatComment(text) {
    // HTML特殊文字をエスケープ
    text = escapeHTML(text);
    
    // 改行をbrタグに変換
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

// HTML特殊文字をエスケープする関数
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 日付をフォーマット
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('ja-JP');
}

// ランダムなCAPTCHAを生成
function generateCaptcha() {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer;
    
    switch(operation) {
        case '+':
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            answer = num1 + num2;
            break;
        case '-':
            num1 = Math.floor(Math.random() * 10) + 5;
            num2 = Math.floor(Math.random() * 5) + 1;
            answer = num1 - num2;
            break;
        case '*':
            num1 = Math.floor(Math.random() * 5) + 1;
            num2 = Math.floor(Math.random() * 5) + 1;
            answer = num1 * num2;
            break;
    }
    
    return {
        question: `${num1} ${operation} ${num2} = ?`,
        answer: answer
    };
}

// コメント投稿時の挙動を設定
$(document).ready(function() {
    // 現在のCAPTCHAを保持する変数
    let currentCaptcha = null;
    
    // モーダルが開いたらCAPTCHAを生成
    $(document).on('click', '.close-modal', function() {
        generateAndShowCaptcha();
    });
    
    // CAPTCHA生成と表示
    function generateAndShowCaptcha() {
        currentCaptcha = generateCaptcha();
        const captchaHTML = `
        <div class="captcha">
            <label>${currentCaptcha.question}</label>
            <input type="number" id="captchaAnswer" placeholder="答えを入力">
        </div>
        `;
        $('#captchaContainer').html(captchaHTML);
    }
    
    // コメント投稿ボタンクリック時
    $(document).on('click', '#postComment', function() {
        const name = $('#commentName').val().trim();
        const text = $('#commentText').val().trim();
        const captchaAnswer = parseInt($
