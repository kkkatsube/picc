-- PICC Database Queries
-- Usage: docker exec -i picc-pgsql-1 psql -U sail -d picc < scripts/db_queries.sql

-- 基本情報
\echo '=== Database Information ==='
SELECT current_database(), current_user, version();

-- テーブル一覧
\echo '\n=== Tables ==='
\dt

-- ユーザー情報
\echo '\n=== Users ==='
SELECT id, name, email, email_verified_at, created_at, updated_at 
FROM users 
ORDER BY created_at DESC;

-- ユーザー統計
\echo '\n=== User Statistics ==='
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN email_verified_at IS NOT NULL THEN 1 END) as verified_users,
    COUNT(CASE WHEN email_verified_at IS NULL THEN 1 END) as unverified_users
FROM users;

-- アクセストークン情報
\echo '\n=== Active Tokens ==='
SELECT 
    u.name as user_name,
    u.email,
    t.name as token_name,
    t.abilities,
    t.created_at as token_created,
    t.last_used_at
FROM personal_access_tokens t
JOIN users u ON u.id = t.tokenable_id
WHERE t.expires_at IS NULL OR t.expires_at > NOW()
ORDER BY t.created_at DESC;

-- 最近のアクティビティ
\echo '\n=== Recent Activity ==='
SELECT 
    'User Registration' as activity,
    name as details,
    created_at as timestamp
FROM users
WHERE created_at > NOW() - INTERVAL '1 day'
UNION ALL
SELECT 
    'Token Created' as activity,
    name as details,
    created_at as timestamp
FROM personal_access_tokens
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY timestamp DESC;