# Domain Verification PowerShell Script
# This script helps verify domain configuration and SSL certificate status

param(
    [Parameter(Mandatory=$false)]
    [string]$Domain = "ttaurban.com",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("AWS", "Azure", "Both")]
    [string]$Provider = "Both"
)

Write-Host "`n🔍 Domain & SSL Verification Tool" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Domain: $Domain`n" -ForegroundColor Yellow

# Function to check DNS records
function Test-DNSRecords {
    param([string]$domain)
    
    Write-Host "`n📡 Checking DNS Records..." -ForegroundColor Green
    
    try {
        # A Record
        Write-Host "`nA Record:" -ForegroundColor Cyan
        $aRecords = Resolve-DnsName -Name $domain -Type A -ErrorAction SilentlyContinue
        if ($aRecords) {
            $aRecords | ForEach-Object { Write-Host "  ✓ $($_.IPAddress)" -ForegroundColor Green }
        } else {
            Write-Host "  ✗ No A records found" -ForegroundColor Red
        }
        
        # CNAME Record for www
        Write-Host "`nCNAME Record (www):" -ForegroundColor Cyan
        $cnameRecords = Resolve-DnsName -Name "www.$domain" -Type CNAME -ErrorAction SilentlyContinue
        if ($cnameRecords) {
            $cnameRecords | ForEach-Object { Write-Host "  ✓ $($_.NameHost)" -ForegroundColor Green }
        } else {
            Write-Host "  ✗ No CNAME records found" -ForegroundColor Red
        }
        
        # Nameservers
        Write-Host "`nNameservers:" -ForegroundColor Cyan
        $nsRecords = Resolve-DnsName -Name $domain -Type NS -ErrorAction SilentlyContinue
        if ($nsRecords) {
            $nsRecords | ForEach-Object { Write-Host "  ✓ $($_.NameHost)" -ForegroundColor Green }
        }
        
    } catch {
        Write-Host "  ✗ Error checking DNS: $_" -ForegroundColor Red
    }
}

