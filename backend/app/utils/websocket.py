from fastapi import WebSocket, status
from sqlalchemy.orm import Session
from app.models.message import Message
from app.models.user import User
from datetime import datetime
import json

class ConnectionManager:
    
    def __init__(self):
        self.active_connections: dict[int, WebSocket] = {}
    
    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
    
    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
    
    async def send_personal_message(self, user_id: int, message: dict):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
            except Exception as e:
                print(f"Error sending message to user {user_id}: {e}")
                self.disconnect(user_id)
    
    async def broadcast_to_users(self, sender_id: int, recipient_id: int, message: dict):
        await self.send_personal_message(sender_id, message)
        await self.send_personal_message(recipient_id, message)
    
    def is_user_online(self, user_id: int) -> bool:
        return user_id in self.active_connections

connection_manager = ConnectionManager()
