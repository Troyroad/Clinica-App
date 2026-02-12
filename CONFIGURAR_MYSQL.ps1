$myIni = "C:\ProgramData\MySQL\MySQL Server 8.0\my.ini"
$serviceName = "MySQL80"

Write-Host "--- Configurando MySQL para Acceso Remoto ---" -ForegroundColor Cyan

if (Test-Path $myIni) {
    $content = Get-Content $myIni -Raw
    
    if ($content -match "bind-address") {
        Write-Host "✅ La configuración 'bind-address' ya existe." -ForegroundColor Yellow
    } else {
        Write-Host "📝 Agregando 'bind-address = 0.0.0.0' a my.ini..." -ForegroundColor Green
        
        # Realizar backup
        Copy-Item $myIni "$myIni.bak" -Force
        Write-Host "   Backup creado en $myIni.bak" -ForegroundColor Gray
        
        # Insertar debajo de [mysqld]
        $newContent = $content -replace "\[mysqld\]", "[mysqld]`r`nbind-address = 0.0.0.0"
        
        try {
            Set-Content -Path $myIni -Value $newContent -ErrorAction Stop
            Write-Host "✅ Archivo actualizado correctamente." -ForegroundColor Green
        } catch {
            Write-Host "❌ Error al guardar el archivo: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "⚠️ Asegúrese de ejecutar este script como ADMINISTRADOR." -ForegroundColor Red
            Read-Host "Presione Enter para salir"
            exit
        }
    }
    
    Write-Host "🔄 Reiniciando servicio $serviceName..." -ForegroundColor Cyan
    try {
        Restart-Service $serviceName -ErrorAction Stop
        Write-Host "✅ Servicio reiniciado exitosamente." -ForegroundColor Green
    } catch {
        Write-Host "❌ Error al reiniciar servicio: $($_.Exception.Message)" -ForegroundColor Red
    }

} else {
    Write-Host "❌ No se encontró el archivo: $myIni" -ForegroundColor Red
}

Write-Host "`n--- Proceso Finalizado ---" -ForegroundColor Cyan
Read-Host "Presione Enter para salir"
