# Infrastructure (Terraform)

Terraform による Infrastructure as Code

## 技術スタック
- Terraform + HCL
- AWS (ECS Fargate, RDS Aurora PostgreSQL, ElastiCache Redis)
- S3 + DynamoDB (State管理)

## 環境
- dev: 開発環境
- staging: ステージング環境  
- production: 本番環境

## セットアップ
```bash
cd environments/dev
terraform init
terraform plan
terraform apply
```