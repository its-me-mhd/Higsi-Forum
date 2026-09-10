import { useState } from "react";
import { supabase } from "../../lib/supabase";

const bucketName = "portfolio-images";

const inputClass =
  "input input-lg border-0 border-b-2 focus:outline-none focus:border-picto-primary border-[#E6E8EB] w-full rounded-none px-0";

const UploadForm = ({ adminUser, onUploaded }) => {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!adminUser) return;

    setError("");

    if (!image) {
      setError("Please choose an image.");
      return;
    }

    setIsSubmitting(true);

    try {
      const fileExtension = image.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExtension}`;
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, image, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      const { data: project, error: insertError } = await supabase
        .from("projects")
        .insert({
          description,
          image_url: publicUrlData.publicUrl,
          category: "UI-UX DESIGN",
          title: "Product Admin Dashboard",
          link: "#!",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setDescription("");
      setImage(null);
      event.target.reset();
      onUploaded(project);
    } catch (submitError) {
      setError(submitError.message || "The project could not be uploaded.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!adminUser) return null;

  return (
    <form onSubmit={handleSubmit} className="mx-auto mb-12 max-w-106">
      <p className="mb-4 text-lg font-semibold text-gray-900">Add a project</p>
      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Project description*"
          className={inputClass}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(event) => setImage(event.target.files?.[0] || null)}
          className="file-input file-input-bordered w-full"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-fit rounded-sm px-6 text-[16px] font-semibold"
        >
          {isSubmitting ? "Uploading..." : "Upload project"}
        </button>
      </div>
    </form>
  );
};

export default UploadForm;