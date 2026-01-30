import { Link } from "react-router-dom";
import { Calendar, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background border-t-[3px] border-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary border-[3px] border-background rounded-xl flex items-center justify-center">
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
              <li><Link to="#" className="text-background/80 hover:text-background transition-colors">Contact Us</Link></li>
              <li><Link to="#" className="text-background/80 hover:text-background transition-colors">FAQs</Link></li>
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
