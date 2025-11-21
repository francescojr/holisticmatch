# AWS CLI Script to Add Rekognition Permission to holisticmatch-s3-user
# Run this with AWS credentials that have IAM admin permissions

$UserName = "holisticmatch-s3-user"
$PolicyName = "RekognitionModerationPolicy"

# JSON policy document
$PolicyDocument = @{
    Version = "2012-10-17"
    Statement = @(
        @{
            Effect = "Allow"
            Action = @(
                "rekognition:DetectModerationLabels",
                "rekognition:DetectLabels"
            )
            Resource = "*"
        }
    )
} | ConvertTo-Json -Depth 10

Write-Host "Adding Rekognition permissions to IAM user: $UserName" -ForegroundColor Green
Write-Host "Policy: $PolicyName" -ForegroundColor Green
Write-Host ""
Write-Host "Policy Document:" -ForegroundColor Yellow
Write-Host $PolicyDocument
Write-Host ""
Write-Host "Running AWS CLI command..." -ForegroundColor Cyan

# Add inline policy to user
aws iam put-user-policy `
    --user-name $UserName `
    --policy-name $PolicyName `
    --policy-document $PolicyDocument

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS! Rekognition permissions added." -ForegroundColor Green
    Write-Host ""
    Write-Host "Verifying permissions..." -ForegroundColor Cyan
    aws iam get-user-policy `
        --user-name $UserName `
        --policy-name $PolicyName
} else {
    Write-Host "FAILED! Check your AWS credentials and permissions." -ForegroundColor Red
    exit 1
}
