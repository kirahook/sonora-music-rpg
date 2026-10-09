$ErrorActionPreference='Stop'
$catalogRoot=Split-Path $PSScriptRoot -Parent
$requests=@(
 @{code='A-170';query='Dave Brubeck Time Out';artist='Brubeck';title='Time Out';genre='JAZZ';region=0;note='不规则拍号的爵士实验，让港口的钟摆学会新舞步。'},
 @{code='A-181';query='Stevie Wonder Songs in the Key of Life';artist='Stevie Wonder';title='Songs in the Key of Life';genre='FUNK';region=0;note='明亮铜管、灵魂和放克，装满一整袋生活的色彩。'},
 @{code='A-192';query='Buena Vista Social Club';artist='Buena Vista';title='Buena Vista Social Club';genre='WORLD';region=0;note='沿着古巴街巷寻找木吉他、铜管和温暖的手鼓。'},
 @{code='A-203';query='Prodigy The Fat of the Land';artist='Prodigy';title='The Fat of the Land';genre='BREAKBEAT';region=1;note='破碎鼓点与粗粝能量，把电波站的灯一盏盏点亮。'},
 @{code='A-214';query='Kraftwerk Computer World';artist='Kraftwerk';title='Computer World';genre='SYNTH POP';region=1;note='机器也会唱歌：精确脉冲组成一座复古未来城市。'},
 @{code='A-225';query='Burial Untrue';artist='Burial';title='Untrue';genre='DUBSTEP';region=2;note='夜行街灯、残缺人声与低频，拼出雨中的城市记忆。'},
 @{code='A-236';query='Brian Eno Ambient 1 Music for Airports';artist='Brian Eno';title='Music for Airports';genre='AMBIENT';region=5;note='候机室里缓慢呼吸的音符，把等待变成一片宁静海域。'},
 @{code='A-247';query='Nick Drake Five Leaves Left';artist='Nick Drake';title='Five Leaves Left';genre='FOLK';region=3;note='木吉他与轻柔弦乐，像写在秋日落叶上的私人日记。'},
 @{code='A-258';query='Sufjan Stevens Carrie Lowell';artist='Sufjan Stevens';title='Carrie';genre='INDIE FOLK';region=3;note='克制而细腻的民谣，把记忆与湖面微光编织在一起。'},
 @{code='A-269';query='Metallica Master of Puppets';artist='Metallica';title='Master of Puppets';genre='METAL';region=4;note='疾速吉他和沉重鼓击，在黑石剧场开启另一种能量。'},
 @{code='A-280';query='Bob Marley Exodus';artist='Bob Marley';title='Exodus';genre='REGGAE';region=2;note='反拍节奏与温暖低音，让迷雾渡船驶向阳光海岸。'},
 @{code='A-291';query='Philip Glass Glassworks';artist='Philip Glass';title='Glassworks';genre='CLASSICAL';region=5;note='重复音型与极简管弦乐，让冰川折射出不同的秩序。'}
)
$newAlbums=@();$newCatalog=@{};$newSources=@()
$directIds=@{'A-203'=500162127;'A-258'=955572616}
foreach($request in $requests){
 $uri='https://itunes.apple.com/search?entity=album&country=us&limit=25&term='+[uri]::EscapeDataString($request.query)
 $matches=(Invoke-RestMethod -Uri $uri).results | Where-Object {$_.artistName -match [regex]::Escape($request.artist) -and $_.collectionName -match [regex]::Escape($request.title)}
 $selected=$matches | Where-Object {$_.collectionName -notmatch ' - EP|Remixes|Interview|\bLive\b'} | Sort-Object {$_.collectionName.Length} | Select-Object -First 1
 if($directIds.ContainsKey($request.code)){$selected=(Invoke-RestMethod -Uri ('https://itunes.apple.com/lookup?id='+$directIds[$request.code]+'&country=us')).results | Select-Object -First 1}
 if(!$selected){throw ('No verified match for '+$request.query)}
 $lookup=Invoke-RestMethod -Uri ('https://itunes.apple.com/lookup?id='+$selected.collectionId+'&entity=song&limit=200&country=us')
 $tracks=@($lookup.results | Where-Object {$_.wrapperType -eq 'track' -and $_.previewUrl} | Sort-Object discNumber,trackNumber | ForEach-Object {@{id=[string]$_.trackId;title=$_.trackName;artist=$_.artistName;url=$_.previewUrl;number=$_.trackNumber;durationMs=$_.trackTimeMillis;source=$_.trackViewUrl}})
 if(!$tracks.Count){throw ('No previews for '+$selected.collectionName)}
 $art=$selected.artworkUrl100 -replace '100x100bb','600x600bb'
 Invoke-WebRequest -Uri $art -OutFile (Join-Path $catalogRoot ('public/assets/'+$request.code+'.jpg'))
 $newCatalog[$request.code]=@{source=$selected.collectionViewUrl;tracks=$tracks}
 $newSources+=@{id=$request.code;source=$selected.collectionViewUrl;artist=$selected.artistName;title=$selected.collectionName;artwork=$art}
 $newAlbums+=@{code=$request.code;title=$selected.collectionName;artist=$selected.artistName;year=([string]([datetime]$selected.releaseDate).Year);genre=$request.genre;region=$request.region;note=$request.note;cover=('/assets/'+$request.code+'.jpg')}
 Write-Output ($request.code+' | '+$selected.artistName+' | '+$selected.collectionName+' | '+$tracks.Count)
}
$newAlbums | ConvertTo-Json -Depth 5 | Set-Content -Encoding utf8 (Join-Path $catalogRoot 'src/extra-albums.json')
$newCatalog | ConvertTo-Json -Depth 8 | Set-Content -Encoding utf8 (Join-Path $catalogRoot 'src/extra-audio-catalog.json')
$newSources | ConvertTo-Json -Depth 5 | Set-Content -Encoding utf8 (Join-Path $catalogRoot 'public/assets/extra-cover-sources.json')
