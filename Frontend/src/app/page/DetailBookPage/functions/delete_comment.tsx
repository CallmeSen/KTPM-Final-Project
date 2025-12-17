import { DELETE_COMMENT, GET_COMMENTS_BY_BOOK } from "@/app/graphQL/queries";
import { DeleteCommentResponse } from "@/app/interfaces/interfaces";
import { useMutation } from "@apollo/client/react";



export const useDeleteComment = () => {
    const [deleteCommentMutation, { loading, error }] = useMutation<DeleteCommentResponse>(DELETE_COMMENT);

    const deleteComment = async ({
        bookId,
        commentId,
    }: {
        bookId: string;
        commentId: string;
    }) => {
        try {
            const { data } = await deleteCommentMutation({
                variables: { commentId },

                update: (cache, { data }) => {
                    if (!data?.removeComment) return;

                    const deletedCommentId = data.removeComment.id;

                    const existing = cache.readQuery<{ getCommentsByBook: any[] }>({
                        query: GET_COMMENTS_BY_BOOK,
                        variables: { bookId, skip: 0, take: 4 },
                    });

                    if (!existing?.getCommentsByBook) return;


                    function removeCommentFromTree(comments: any[], id: string): any[] {
                        return comments
                            .filter(c => c.id !== id)
                            .map(c => ({
                                ...c,
                                replies: removeCommentFromTree(c.replies || [], id),
                            }));
                    }

                    const updatedComments = removeCommentFromTree(existing.getCommentsByBook, deletedCommentId);

                    cache.writeQuery({
                        query: GET_COMMENTS_BY_BOOK,
                        variables: { bookId, skip: 0, take: 4 },
                        data: { getCommentsByBook: updatedComments },
                    });
                },
            });

            return data?.removeComment;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    return { deleteComment, loading, error };
};
