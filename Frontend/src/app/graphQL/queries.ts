import { gql } from "@apollo/client";

export const GET_TOP_RATED_BOOKS = gql`
  query GetTopRatedBooks($limit: Int!) {
    getTopRatedBooks(limit: $limit) {
      id
      title
      thumbnail
    }
  }
`;

export const GETBook = gql`
  query GetBook($id: ID!) {
    book(id: $id) {
      id
      title
      authors
      average_rating
      published_year
      description
      thumbnail
      num_pages
      ratings_count
      price
      id_stripe
    }
  }
`;


export const GET_CART_BY_USER = gql`
  query GetCartByUser($userId: String!) {
    getCartByUser(userId: $userId) {
      id
      user {
        id
        username
      }
      totalPrice
      items {
        id
        quantity
        book {
          id
          title
          thumbnail
          id_stripe 
          price
        }
      }
    }
  }
`;

export const ADD_CART_ITEM = gql`
  mutation AddCartItem(
    $cartId: ID
    $userId: ID!
    $bookId: ID!
    $quantity: Int
  ) {
    addCartItem(cartId: $cartId, userId: $userId, bookId: $bookId, quantity: $quantity) {
      id
      quantity
      book {
        id
        title
        price
      }
    }
  }
`;


export const GET_BOOKS_BY_CATEGORY = gql`
  query BooksByCategory($categoryName: String!, $page: Int, $limit: Int) {
    booksByCategory(categoryName: $categoryName, page: $page, limit: $limit) {
      data {
        id
        title
        authors
        thumbnail
        average_rating
        published_year
        description
      }
      total
      totalPages
      currentPage
    }
  }
`;



export const COUNT_CART_ITEMS = gql`
  query CountCartItems($userId: String!) {
    countCartItems(userId: $userId)
  }
`;


export const COUNT_NOTIFICATIONS = gql`
  query CountNotifications($userId: String!) {
    countNotifications(userId: $userId)
  }
`;

export const SEARCH_BOOKS_BY_TITLE = gql`
  query SearchBooksByTitle($searchTerm: String!) {
    searchBooksByTitle(searchTerm: $searchTerm) {
      id
      title
      authors
      average_rating
      published_year
      description
      thumbnail
      num_pages
      ratings_count
      price
      id_stripe
    }
  }
`;

export const GET_NOTIFICATIONS = gql`
  query GetNotifications($userId: String!) {
    getNotifications(userId: $userId) {
      id
      title
      image
      message
      createdAt
    }
  }
`;

export const GET_COMMENTS_BY_BOOK = gql`
  query getCommentsByBook($bookId: String!, $skip: Int!, $take: Int!) {
    getCommentsByBook(bookId: $bookId, skip: $skip, take: $take) {
      id
      content
      likes
      sentiment
      user {
        id
        email
        username
      }
      replies {
        id
        content
        likes
        user {
          id
          username
        }
      }
    }
  }
`;

export const ADD_COMMENT = gql`
  mutation AddComment(
    $bookId: String!
    $userId: String!
    $content: String!
    $parentId: String
  ) {
    AddComment(
      createCommentInput: {
        bookId: $bookId
        userId: $userId
        content: $content
        parentId: $parentId
      }
    ) {
      id
      content
      likes
      sentiment   
      user {
        id
        email
        username
      }
      replies {
        id
        content
        likes
        user {
          id
          username
        }
      }
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation removeComment($commentId: String!) {
    removeComment(id: $commentId) {
      id
    }
  }
`;


export const LIKE_COMMENT = gql`
  mutation likeComment($commentId: String!, $userId: String!) {
    likeComment(commentId: $commentId, userId: $userId) {
      id
      content
      likes
      createdAt
    }
  }
`;

export const GET_ALL_BOOKS = gql`
  query GetAllBooks($page: Int, $limit: Int) {
    books(pagination: { page: $page, limit: $limit }) {
      data {
        id
        title
        authors
        thumbnail
        average_rating
        published_year
        price
      }
      total
      page,
      limit,
    }
  }
`;



export const GET_ALL_USERS = gql`
  query GetAllUsers($page: Int, $limit: Int) {
    getAllUsers(page: $page, limit: $limit) {
      users {
        id
        username
        status
        email
        role
        avatarUrl
      }
      total
      page
      limit
    }
  }
`;

