$ErrorActionPreference = 'SilentlyContinue'

$projectRoot = Join-Path $PSScriptRoot '..'
$publicRoot = Join-Path $projectRoot 'public'
$coversDest = Join-Path $publicRoot 'covers'
New-Item -ItemType Directory -Force -Path $coversDest | Out-Null

$names = @(
  'series.png',
  'film-stars.png',
  'footbal.jpg',
  'basketball-players.jpg',
  'basketball-teams.jpg',
  'movies.jpg',
  'football-players.jpg'
)

$roots = @(
  (Join-Path $env:USERPROFILE 'OneDrive'),
  (Join-Path $env:USERPROFILE 'Downloads'),
  (Join-Path $env:USERPROFILE 'Desktop'),
  (Join-Path $env:USERPROFILE 'Pictures')
)

$ok = 0; $miss = 0
foreach ($name in $names) {
  $found = $null
  foreach ($root in $roots) {
    if (-not (Test-Path $root)) { continue }
    $candidate = Get-ChildItem -Path $root -Recurse -Filter $name -File -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($candidate) { $found = $candidate; break }
  }
  if ($found) {
    Copy-Item $found.FullName -Destination (Join-Path $coversDest $name) -Force
    Write-Host "OK  $name  <-  $($found.FullName)"
    $ok++
  } else {
    Write-Host "MISS $name"
    $miss++
  }
}

Write-Host "Covers restore complete. OK=$ok MISS=$miss"
