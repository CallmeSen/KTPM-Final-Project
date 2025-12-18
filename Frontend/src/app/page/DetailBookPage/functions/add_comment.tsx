import { ADD_COMMENT, GET_COMMENTS_BY_BOOK } from "@/app/graphQL/queries";
import { AddCommentResponse } from "@/app/interfaces/interfaces";
import { useMutation } from "@apollo/client/react";


export const useAddComment = () => {

    const [addCommentMutation, { loading, error }] = useMutation <AddCommentResponse>(ADD_COMMENT);

    const addComment = async ({
        bookId,
        userId,
        content,
        parentId = null,
        take = 4,
    }: {
        bookId: string;
        userId?: string;
        content: string;
        parentId?: string | null;
        take?: number;
    }) => {
        try {
            const { data } = await addCommentMutation({
                variables: { bookId, userId, content, parentId },
                update: (cache, { data }) => {
                    if (!data?.AddComment) return;
                    
                    const newComment = data.AddComment;

                    const existing = cache.readQuery<{ getCommentsByBook: any[] }>({
                        query: GET_COMMENTS_BY_BOOK,
                        variables: { bookId, skip: 0, take },
                    });

                    if (!existing) return;

                    const updatedComments = parentId
                        ? existing.getCommentsByBook.map(c =>
                            c.id === parentId
                                ? { ...c, replies: [...(c.replies || []), newComment] }
                                : c
                        )
                        : [newComment, ...existing.getCommentsByBook];

                    cache.writeQuery({
                        query: GET_COMMENTS_BY_BOOK,
                        variables: { bookId, skip: 0, take },
                        data: { getCommentsByBook: updatedComments },
                    });
                },
            });

            return (data as { AddComment: any }).AddComment;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    return { addComment, loading, error };
};
