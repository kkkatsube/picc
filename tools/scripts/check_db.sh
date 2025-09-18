#!/bin/bash

# PICC Database Check Script
# Usage: ./tools/scripts/check_db.sh

echo "🗄️  PICC Database Check"
echo "======================"

# Check if containers are running
if ! docker ps | grep -q picc-pgsql-1; then
    echo "❌ PostgreSQL container is not running. Please start with: docker-compose up -d"
    exit 1
fi

echo -e "\n📊 Quick Database Overview"
echo "-------------------------"

# User count via Laravel
echo "👥 Total Users:"
docker exec picc-backend-1 php artisan tinker --execute="echo User::count();"

echo -e "\n🔑 Active Tokens:"
docker exec picc-backend-1 php artisan tinker --execute="echo DB::table('personal_access_tokens')->count();"

echo -e "\n📋 Recent Users (Last 5):"
docker exec picc-backend-1 php artisan tinker --execute="User::latest()->take(5)->get(['name', 'email', 'created_at'])->each(function(\$user) { echo \$user->name . ' (' . \$user->email . ') - ' . \$user->created_at . PHP_EOL; });"

echo -e "\n🎯 Interactive Options:"
echo "1. View all users"
echo "2. View user tokens"
echo "3. Search user by email"
echo "4. Run custom SQL"
echo "5. Open psql console"
echo "6. Exit"

read -p "Choose option (1-6): " choice

case $choice in
    1)
        echo -e "\n👥 All Users:"
        docker exec picc-backend-1 php artisan tinker --execute="User::all(['id', 'name', 'email', 'created_at'])->each(function(\$user) { echo 'ID: ' . \$user->id . ' | ' . \$user->name . ' (' . \$user->email . ') | ' . \$user->created_at . PHP_EOL; });"
        ;;
    2)
        echo -e "\n🔑 User Tokens:"
        docker exec picc-backend-1 php artisan tinker --execute="DB::table('personal_access_tokens')->join('users', 'users.id', '=', 'personal_access_tokens.tokenable_id')->select('users.name', 'users.email', 'personal_access_tokens.name as token_name', 'personal_access_tokens.created_at')->get()->each(function(\$token) { echo \$token->name . ' (' . \$token->email . ') | Token: ' . \$token->token_name . ' | Created: ' . \$token->created_at . PHP_EOL; });"
        ;;
    3)
        read -p "Enter email to search: " email
        echo -e "\n🔍 Searching for: $email"
        docker exec picc-backend-1 php artisan tinker --execute="User::where('email', '$email')->get()->each(function(\$user) { echo 'Found: ' . \$user->name . ' (' . \$user->email . ') | ID: ' . \$user->id . ' | Created: ' . \$user->created_at . PHP_EOL; });"
        ;;
    4)
        echo -e "\n💻 Running comprehensive SQL report..."
        docker exec -i picc-pgsql-1 psql -U sail -d picc < tools/scripts/db_queries.sql
        ;;
    5)
        echo -e "\n💻 Opening PostgreSQL console..."
        echo "Available commands:"
        echo "  \\dt              - List tables"
        echo "  \\d users         - Describe users table"
        echo "  SELECT * FROM users LIMIT 5;"
        echo "  \\q               - Quit"
        echo ""
        docker exec -it picc-pgsql-1 psql -U sail -d picc
        ;;
    6)
        echo "👋 Goodbye!"
        ;;
    *)
        echo "❌ Invalid option"
        ;;
esac