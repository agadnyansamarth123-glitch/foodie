import { useState, useEffect, useRef } from "react";
import { addComment, deleteComment, getCommentsForPost } from "../services/comments";

function PostCard({ username, text, imageUrl, avatarUrl, postId, userId, likeCount, isLiked, onLikeToggle, onDelete, currentUserId }) {
  const hasText = Boolean(text && text.trim());
  const hasImage = Boolean(imageUrl);
  const hasAvatar = Boolean(avatarUrl);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const commentInputRef = useRef(null);

  const handleLikeClick = () => {
    if (onLikeToggle) {
      onLikeToggle(postId);
    }
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(postId);
    }
  };

  useEffect(() => {
    async function loadComments() {
      setIsLoadingComments(true);
      setCommentsError("");
      const { comments: fetchedComments, error } = await getCommentsForPost(postId);
      if (error) {
        console.error("Error loading comments:", error);
        setCommentsError("Failed to load comments");
      } else {
        setComments(fetchedComments);
      }
      setIsLoadingComments(false);
    }

    loadComments();
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    const { success, error } = await addComment(postId, newComment.trim());
    if (success) {
      // Reload comments
      const { comments: fetchedComments } = await getCommentsForPost(postId);
      setComments(fetchedComments);
      setNewComment("");
    } else {
      alert("Failed to add comment: " + error);
    }
    setIsSubmittingComment(false);
  };

  const handleDeleteComment = async (commentId) => {
    const confirmed = confirm("Delete this comment?");
    if (!confirmed) return;

    const { success, error } = await deleteComment(commentId);
    if (success) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } else {
      alert("Failed to delete comment: " + error);
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-sm font-bold text-brand-800">
          {hasAvatar ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            username.slice(0, 1).toUpperCase()
          )}
        </span>
        <p className="font-semibold text-slate-900">{username}</p>
      </div>

      {hasImage ? (
        <div className="bg-slate-50">
          <img
            src={imageUrl}
            alt=""
            className="max-h-[420px] w-full object-cover"
          />
        </div>
      ) : null}

      {hasText ? (
        <div className="px-4 py-3">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-800">
            {text}
          </p>
        </div>
      ) : null}

      {!hasText && !hasImage ? (
        <div className="px-4 py-6 text-center text-sm text-slate-500">
          Empty post
        </div>
      ) : null}

      <div className="flex items-center gap-4 border-t border-slate-100 px-4 py-3">
        <button
          onClick={handleLikeClick}
          className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            isLiked
              ? "bg-red-50 text-red-600 hover:bg-red-100"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span className="text-lg">{isLiked ? "❤️" : "🤍"}</span>
          <span>{likeCount}</span>
        </button>

        <button
          onClick={() => {
            setShowComments(!showComments);
            if (!showComments) {
              setTimeout(() => {
                commentInputRef.current?.focus();
              }, 100);
            }
          }}
          className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
        >
          <span className="text-lg">💬</span>
          <span>{comments.length}</span>
        </button>

        {currentUserId === userId && (
          <button
            onClick={handleDeleteClick}
            className="flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
          >
            Delete
          </button>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-slate-100 px-4 py-3">
        {isLoadingComments ? (
          <p className="text-sm text-slate-500">Loading comments...</p>
        ) : commentsError ? (
          <p className="text-sm text-red-500">{commentsError}</p>
        ) : (
          <>
            {/* Comments List */}
            {comments.length > 0 && (
              <div className="mb-3 space-y-2">
                {(showAllComments ? comments : comments.slice(0, 2)).map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-xs font-bold text-brand-800">
                      {comment.avatar_url ? (
                        <img src={comment.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        comment.username.slice(0, 1).toUpperCase()
                      )}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold text-slate-900">{comment.username}</span>{" "}
                        <span className="text-slate-700">{comment.content}</span>
                      </p>
                    </div>
                    {currentUserId === comment.user_id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-xs text-slate-400 hover:text-red-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                {/* View all comments button */}
                {comments.length > 2 && !showAllComments && (
                  <button
                    onClick={() => setShowAllComments(true)}
                    className="text-sm text-slate-500 hover:text-slate-700 font-medium"
                  >
                    View all {comments.length} comments
                  </button>
                )}

                {/* Show less button */}
                {comments.length > 2 && showAllComments && (
                  <button
                    onClick={() => setShowAllComments(false)}
                    className="text-sm text-slate-500 hover:text-slate-700 font-medium"
                  >
                    Show less
                  </button>
                )}
              </div>
            )}

            {/* Add Comment Input */}
            {currentUserId && (
              <div className="flex gap-2">
                <input
                  ref={commentInputRef}
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 rounded-full border border-slate-200 px-3 py-1 text-sm focus:border-brand-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddComment();
                    }
                  }}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="rounded-full bg-brand-500 px-4 py-1 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
                >
                  {isSubmittingComment ? "..." : "Post"}
                </button>
              </div>
            )}
          </>
        )}
        </div>
      )}

    </article>
  );
}

export default PostCard;
