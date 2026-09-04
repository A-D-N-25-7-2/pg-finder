import { useState, useRef } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import AppIcon from "./ui/AppIcon";

const ImageUploader = ({ listingId, existingImages = [], onUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const fileInputRef = useRef(null);

  const images = existingImages || [];
  const canAddMore = images.length < 10;

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validate file sizes
    const invalidFiles = files.filter((f) => f.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error(
        `${invalidFiles.length} file(s) exceed 5MB limit. Please select smaller files.`,
      );
      return;
    }

    // Check max images
    if (images.length + files.length > 10) {
      toast.error(
        `You can only have up to 10 images. Currently ${images.length} uploaded.`,
      );
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    setUploading(true);
    try {
      const { data } = await API.post(
        `/listings/${listingId}/images`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      toast.success("Images uploaded!");
      if (onUpdate) onUpdate(data.images);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload images");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (imageUrl) => {
    if (!window.confirm("Delete this image?")) return;

    setDeleting(imageUrl);
    try {
      const { data } = await API.delete(`/listings/${listingId}/images`, {
        data: { imageUrl },
      });
      toast.success("Image deleted");
      if (onUpdate) onUpdate(data.images);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete image");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      {/* Image count */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">
        {images.length} / 10 images
      </p>

      {/* Image grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {images.map((img, index) => (
          <div
            key={index}
            className="relative group aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 dark:bg-dark-elevated border border-gray-200 dark:border-dark-border"
          >
            <img
              src={img}
              alt={`listing-${index}`}
              className="w-full h-full object-cover"
            />
            {/* Delete button */}
            <button
              onClick={() => handleDelete(img)}
              disabled={deleting === img}
              className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              title="Delete image"
            >
              {deleting === img ? (
                <svg
                  className="w-3.5 h-3.5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <AppIcon name="close" size={12} />
              )}
            </button>
          </div>
        ))}

        {/* Add images button */}
        {canAddMore && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50 dark:bg-dark-elevated/50 flex flex-col items-center justify-center gap-2 transition-all hover:bg-blue-50 dark:hover:bg-blue-500/5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <svg
                  className="w-8 h-8 animate-spin text-blue-500"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span className="text-xs font-medium text-blue-500">
                  Uploading...
                </span>
              </>
            ) : (
              <>
                <span className="text-3xl text-gray-400 dark:text-gray-500">
                  +
                </span>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Add Images
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Help text */}
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Accepted: JPG, PNG, WebP • Max 5MB per file • Up to 10 images total
      </p>
    </div>
  );
};

export default ImageUploader;
