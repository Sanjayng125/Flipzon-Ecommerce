import useFetch from "./useFetch";

const useCloudinary = () => {
  const { fetchWithAuth } = useFetch();

  const uploadSingle = async (file: File, uploadfolder: string) => {
    try {
      const res = await fetchWithAuth("/cloudinary/upload", {
        method: "POST",
        body: JSON.stringify({ folder: uploadfolder }),
      });
      const { timestamp, signature, folder } = res;
      const cloudinaryApiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
      const cloudinaryUploadApi = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_API;

      if (
        res?.success &&
        cloudinaryApiKey &&
        cloudinaryUploadApi &&
        file &&
        signature &&
        timestamp &&
        folder
      ) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("timestamp", timestamp);
        formData.append("signature", signature);
        formData.append("api_key", cloudinaryApiKey);
        formData.append("folder", folder);

        const uploadRes = await fetch(cloudinaryUploadApi, {
          method: "POST",
          body: formData,
        });

        const data = await uploadRes.json();

        // console.log("Uploaded Image:", data);
        return { url: data.secure_url, public_id: data.public_id };
      }
      return { error: "Failed to uplaod" };
    } catch (error: any) {
      return { error: error.message || "Failed to uplaod" };
    }
  };

  const deleteImage = async (public_ids: string[]) => {
    try {
      await fetchWithAuth("/cloudinary/delete", {
        method: "DELETE",
        body: JSON.stringify({ public_ids }),
      });

      return true;
    } catch (error: any) {
      return { error: error.message || "Failed to delete" };
    }
  };

  const uploadMultiple = async (files: File[], uploadfolder: string) => {
    try {
      const res = await fetchWithAuth("/cloudinary/upload", {
        method: "POST",
        body: JSON.stringify({ folder: uploadfolder }),
      });

      const { timestamp, signature, folder } = res;
      const cloudinaryApiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
      const cloudinaryUploadApi = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_API;

      if (
        res?.success &&
        cloudinaryApiKey &&
        cloudinaryUploadApi &&
        files.length > 0 &&
        signature &&
        timestamp &&
        folder
      ) {
        // Upload Images to Cloudinary
        const uploadResults = await Promise.allSettled(
          files.map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("timestamp", timestamp);
            formData.append("signature", signature);
            formData.append("api_key", cloudinaryApiKey);
            formData.append("folder", folder);

            const uploadRes = await fetch(cloudinaryUploadApi, {
              method: "POST",
              body: formData,
            });

            const data = await uploadRes.json();

            if (!uploadRes.ok || !data?.secure_url || !data?.public_id) {
              throw new Error("Upload failed");
            }

            return { url: data.secure_url, public_id: data.public_id };
          })
        );

        const successfulUploads = uploadResults
          .filter((result) => result.status === "fulfilled")
          .map(
            (result) =>
              (result as PromiseFulfilledResult<CloudinaryImage>).value
          );

        const failedUploads = uploadResults
          .filter((result) => result.status === "rejected")
          .map((result) => (result as PromiseRejectedResult).reason);

        return { urls: successfulUploads, failedUploads };
      }

      return { error: "Failed to upload" };
    } catch (error: any) {
      return { error: "Failed to upload" };
    }
  };

  return { uploadSingle, uploadMultiple, deleteImage };
};

export default useCloudinary;
