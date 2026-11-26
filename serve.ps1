# Servidor local simple: powershell -File serve.ps1  ->  http://localhost:8787
$root = $PSScriptRoot; $l = New-Object Net.HttpListener; $l.Prefixes.Add("http://localhost:8787/"); $l.Start()
$types = @{ ".html"="text/html; charset=utf-8"; ".css"="text/css"; ".js"="text/javascript"; ".svg"="image/svg+xml"; ".jpg"="image/jpeg"; ".png"="image/png" }
while ($l.IsListening) { $c = $l.GetContext(); $p = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath.TrimStart('/')); if (!$p) { $p = "index.html" }
  $f = Join-Path $root $p; if (Test-Path $f -PathType Leaf) { $b = [IO.File]::ReadAllBytes($f); $e = [IO.Path]::GetExtension($f); if ($types[$e]) { $c.Response.ContentType = $types[$e] }; $c.Response.OutputStream.Write($b,0,$b.Length) } else { $c.Response.StatusCode = 404 }; $c.Response.Close() }
