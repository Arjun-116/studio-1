// src/app/alumni-dashboard/messaging/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Send, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { alumniData as initialAlumniData } from '@/lib/data';
import type { Alumni, Message } from '@/lib/types';
import { cn } from '@/lib/utils';

const ALUMNI_STORAGE_KEY = 'alumni-data';
const MESSAGES_STORAGE_KEY = 'messages-data';
const LOGGED_IN_USER_ID_KEY = 'alumni-user-id';

export default function MessagingPage() {
  const [currentUser, setCurrentUser] = useState<Alumni | null>(null);
  const [alumniList, setAlumniList] = useState<Alumni[]>([]);
  const [conversations, setConversations] = useState<Alumni[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<Alumni | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial data from localStorage
  useEffect(() => {
    try {
      const storedAlumni = localStorage.getItem(ALUMNI_STORAGE_KEY);
      const allAlumni = storedAlumni ? JSON.parse(storedAlumni) : initialAlumniData;
      setAlumniList(allAlumni);

      const loggedInId = localStorage.getItem(LOGGED_IN_USER_ID_KEY) || initialAlumniData[0].id;
      const user = allAlumni.find((a: Alumni) => a.id === loggedInId) || null;
      setCurrentUser(user);

      // Simulate existing conversations
      const storedMessages = JSON.parse(localStorage.getItem(MESSAGES_STORAGE_KEY) || '{}');
      const convoPartners = new Set<string>();
      Object.keys(storedMessages).forEach(convoId => {
        const [id1, id2] = convoId.split('--');
        if (id1 === loggedInId) convoPartners.add(id2);
        if (id2 === loggedInId) convoPartners.add(id1);
      });
      
      const convoUsers = allAlumni.filter((a: Alumni) => convoPartners.has(a.id));
      setConversations(convoUsers);

      // Handle direct message from mentor page
      const recipientId = searchParams.get('recipientId');
      if (recipientId) {
        const recipient = allAlumni.find((a: Alumni) => a.id === recipientId);
        if (recipient) {
          handleSelectConvo(recipient);
        }
      } else if (convoUsers.length > 0) {
        handleSelectConvo(convoUsers[0]);
      }

    } catch (error) {
      console.error("Failed to load messaging data", error);
    }
  }, [searchParams]);

  const getConversationId = (id1: string, id2: string) => {
    return [id1, id2].sort().join('--');
  };

  const handleSelectConvo = (alumni: Alumni) => {
    setSelectedConvo(alumni);
    if (!currentUser) return;
    
    const convoId = getConversationId(currentUser.id, alumni.id);
    const allMessages = JSON.parse(localStorage.getItem(MESSAGES_STORAGE_KEY) || '{}');
    setMessages(allMessages[convoId] || []);
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !selectedConvo) return;

    const convoId = getConversationId(currentUser.id, selectedConvo.id);
    const allMessages = JSON.parse(localStorage.getItem(MESSAGES_STORAGE_KEY) || '{}');
    const currentConvoMessages = allMessages[convoId] || [];

    const message: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      recipientId: selectedConvo.id,
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...currentConvoMessages, message];
    allMessages[convoId] = updatedMessages;
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(allMessages));
    setMessages(updatedMessages);
    setNewMessage('');

    // Add to conversations list if not already there
    if (!conversations.find(c => c.id === selectedConvo.id)) {
        setConversations([selectedConvo, ...conversations]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredAlumni = searchTerm
    ? alumniList.filter(
        (a) =>
          a.id !== currentUser?.id &&
          a.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : conversations;

  return (
    <div className="h-[calc(100vh-100px)]">
      <Card className="h-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
        <div className={cn("flex-col border-r", selectedConvo ? 'hidden md:flex' : 'flex')}>
          <div className="p-4 border-b">
            <h2 className="text-xl font-headline font-bold">Messages</h2>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alumni..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredAlumni.map((alumni) => (
              <div
                key={alumni.id}
                onClick={() => handleSelectConvo(alumni)}
                className={cn(
                  'flex items-center gap-3 p-3 cursor-pointer hover:bg-accent',
                  selectedConvo?.id === alumni.id && 'bg-accent'
                )}
              >
                <Avatar>
                  <AvatarImage src={alumni.avatarUrl} alt={alumni.name} />
                  <AvatarFallback>{alumni.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{alumni.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{alumni.currentRole}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={cn("md:col-span-2 lg:col-span-3 flex-col", selectedConvo ? 'flex' : 'hidden md:flex')}>
          {selectedConvo && currentUser ? (
            <>
              <CardHeader className="flex-row items-center gap-3 space-y-0 p-4 border-b">
                 <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConvo(null)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar>
                  <AvatarImage src={selectedConvo.avatarUrl} alt={selectedConvo.name} />
                  <AvatarFallback>{selectedConvo.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedConvo.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedConvo.currentRole}</p>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex items-end gap-2 max-w-xs',
                      msg.senderId === currentUser.id ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.senderId === currentUser.id ? currentUser.avatarUrl : selectedConvo.avatarUrl} />
                    </Avatar>
                    <p
                      className={cn(
                        'rounded-lg px-3 py-2 text-sm',
                        msg.senderId === currentUser.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      {msg.text}
                    </p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    autoComplete="off"
                  />
                  <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
