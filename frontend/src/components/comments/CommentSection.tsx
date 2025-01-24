import { useState, useCallback, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import {
  Box,
  TextField,
  Button,
  Avatar,
  Typography,
  Paper,
  Skeleton,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import ReplyIcon from '@mui/icons-material/Reply';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useDispatch } from 'react-redux';
import { 
  createComment, 
  fetchCommentsByTopic,
  updateComment,
  deleteComment 
} from '../../store/slices/commentSlice';
import { format } from 'date-fns';
import type { AppDispatch } from '../../store';

interface Comment {
  _id: string;
  userId: {
    _id: string;
    username: string;
    avatarUrl: string;
  };
  content: string;
  replyTo: string | null;
  createdAt: string;
}

interface CommentSectionProps {
  topicId: string;
  comments: Comment[];
  loading: boolean;
  currentUser: {
    id: string;
    username: string;
    avatarUrl: string;
  };
}

export default function CommentSection({ topicId, comments, loading, currentUser }: CommentSectionProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyingToUsername, setReplyingToUsername] = useState<string>('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    dispatch(fetchCommentsByTopic(topicId)).unwrap()
      .then((result) => {
        setCommentCount(result.commentCount);
      });
  }, [dispatch, topicId]);

  const handleNewComment = useCallback((data: { comment: any; commentCount: number }) => {
    setCommentCount(data.commentCount);
    dispatch(fetchCommentsByTopic(topicId));
  }, [dispatch, topicId]);

  const handleCommentUpdated = useCallback((data: { comment: any; commentCount: number }) => {
    setCommentCount(data.commentCount);
    dispatch(fetchCommentsByTopic(topicId));
  }, [dispatch, topicId]);

  const handleCommentDeleted = useCallback((data: { commentId: string; commentCount: number }) => {
    setCommentCount(data.commentCount);
    dispatch(fetchCommentsByTopic(topicId));
  }, [dispatch, topicId]);

  useSocket({
    topicId,
    onNewComment: handleNewComment,
    onCommentUpdated: handleCommentUpdated,
    onCommentDeleted: handleCommentDeleted
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const commentData = {
        userId: currentUser.id,
        topicId: topicId,
        content: newComment.trim(),
        replyTo: replyTo // Menggunakan replyTo state
      };

      await dispatch(createComment(commentData)).unwrap();
      setNewComment('');
      setReplyTo(null); // Reset reply state
      setReplyingToUsername('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  const handleReply = (commentId: string, username: string) => {
    setReplyTo(commentId);
    setReplyingToUsername(username);
    setNewComment(`@${username} `);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, commentId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(commentId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedComment(null);
  };

  const handleEditClick = (comment: Comment) => {
    setEditingComment(comment._id);
    setEditContent(comment.content);
    handleMenuClose();
  };

  const handleEditSubmit = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      await dispatch(updateComment({ 
        commentId, 
        content: editContent.trim() 
      })).unwrap();
      
      setEditingComment(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDeleteClick = async (commentId: string) => {
    try {
      await dispatch(deleteComment(commentId)).unwrap();
      handleMenuClose();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const renderComment = (comment: Comment) => {
    // Pastikan comment dan userId ada sebelum render
    if (!comment || !comment.userId) {
      return null;
    }

    return (
      <Paper 
        key={comment._id} 
        sx={{ 
          p: 2, 
          mb: comment.replyTo ? 1 : 2,
          ml: comment.replyTo ? 6 : 0,
          borderLeft: comment.replyTo ? '2px solid #e0e0e0' : 'none',
          backgroundColor: comment.replyTo ? '#fafafa' : 'white',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Avatar 
            src={comment.userId?.avatarUrl || ''}
            alt={comment.userId?.username || 'User'}
            sx={{ width: comment.replyTo ? 32 : 40, height: comment.replyTo ? 32 : 40 }}
          />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="subtitle2">
                {comment.userId?.username || 'Unknown User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • {format(new Date(comment.createdAt), 'MMM d, yyyy')}
              </Typography>
              {/* Show menu only for user's own comments */}
              {currentUser.id === comment.userId?._id && (
                <>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, comment._id)}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && selectedComment === comment._id}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => handleEditClick(comment)}>Edit</MenuItem>
                    <MenuItem 
                      onClick={() => handleDeleteClick(comment._id)}
                      sx={{ color: 'error.main' }}
                    >
                      Delete
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
            
            {editingComment === comment._id ? (
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  size="small"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    size="small"
                    variant="contained"
                    onClick={() => handleEditSubmit(comment._id)}
                    disabled={!editContent.trim()}
                  >
                    Save
                  </Button>
                  <Button 
                    size="small"
                    onClick={() => {
                      setEditingComment(null);
                      setEditContent('');
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ mb: 1 }}>
                {comment.content}
              </Typography>
            )}
            
            {!editingComment && (
              <Button 
                size="small"
                sx={{ 
                  minWidth: 'auto', 
                  p: 0.5,
                  fontSize: comment.replyTo ? '0.75rem' : '0.875rem'
                }}
                onClick={() => handleReply(comment._id, comment.userId?.username || 'Unknown User')}
              >
                Reply
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    );
  };

  if (loading) {
    return (
      <Box>
        {[1, 2, 3].map((item) => (
          <Paper key={item} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="30%" />
                <Skeleton variant="text" height={60} />
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        {replyTo && (
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Replying to @{replyingToUsername}
            </Typography>
            <Button 
              size="small" 
              onClick={() => {
                setReplyTo(null);
                setReplyingToUsername('');
                setNewComment('');
              }}
            >
              Cancel
            </Button>
          </Box>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button 
            type="submit" 
            variant="contained"
            disabled={!newComment.trim()}
          >
            {replyTo ? 'Reply' : 'Post Comment'}
          </Button>
        </form>
      </Paper>

      {comments.length === 0 ? (
        <Typography color="text.secondary" align="center">
          No comments yet. Be the first to comment!
        </Typography>
      ) : (
        <Box>
          {comments
            .filter(comment => !comment.replyTo)
            .map(comment => (
              <Box key={comment._id}>
                {renderComment(comment)}
                {comments
                  .filter(reply => reply.replyTo === comment._id)
                  .map(reply => renderComment(reply))}
              </Box>
            ))}
        </Box>
      )}
    </Box>
  );
} 