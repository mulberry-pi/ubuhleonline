import { useState } from "react";
import { Upload, Camera, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { toast } from "sonner";

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

  const handleNativeCamera = async (
    source: CameraSource,
    type: "selfie" | "inspiration"
  ) => {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source,
        promptLabelHeader: source === CameraSource.Camera ? 'Take a Photo' : 'Choose from Gallery',
        promptLabelCancel: 'Cancel',
        promptLabelPhoto: 'Photo Gallery',
        promptLabelPicture: 'Camera',
      });

      if (image.dataUrl) {
        if (type === "selfie") {
          setSelfie(image.dataUrl);
        } else {
          setInspiration(image.dataUrl);
        }
      }
    } catch (error: any) {
      if (error.message !== 'User cancelled photos app') {
        console.error('Camera error:', error);
        toast.error('Failed to access camera or gallery. Please check permissions.');
      }
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
          onNativeCamera={(source) => handleNativeCamera(source, "selfie")}
          icon={<Camera className="w-12 h-12 text-primary/60" />}
        />

        {/* Inspiration Upload */}
        <UploadBox
          title="Upload Your Inspiration"
          image={inspiration}
          onFileUpload={(e) => handleFileUpload(e, "inspiration")}
          onNativeCamera={(source) => handleNativeCamera(source, "inspiration")}
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
  onNativeCamera: (source: CameraSource) => void;
  icon: React.ReactNode;
}

const UploadBox = ({ title, image, onFileUpload, onNativeCamera, icon }: UploadBoxProps) => {
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
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {icon}
            <p className="mt-4 text-sm font-medium text-foreground/80">Upload from…</p>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="mt-4">
                  Choose Source
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem 
                  onClick={() => onNativeCamera(CameraSource.Photos)}
                  className="cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Photo Gallery
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onNativeCamera(CameraSource.Camera)}
                  className="cursor-pointer"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take a Photo
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <label className="cursor-pointer w-full flex items-center">
                    <Upload className="w-4 h-4 mr-2" />
                    My Files
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onFileUpload}
                      className="hidden"
                    />
                  </label>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadInterface;
