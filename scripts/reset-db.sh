#!/bin/bash

# Database reset script

echo "⚠️  WARNING: This will delete ALL data in the buzaglo database!"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

echo "🗑️  Dropping database..."
dropdb buzaglo

echo "📦 Creating fresh database..."
createdb buzaglo

echo "🔧 Running migrations..."
cd backend
npm run migrate
cd ..

echo "✅ Database reset complete!"
rm -f .migration-done

