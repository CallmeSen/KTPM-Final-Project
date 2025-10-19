'use client'
import { useState } from 'react';
import CommentForm from '@/app/page/DetailBookPage/components/Comment_form';
import { useLikeComment } from '@/app/page/DetailBookPage/functions/Like';
import { useDeleteComment } from '@/app/page/DetailBookPage/functions/delete_comment';
import { PropsComentItem } from '@/app/interfaces/interfaces';

export default function CommentItem({ comment, bookId, currentUserId }: PropsComentItem) {

    const [showReply, setShowReply] = useState(false);

    const { deleteComment } = useDeleteComment();

    const { Like } = useLikeComment();


    const handleLikeClick = async (commentId: string) => {
        await Like({ bookId, commentId, userId:currentUserId });
    };

    const handleDelete = async (commentId: string) => {
        await deleteComment({ bookId, commentId });
    };

    return (
        <div className="border-b py-2">
            <div className="flex items-start gap-2">
                <img
                    src={comment.user.avatar || '/avatar.svg'}
                    alt={comment.user.username}
                    className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 ml-4">
                    <div className="flex justify-between">
                        <p className="font-semibold text-blue-950">{comment.user.email}</p>
                    </div>

                    <div className='flex items-center space-x-2 mt-2'>
                        <p className="text-sm text-black ">{comment.content}</p>

                        {comment.sentiment && (
                            <span
                                className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${comment.sentiment === "positive"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {comment.sentiment}
                            </span>
                        )}

                    </div>
                  

                    <div className="flex gap-2 mt-4 items-center ">
                        {comment.user.id === currentUserId && (
                            <button
                                onClick={() => handleDelete(comment.id)}
                                className="text-red-500 text-xs cursor-pointer"
                            >
                                Xóa
                            </button>
                        )}

                        {comment.parentId == null && (
                            <button
                                onClick={() => setShowReply(!showReply)}
                                className="text-gray-500 text-xs cursor-pointer"
                            >
                                Reply
                            </button>
                        )}


                        <span
                            className={`text-xs cursor-pointer ${comment.likes==1 ? "text-blue-500" : "text-gray-700"
                                }`}
                            onClick={() => handleLikeClick(comment.id)}
                        >
                            {comment.likes} likes
                        </span>
                        
                    </div>

                    {showReply && (
                        <CommentForm
                            bookId={bookId}
                            userId={currentUserId}
                            parentId={comment.id}
                            take={4}
                        />
                    )}

                    <div className="ml-6 mt-2">
                        {comment.replies?.map((reply) => (
                            <CommentItem
                                key={`${reply.id}-reply-${comment.id}`}
                                comment={reply}
                                bookId={bookId}
                                currentUserId={currentUserId}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
