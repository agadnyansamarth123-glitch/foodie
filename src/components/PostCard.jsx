function PostCard({ username, text, imageUrl, avatarUrl, postId, userId, likeCount, isLiked, onLikeToggle, onDelete, currentUserId }) {
  const hasText = Boolean(text && text.trim());
  const hasImage = Boolean(imageUrl);
  const hasAvatar = Boolean(avatarUrl);

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

        {currentUserId === userId && (
          <button
            onClick={handleDeleteClick}
            className="flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
}

export default PostCard;
