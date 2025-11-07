#!/usr/bin/env pwsh
# Test Photo Upload - Direct API Testing
# This tests the backend without frontend

param(
    [string]$Backend = "https://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com"
)

$endpoint = "$Backend/api/v1/professionals/register/"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "PHOTO UPLOAD - DIRECT API TEST" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend: $Backend" -ForegroundColor Yellow
Write-Host "Endpoint: $endpoint" -ForegroundColor Yellow
Write-Host ""

# Test 1: JSON POST without photo
Write-Host "TEST 1: JSON POST - No Photo" -ForegroundColor Green
Write-Host "─────────────────────────────────" -ForegroundColor Green

$jsonData = @{
    email = "test_json_$timestamp@example.com"
    password = "TestPass123!"
    full_name = "Test JSON User"
    state = "SP"
    city = "Sao Paulo"
    neighborhood = "Centro"
    services = @("Meditaçao")
    price_per_session = "100.00"
    attendance_type = "presencial"
    bio = "Test user via JSON"
    whatsapp = "11999999999"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri $endpoint -Method POST -Body $jsonData -ContentType "application/json" -ErrorAction Continue -SkipHttpErrorCheck
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Yellow
    if ($response.StatusCode -eq 201) {
        Write-Host "✅ SUCCESS - Registration created!" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "User ID: $($data.user_id)" -ForegroundColor Green
    } else {
        Write-Host "❌ FAILED - $($response.StatusCode)" -ForegroundColor Red
        Write-Host $response.Content -ForegroundColor Red
    }
} catch {
    Write-Host "❌ ERROR: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host ""

# Test 2: FormData without photo
Write-Host "TEST 2: FormData POST - No Photo" -ForegroundColor Green
Write-Host "──────────────────────────────────" -ForegroundColor Green

$form = @{
    email = "test_form_$timestamp@example.com"
    password = "TestPass123!"
    full_name = "Test Form User"
    state = "SP"
    city = "Sao Paulo"
    neighborhood = "Centro"
    services = '["Aromaterapia"]'
    price_per_session = "100.00"
    attendance_type = "presencial"
    bio = "Test user via FormData"
    whatsapp = "11999999999"
}

try {
    $response = Invoke-WebRequest -Uri $endpoint -Method POST -Form $form -ErrorAction Continue -SkipHttpErrorCheck
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Yellow
    if ($response.StatusCode -eq 201) {
        Write-Host "✅ SUCCESS - Registration created!" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "User ID: $($data.user_id)" -ForegroundColor Green
    } else {
        Write-Host "❌ FAILED - $($response.StatusCode)" -ForegroundColor Red
        Write-Host $response.Content -ForegroundColor Red
    }
} catch {
    Write-Host "❌ ERROR: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host ""

# Test 3: FormData with photo file
Write-Host "TEST 3: FormData POST - WITH Photo (CRITICAL TEST)" -ForegroundColor Green
Write-Host "──────────────────────────────────────────────────" -ForegroundColor Green

# Create test image using PowerShell
Write-Host "Creating test photo..." -ForegroundColor Cyan

$tempImage = "$env:TEMP\test_photo_$timestamp.png"

# Create a 1x1 red PNG (minimal valid PNG file)
$pngHeader = @(
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  # PNG signature
    0x00, 0x00, 0x00, 0x0D,                            # IHDR chunk size
    0x49, 0x48, 0x44, 0x52,                            # IHDR
    0x00, 0x00, 0x00, 0x64,                            # Width: 100
    0x00, 0x00, 0x00, 0x64,                            # Height: 100
    0x08, 0x02,                                        # Bit depth: 8, Color type: 2 (RGB)
    0x00, 0x00, 0x00,                                  # Compression, Filter, Interlace
    0x7C, 0x7E, 0x5B, 0x55,                            # CRC
    0x00, 0x00, 0x00, 0x1D,                            # IDAT chunk size
    0x49, 0x44, 0x41, 0x54,                            # IDAT
    0x78, 0x9C, 0xED, 0xC1, 0x01, 0x0D, 0x00, 0x00,
    0x00, 0xC2, 0xA0, 0xF5, 0x4F, 0xED, 0x61, 0x0D,
    0xA0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0xBE, 0x0B, 0xB0, 0x80,
    0x00, 0x00, 0x00, 0x00,                            # IEND chunk size
    0x49, 0x45, 0x4E, 0x44,                            # IEND
    0xAE, 0x42, 0x60, 0x82                             # CRC
)

[byte[]]$bytes = $pngHeader
[System.IO.File]::WriteAllBytes($tempImage, $bytes)

if (Test-Path $tempImage) {
    $fileSize = (Get-Item $tempImage).Length
    Write-Host "✅ Created: $tempImage ($fileSize bytes)" -ForegroundColor Cyan
    
    $form_with_photo = @{
        email = "test_photo_$timestamp@example.com"
        password = "TestPass123!"
        full_name = "Test Photo User"
        state = "SP"
        city = "Sao Paulo"
        neighborhood = "Centro"
        services = '["Meditaçao"]'
        price_per_session = "100.00"
        attendance_type = "presencial"
        bio = "Test user with photo"
        whatsapp = "11999999999"
        photo = Get-Item $tempImage
    }
    
    try {
        Write-Host "Sending FormData with photo..." -ForegroundColor Cyan
        $response = Invoke-WebRequest -Uri $endpoint -Method POST -Form $form_with_photo -ErrorAction Continue -SkipHttpErrorCheck
        Write-Host "Status: $($response.StatusCode)" -ForegroundColor Yellow
        
        if ($response.StatusCode -eq 201) {
            Write-Host "✅ SUCCESS - Photo upload worked!" -ForegroundColor Green
            $data = $response.Content | ConvertFrom-Json
            Write-Host "User ID: $($data.user_id)" -ForegroundColor Green
            Write-Host "Professional ID: $($data.professional_id)" -ForegroundColor Green
        } else {
            Write-Host "❌ FAILED - $($response.StatusCode)" -ForegroundColor Red
            Write-Host $response.Content -ForegroundColor Red
            
            if ($response.StatusCode -eq 413) {
                Write-Host "⚠️ ERROR 413: Nginx rejecting large files" -ForegroundColor Yellow
                Write-Host "   Check: .ebextensions/nginx_upload.config" -ForegroundColor Yellow
            } elseif ($response.StatusCode -eq 400) {
                Write-Host "⚠️ ERROR 400: Backend validation failed" -ForegroundColor Yellow
                Write-Host "   Check: Serializer photo field" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "❌ ERROR: $_" -ForegroundColor Red
    } finally {
        Remove-Item $tempImage -Force 2>$null
    }
} else {
    Write-Host "❌ Failed to create test image" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "TEST COMPLETE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
