$ErrorActionPreference='Stop'
$project=Split-Path $PSScriptRoot -Parent
$existing=Get-Content -Raw (Join-Path $project 'src/audio-catalog.json') | ConvertFrom-Json -AsHashtable
$sources=@(Get-Content -Raw (Join-Path $project 'public/assets/cover-sources.json') | ConvertFrom-Json)
$selected=@(@('A-071','268443092'),@('A-082','697194953'),@('A-093','724466069'),@('A-104','292885238'),@('A-115','1065975633'),@('A-126','1078898175'),@('A-137','509665145'),@('A-148','416292276'),@('A-159','281116024'))
foreach($item in $selected){
  $data=Invoke-RestMethod -Uri ('https://itunes.apple.com/lookup?id='+$item[1]+'&entity=song&limit=200&country=us')
  $record=$data.results | Where-Object wrapperType -eq 'collection' | Select-Object -First 1
  if(!$record){throw ('Missing album '+$item[0])}
  $tracks=@($data.results | Where-Object { $_.wrapperType -eq 'track' -and $_.previewUrl } | Sort-Object discNumber,trackNumber | ForEach-Object { @{id=[string]$_.trackId;title=$_.trackName;artist=$_.artistName;url=$_.previewUrl;number=$_.trackNumber;durationMs=$_.trackTimeMillis;source=$_.trackViewUrl} })
  if(!$tracks.Count){throw ('No previews '+$item[0])}
  $existing[$item[0]]=@{source=$record.collectionViewUrl;tracks=$tracks}
  $artwork=$record.artworkUrl100 -replace '100x100bb','600x600bb'
  Invoke-WebRequest -Uri $artwork -OutFile (Join-Path $project ('public/assets/'+$item[0]+'.jpg'))
  $sources=@($sources | Where-Object id -ne $item[0]) + @{id=$item[0];source=$record.collectionViewUrl;artist=$record.artistName;title=$record.collectionName;artwork=$artwork}
  Write-Host ($item[0]+' '+$record.collectionName+': '+$tracks.Count)
}
$existing | ConvertTo-Json -Depth 9 | Set-Content -Encoding utf8 (Join-Path $project 'src/audio-catalog.json')
$sources | ConvertTo-Json -Depth 5 | Set-Content -Encoding utf8 (Join-Path $project 'public/assets/cover-sources.json')
Write-Host ('Total '+(($existing.Values | ForEach-Object {$_.tracks.Count} | Measure-Object -Sum).Sum))
