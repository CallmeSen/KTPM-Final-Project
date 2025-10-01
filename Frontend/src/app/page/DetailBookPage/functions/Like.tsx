import { LIKE_COMMENT, GET_COMMENTS_BY_BOOK } from "@/app/graphQL/queries";
import { LikeCommentResponse } from "@/app/interfaces/interfaces";
import { useMutation } from "@apollo/client/react";

export const useLikeComment = () => {
    const [likeCommentMutation, { loading, error }] =
        useMutation<LikeCommentResponse>(LIKE_COMMENT);

    const Like = async ({
        bookId,
        commentId,
        userId,
        take = 4,
    }: {
        bookId: string;
        commentId: string;
        userId: string;
        take?: number;
    }) => {
        try {
            const { data } = await likeCommentMutation({

                variables: { commentId, userId },


                update: (cache, { data }) => {
                    if (!data?.likeComment) return;

                    const updatedComment = data.likeComment;

                    const existing = cache.readQuery<{ getCommentsByBook: any[] }>({
                        query: GET_COMMENTS_BY_BOOK,
                        variables: { bookId, skip: 0, take },
                    });

                    if (!existing) return;

                    const newComments = existing.getCommentsByBook.map((comment) =>
                        comment.id === updatedComment.id
                            ? { ...comment, ...updatedComment }
                            : comment
                    );

                    cache.writeQuery({
                        query: GET_COMMENTS_BY_BOOK,
                        variables: { bookId, skip: 0, take },
                        data: { getCommentsByBook: newComments },
                    });
                },
            });

            return data?.likeComment;

        } catch (err) {
            console.error(err);
        }
    };

    return { Like, loading, error };
};
