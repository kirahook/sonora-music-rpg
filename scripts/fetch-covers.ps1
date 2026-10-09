$ErrorActionPreference = 'Stop'
$catalog = @(
  @{id='A-004'; term='John Coltrane Blue Train'; artist='John Coltrane'; title='Blue Train'},
  @{id='A-012'; term='Air Moon Safari'; artist='Air'; title='Moon Safari'},
  @{id='A-017'; term='Portishead Dummy'; artist='Portishead'; title='Dummy'},
  @{id='A-021'; term='Cocteau Twins Heaven or Las Vegas'; artist='Cocteau Twins'; title='Heaven or Las Vegas'},
  @{id='A-028'; term='Radiohead In Rainbows'; artist='Radiohead'; title='In Rainbows'},
  @{id='A-034'; term='Floating Points Promises'; artist='Floating Points'; title='Promises'},
  @{id='A-041'; term='Lauryn Hill Miseducation'; artist='Lauryn Hill'; title='Miseducation'},
  @{id='A-052'; term='Aphex Twin Selected Ambient Works'; artist='Aphex Twin'; title='Selected Ambient Works 85'},
  @{id='A-063'; term='Bjork Vespertine'; artist='Björk'; title='Vespertine'}
)
$assetDir = Join-Path $PSScriptRoot '..\public\assets'
$sources = foreach ($entry in $catalog) {
  $uri = 'https://itunes.apple.com/search?term=' + [uri]::EscapeDataString($entry.term) + '&entity=album&limit=15&country=us'
  $response = Invoke-RestMethod -Uri $uri
  $album = $response.results | Where-Object { $_.artistName -like ('*' + $entry.artist + '*') -and $_.collectionName -like ('*' + $entry.title + '*') } | Select-Object -First 1
  if (-not $album) { throw "No matching album: $($entry.term)" }
  $art = $album.artworkUrl100.Replace('100x100bb', '600x600bb')
  Invoke-WebRequest -Uri $art -OutFile (Join-Path $assetDir ($entry.id + '.jpg'))
  Write-Host ($entry.id + ': ' + $album.artistName + ' / ' + $album.collectionName)
  @{id=$entry.id; title=$album.collectionName; artist=$album.artistName; artwork=$art; source=$album.collectionViewUrl}
}
$sources | ConvertTo-Json | Set-Content -Encoding utf8 (Join-Path $assetDir 'cover-sources.json')
