<?php
/**
 * 설비트리거 - 건설뉴스 수집
 * 네이버 뉴스 검색 API 사용
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

define('CLIENT_ID',     'X4ZLWeXd6cSSzF3FC3Cr');
define('CLIENT_SECRET', 'izINeRCUn1');
define('CACHE_FILE', __DIR__ . '/rss_cache.json');
define('CACHE_TTL',  1800);

// 캐시 유효하면 즉시 반환
if(file_exists(CACHE_FILE) && (time() - filemtime(CACHE_FILE)) < CACHE_TTL){
    echo file_get_contents(CACHE_FILE);
    exit;
}

$keywords = ['기계설비','건설공사','설비배관','소방설비','전기공사'];
$items = [];
$seen  = [];

foreach($keywords as $kw){
    $url = 'https://openapi.naver.com/v1/search/news.json'
         . '?query=' . urlencode($kw)
         . '&display=5&sort=date';

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_TIMEOUT        => 8,
        CURLOPT_HTTPHEADER     => [
            'X-Naver-Client-Id: '     . CLIENT_ID,
            'X-Naver-Client-Secret: ' . CLIENT_SECRET,
        ],
    ]);
    $body = curl_exec($ch);
    $err  = curl_error($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if($err || $code !== 200) continue;

    $data = json_decode($body, true);
    if(empty($data['items'])) continue;

    foreach($data['items'] as $item){
        $title = html_entity_decode(strip_tags($item['title'] ?? ''), ENT_QUOTES, 'UTF-8');
        if(!$title || isset($seen[$title])) continue;
        $seen[$title] = true;

        $desc = html_entity_decode(strip_tags($item['description'] ?? ''), ENT_QUOTES, 'UTF-8');
        $desc = mb_substr($desc, 0, 100, 'UTF-8');

        $pubDate = $item['pubDate'] ?? '';
        $date = $pubDate ? date('Y.m.d', strtotime($pubDate)) : date('Y.m.d');

        $items[] = [
            'cat'     => $kw,
            'title'   => $title,
            'summary' => $desc ?: $title,
            'content' => $desc ?: $title,
            'date'    => $date,
            'link'    => $item['originallink'] ?? $item['link'] ?? '',
        ];
    }
    if(count($items) >= 20) break;
}

// 날짜 정렬
usort($items, function($a, $b){ return strcmp($b['date'], $a['date']); });

$result = json_encode(['ok' => true, 'items' => $items, 'count' => count($items)],
    JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

// 결과가 있을 때만 캐시 저장
if(count($items) > 0){
    file_put_contents(CACHE_FILE, $result);
}

echo $result;
