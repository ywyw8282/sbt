# 자동 Git 동기화 + UPDATE_LOG 자동 생성 스크립트
# 파일 변경 감지 시 UPDATE_LOG_NNN.md 생성 후 자동 commit + push

$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectPath

Write-Host "자동 Git 동기화 시작..." -ForegroundColor Green
Write-Host "경로: $projectPath" -ForegroundColor Cyan
Write-Host "종료하려면 Ctrl+C 를 누르세요." -ForegroundColor Yellow
Write-Host ""

# 무시할 파일/폴더 패턴
$ignorePatterns = @('.git', 'auto-git.ps1', 'rss_cache.json')

# 다음 UPDATE_LOG 번호 계산 함수
function Get-NextLogNumber {
    $existing = Get-ChildItem -Path $projectPath -Filter "UPDATE_LOG_*.md" |
                Where-Object { $_.Name -match "UPDATE_LOG_(\d+)\.md" } |
                ForEach-Object { [int]$Matches[1] } |
                Sort-Object -Descending
    if ($existing) { return $existing[0] + 1 }
    return 2
}

# UPDATE_LOG 생성 함수
function New-UpdateLog($changedFiles, $timestamp) {
    $num = Get-NextLogNumber
    $numStr = $num.ToString("000")
    $logPath = Join-Path $projectPath "UPDATE_LOG_$numStr.md"
    $date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

    $lines = @()
    $lines += "# UPDATE_LOG_$numStr — 자동 기록"
    $lines += ""
    $lines += "> **날짜**: $date"
    $lines += "> **유형**: 자동 감지 변경"
    $lines += ""
    $lines += "---"
    $lines += ""
    $lines += "## 변경된 파일"
    $lines += ""
    $lines += "| 파일 | 변경 유형 |"
    $lines += "|------|----------|"

    foreach ($f in $changedFiles) {
        $rel = $f -replace [regex]::Escape($projectPath + "\"), ""
        $rel = $rel -replace "\\", "/"

        if (Test-Path (Join-Path $projectPath $rel)) {
            $lines += "| $rel | 수정/추가 |"
        } else {
            $lines += "| $rel | 삭제 |"
        }
    }

    $lines += ""
    $lines += "---"
    $lines += ""
    $lines += "## 수정 내용"
    $lines += ""
    $lines += "<!-- 이 항목은 수동으로 작성하세요 -->"
    $lines += "- (자동 감지된 변경사항입니다. 상세 내용은 직접 기록해주세요)"

    $lines | Out-File -FilePath $logPath -Encoding UTF8
    Write-Host "  UPDATE_LOG_$numStr.md 생성됨" -ForegroundColor Cyan
    return "UPDATE_LOG_$numStr.md"
}

# 파일 감시 설정
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $projectPath
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]::LastWrite -bor [System.IO.NotifyFilters]::FileName

$global:pendingChange = $false
$global:changedFiles = [System.Collections.Generic.HashSet[string]]::new()

$action = {
    $path = $Event.SourceEventArgs.FullPath
    $name = $Event.SourceEventArgs.Name

    foreach ($pattern in $ignorePatterns) {
        if ($path -like "*$pattern*") { return }
    }
    # UPDATE_LOG 파일 자체는 무시
    if ($name -match "UPDATE_LOG_\d+\.md") { return }

    $global:changedFiles.Add($path) | Out-Null
    $global:pendingChange = $true
}

Register-ObjectEvent $watcher "Changed" -Action $action | Out-Null
Register-ObjectEvent $watcher "Created" -Action $action | Out-Null
Register-ObjectEvent $watcher "Deleted" -Action $action | Out-Null
Register-ObjectEvent $watcher "Renamed" -Action $action | Out-Null

Write-Host "파일 감시 중..." -ForegroundColor Green

while ($true) {
    Start-Sleep -Seconds 3

    if ($global:pendingChange) {
        $global:pendingChange = $false
        $files = @($global:changedFiles)
        $global:changedFiles.Clear()

        Start-Sleep -Seconds 2  # 저장 완료 대기

        $status = git status --porcelain
        if ($status) {
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

            # UPDATE_LOG 생성
            $logFile = New-UpdateLog $files $timestamp

            # Git 커밋 + 푸시
            git add .
            git commit -m "자동 저장: $timestamp" 2>&1 | Out-Null
            git push 2>&1 | Out-Null

            Write-Host "[$timestamp] 자동 업로드 완료 ($logFile)" -ForegroundColor Green
        }
    }
}
