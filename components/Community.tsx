import React, { useState, useEffect } from 'react';
import { CommunityPost, UserProfile } from '../types';
import { getPosts, savePost, toggleLike, getProfile } from '../services/storageService';
import { Card, Button } from './UIComponents';
import { Heart, MessageCircle } from 'lucide-react';

export const Community: React.FC = () => {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        setPosts(getPosts());
        setProfile(getProfile());
    }, []);

    const handlePost = () => {
        if (!newPostContent.trim() || !profile) return;

        const post: CommunityPost = {
            id: Date.now().toString(),
            author: profile.name || 'Me',
            authorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || 'User'}`,
            content: newPostContent,
            type: 'status',
            likes: 0,
            comments: 0,
            timestamp: Date.now()
        };

        const updated = savePost(post);
        setPosts(updated);
        setNewPostContent('');
    };

    const handleLike = (id: string) => {
        const updated = toggleLike(id);
        setPosts(updated);
    };

    const formatTime = (ms: number) => {
        const diff = Date.now() - ms;
        if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
        if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
        return new Date(ms).toLocaleDateString();
    };

    return (
        <div className="space-y-6 pb-24 animate-fade-in">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">Community</h1>
                <p className="text-sm text-gray-500">Share your journey together</p>
            </header>

            {/* Create Post */}
            <Card className="p-4 border-none shadow-chakra-md">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-50 flex-shrink-0 overflow-hidden border border-primary-100">
                         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name || 'User'}`} alt="Me" />
                    </div>
                    <div className="flex-1">
                        <textarea 
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder="Share a win or ask a question..."
                            className="w-full bg-gray-50 rounded-md p-3 text-sm border-none focus:ring-2 focus:ring-primary-500 resize-none h-20 outline-none text-gray-800"
                        />
                        <div className="flex justify-end mt-2">
                            <Button size="sm" onClick={handlePost} disabled={!newPostContent.trim()}>
                                Post
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Feed */}
            <div className="space-y-4">
                {posts.map((post) => (
                    <Card key={post.id} className="p-0 overflow-hidden border-none shadow-chakra">
                        <div className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-100">
                                    <img src={post.authorAvatar} alt={post.author} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-gray-900">{post.author}</h4>
                                    <span className="text-xs text-gray-400">{formatTime(post.timestamp)}</span>
                                </div>
                                {post.type === 'milestone' && (
                                    <span className="ml-auto bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">WIN</span>
                                )}
                            </div>
                            <p className="text-gray-800 text-sm leading-relaxed mb-4">
                                {post.content}
                            </p>
                            <div className="flex items-center gap-6 border-t border-gray-50 pt-3">
                                <button 
                                    onClick={() => handleLike(post.id)}
                                    className={`flex items-center gap-1.5 text-sm transition-colors font-medium ${post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <Heart size={18} fill={post.isLiked ? "currentColor" : "none"} />
                                    <span>{post.likes}</span>
                                </button>
                                <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium">
                                    <MessageCircle size={18} />
                                    <span>{post.comments}</span>
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};