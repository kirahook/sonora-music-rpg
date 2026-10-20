# Read alpha bounds only; original generated PNGs are not edited or resampled.
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path -Parent $PSScriptRoot
$artNames = @('harbor','crystal','mist','dream','volcano','glacier')
$allBounds = @{}
foreach ($artName in $artNames) {
  $bitmap = [System.Drawing.Bitmap]::FromFile((Join-Path $projectRoot "public/assets/v16-battle-$artName.png"))
  try {
    $frames = @()
    foreach ($row in 0..1) {
      foreach ($column in 0..4) {
        $left = [int][Math]::Ceiling($column * $bitmap.Width / 5)
        $right = [int][Math]::Floor(($column + 1) * $bitmap.Width / 5) - 1
        $top = $row * 512
        $bottom = $top + 511
        $minX = $right; $maxX = $left; $minY = $bottom; $maxY = $top
        for ($y = $top; $y -le $bottom; $y++) {
          for ($x = $left; $x -le $right; $x++) {
            if ($bitmap.GetPixel($x,$y).A -ge 96) {
              $minX = [Math]::Min($minX,$x); $maxX = [Math]::Max($maxX,$x)
              $minY = [Math]::Min($minY,$y); $maxY = [Math]::Max($maxY,$y)
            }
          }
        }
        # Small safety gutter retains antialiasing/quiet state accents without another cell.
        $minX = [Math]::Max($left,$minX-6); $maxX = [Math]::Min($right,$maxX+6)
        $minY = [Math]::Max($top,$minY-6); $maxY = [Math]::Min($bottom,$maxY+6)
        $frames += ,@($minX,$minY,($maxX-$minX+1),($maxY-$minY+1))
      }
    }
    $allBounds[$artName] = $frames
  } finally { $bitmap.Dispose() }
}
$allBounds | ConvertTo-Json -Depth 4 -Compress
