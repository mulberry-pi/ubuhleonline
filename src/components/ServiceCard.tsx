import { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const ServiceCard = ({ icon: Icon, title, description }: ServiceCardProps) => {
  return (
    <div className="bg-card rounded-2xl p-8 shadow-[0_4px_20px_-2px_hsl(266_60%_70%/0.15)] hover:shadow-[0_8px_30px_-4px_hsl(266_60%_70%/0.25)] transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
      <div className="mb-6">
        <Icon className="w-16 h-16 text-primary" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};

export default ServiceCard;
