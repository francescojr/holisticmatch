#!/bin/bash

# AWS CLI Script to Add Rekognition Permission to holisticmatch-s3-user
# Run this with AWS credentials that have IAM admin permissions

USER_NAME="holisticmatch-s3-user"
POLICY_NAME="RekognitionModerationPolicy"

# JSON policy document
POLICY_DOCUMENT='
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "rekognition:DetectModerationLabels",
                "rekognition:DetectLabels"
            ],
            "Resource": "*"
        }
    ]
}
'

echo -e "\033[32mAdding Rekognition permissions to IAM user: $USER_NAME\033[0m"
echo -e "\033[32mPolicy: $POLICY_NAME\033[0m"
echo ""
echo -e "\033[33mPolicy Document:\033[0m"
echo "$POLICY_DOCUMENT"
echo ""
echo -e "\033[36mRunning AWS CLI command...\033[0m"
echo ""

# Add inline policy to user
aws iam put-user-policy \
    --user-name "$USER_NAME" \
    --policy-name "$POLICY_NAME" \
    --policy-document "$POLICY_DOCUMENT"

if [ $? -eq 0 ]; then
    echo -e "\033[32mSUCCESS! Rekognition permissions added.\033[0m"
    echo ""
    echo -e "\033[36mVerifying permissions...\033[0m"
    aws iam get-user-policy \
        --user-name "$USER_NAME" \
        --policy-name "$POLICY_NAME"
else
    echo -e "\033[31mFAILED! Check your AWS credentials and permissions.\033[0m"
    exit 1
fi
