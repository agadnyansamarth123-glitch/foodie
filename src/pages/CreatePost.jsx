import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../services/supabase";

function CreatePost() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/auth/login", { replace: true });
        return;
      }
      setIsCheckingSession(false);
    }
    checkSession();
  }, [navigate]);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    setImageFile(file ?? null);
    setError("");
  }

  async function handlePost(event) {
    event.preventDefault();
    const trimmed = text.trim();
    const hasText = Boolean(trimmed);
    const hasImage = Boolean(imageFile);

    if (!hasText && !hasImage) {
      setError("Please add some text or an image before posting.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setIsSubmitting(false);
      setError("You must be logged in to post.");
      return;
    }

    let publicImageUrl = null;

    if (imageFile) {
      const fileExt =
        imageFile.name?.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(fileName, imageFile, { upsert: false });

      if (uploadError) {
        setIsSubmitting(false);
        setError(uploadError.message || "Image upload failed.");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("posts")
        .getPublicUrl(fileName);

      publicImageUrl = publicUrlData?.publicUrl ?? null;
    }

    const { error: insertError } = await supabase.from("posts").insert({
      user_id: user.id,
      content: hasText ? trimmed : null,
      image_url: publicImageUrl,
    });

    if (insertError) {
      setIsSubmitting(false);
      setError(insertError.message || "Could not create post.");
      return;
    }

    setIsSubmitting(false);
    navigate("/home", { replace: true });
  }

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm font-medium text-slate-600">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-lg">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 text-sm font-medium text-brand-700 hover:underline"
        >
          ← Back
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Create post</h1>
          <p className="mt-1 text-sm text-slate-600">
            Share text, a photo, or both. At least one is required.
          </p>

          <form onSubmit={handlePost} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="post-text"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                What&apos;s on your mind?
              </label>
              <textarea
                id="post-text"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setError("");
                }}
                rows={5}
                placeholder="Write something about food, labels, or a meal you tried..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div>
              <label
                htmlFor="post-image"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Add a photo (optional)
              </label>
              <input
                id="post-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
              />
              {previewUrl ? (
                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-64 w-full object-cover"
                  />
                </div>
              ) : null}
            </div>

            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-b from-brand-500 to-brand-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-brand-600 hover:to-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Posting..." : "Post"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default CreatePost;
