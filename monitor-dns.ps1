# DNS Propagation Monitor Script
# Checks DNS every 30 seconds until hollisticmatch.online resolves

Write-Host "🌐 Monitoring DNS propagation for hollisticmatch.online" -ForegroundColor Cyan
Write-Host "Expected IP: 44.197.112.222" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop monitoring`n" -ForegroundColor Gray

$targetIP = "44.197.112.222"
$attempt = 1

while ($true) {
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] Attempt #$attempt - " -NoNewline -ForegroundColor Gray
    
    try {
        $result = Resolve-DnsName hollisticmatch.online -ErrorAction SilentlyContinue
        
        if ($result) {
            $resolvedIP = $result | Where-Object {$_.Type -eq "A"} | Select-Object -First 1 -ExpandProperty IPAddress
            
            if ($resolvedIP -eq $targetIP) {
                Write-Host "✅ DNS PROPAGATED! Resolved to $resolvedIP" -ForegroundColor Green
                Write-Host "`n🎉 Domain is ready! You can now run:" -ForegroundColor Cyan
                Write-Host "   ssh -i `"hollistickeypair.pem`" ubuntu@44.197.112.222" -ForegroundColor White
                Write-Host "   sudo certbot --nginx -d hollisticmatch.online`n" -ForegroundColor White
                break
            } else {
                Write-Host "⚠️  Resolved to $resolvedIP (incorrect IP)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ NXDOMAIN (domain not found)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ DNS lookup failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    $attempt++
    Start-Sleep -Seconds 30
}

Write-Host "`nMonitoring complete." -ForegroundColor Cyan
