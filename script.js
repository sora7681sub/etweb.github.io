// メインスクリプト
$(document).ready(function() {
    // サイト初期化時に現在アクティブなタブのコンテンツを読み込む
    const initialTab = $('.tab.active').data('page');
    if (initialTab !== 'home') {
        loadTabContent(initialTab);
    }

    // タブクリック時の挙動
    $('.tab').on('click', function(e) {
        e.preventDefault();
        
        // すでにアクティブなタブなら何もしない
        if ($(this).hasClass('active')) {
            return;
        }
        
        // タブ切り替え
        $('.tab').removeClass('active');
        $(this).addClass('active');
        
        // コンテンツ切り替え
        const page = $(this).data('page');
        $('.page-content').removeClass('active');
        
        // ホームタブの場合は直接表示
        if (page === 'home') {
            $('#home-content').addClass('active');
            return;
        }
        
        // その他のタブはコンテンツを読み込む
        loadTabContent(page);
    });
    
    // 特集アイテムのタブリンク
    $(document).on('click', '.btn[data-page]', function(e) {
        e.preventDefault();
        const page = $(this).data('page');
        
        // 対応するタブをアクティブに
        $('.tab').removeClass('active');
        $(`.tab[data-page="${page}"]`).addClass('active');
        
        // コンテンツを読み込む
        $('.page-content').removeClass('active');
        loadTabContent(page);
    });
});

// タブコンテンツを読み込む関数
function loadTabContent(page) {
    const contentDiv = $(`#${page}-content`);
    
    // すでに読み込み済みかチェック（初回のみ読み込む）
    if (contentDiv.children().length > 0) {
        contentDiv.addClass('active');
        return;
    }
    
    // ローディングアニメーション表示
    contentDiv.html('<div class="loading">ロード中...</div>');
    contentDiv.addClass('active');
    
    // ページを読み込む
    $.ajax({
        url: `pages/${page}.html`,
        success: function(data) {
            contentDiv.html(data);
            // コンテンツ読み込み後のイベントを設定
            setupTabContentEvents(page);
        },
        error: function() {
            contentDiv.html('<div class="error">ページの読み込みに失敗しました。</div>');
        }
    });
}

// モーダルを開く関数
function openArticleModal(articleId, category) {
    // モーダルタイトルと内容を取得
    // 実際のシステムではデータベースやJSONファイルから取得する
    // ここではサンプルとして固定データを使用
    let articleTitle = '';
    let articleContent = '';
    
    if (category === 'tools') {
        switch(articleId) {
            case 1:
                articleTitle = '万能解析ツール';
                articleContent = '<p>このツールを使えば、あらゆるシステムを解析できる！フハハハハ！</p><p>使い方は簡単だ。まずは対象システムのURLを入力して、「解析開始」ボタンを押すだけだ！</p>';
                break;
            case 2:
                articleTitle = '自動化スクリプト生成器';
                articleContent = '<p>単調な作業は機械に任せるべし！このツールで自動化スクリプトを生成できる！</p><p>様々なシナリオに対応したスクリプトを簡単に作成できるぞ！</p>';
                break;
            // 他のツール記事
        }
    } else if (category === 'poems') {
        switch(articleId) {
            case 1:
                articleTitle = '狂気の詩';
                articleContent = '<p>闇に響く 狂気の旋律<br>理性の檻を 打ち壊せ<br>混沌こそが 真理なり<br>我は解き放つ 新たなる世界を</p>';
                break;
            case 2:
                articleTitle = '実験の果てに';
                articleContent = '<p>試験管の中で踊る分子たち<br>未知への扉は今開かれる<br>常識という名の鎖を解き放ち<br>真の自由を掴み取るのだ</p>';
                break;
            // 他のポエム記事
        }
    } else if (category === 'history') {
        switch(articleId) {
            case 1:
                articleTitle = 'ET鯖の始まり';
                articleContent = '<p>かつて伝説の実験者たちが集い、禁断の知識を求めて結成されたET鯖。その歴史は狂気と天才の狭間で紡がれてきた...</p><p>2015年、最初の実験は小さな部屋から始まった。しかしその影響は世界を変えることとなるのだ！</p>';
                break;
            case 2:
                articleTitle = '大革命の時代';
                articleContent = '<p>2018年、ET鯖に革命が起きた。新たな技術の導入により、実験の規模と質が飛躍的に向上したのだ！</p><p>当時のメンバーたちの熱気は今も語り継がれている...</p>';
                break;
            // 他の歴史記事
        }
    } else if (category === 'cheats') {
        switch(articleId) {
            case 1:
                articleTitle = '基本的なチート作成法';
                articleContent = '<p>チート作成の基本は、システムの仕組みを理解することだ！まずはメモリ解析の方法を学ぼう。</p><p>1. ターゲットプログラムのメモリマップを取得<br>2. 値の変化を監視して特定のアドレスを見つける<br>3. そのアドレスを操作するコードを書く</p>';
                break;
            case 2:
                articleTitle = '高度な検出回避テクニック';
                articleContent = '<p>チート検出システムを回避するためには、システムの監視方法を知る必要がある。典型的な検出方法と回避策をまとめた！</p><p>・メモリスキャン回避のためのコード難読化<br>・シグネチャ検出を避けるための動的命令生成<br>・タイミング検出を欺くためのスリープ調整</p>';
                break;
            // 他のチート作成記事
        }
    }
    
    // モーダル内容を設定
    $('#modalTitle').text(articleTitle);
    $('#modalBody').html(articleContent);
    
    // カテゴリを設定（コメント機能で使用）
    $('#articleModal').data('category', category);
    $('#articleModal').data('articleId', articleId);
    
    // コメントを読み込む
    loadComments(category, articleId);
    
    // モーダルを表示
    $('#articleModal').fadeIn(300);
    
    // スクロール制御
    $('body').css('overflow', 'hidden');
}

// モーダルを閉じる
function closeArticleModal() {
    $('#articleModal').fadeOut(300);
    $('body').css('overflow', 'auto');
}

// タブコンテンツ読み込み後のイベント設定
function setupTabContentEvents(page) {
    // 記事クリックイベントの設定
    $(`.${page}-article`).on('click', function(e) {
        e.preventDefault();
        const articleId = $(this).data('id');
        openArticleModal(articleId, page);
    });
    
    // モーダル閉じるボタン
    $('.close-modal').on('click', function() {
        closeArticleModal();
    });
    
    // モーダル外クリックで閉じる
    $(document).on('click', '#articleModal', function(e) {
        if (e.target.id === 'articleModal') {
            closeArticleModal();
        }
    });
    
    // ESCキーでモーダルを閉じる
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' && $('#articleModal').is(':visible')) {
            closeArticleModal();
        }
    });
}

// ページがロードされたときにモーダルを作成（最初に一度だけ）
$(document).ready(function() {
    // モーダルHTMLを作成してbodyに追加
    const modalHTML = `
    <div id="articleModal" class="modal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <div class="modal-header">
                <h2 id="modalTitle"></h2>
            </div>
            <div id="modalBody"></div>
            <div class="comments-section">
                <h3>コメント</h3>
                <div id="commentsList"></div>
                <div class="comment-form">
                    <h4>コメントを投稿</h4>
                    <input type="text" id="commentName" placeholder="名前（任意）">
                    <textarea id="commentText" placeholder="コメントを入力..."></textarea>
                    <div id="captchaContainer"></div>
                    <button id="postComment" class="btn">投稿</button>
                </div>
            </div>
        </div>
    </div>
    `;
    $('body').append(modalHTML);
});
