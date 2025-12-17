'use client'
import { useState } from 'react';
import { useAddComment } from '@/app/page/DetailBookPage/functions/add_comment';
import { PropsCommentForm } from '@/app/interfaces/interfaces';



export default function CommentForm({ bookId, userId, parentId, onSuccess }: PropsCommentForm) {

    const [content, setContent] = useState('');

    const { addComment, loading } = useAddComment();

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();

        if (!content.trim()) return;

        try {

            await addComment({ bookId, userId, content, parentId });
            
            setContent('');
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            alert('Thêm comment thất bại');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
            <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={parentId ? 'Viết reply...' : 'Viết bình luận...'}
                className="flex-1 border border-gray-300 rounded px-2 py-1 bg-[#F5F5F5] text-black"
            />
            <button type="submit" disabled={loading} className="bg-blue-900 text-white px-4 py-1 rounded">
                {loading ? 'Loading...' : 'Submit'}
            </button>
        </form>
    );
}
