import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const BASE = "https://ubuhleonline.co.za";

const META: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Ubuhle - Connect with Trusted Beauty Professionals",
    description: "Connecting you to the right beauty professionals, faster. Book appointments, discover stylists, and experience beauty excellence.",
  },
  "/search": {
    title: "Find Beauty Professionals Near You | Ubuhle",
    description: "Browse trusted hairstylists, barbers and lash technicians near you. Compare services, prices and ratings, then book.",
  },
  "/style-preview": {
    title: "Inspo Search - Preview Your Next Look | Ubuhle",
    description: "Upload an inspiration photo and get matched with stylists who can create the look you want.",
  },
  "/service-providers": {
    title: "For Beauty Professionals - Grow Your Business | Ubuhle",
    description: "Join Ubuhle to reach new clients, manage bookings and track beauty market trends.",
  },
  "/pricing": {
    title: "Pricing Plans for Beauty Professionals | Ubuhle",
    description: "Simple, transparent plans for hairstylists, barbers and lash technicians on Ubuhle.",
  },
  "/get-started": {
    title: "Join Ubuhle - Sign Up as a Client or Provider",
    description: "Create your Ubuhle account to book beauty appointments or offer your services to new clients.",
  },
};

const RouteMeta = () => {
  const { pathname } = useLocation();
  const meta = META[pathname] ?? META["/"];
  const url = `${BASE}${pathname}`;
  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:url" content={url} />
    </Helmet>
  );
};

export default RouteMeta;