# Function to check SSL certificate
function Test-SSLCertificate {
    param([string]$domain)
    
    Write-Host "`n🔒 Checking SSL Certificate..." -ForegroundColor Green
    
    try {
        $url = "https://$domain"
        $request = [System.Net.HttpWebRequest]::Create($url)
        $request.Timeout = 10000
        $request.AllowAutoRedirect = $false
        
        try {
            $response = $request.GetResponse()
            $cert = $request.ServicePoint.Certificate
            
            if ($cert) {
                $cert2 = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2 $cert
                
                Write-Host "`nCertificate Details:" -ForegroundColor Cyan
                Write-Host "  Subject: $($cert2.Subject)" -ForegroundColor White
                Write-Host "  Issuer: $($cert2.Issuer)" -ForegroundColor White
                Write-Host "  Valid From: $($cert2.NotBefore)" -ForegroundColor White
                Write-Host "  Valid To: $($cert2.NotAfter)" -ForegroundColor White
                Write-Host "  Thumbprint: $($cert2.Thumbprint)" -ForegroundColor White
                
                # Check if certificate is valid
                $now = Get-Date
                if ($now -gt $cert2.NotBefore -and $now -lt $cert2.NotAfter) {
                    Write-Host "`n  ✓ Certificate is VALID" -ForegroundColor Green
                } else {
                    Write-Host "`n  ✗ Certificate is EXPIRED or NOT YET VALID" -ForegroundColor Red
                }
                
                # Check days until expiry
                $daysUntilExpiry = ($cert2.NotAfter - $now).Days
                if ($daysUntilExpiry -lt 30) {
                    Write-Host "  ⚠️  Certificate expires in $daysUntilExpiry days" -ForegroundColor Yellow
                } else {
                    Write-Host "  ✓ Certificate expires in $daysUntilExpiry days" -ForegroundColor Green
                }
            }
        } catch {
            Write-Host "  ✗ Could not retrieve certificate: $_" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ✗ Error checking SSL: $_" -ForegroundColor Red
    }
}

# Function to test HTTPS redirect
function Test-HTTPSRedirect {
    param([string]$domain)
    
    Write-Host "`n🔀 Checking HTTP to HTTPS Redirect..." -ForegroundColor Green
    
    try {
        $httpUrl = "http://$domain"
        $request = [System.Net.WebRequest]::Create($httpUrl)
        $request.AllowAutoRedirect = $false
        $request.Timeout = 10000
        
        try {
            $response = $request.GetResponse()
            $statusCode = [int]$response.StatusCode
            $location = $response.Headers["Location"]
            
            if ($statusCode -eq 301 -or $statusCode -eq 302) {
                if ($location -like "https://*") {
                    Write-Host "  ✓ HTTP redirects to HTTPS" -ForegroundColor Green
                    Write-Host "  Status: $statusCode" -ForegroundColor White
                    Write-Host "  Location: $location" -ForegroundColor White
                } else {
                    Write-Host "  ⚠️  Redirect found but not to HTTPS" -ForegroundColor Yellow
                    Write-Host "  Location: $location" -ForegroundColor White
                }
            } else {
                Write-Host "  ✗ No redirect found (Status: $statusCode)" -ForegroundColor Red
            }
        } catch {
            Write-Host "  ⚠️  Could not test redirect: $_" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ✗ Error testing redirect: $_" -ForegroundColor Red
    }
}

# Function to check security headers
function Test-SecurityHeaders {
    param([string]$domain)
    
    Write-Host "`n🛡️  Checking Security Headers..." -ForegroundColor Green
    
    try {
        $response = Invoke-WebRequest -Uri "https://$domain" -UseBasicParsing -MaximumRedirection 0 -ErrorAction SilentlyContinue
        
        $headers = @(
            "Strict-Transport-Security",
            "Content-Security-Policy",
            "X-Frame-Options",
            "X-Content-Type-Options",
            "Referrer-Policy",
            "X-XSS-Protection"
        )
        
        foreach ($header in $headers) {
            if ($response.Headers[$header]) {
                Write-Host "  ✓ $header" -ForegroundColor Green
                Write-Host "    $($response.Headers[$header])" -ForegroundColor Gray
            } else {
                Write-Host "  ✗ $header (missing)" -ForegroundColor Red
            }
        }
    } catch {
        Write-Host "  ⚠️  Could not check security headers" -ForegroundColor Yellow
    }
}

# Function to check AWS-specific details
function Test-AWSConfiguration {
    param([string]$domain)
    
    Write-Host "`n☁️  AWS Configuration Check..." -ForegroundColor Green
    
    try {
        # Check if AWS CLI is installed
        $awsVersion = aws --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ AWS CLI installed: $($awsVersion.Split()[0])" -ForegroundColor Green
            
            # Check Route 53 hosted zones
            Write-Host "`n  Checking Route 53 Hosted Zones..." -ForegroundColor Cyan
            $hostedZones = aws route53 list-hosted-zones-by-name --dns-name "$domain." --query "HostedZones[0]" 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✓ Hosted zone found" -ForegroundColor Green
            }
        } else {
            Write-Host "  ⚠️  AWS CLI not installed or not configured" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ⚠️  Could not check AWS configuration" -ForegroundColor Yellow
    }
}

# Function to check Azure-specific details
function Test-AzureConfiguration {
    param([string]$domain)
    
    Write-Host "`n☁️  Azure Configuration Check..." -ForegroundColor Green
    
    try {
        # Check if Azure CLI is installed
        $azVersion = az version 2>&1 | ConvertFrom-Json
        if ($azVersion) {
            Write-Host "  ✓ Azure CLI installed: $($azVersion.'azure-cli')" -ForegroundColor Green
            
            # Check DNS zones
            Write-Host "`n  Checking Azure DNS Zones..." -ForegroundColor Cyan
            $dnsZones = az network dns zone list --query "[?name=='$domain']" 2>&1 | ConvertFrom-Json
            if ($dnsZones.Count -gt 0) {
                Write-Host "  ✓ DNS zone found" -ForegroundColor Green
                Write-Host "    Resource Group: $($dnsZones[0].resourceGroup)" -ForegroundColor White
            } else {
                Write-Host "  ⚠️  DNS zone not found" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "  ⚠️  Azure CLI not installed or not configured" -ForegroundColor Yellow
    }
}

# Run tests
Test-DNSRecords -domain $Domain
Test-SSLCertificate -domain $Domain
Test-HTTPSRedirect -domain $Domain
Test-SecurityHeaders -domain $Domain

if ($Provider -eq "AWS" -or $Provider -eq "Both") {
    Test-AWSConfiguration -domain $Domain
}

if ($Provider -eq "Azure" -or $Provider -eq "Both") {
    Test-AzureConfiguration -domain $Domain
}

# Final summary
Write-Host "`n=================================" -ForegroundColor Cyan
Write-Host "✅ Verification Complete!" -ForegroundColor Green
Write-Host "`nRecommended Tools:" -ForegroundColor Yellow
Write-Host "  • SSL Test: https://www.ssllabs.com/ssltest/analyze.html?d=$Domain" -ForegroundColor White
Write-Host "  • DNS Check: https://dnschecker.org/" -ForegroundColor White
Write-Host "  • Security Headers: https://securityheaders.com/?q=$Domain" -ForegroundColor White
Write-Host ""
