/**
 * 高度な荒らし対策機能
 * 投稿頻度制限、禁止ワードフィルタ、ハニーポットトラップを実装
 */

// 荒らし対策の設定
const antispamConfig = {
    // 投稿間隔制限（ミリ秒）
    postInterval: 30000, // 30秒
    
    // 禁止ワードリスト（実際の運用では適切に拡張）
    bannedWords: [
        "荒らし", "スパム", "アダルト", 
        "詐欺", "ハッキング", "違法", 
        "荒らしテスト", "テスト荒らし"
    ],
    
    // 同一IPからの最大投稿数（24時間）
    maxPostsPerDay: 20
};

// 前回の投稿時刻を追跡
let lastPostTimestamp = 0;

// ハニーポットフィールドを追加（ボットの検出用）
$(document).ready(function() {
    // 非表示のハニーポットフィールドを追加
    const honeyPotHTML = `
    <div style="opacity: 0; position: absolute; top: -9999px; left: -9999px;">
        <input type="text" id="websiteField" name="website" autocomplete="off">
    </div>
    `;
    $('.comment-form').append(honeyPotHTML);
    
    // コメント投稿前の検証処理をフック
    $(document).on('click', '#postComment', function(e) {
        // この時点ではクリックイベントをキャンセルしない
        // コメント処理前の検証を行う
        if (!validateComment()) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });
});

// コメントをバリデーションする関数
function validateComment() {
    const commentText = $('#commentText').val().trim();
    const honeyPotValue = $('#websiteField').val();
    
    // ハニーポットチェック（ボット対策）
    if (honeyPotValue.length > 0) {
        console.log("ボット検出！"); // 実際の運用では警告ではなく静かに失敗させる
        return false;
    }
    
    // 投稿頻度チェック
    const currentTime = new Date().getTime();
    if (currentTime - lastPostTimestamp < antispamConfig.postInterval) {
        const waitSeconds = Math.ceil((antispamConfig.postInterval - (currentTime - lastPostTimestamp)) / 1000);
        alert(`投稿が速すぎるぞ！あと${waitSeconds}秒待つのじゃ！`);
        return false;
    }
    
    // 禁止ワードチェック
    for (const word of antispamConfig.bannedWords) {
        if (commentText.toLowerCase().includes(word.toLowerCase())) {
            alert("禁止ワードが含まれています！狂気には秩序が必要じゃ！");
            return false;
        }
    }
    
    // 文字数チェック
    if (commentText.length < 3) {
        alert("コメントが短すぎます！もう少し実験的な考察を加えるのじゃ！");
        return false;
    }
    
    if (commentText.length > 1000) {
        alert("コメントが長すぎます！簡潔な狂気を心がけるのじゃ！最大1000文字じゃ！");
        return false;
    }
    
    // 連続投稿チェック（日次制限）
    checkDailyPostLimit();
    
    // 投稿時刻を記録
    lastPostTimestamp = currentTime;
    
    return true;
}

// 日次投稿制限をチェックする関数
function checkDailyPostLimit() {
    // ユニークな識別子を生成（実際にはもっと洗練された方法を使用）
    // ここではローカルストレージに保存された一時ID使用
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('userId', userId);
    }
    
    // 現在の日付を取得
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `posts_${userId}_${today}`;
    
    // 今日の投稿数を取得
    let postCount = parseInt(localStorage.getItem(storageKey) || '0');
    
    // 投稿数チェック
    if (postCount >= antispamConfig.maxPostsPerDay) {
        alert(`本日の投稿上限に達しました。明日また参加してください！`);
        return false;
    }
    
    // 投稿数を増やす
    localStorage.setItem(storageKey, postCount + 1);
    return true;
}

// コンテンツのフィルタリング関数（過剰なCAPSや繰り返しを検出）
function filterContent(text) {
    // 大文字が多すぎるかチェック
    const upperCaseCount = (text.match(/[A-Z]/g) || []).length;
    const totalCharCount = text.length;
    const upperCaseRatio = upperCaseCount / totalCharCount;
    
    if (upperCaseRatio > 0.5 && totalCharCount > 20) {
        return {
            valid: false,
            reason: "大文字の使用が多すぎます。適度な表現を心がけてください。"
        };
    }
    
    // 同じ文字の繰り返しをチェック
    const repeatedCharsRegex = /(.)\1{5,}/;
    if (repeatedCharsRegex.test(text)) {
        return {
            valid: false,
            reason: "文字の過剰な繰り返しが検出されました。"
        };
    }
    
    // 絵文字の過剰使用をチェック
    const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    const emojiMatches = text.match(emojiRegex) || [];
    if (emojiMatches.length > 10) {
        return {
            valid: false,
            reason: "絵文字の使用が多すぎます。"
        };
    }
    
    // URL数の制限（スパム対策）
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urlMatches = text.match(urlRegex) || [];
    if (urlMatches.length > 2) {
        return {
            valid: false,
            reason: "リンクの数が多すぎます。最大2つまでにしてください。"
        };
    }
    
    return {
        valid: true,
        filteredText: text
    };
}

// アンチフラッディング対策（ページロード時）
$(document).ready(function() {
    // ページ内のすべてのフォーム送信に遅延を追加
    $('form').on('submit', function(e) {
        const form = $(this);
        
        // 既に処理中なら何もしない
        if (form.data('processing')) {
            e.preventDefault();
            return false;
        }
        
        // フォームを処理中にマーク
        form.data('processing', true);
        
        // 送信ボタンを無効化
        form.find('button[type="submit"]').prop('disabled', true);
        
        // 遅延後に処理を再開
        setTimeout(function() {
            form.data('processing', false);
            form.find('button[type="submit"]').prop('disabled', false);
        }, 2000); // 2秒の遅延
    });
});
