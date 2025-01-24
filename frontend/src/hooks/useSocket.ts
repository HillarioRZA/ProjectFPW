import { useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

interface Comment {
  _id: string;
  content: string;
  userId: {
    _id: string;
    username: string;
    avatarUrl: string;
  };
  topicId: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  isEdited: boolean;
}

interface UseSocketProps {
  topicId: string;
  onCommentAdded?: (comment: Comment) => void;
  onCommentUpdated?: (comment: Comment) => void;
  onCommentDeleted?: (comment: Comment) => void;
  onVoteUpdated?: (data: any) => void;
}

export const useSocket = ({
  topicId,
  onCommentAdded,
  onCommentUpdated,
  onCommentDeleted,
  onVoteUpdated
}: UseSocketProps) => {
  const socket = useRef<Socket>();

  const connect = useCallback(() => {
    socket.current = io('http://localhost:5000', {
      withCredentials: true
    });

    // Set up event listeners
    if (socket.current) {
      if (onCommentAdded) {
        socket.current.on('commentAdded', onCommentAdded);
      }
      if (onCommentUpdated) {
        socket.current.on('commentUpdated', onCommentUpdated);
      }
      if (onCommentDeleted) {
        socket.current.on('commentDeleted', onCommentDeleted);
      }
      if (onVoteUpdated) {
        socket.current.on('voteUpdated', onVoteUpdated);
      }

      // Join topic room
      socket.current.emit('joinTopic', topicId);
    }
  }, [topicId, onCommentAdded, onCommentUpdated, onCommentDeleted, onVoteUpdated]);

  const disconnect = useCallback(() => {
    if (socket.current) {
      socket.current.emit('leaveTopic', topicId);
      socket.current.disconnect();
    }
  }, [topicId]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return socket.current;
}; 