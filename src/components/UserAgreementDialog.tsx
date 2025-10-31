import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserAgreementDialogProps {
  children: React.ReactNode;
}

export const UserAgreementDialog = ({ children }: UserAgreementDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Ubuhle Platform User Agreement</DialogTitle>
          <DialogDescription>
            Last updated: 30 October 2025
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-bold text-base mb-2">1. Introduction</h3>
              <p className="text-muted-foreground">
                Welcome to Ubuhle ("we," "us," or "our"). Ubuhle is a digital beauty platform that connects Clients seeking hairstyling or lash services with independent Service Providers based on uploaded style inspiration images.
              </p>
              <p className="text-muted-foreground mt-2">
                By creating an account or using our website and related services, you ("you," "user," "Client," or "Service Provider") agree to this User Agreement ("Agreement"). If you do not agree, please do not use the platform.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">2. Definitions</h3>
              <p className="text-muted-foreground mb-2">For clarity:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li><strong>"Client"</strong> – a user seeking or booking beauty services through the Ubuhle platform.</li>
                <li><strong>"Service Provider"</strong> – a hairstylist, lash technician, or other beauty professional offering services via Ubuhle.</li>
                <li><strong>"Platform"</strong> – the Ubuhle website, mobile interface, and related digital tools.</li>
                <li><strong>"AI Tools"</strong> – Ubuhle's automated systems used to analyse uploaded inspiration images, stylist portfolios, and market trends to recommend stylist matches.</li>
                <li><strong>"Account"</strong> – your registered user profile on Ubuhle.</li>
                <li><strong>"Booking"</strong> – an appointment made between a Client and Service Provider through the Ubuhle platform.</li>
                <li><strong>"Content"</strong> – any images, text, reviews, or data you upload or generate on the platform.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">3. Our Role</h3>
              <p className="text-muted-foreground mb-2">Ubuhle provides:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>A digital platform for Clients to upload style inspiration images and find matching stylists or lash technicians.</li>
                <li>Tools for Service Providers to manage portfolios, display services, and accept bookings.</li>
                <li>AI-assisted stylist recommendations and visual analysis of portfolio work.</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Ubuhle does not directly provide beauty services. Each Service Provider acts as an independent contractor, responsible for their own pricing, schedules, service quality, and client communication.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">4. Account Registration</h3>
              <p className="text-muted-foreground mb-2">To use Ubuhle, you must:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Be at least 18 years old (or have parental consent).</li>
                <li>Provide true, complete, and current information.</li>
                <li>Keep your login credentials secure and confidential.</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                You are responsible for all activity on your account. Ubuhle reserves the right to suspend or delete accounts violating this Agreement.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">5. Booking, Payments & Fees</h3>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Clients may request, confirm, and pay for bookings directly through the platform.</li>
                <li>Service Providers set their own prices, deposits, and cancellation terms.</li>
                <li>Refunds and cancellations follow each Provider's individual policy.</li>
                <li>Ubuhle may charge a service or transaction fee for platform use.</li>
                <li>Payment processing is handled through third-party gateways (e.g., PayFast).</li>
                <li>Ubuhle is not responsible for any delays, payment errors, or disputes between Clients and Providers.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">6. Style Inspiration & Matching</h3>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Clients can upload style inspiration images to find stylists whose portfolios most closely match their desired look.</li>
                <li>Ubuhle's AI Tools analyse these images and stylist portfolios to recommend top matches.</li>
                <li>These are suggestions only and do not guarantee identical results.</li>
                <li>Ubuhle is not liable for dissatisfaction if a service result differs from an uploaded inspiration.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">7. Portfolios & Image Content</h3>
              <p className="text-muted-foreground mb-2"><strong>For Service Providers:</strong></p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Upload only images that represent your own original work.</li>
                <li>Do not upload copyrighted or third-party images.</li>
                <li>Maintain a consistent, professional portfolio — your visibility depends on it.</li>
              </ul>
              <p className="text-muted-foreground mt-3 mb-2"><strong>For Clients:</strong></p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Upload only images you own or are licensed to use.</li>
                <li>Avoid uploading offensive, explicit, or unrelated content.</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                By uploading any image, you grant Ubuhle a limited license to analyse, display, and use it solely for stylist matching and platform functionality.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">8. Reviews & After-Service Feedback</h3>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Clients may post reviews and ratings after completed appointments.</li>
                <li>Service Providers may upload after-service images of their work to demonstrate outcomes.</li>
                <li>Ubuhle's AI Tools may analyse before-and-after images to generate a quality rating percentage.</li>
                <li>Reviews are public, represent individual opinions, and may be moderated if they breach community standards.</li>
                <li>If a Client review is tied to an after-service image, that association will be visible to other potential Clients.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">9. Security & Conduct</h3>
              <p className="text-muted-foreground mb-2"><strong>All Users must:</strong></p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Use Ubuhle only for lawful purposes.</li>
                <li>Avoid harassment, discrimination, or fraudulent activity.</li>
                <li>Keep personal data secure and avoid sharing others' private information.</li>
              </ul>
              <p className="text-muted-foreground mt-3 mb-2"><strong>Additional for Service Providers:</strong></p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Maintain proper hygiene and safety standards during services.</li>
                <li>Honour confirmed bookings and treat Clients respectfully.</li>
                <li>Avoid soliciting Clients outside the platform for the purpose of bypassing Ubuhle's booking system.</li>
              </ul>
              <p className="text-muted-foreground mt-3 mb-2"><strong>Additional for Clients:</strong></p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Communicate respectfully with Providers.</li>
                <li>Honour confirmed bookings and cancellation timelines.</li>
                <li>Provide accurate feedback without defamation or personal attacks.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">10. Privacy & Data</h3>
              <p className="text-muted-foreground">
                Your privacy matters to us. By using Ubuhle, you consent to our Privacy Policy, which explains how your data and images are stored, processed, and used for stylist matching and analytics.
              </p>
              <p className="text-muted-foreground mt-2">
                We do not sell personal information to third parties. Images are used exclusively for analysis, stylist discovery, and trend reporting.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">11. AI Disclaimer</h3>
              <p className="text-muted-foreground mb-2">Ubuhle uses AI Tools to:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Analyse uploaded inspiration images.</li>
                <li>Identify style similarities between portfolios and client preferences.</li>
                <li>Track trending beauty styles on social platforms (e.g., TikTok, Instagram, Pinterest).</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                AI outputs are automated recommendations, not professional advice. Ubuhle does not guarantee the accuracy or suitability of any AI-assisted match or trend insight.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">12. Limitation of Liability</h3>
              <p className="text-muted-foreground mb-2">Ubuhle is not liable for:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Service outcomes, dissatisfaction, or damages resulting from stylist performance.</li>
                <li>Allergic reactions, injuries, or losses related to services rendered.</li>
                <li>Third-party payment errors, downtime, or technical interruptions.</li>
                <li>Any indirect, incidental, or consequential damages.</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                You use the platform at your own discretion and risk.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">13. Termination</h3>
              <p className="text-muted-foreground mb-2">Ubuhle may suspend or terminate accounts for:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Fraudulent or abusive behaviour.</li>
                <li>Uploading misleading or offensive content.</li>
                <li>Breach of this Agreement or applicable law.</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Termination does not remove your responsibility for past transactions or obligations.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">14. Governing Law</h3>
              <p className="text-muted-foreground">
                This Agreement is governed by the laws of the Republic of South Africa. Any disputes will be handled under South African jurisdiction.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">15. Contact</h3>
              <p className="text-muted-foreground">
                📧 ubuhle.capetown@gmail.com
              </p>
              <p className="text-muted-foreground">
                🌍 www.ubuhleonline.co.za
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
