# =========================================================
#  Build del portfolio (correr antes de cada commit):
#    powershell -ExecutionPolicy Bypass -File tools/build.ps1
#
#  1. Versión de caché: pone ?v=<hash del contenido> en los CSS/JS de
#     index.html, así nunca hay que subirla a mano.
#  2. Versión en inglés: abre index.html con ?build=en en Edge headless
#     (i18n.js aplica las traducciones), guarda el HTML resultante y lo
#     ajusta para que funcione en /en/ (rutas, canonical, metadatos).
# =========================================================
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$utf8 = New-Object System.Text.UTF8Encoding($false)
$edge = @("C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe", "C:\Program Files\Microsoft\Edge\Application\msedge.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw "No encontré Microsoft Edge para generar /en/." }

# ---------- 1. versión de caché ----------
$sha = [System.Security.Cryptography.SHA256]::Create()
$bytes = @("css\styles.css", "js\main.js", "js\i18n.js") | ForEach-Object { [IO.File]::ReadAllBytes((Join-Path $root $_)) }
$all = New-Object System.Collections.Generic.List[byte]; $bytes | ForEach-Object { $all.AddRange([byte[]]$_) }
$ver = ([BitConverter]::ToString($sha.ComputeHash($all.ToArray())) -replace "-", "").Substring(0, 8).ToLower()
$indexPath = Join-Path $root "index.html"
$html = [IO.File]::ReadAllText($indexPath, $utf8)
$html = [regex]::Replace($html, '(css/styles\.css|js/i18n\.js|js/main\.js)\?v=[^"]*', "`$1?v=$ver")
[IO.File]::WriteAllText($indexPath, $html, $utf8)
Write-Host "Versión de caché: $ver"

# ---------- 2. /en/ ----------
# página temporal sin main.js (no hacen falta las animaciones para traducir)
$tmpName = "_build-en.html"
$tmp = Join-Path $root $tmpName
[IO.File]::WriteAllText($tmp, ($html -replace '\s*<script src="js/main\.js[^"]*"></script>', ''), $utf8)
$dumpFile = Join-Path $env:TEMP "portfolio-en-dump.html"
$profileDir = Join-Path $env:TEMP "portfolio-build-edge"
$url = "file:///" + ($tmp -replace '\\', '/') + "?build=en"
$p = Start-Process -FilePath $edge -ArgumentList "--headless=new", "--disable-gpu", "--user-data-dir=$profileDir", "--virtual-time-budget=3000", "--dump-dom", $url -RedirectStandardOutput $dumpFile -PassThru -WindowStyle Hidden
$p.WaitForExit(60000) | Out-Null
Remove-Item -LiteralPath $tmp -Force
$en = [IO.File]::ReadAllText($dumpFile, $utf8)
if ($en -notmatch 'data-lang-toggle' -or $en -notmatch 'Let.s talk') { throw "La traducción no se aplicó: revisá js/i18n.js." }

$base = "https://manu-alz.github.io/Portfolio/"
$en = $en -replace '^\s*<!DOCTYPE html>\s*', ''
$en = "<!doctype html>`n" + ([regex]'<html[^>]*>').Replace($en, '<html lang="en" data-static-lang="en">', 1)
# rutas relativas: /en/ está un nivel más abajo
$en = [regex]::Replace($en, '(href|src|poster|data-src|data-reel)="(css|js|assets)/', '$1="../$2/')
$en = $en -replace 'href="cv\.html"', 'href="../cv.html"'
# main.js otra vez, después de i18n.js
$en = [regex]::Replace($en, '(<script src="\.\./js/i18n\.js[^"]*"></script>)', "`$1`n  <script src=`"../js/main.js?v=$ver`"></script>")
# canonical y metadatos en inglés
$title = "Manuel Alzugaray — Brand, web and video design &amp; development"
$en = $en -replace '<link rel="canonical" href="[^"]*">', "<link rel=`"canonical`" href=`"${base}en/`">"
$en = $en -replace '<meta property="og:url" content="[^"]*">', "<meta property=`"og:url`" content=`"${base}en/`">"
$en = $en -replace '<meta property="og:locale" content="es_UY">', '<meta property="og:locale" content="en_US">'
$en = $en -replace '<meta property="og:locale:alternate" content="en_US">', '<meta property="og:locale:alternate" content="es_UY">'
$en = $en -replace '<meta property="og:title" content="[^"]*">', "<meta property=`"og:title`" content=`"$title`">"
$en = $en -replace '<meta name="twitter:title" content="[^"]*">', "<meta name=`"twitter:title`" content=`"$title`">"
$en = $en -replace '<meta property="og:image:alt" content="[^"]*">', "<meta property=`"og:image:alt`" content=`"$title`">"
$en = $en -replace '<meta name="twitter:description" content="[^"]*">', '<meta name="twitter:description" content="Independent designer and developer in Punta del Este, Uruguay.">'
$en = $en -replace 'assets/og\.jpg', 'assets/og-en.jpg'
$en = $en -replace '"jobTitle": "Diseñador y desarrollador web"', '"jobTitle": "Web designer and developer"'
# el aviso <noscript> no lo toca i18n.js (con JavaScript activo es texto plano)
$en = $en -replace 'Estás viendo la versión sin animaciones: todo el contenido está disponible. Contacto:', 'You are viewing the version without animations: all the content is available. Contact:'

$enDir = Join-Path $root "en"
if (-not (Test-Path $enDir)) { New-Item -ItemType Directory -Path $enDir | Out-Null }
[IO.File]::WriteAllText((Join-Path $enDir "index.html"), $en, $utf8)
Write-Host "Generado en/index.html ($([math]::Round($en.Length / 1KB)) KB)"
