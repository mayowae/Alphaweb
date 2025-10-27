# AlphaKolect API Test Script for PowerShell
# This script helps you test the API with proper authentication

# Configuration
$API_BASE_URL = "http://alphakolect.com"
$EMAIL = ""
$PASSWORD = ""
$TOKEN_FILE = ".api_token"

# Function to print colored output
function Write-Status {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Function to get credentials
function Get-Credentials {
    if ([string]::IsNullOrEmpty($EMAIL)) {
        $script:EMAIL = Read-Host "Enter your email"
    }
    if ([string]::IsNullOrEmpty($PASSWORD)) {
        $securePassword = Read-Host "Enter your password" -AsSecureString
        $script:PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))
    }
}

# Function to login and get token
function Login {
    Write-Status "🔐 Attempting to login..." "Yellow"
    
    $loginData = @{
        email = $EMAIL
        password = $PASSWORD
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$API_BASE_URL/api/auth/login" -Method Post -Body $loginData -ContentType "application/json"
        
        if ($response.access_token) {
            $response.access_token | Out-File -FilePath $TOKEN_FILE -Encoding UTF8
            Write-Status "✅ Login successful! Token saved." "Green"
            return $response.access_token
        } else {
            Write-Status "❌ Login failed: No access token in response" "Red"
            return $null
        }
    } catch {
        Write-Status "❌ Login failed: $($_.Exception.Message)" "Red"
        return $null
    }
}

# Function to get token (from file or login)
function Get-Token {
    if (Test-Path $TOKEN_FILE) {
        $token = Get-Content $TOKEN_FILE -Raw
        if ($token.Length -gt 50) {
            return $token.Trim()
        } else {
            Write-Status "⚠️ Stored token appears invalid. Logging in again..." "Yellow"
            return Login
        }
    } else {
        Write-Status "⚠️ No stored token found. Logging in..." "Yellow"
        return Login
    }
}

# Function to test API connection
function Test-APIConnection {
    Write-Status "🔍 Testing API connection..." "Yellow"
    
    try {
        $response = Invoke-WebRequest -Uri "$API_BASE_URL/api/health" -Method Get -TimeoutSec 10
        Write-Status "✅ API is reachable (HTTP $($response.StatusCode))" "Green"
        return $true
    } catch {
        Write-Status "❌ Cannot reach API: $($_.Exception.Message)" "Red"
        return $false
    }
}

# Function to get customers with proper authentication
function Get-Customers {
    $token = Get-Token
    
    if ([string]::IsNullOrEmpty($token)) {
        Write-Status "❌ No valid token available" "Red"
        return
    }
    
    Write-Status "📊 Fetching customers..." "Yellow"
    
    $headers = @{
        "accept" = "application/json"
        "Authorization" = "Bearer $token"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$API_BASE_URL/api/customers" -Method Get -Headers $headers
        Write-Status "✅ Customers retrieved successfully!" "Green"
        $response | ConvertTo-Json -Depth 10
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Status "❌ Failed to get customers (HTTP $statusCode)" "Red"
        Write-Status "Response: $($_.Exception.Message)" "Red"
        
        if ($_.Exception.Message -like "*Invalid or expired token*") {
            Write-Status "🔄 Token expired. Attempting to refresh..." "Yellow"
            Remove-Item $TOKEN_FILE -ErrorAction SilentlyContinue
            Get-Customers
        }
    }
}

# Function to show corrected curl command
function Show-CorrectedCurl {
    $token = Get-Token
    
    if (-not [string]::IsNullOrEmpty($token)) {
        Write-Status "📋 Corrected curl command:" "Green"
        Write-Host ""
        Write-Host "curl -X 'GET' \"
        Write-Host "  '$API_BASE_URL/api/customers' \"
        Write-Host "  -H 'accept: application/json' \"
        Write-Host "  -H 'Authorization: Bearer $token'"
        Write-Host ""
    }
}

# Function to show the original problematic curl command
function Show-OriginalCurl {
    Write-Status "❌ Your original curl command (with issues):" "Red"
    Write-Host ""
    Write-Host "curl -X 'GET' \"
    Write-Host "  'http://alphakolect.com/api/customers' \"
    Write-Host "  -H 'accept: application/json' \"
    Write-Host "  -H 'Authorization: Bearer <token>' \"
    Write-Host "  -H 'authorization: Bearer <token>'  # ← DUPLICATE HEADER!"
    Write-Host ""
    Write-Status "Issues found:" "Yellow"
    Write-Host "1. Duplicate Authorization headers (Authorization vs authorization)"
    Write-Host "2. Token appears to be expired"
    Write-Host "3. Only one Authorization header should be used"
    Write-Host ""
}

# Main menu
function Show-Menu {
    Write-Host ""
    Write-Status "🚀 AlphaKolect API Test Tool" "Green"
    Write-Host "1. Show original problematic curl command"
    Write-Host "2. Test API connection"
    Write-Host "3. Login and get token"
    Write-Host "4. Get customers"
    Write-Host "5. Show corrected curl command"
    Write-Host "6. Clear stored token"
    Write-Host "7. Exit"
    Write-Host ""
}

# Main execution
function Main {
    while ($true) {
        Show-Menu
        $choice = Read-Host "Choose an option (1-7)"
        
        switch ($choice) {
            "1" {
                Show-OriginalCurl
            }
            "2" {
                Test-APIConnection
            }
            "3" {
                Get-Credentials
                Login
            }
            "4" {
                Get-Credentials
                Get-Customers
            }
            "5" {
                Get-Credentials
                Show-CorrectedCurl
            }
            "6" {
                Remove-Item $TOKEN_FILE -ErrorAction SilentlyContinue
                Write-Status "✅ Stored token cleared" "Green"
            }
            "7" {
                Write-Status "👋 Goodbye!" "Green"
                exit 0
            }
            default {
                Write-Status "❌ Invalid option. Please choose 1-7." "Red"
            }
        }
        
        Write-Host ""
        Read-Host "Press Enter to continue..."
    }
}

# Run main function
Main
