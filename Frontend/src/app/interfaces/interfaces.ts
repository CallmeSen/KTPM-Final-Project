
export interface DeleteCommentResponse {
    removeComment: {
        id: string;
        parentId?: string | null;
    }
};

export interface RemoveCommentData {
    removeComment: {
        id: string;
        content: string;
        createdAt: string;
        user: {
            id: string;
            name: string;
        };
    }
}

export interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string;
}

export interface CommentType {
    id: string;
    content: string;
    user: User;
    sentiment:string,
    likes: number;
    replies: CommentType[];
    parentId?: string | null;
}

export interface PropsComentItem {
    comment: CommentType;
    bookId: string;
    currentUserId: string;
}

export interface AddCommentResponse {
    AddComment: {
        id: string;
        content: string;
        userId: string;
        bookId: string;
        parentId?: string | null;
        replies?: any[];
        createdAt: string;
    };
}


export interface PropsCommentForm {
    bookId: string;
    userId: string;
    parentId?: string;
    take: number;
    onSuccess?: () => void;
}

export interface LikeCommentResponse {
    likeComment: {
        id: string;
        userId: string;
        likes: number;
        likeUsers:string[]
    };
}

