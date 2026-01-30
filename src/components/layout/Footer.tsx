import { Link } from "react-router-dom";
import { Calendar, Heart, Mail, Phone } from "lucide-react";

export function Footer() {
  const organizers = [
    {
      name: "Himanshu Choyal",
      email: "himanshu.choyal@vit.edu.in",
      mobile: "7879946433"
    },
    {
      name: "Sujal Tiwari",
      email: "sujal.tiwari@vit.edu.in",
      mobile: "8898827525"
    },
    {
      name: "Varennya Pophali",
      email: "varennya.pophali@vit.edu.in",
      mobile: "9136043262"
    }
  ];

  return (
    <footer className="bg-foreground text-background border-t-[1px] border-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary border-[1px] border-background rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">CampusHub</span>
            </Link>
            <p className="text-background/80 text-sm">
              The complete campus event management platform for colleges.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/events" className="text-background/80 hover:text-background transition-colors">Browse Events</Link></li>
              <li><Link to="/my-events" className="text-background/80 hover:text-background transition-colors">My Events</Link></li>
              <li><Link to="/organizer" className="text-background/80 hover:text-background transition-colors">Organizer Dashboard</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-lg mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link to="#" className="text-background/80 hover:text-background transition-colors">Help Center</Link></li>
              <li><Link to="#" className="text-background/80 hover:text-background transition-colors">FAQs</Link></li>
              <li><Link to="#" className="text-background/80 hover:text-background transition-colors">Report Issue</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-lg mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="#" className="text-background/80 hover:text-background transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="text-background/80 hover:text-background transition-colors">Terms of Service</Link></li>
              <li><Link to="#" className="text-background/80 hover:text-background transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

          {/* Contact Us - Organizers */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contact Us</h4>
            <div className="space-y-4">
              {organizers.map((org, index) => (
                <div key={index} className="text-sm">
                  <p className="font-semibold text-background mb-1">{org.name}</p>
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-3 h-3" />
                    <a 
                      href={`mailto:${org.email}`}
                      className="text-background/80 hover:text-background transition-colors text-xs break-all"
                    >
                      {org.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    <a 
                      href={`tel:${org.mobile}`}
                      className="text-background/80 hover:text-background transition-colors text-xs"
                    >
                      {org.mobile}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/60 text-sm">
            © 2026 CampusHub. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-background/60 text-sm">
            Made with <Heart className="w-4 h-4 text-destructive fill-destructive" /> for campus communities
          </p>
        </div>
      </div>
    </footer>
  );
}
