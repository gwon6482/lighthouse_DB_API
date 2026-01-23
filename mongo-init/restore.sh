#!/bin/bash
# MongoDB 덤프 자동 복원 스크립트

echo "🔄 MongoDB 덤프 복원 대기 중..."
sleep 5

# 덤프 폴더가 존재하는지 확인
if [ -d "/dump" ] && [ "$(ls -A /dump 2>/dev/null)" ]; then
    echo "📦 덤프 파일 발견, 복원 시작..."
    mongorestore --uri="mongodb://admin:password123@mongo:27017/?authSource=admin" /dump
    echo "✅ 덤프 복원 완료!"
else
    echo "⚠️ 덤프 폴더가 비어있거나 존재하지 않습니다."
fi
