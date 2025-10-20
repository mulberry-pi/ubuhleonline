import { useState } from "react";
import { Upload, Camera, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UploadInterfaceProps {
  onUploadComplete: (selfie: string, inspiration: string) => void;
}

const UploadInterface = ({ onUploadComplete }: UploadInterfaceProps) => {
  const [selfie, setSelfie] = useState<string | null>(null);
  const [inspiration, setInspiration] = useState<string | null>(null);

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "selfie" | "inspiration"
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === "selfie") {
          setSelfie(result);
        } else {
          setInspiration(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = () => {
    if (selfie && inspiration) {
      onUploadComplete(selfie, inspiration);
    }
  };

  return (
    <div className="bg-card rounded-2xl p-8 md:p-12 shadow-elegant border border-border/50">
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Selfie Upload */}
        <UploadBox
          title="Upload Your Selfie"
          image={selfie}
          onFileUpload={(e) => handleFileUpload(e, "selfie")}
          icon={<Camera className="w-12 h-12 text-primary/60" />}
        />

        {/* Inspiration Upload */}
        <UploadBox
          title="Upload Your Inspiration"
          image={inspiration}
          onFileUpload={(e) => handleFileUpload(e, "inspiration")}
          icon={<ImageIcon className="w-12 h-12 text-primary/60" />}
        />
      </div>

      <div className="text-center">
        <Button
          onClick={handleGenerate}
          disabled={!selfie || !inspiration}
          size="lg"
          className="px-12 hover-glow text-lg h-14"
        >
          Generate Your Preview
        </Button>
        <p className="text-sm text-muted-foreground mt-4">
          Your images are processed securely and never stored permanently
        </p>
      </div>
    </div>
  );
};

interface UploadBoxProps {
  title: string;
  image: string | null;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
}

const UploadBox = ({ title, image, onFileUpload, icon }: UploadBoxProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-center">{title}</h3>
      
      <div
        className={`relative aspect-[3/4] rounded-xl border-2 border-dashed transition-all duration-300 overflow-hidden group ${
          image
            ? "border-primary/50 bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
        }`}
      >
        {image ? (
          <>
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <label className="cursor-pointer">
                <Upload className="w-8 h-8 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </>
        ) : (
          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
            {icon}
            <p className="mt-4 text-sm font-medium text-foreground/80">Upload from…</p>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="mt-4" onClick={(e) => e.preventDefault()}>
                  Choose Source
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <label className="cursor-pointer w-full">
                    My Files
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onFileUpload}
                      className="hidden"
                    />
                  </label>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <label className="cursor-pointer w-full">
                    Photo Gallery
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onFileUpload}
                      className="hidden"
                    />
                  </label>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <label className="cursor-pointer w-full">
                    Take a Photo
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={onFileUpload}
                      className="hidden"
                    />
                  </label>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </label>
        )}
      </div>
    </div>
  );
};

export default UploadInterface;
