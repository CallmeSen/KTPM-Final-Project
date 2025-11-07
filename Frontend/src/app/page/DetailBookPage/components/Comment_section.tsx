'use client';

import { GET_COMMENTS_BY_BOOK } from '@/app/graphQL/queries';
import { Session } from '@/app/interfaces/session.interface';
import CommentForm from '@/app/page/DetailBookPage/components/Comment_form';
import CommentItem from '@/app/page/DetailBookPage/components/Comment_Item';
import { useQuery } from '@apollo/client/react';

interface Props {
    bookId: string;
    session?: Session | null; // Cho phép null nếu chưa đăng nhập
}

interface Comment {
    id: string;
    sentiment: string;
}

interface GetCommentsByBookData {
    getCommentsByBook: Comment[];
}

export default function CommentSection({ bookId, session }: Props) {
    const take = 4;

    const { data, loading, error, fetchMore } = useQuery<GetCommentsByBookData>(
        GET_COMMENTS_BY_BOOK,
        {
            variables: { bookId, skip: 0, take },
            fetchPolicy: 'cache-and-network',
        }
    );

    const handleSeeMore = () => {
        fetchMore({
            variables: {
                bookId,
                skip: data?.getCommentsByBook.length || 0,
                take,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult) return prev;
                return {
                    getCommentsByBook: [
                        ...prev.getCommentsByBook,
                        ...fetchMoreResult.getCommentsByBook,
                    ],
                };
            },
        });
    };

    if (loading) return <p>Loading comments...</p>;
    if (error) return <p className="text-red-500">Error: {error.message}</p>;

    return (
        <div className="mt-6">
            <h2 className="font-bold text-lg mb-2 text-blue-950">Reviews</h2>

            {/* Nếu chưa đăng nhập → hiển thị thông báo */}
            {!session ? (
                <p className="text-red-600 mb-4">
                    Bạn phải <span className="font-semibold">đăng nhập</span> để bình luận.
                </p>
            ) : (
                <CommentForm
                    bookId={bookId}
                    userId={session.user.id}
                    take={take}
                />
            )}

            {/* Danh sách bình luận */}
            <div className="mt-4 space-y-2">
                {data?.getCommentsByBook.map((comment: any) => (
                    <CommentItem
                        key={`${comment.id}-root`}
                        comment={comment}
                        bookId={bookId}
                        currentUserId={session?.user?.id}
                    />
                ))}
            </div>

            {/* Nút "See more" */}
            {data?.getCommentsByBook &&
                data.getCommentsByBook.length > 0 &&
                data.getCommentsByBook.length % take === 0 && (
                    <button
                        onClick={handleSeeMore}
                        className="mt-4 text-blue-600 hover:underline"
                    >
                        See more
                    </button>
                )}
        </div>
    );
}
