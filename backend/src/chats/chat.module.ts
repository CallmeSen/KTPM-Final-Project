import { Module } from "@nestjs/common";
import { MessageBody, SubscribeMessage } from "@nestjs/websockets";
import {  EventsGateway } from "src/chats/chat-gateway";

@Module(
    {
        providers: [EventsGateway]
    }
)
export class ChatModule {
    @SubscribeMessage('newMessage')
    handleNewMessage(@MessageBody() message: any) {
        console.log(message)
    }
}