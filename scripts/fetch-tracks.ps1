$ErrorActionPreference = 'Stop'
$sources = Get-Content -Raw (Join-Path $PSScriptRoot '..\public\assets\cover-sources.json') | ConvertFrom-Json
$catalog = @{}
foreach ($album in $sources) {
  $id = [regex]::Match($album.source, '/(\d+)\?').Groups[1].Value
  $response = Invoke-RestMethod -Uri ('https://itunes.apple.com/lookup?id=' + $id + '&entity=song&limit=200&country=us')
  $tracks = @($response.results | Where-Object { $_.wrapperType -eq 'track' -and $_.previewUrl } | Sort-Object discNumber,trackNumber | ForEach-Object {
    @{ id=[string]$_.trackId; title=$_.trackName; artist=$_.artistName; url=$_.previewUrl; number=$_.trackNumber; durationMs=$_.trackTimeMillis; source=$_.trackViewUrl }
  })
  $catalog[$album.id] = @{ source=$album.source; tracks=$tracks }
  Write-Host ($album.id + ': ' + $tracks.Count + ' preview tracks')
}
$catalog | ConvertTo-Json -Depth 8 | Set-Content -Encoding utf8 (Join-Path $PSScriptRoot '..\src\audio-catalog.json')
